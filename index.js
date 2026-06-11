const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend API is running!' });
});

app.post('/auth/register', (req, res) => {
  res.json({ success: true, message: 'User registered' });
});

app.post('/auth/login', (req, res) => {
  res.json({ success: true, token: 'sample-token' });
});

app.get('/channels', (req, res) => {
  res.json({ channels: [] });
});

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}` );
});
