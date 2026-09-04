// server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { users } = require('./data');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let nextId = 1;

// Register
app.post('/api/register', async (req, res) => {
  const { username, password, age, bio, interests } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'username already taken' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    id: nextId++,
    username,
    passwordHash,
    age: age || null,
    bio: bio || '',
    interests: interests || []
  };

  users.push(user);

  res.json({ message: 'registered', user: { id: user.id, username: user.username } });
});

// Login (very basic, no JWT/session here)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ error: 'invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ error: 'invalid credentials' });

  // In a real app, return a token or session
  res.json({
    message: 'logged in',
    user: {
      id: user.id,
      username: user.username,
      age: user.age,
      bio: user.bio,
      interests: user.interests
    }
  });
});

// List profiles (simple “browse”)
app.get('/api/profiles', (req, res) => {
  const publicProfiles = users.map(u => ({
    id: u.id,
    username: u.username,
    age: u.age,
    bio: u.bio,
    interests: u.interests
  }));
  res.json(publicProfiles);
});

// Simple filter by interest
app.get('/api/profiles/search', (req, res) => {
  const { interest } = req.query;
  if (!interest) return res.json([]);

  const matches = users.filter(u =>
    (u.interests || []).some(i => i.toLowerCase().includes(interest.toLowerCase()))
  ).map(u => ({
    id: u.id,
    username: u.username,
    age: u.age,
    bio: u.bio,
    interests: u.interests
  }));

  res.json(matches);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Dating site server running on port', PORT);
});
