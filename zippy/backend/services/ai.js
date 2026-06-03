const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function extractNotice(text) {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a college notice extraction AI for a WhatsApp-like campus communication app.
Return ONLY valid JSON.
Extract:
- isImportant: boolean
- category: one of ["exam", "assignment", "fee", "holiday", "placement", "event", "attendance", "admission", "results", "other"]
- title: short title
- summary: 1 to 2 line summary
- deadline: date string like "2024-12-31" or null
- time: time or null
- priority: one of ["low", "medium", "high", "urgent"]
- actionRequired: what the student should do, or null
- audience: who this is for, or null
- keywords: array of strings
- sourceType: one of ["message", "notice", "pdf", "image", "voice", "other"]

Rules:
- Mark isImportant true only if the content has real value for students.
- Ignore greetings, jokes, stickers, emojis, and casual chat.
- Set isImportant to false if it's casual chat.
- Keep values concise and accurate.`
        },
        {
          role: "user",
          content: `Extract important information from this content:\n\n${text}`
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });
    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    console.log("=== AI EXTRACTION RESULT ===", result);
    return result;
  } catch (error) {
    console.error("=== AI EXTRACTION ERROR ===", error);
    return { isImportant: false };
  }
}

async function askAssistant(question, notices) {
  try {
    const noticeContext = notices.slice(0, 30).map(n =>
      `[${n.category.toUpperCase()}] ${n.title} | Deadline: ${n.deadline || 'N/A'} | Priority: ${n.priority} | Summary: ${n.summary}`
    ).join('\n');

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a helpful campus AI assistant for college students. You have access to recent campus notices and announcements. Answer student questions clearly, concisely, and helpfully. Keep answers under 100 words. Be friendly and direct. If information is not in the notices, say so honestly.

Current notices:
${noticeContext}`
        },
        {
          role: "user",
          content: question
        }
      ],
      temperature: 0.3,
      max_tokens: 200
    });
    return response.choices[0]?.message?.content || "I couldn't find an answer. Please check with your department.";
  } catch (error) {
    console.error("Assistant error:", error);
    return "I'm having trouble connecting right now. Please try again.";
  }
}

async function generateDigest(notices) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const urgent = notices.filter(n => n.priority === 'urgent' || n.priority === 'high').slice(0, 5);
    const withDeadlines = notices.filter(n => n.deadline).slice(0, 5);
    
    const context = [...urgent, ...withDeadlines].slice(0, 8).map(n =>
      `${n.title} (${n.category}, ${n.priority}, deadline: ${n.deadline || 'N/A'})`
    ).join('\n');

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a campus AI assistant. Generate a brief morning digest (3-4 sentences max) highlighting the most important notices for students today. Be concise, warm, and helpful. Start with 'Good morning! Here's your campus update:'"
        },
        {
          role: "user",
          content: `Generate today's digest from these notices:\n${context}`
        }
      ],
      temperature: 0.4,
      max_tokens: 150
    });
    return response.choices[0]?.message?.content || "Good morning! Check the notice board for today's updates.";
  } catch (error) {
    return "Good morning! Check the notice board for today's updates.";
  }
}

module.exports = { extractNotice, askAssistant, generateDigest };
