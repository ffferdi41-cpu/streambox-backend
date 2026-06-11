# Streambox API - Backend Server

Streambox IPTV uygulaması için Node.js + Express backend API sunucusu.

## 🚀 Başlangıç

### Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Sunucuyu başlat
npm start
```

Sunucu `http://localhost:5000` adresinde çalışacak.

## 📚 API Endpoints

### Health Check

```
GET /health
```

Sunucunun durumunu kontrol et.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-06-12T10:30:00.000Z",
  "firebase": "connected"
}
```

### Authentication

#### Register (Kayıt)

```
POST /auth/register
```

Yeni kullanıcı oluştur.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "uid": "user-id-123",
  "email": "user@example.com",
  "message": "User registered successfully"
}
```

#### Login

```
POST /auth/login
```

Kullanıcı girişi.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "uid": "user-id-123",
  "email": "user@example.com",
  "token": "custom-firebase-token",
  "message": "Login successful"
}
```

### Channels (Kanallar)

#### Get All Channels

```
GET /channels
```

Tüm TV kanallarını getir.

**Response:**
```json
[
  {
    "id": "1",
    "name": "TRT 1",
    "url": "https://example.com/stream1.m3u8",
    "category": "Genel",
    "description": "TRT 1 Canlı Yayını"
  },
  {
    "id": "2",
    "name": "Kanal D",
    "url": "https://example.com/stream2.m3u8",
    "category": "Genel",
    "description": "Kanal D Canlı Yayını"
  }
]
```

#### Get Channel by ID

```
GET /channels/:id
```

Belirli bir kanalı getir.

**Response:**
```json
{
  "id": "1",
  "name": "TRT 1",
  "url": "https://example.com/stream1.m3u8",
  "category": "Genel",
  "description": "TRT 1 Canlı Yayını"
}
```

#### Create Channel

```
POST /channels
```

Yeni kanal oluştur (Admin).

**Request:**
```json
{
  "name": "TRT 1",
  "url": "https://example.com/stream1.m3u8",
  "category": "Genel",
  "description": "TRT 1 Canlı Yayını"
}
```

**Response:**
```json
{
  "id": "channel-id-123",
  "message": "Channel created successfully"
}
```

### Licenses (Lisanslar)

#### Get User Licenses

```
GET /licenses/:userId
```

Kullanıcının lisanslarını getir.

**Response:**
```json
[
  {
    "id": "license-1",
    "userId": "user-123",
    "channels": ["1", "2", "3"],
    "expiryDate": "2026-07-12T10:30:00.000Z",
    "plan": "basic",
    "active": true
  }
]
```

#### Create License

```
POST /licenses
```

Yeni lisans oluştur.

**Request:**
```json
{
  "userId": "user-123",
  "channels": ["1", "2", "3"],
  "expiryDate": "2026-07-12T10:30:00.000Z",
  "plan": "basic"
}
```

**Response:**
```json
{
  "id": "license-id-123",
  "message": "License created successfully"
}
```

### Subscriptions (Abonelikler)

#### Get User Subscription

```
GET /subscriptions/:userId
```

Kullanıcının abonelik bilgisini getir.

**Response:**
```json
{
  "id": "subscription-1",
  "userId": "user-123",
  "plan": "premium",
  "price": 9.99,
  "expiryDate": "2026-07-12T10:30:00.000Z",
  "active": true
}
```

#### Create Subscription

```
POST /subscriptions
```

Yeni abonelik oluştur.

**Request:**
```json
{
  "userId": "user-123",
  "plan": "premium",
  "price": 9.99,
  "expiryDate": "2026-07-12T10:30:00.000Z"
}
```

**Response:**
```json
{
  "id": "subscription-id-123",
  "message": "Subscription created successfully"
}
```

### Devices (Cihazlar)

#### Get User Devices

```
GET /devices/:userId
```

Kullanıcının cihazlarını getir.

**Response:**
```json
[
  {
    "id": "device-1",
    "userId": "user-123",
    "deviceId": "device-unique-id",
    "deviceName": "iPhone 14",
    "platform": "ios",
    "createdAt": "2026-06-12T10:30:00.000Z",
    "lastActive": "2026-06-12T10:30:00.000Z"
  }
]
```

#### Register Device

```
POST /devices
```

Yeni cihaz kaydet.

**Request:**
```json
{
  "userId": "user-123",
  "deviceId": "device-unique-id",
  "deviceName": "iPhone 14",
  "platform": "ios"
}
```

**Response:**
```json
{
  "id": "device-id-123",
  "message": "Device registered successfully"
}
```

## 🔧 Konfigürasyon

`.env` dosyasını düzenle:

```env
PORT=5000
FIREBASE_PROJECT_ID=streambox-21949
FIREBASE_DATABASE_URL=https://streambox-21949.firebaseio.com
NODE_ENV=production
```

## 🔐 Firebase Setup

1. Firebase Service Account Key'i kopyala:
   ```bash
   cp /path/to/service-account-key.json ./streambox-21949-firebase-adminsdk-fbsvc-0473571a7a.json
   ```

2. Firestore Security Rules'ı ayarla:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth.uid == userId;
       }
       match /channels/{document=**} {
         allow read: if request.auth != null;
       }
       match /licenses/{document=**} {
         allow read: if request.auth != null;
       }
       match /subscriptions/{document=**} {
         allow read: if request.auth != null;
       }
       match /devices/{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

## 📦 Bağımlılıklar

- **express**: Web framework
- **firebase-admin**: Firebase Admin SDK
- **cors**: CORS middleware
- **dotenv**: Environment variables

## 🚀 Deployment

### Heroku

```bash
git push heroku main
```

### Railway

```bash
railway up
```

### Docker

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📝 Lisans

ISC

## 👨‍💻 Geliştirici

Streambox Team
