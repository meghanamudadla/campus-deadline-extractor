const express = require('express');
const db = require('../database');
const { extractNotice, askAssistant, generateDigest } = require('../services/ai');
const pdfParse = require('pdf-parse');
const router = express.Router();

// Extract readable text from a base64 data URI (PDF or image)
async function extractTextFromDataUri(dataUri) {
  try {
    const commaIdx = dataUri.indexOf(',');
    if (commaIdx === -1) return null;
    const meta = dataUri.substring(0, commaIdx);
    const base64 = dataUri.substring(commaIdx + 1);
    const buffer = Buffer.from(base64, 'base64');

    if (meta.includes('pdf')) {
      const parsed = await pdfParse(buffer);
      const text = (parsed.text || '').trim();
      console.log(`PDF text extracted: ${text.length} chars`);
      return text.length > 10 ? text : null;
    }

    if (meta.includes('image')) {
      return '[Image/screenshot uploaded — this is likely a campus notice or announcement. Extract any visible deadlines, events, exam dates, fee due dates, or important information as if this were a typed campus notice.]';
    }

    return null;
  } catch (err) {
    console.error('extractTextFromDataUri error:', err.message);
    return null;
  }
}

function saveNoticeAndReminder(extraction, messageId, senderId) {
  db.run(
    `INSERT INTO notices (message_id, category, title, summary, deadline, time, priority, action_required, audience, keywords, source_type)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      messageId,
      extraction.category,
      extraction.title,
      extraction.summary,
      extraction.deadline,
      extraction.time,
      extraction.priority,
      extraction.actionRequired,
      extraction.audience,
      JSON.stringify(extraction.keywords || []),
      extraction.sourceType
    ],
    function(err2) {
      if (err2) { console.error('Notice insert error:', err2.message); return; }
      if (extraction.deadline) {
        db.run(
          `INSERT INTO reminders (notice_id, user_id, title, deadline, remind_at, priority) VALUES (?, ?, ?, ?, ?, ?)`,
          [this.lastID, senderId, extraction.title, extraction.deadline, '1 day before', extraction.priority]
        );
      }
    }
  );
}

// ── Notices ──────────────────────────────────────────────────────────────────

router.get('/notices/all', (req, res) => {
  db.all('SELECT * FROM notices ORDER BY timestamp DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

router.delete('/notices/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM notices WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Notice deleted successfully', id });
  });
});

// ── Reminders ─────────────────────────────────────────────────────────────────

router.get('/reminders/:userId', (req, res) => {
  const { userId } = req.params;
  db.all(
    `SELECT * FROM reminders WHERE user_id = ? AND dismissed = 0 ORDER BY deadline ASC`,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
});

router.post('/reminders', (req, res) => {
  const { notice_id, user_id, title, deadline, remind_at, priority } = req.body;
  db.run(
    `INSERT INTO reminders (notice_id, user_id, title, deadline, remind_at, priority) VALUES (?, ?, ?, ?, ?, ?)`,
    [notice_id, user_id, title, deadline, remind_at || '1 day before', priority || 'medium'],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Reminder created' });
    }
  );
});

router.patch('/reminders/:id/dismiss', (req, res) => {
  const { id } = req.params;
  db.run('UPDATE reminders SET dismissed = 1 WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Reminder dismissed' });
  });
});

// ── AI Assistant ───────────────────────────────────────────────────────────────

router.post('/assistant/ask', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Question required' });

  db.all('SELECT * FROM notices ORDER BY timestamp DESC LIMIT 30', [], async (err, notices) => {
    if (err) return res.status(500).json({ error: err.message });
    const answer = await askAssistant(question, notices || []);
    res.json({ answer });
  });
});

// ── Daily Digest ───────────────────────────────────────────────────────────────

router.get('/digest', (req, res) => {
  db.all('SELECT * FROM notices ORDER BY timestamp DESC LIMIT 20', [], async (err, notices) => {
    if (err) return res.status(500).json({ error: err.message });
    const digest = await generateDigest(notices || []);
    const urgent = (notices || []).filter(n => n.priority === 'urgent' || n.priority === 'high').slice(0, 4);
    const deadlines = (notices || []).filter(n => n.deadline).slice(0, 4);
    res.json({ digest, urgent, deadlines, total: (notices || []).length });
  });
});

// ── Messages ───────────────────────────────────────────────────────────────────

router.get('/:user1/:user2', (req, res) => {
  const { user1, user2 } = req.params;
  db.all(
    `SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY timestamp ASC`,
    [user1, user2, user2, user1],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
});

router.post('/', (req, res) => {
  const { sender_id, receiver_id, content } = req.body;
  db.run(
    'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
    [sender_id, receiver_id, content],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      const messageId = this.lastID;

      db.get('SELECT * FROM messages WHERE id = ?', [messageId], async (err, row) => {
        res.json(row);

        // Determine what text to send to AI
        let textForAI = null;

        if (content && !content.startsWith('data:')) {
          // Plain text message
          textForAI = content;
          console.log(`[AI] Plain text: "${content.substring(0, 80)}"`);
        } else if (content && content.startsWith('data:')) {
          // PDF or image — extract text first
          console.log(`[AI] File upload detected, extracting text...`);
          textForAI = await extractTextFromDataUri(content);
          if (!textForAI) console.log('[AI] Could not extract text from file');
        }

        if (textForAI) {
          const extraction = await extractNotice(textForAI);
          if (extraction && (extraction.isImportant === true || extraction.isImportant === 'true')) {
            console.log(`[AI] Notice saved: "${extraction.title}" (${extraction.priority})`);
            saveNoticeAndReminder(extraction, messageId, sender_id);
          } else {
            console.log('[AI] Not important, skipping');
          }
        }
      });
    }
  );
});

module.exports = router;
