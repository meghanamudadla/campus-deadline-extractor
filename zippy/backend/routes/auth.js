const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const router = express.Router();

const SECRET = 'whatsapp_super_secret';

router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
    if (err) return res.status(400).json({ error: 'Username exists' });
    
    const token = jwt.sign({ id: this.lastID, username }, SECRET);
    res.json({ token, user: { id: this.lastID, username } });
  });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET);
    res.json({ token, user: { id: user.id, username: user.username } });
  });
});

router.get('/users', (req, res) => {
  db.all('SELECT id, username, last_seen FROM users', [], (err, rows) => {
    res.json(rows);
  });
});

module.exports = router;