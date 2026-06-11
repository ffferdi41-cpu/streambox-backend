const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
let admin;
let db;
let auth;

try {
  admin = require('firebase-admin');
  const serviceAccount = require('./streambox-21949-firebase-adminsdk-fbsvc-0473571a7a.json');
  
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  }
  
  db = admin.firestore();
  auth = admin.auth();
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('⚠️ Firebase initialization error:', error.message);
  // Continue without Firebase for testing
}

// ==================== HEALTH CHECK ====================

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    firebase: !!db ? 'connected' : 'disconnected'
  });
});

// ==================== AUTH ROUTES ====================

// Register
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (!auth) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name || email.split('@')[0],
    });

    // Create user document in Firestore
    if (db) {
      await db.collection('users').doc(userRecord.uid).set({
        email,
        name: name || email.split('@')[0],
        createdAt: new Date(),
        subscription: 'free',
        devices: [],
      });
    }

    res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (!auth) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    // Get user by email
    const userRecord = await auth.getUserByEmail(email);

    // Generate custom token
    const customToken = await auth.createCustomToken(userRecord.uid);

    res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      token: customToken,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// ==================== CHANNELS ROUTES ====================

// Get all channels
app.get('/channels', async (req, res) => {
  try {
    if (!db) {
      return res.json([
        {
          id: '1',
          name: 'TRT 1',
          url: 'https://example.com/stream1.m3u8',
          category: 'Genel',
          description: 'TRT 1 Canlı Yayını'
        },
        {
          id: '2',
          name: 'Kanal D',
          url: 'https://example.com/stream2.m3u8',
          category: 'Genel',
          description: 'Kanal D Canlı Yayını'
        }
      ]);
    }

    const snapshot = await db.collection('channels').get();
    const channels = [];

    snapshot.forEach((doc) => {
      channels.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.json(channels);
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get channel by ID
app.get('/channels/:id', async (req, res) => {
  try {
    if (!db) {
      return res.json({
        id: req.params.id,
        name: 'Sample Channel',
        url: 'https://example.com/stream.m3u8',
        category: 'Genel',
      });
    }

    const doc = await db.collection('channels').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    res.json({
      id: doc.id,
      ...doc.data(),
    });
  } catch (error) {
    console.error('Get channel error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create channel
app.post('/channels', async (req, res) => {
  try {
    const { name, url, category, description } = req.body;

    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL required' });
    }

    if (!db) {
      return res.json({
        id: 'mock-' + Date.now(),
        message: 'Channel created (mock)',
      });
    }

    const docRef = await db.collection('channels').add({
      name,
      url,
      category: category || 'General',
      description: description || '',
      createdAt: new Date(),
    });

    res.json({
      id: docRef.id,
      message: 'Channel created successfully',
    });
  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== LICENSES ROUTES ====================

// Get user licenses
app.get('/licenses/:userId', async (req, res) => {
  try {
    if (!db) {
      return res.json([
        {
          id: '1',
          userId: req.params.userId,
          channels: ['1', '2'],
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          plan: 'basic',
          active: true,
        }
      ]);
    }

    const snapshot = await db
      .collection('licenses')
      .where('userId', '==', req.params.userId)
      .get();

    const licenses = [];
    snapshot.forEach((doc) => {
      licenses.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.json(licenses);
  } catch (error) {
    console.error('Get licenses error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create license
app.post('/licenses', async (req, res) => {
  try {
    const { userId, channels, expiryDate, plan } = req.body;

    if (!userId || !channels) {
      return res.status(400).json({ error: 'UserId and channels required' });
    }

    if (!db) {
      return res.json({
        id: 'mock-' + Date.now(),
        message: 'License created (mock)',
      });
    }

    const docRef = await db.collection('licenses').add({
      userId,
      channels,
      expiryDate: expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      plan: plan || 'basic',
      createdAt: new Date(),
      active: true,
    });

    res.json({
      id: docRef.id,
      message: 'License created successfully',
    });
  } catch (error) {
    console.error('Create license error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== SUBSCRIPTIONS ROUTES ====================

// Get user subscription
app.get('/subscriptions/:userId', async (req, res) => {
  try {
    if (!db) {
      return res.json({
        subscription: 'free',
        plan: 'free',
        expiryDate: null,
      });
    }

    const snapshot = await db
      .collection('subscriptions')
      .where('userId', '==', req.params.userId)
      .get();

    if (snapshot.empty) {
      return res.json({ subscription: 'free' });
    }

    let subscription = null;
    snapshot.forEach((doc) => {
      subscription = {
        id: doc.id,
        ...doc.data(),
      };
    });

    res.json(subscription);
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create subscription
app.post('/subscriptions', async (req, res) => {
  try {
    const { userId, plan, price, expiryDate } = req.body;

    if (!userId || !plan) {
      return res.status(400).json({ error: 'UserId and plan required' });
    }

    if (!db) {
      return res.json({
        id: 'mock-' + Date.now(),
        message: 'Subscription created (mock)',
      });
    }

    const docRef = await db.collection('subscriptions').add({
      userId,
      plan,
      price: price || 0,
      expiryDate: expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      active: true,
    });

    res.json({
      id: docRef.id,
      message: 'Subscription created successfully',
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== DEVICES ROUTES ====================

// Get user devices
app.get('/devices/:userId', async (req, res) => {
  try {
    if (!db) {
      return res.json([
        {
          id: '1',
          userId: req.params.userId,
          deviceId: 'device-1',
          deviceName: 'iPhone 14',
          platform: 'ios',
          createdAt: new Date(),
          lastActive: new Date(),
        }
      ]);
    }

    const snapshot = await db
      .collection('devices')
      .where('userId', '==', req.params.userId)
      .get();

    const devices = [];
    snapshot.forEach((doc) => {
      devices.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.json(devices);
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Register device
app.post('/devices', async (req, res) => {
  try {
    const { userId, deviceId, deviceName, platform } = req.body;

    if (!userId || !deviceId) {
      return res.status(400).json({ error: 'UserId and deviceId required' });
    }

    if (!db) {
      return res.json({
        id: 'mock-' + Date.now(),
        message: 'Device registered (mock)',
      });
    }

    const docRef = await db.collection('devices').add({
      userId,
      deviceId,
      deviceName: deviceName || 'Unknown Device',
      platform: platform || 'unknown',
      createdAt: new Date(),
      lastActive: new Date(),
    });

    res.json({
      id: docRef.id,
      message: 'Device registered successfully',
    });
  } catch (error) {
    console.error('Register device error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Streambox API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`\n📚 API Endpoints:`);
  console.log(`   POST   /auth/register`);
  console.log(`   POST   /auth/login`);
  console.log(`   GET    /channels`);
  console.log(`   POST   /channels`);
  console.log(`   GET    /licenses/:userId`);
  console.log(`   POST   /licenses`);
  console.log(`   GET    /subscriptions/:userId`);
  console.log(`   POST   /subscriptions`);
  console.log(`   GET    /devices/:userId`);
  console.log(`   POST   /devices\n`);
});
