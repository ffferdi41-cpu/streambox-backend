const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Örnek kanallar
const channels = [
  { id: 1, name: 'TRT 1', url: 'https://example.com/trt1.m3u8' },
  { id: 2, name: 'TRT 2', url: 'https://example.com/trt2.m3u8' },
  { id: 3, name: 'Kanal D', url: 'https://example.com/kanald.m3u8' },
  { id: 4, name: 'Show TV', url: 'https://example.com/showtv.m3u8' },
  { id: 5, name: 'FOX', url: 'https://example.com/fox.m3u8' },
];

// Health Check
app.get('/health', (req, res ) => {
  res.json({ status: 'OK', message: 'Backend API is running!' });
});

// Auth Endpoints
app.post('/auth/register', (req, res) => {
  res.json({ success: true, message: 'User registered' });
});

app.post('/auth/login', (req, res) => {
  res.json({ success: true, token: 'sample-token' });
});

// Channels Endpoints
app.get('/channels', (req, res) => {
  res.json({ channels: channels });
});

app.post('/channels', (req, res) => {
  const { name, url } = req.body;
  if (!name || !url) {
    return res.status(400).json({ error: 'Name and URL required' });
  }
  const newChannel = { id: channels.length + 1, name, url };
  channels.push(newChannel);
  res.json({ success: true, channel: newChannel });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}` );
});
