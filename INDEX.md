# GFAMS - Government Fleet Allocation & Management System
## Complete Backend Implementation

---

## 📖 Documentation Index

### 🚀 Getting Started
1. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Start here! Quick commands and key endpoints
2. **[backend/README.md](./backend/README.md)** - Backend overview and installation

### 📚 Complete Documentation
3. **[backend/API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md)** - Complete API reference with all endpoints
4. **[backend/ARCHITECTURE.md](./backend/ARCHITECTURE.md)** - System architecture and design patterns
5. **[FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)** - How to integrate with React frontend
6. **[BACKEND_IMPLEMENTATION_SUMMARY.md](./BACKEND_IMPLEMENTATION_SUMMARY.md)** - Complete implementation summary

---

## 🎯 Quick Start (5 Minutes)

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env

# 4. Start MongoDB
docker run -d -p 27017:27017 mongo:latest

# 5. Run server
npm run dev
```

✅ Server running on `http://localhost:5000`

---

## 📋 What's Included

### ✅ Complete Backend System
- **Express.js REST API** with 50+ endpoints
- **MongoDB Database** with 8 core models
- **Socket.io** for real-time communication
- **JWT Authentication** with refresh tokens
- **Role-Based Access Control** (6 roles)

### ✅ Core Features
- **Three-Tier Allocation Algorithm** (Tier 1 → Tier 2 → Tier 3)
- **Real-Time GPS Tracking** with spoofing detection
- **Driver Performance Management** with tier categorization
- **Anomaly Detection** (fraud, idle time, geofence breach)
- **Immutable Audit Logging** (3-year retention)
- **Admin Dashboard APIs** with analytics

### ✅ Security
- JWT authentication with refresh tokens
- Password hashing (bcrypt)
- Role-Based Access Control
- Rate limiting (1000 req/15 min)
- CORS protection
- Data encryption at rest & in transit
- Session timeout (15 minutes)

### ✅ Documentation
- API reference with examples
- System architecture guide
- Frontend integration guide
- Quick reference guide
- Implementation summary

---

## 🏗️ Project Structure

```
fleetflow-connect/
├── backend/                          # Complete backend system
│   ├── models/                       # 8 MongoDB schemas
│   ├── controllers/                  # Request handlers
│   ├── services/                     # Business logic
│   ├── routes/                       # API endpoints
│   ├── middleware/                   # Auth & validation
│   ├── utils/                        # Utilities
│   ├── server.js                     # Main server
│   ├── package.json
│   ├── .env.example
│   ├── README.md
│   ├── API_DOCUMENTATION.md
│   └── ARCHITECTURE.md
│
├── src/                              # Frontend (React)
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── ...
│
├── QUICK_REFERENCE.md                # Quick start guide
├── FRONTEND_INTEGRATION.md           # Frontend integration
├── BACKEND_IMPLEMENTATION_SUMMARY.md # Complete summary
└── README.md                         # This file
```

---

## 🔑 Key Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh-token
GET    /api/auth/me
PUT    /api/auth/profile
POST   /api/auth/logout
```

### Bookings
```
POST   /api/bookings
GET    /api/bookings
GET    /api/bookings/:id
PUT    /api/bookings/:id/cancel
POST   /api/bookings/:id/rate
```

### Drivers
```
POST   /api/drivers/register
GET    /api/drivers/profile
POST   /api/drivers/availability/toggle
POST   /api/drivers/gps/update
GET    /api/drivers/performance/dashboard
GET    /api/drivers/history/rides
```

### Vehicles
```
POST   /api/vehicles
GET    /api/vehicles
GET    /api/vehicles/:id
PUT    /api/vehicles/:id/status
GET    /api/vehicles/admin/stats
```

### Admin
```
GET    /api/admin/audit-logs
GET    /api/admin/incidents
GET    /api/admin/gps-history/:id
GET    /api/admin/dashboard/analytics
GET    /api/admin/analytics/bookings
```

---

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **OFFICIAL** | Create bookings, rate drivers, view own bookings |
| **HOG** | Create bookings (reserved pool), rate drivers |
| **DRIVER** | Register, toggle availability, update GPS, view performance |
| **ADMIN** | Full access, manage vehicles/drivers, approve bookings |
| **COMPLIANCE_OFFICER** | View audit logs, incidents, analytics (read-only) |
| **SUPER_ADMIN** | System configuration, user management |

---

## 🎯 Three-Tier Allocation Algorithm

```
Booking Request
    ↓
TIER 1: Nearest best-rated driver (rating ≥ 4.5)
    ├─ Calculate distance (Haversine formula)
    ├─ Check ETA feasibility (≤ 30 minutes)
    ├─ Verify GPS authenticity
    └─ Send notification (60-second window)
    ↓
If rejected → TIER 2: Next nearest driver (rating ≥ 3.5)
    └─ Same process as Tier 1
    ↓
If rejected → TIER 3: External service (Uber/Rapido)
    ├─ Query external APIs
    ├─ Show cost comparison
    └─ User confirms external booking
```

---

## 🔐 Security Features

- ✅ JWT authentication with refresh tokens
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Role-Based Access Control (RBAC)
- ✅ Rate limiting (1000 requests/15 minutes)
- ✅ CORS protection
- ✅ Helmet.js for HTTP headers
- ✅ Input validation with Joi
- ✅ Immutable audit logging (3-year retention)
- ✅ Data encryption at rest & in transit
- ✅ Session timeout (15 minutes)
- ✅ GPS spoofing detection
- ✅ Availability fraud detection

---

## 📊 Database Models

1. **User** - Authentication & profile management
2. **Driver** - Performance metrics, tier, penalties
3. **Vehicle** - Inventory, status, maintenance
4. **Booking** - Requests, allocations, ratings
5. **Rating** - Driver feedback from officials
6. **GPSLocationHistory** - Real-time location tracking (30-day TTL)
7. **IncidentLog** - Anomalies & fraud detection
8. **AuditLog** - Immutable audit trail (3-year TTL)

---

## 🔄 Real-Time Communication (Socket.io)

### Events
```javascript
// Listen to events
socket.on('driver:availability-changed', (data) => {});
socket.on('vehicle:location-updated', (data) => {});
socket.on('booking:status-changed', (data) => {});
socket.on('booking:driver-responded', (data) => {});
socket.on('incident:new', (data) => {});

// Emit events
socket.emit('driver:availability-update', data);
socket.emit('driver:gps-update', data);
socket.emit('booking:status-update', data);
socket.emit('booking:driver-response', data);
socket.emit('incident:alert', data);
```

---

## 📈 Performance Metrics

| Metric | Target |
|--------|--------|
| Booking Response Time | < 500ms |
| GPS Update Frequency | 30 sec (active), 2 min (idle) |
| Database Query Time | < 100ms (with indexes) |
| API Rate Limit | 1000 requests/15 minutes |
| Session Timeout | 15 minutes |
| Access Token Expiry | 1 hour |
| Refresh Token Expiry | 7 days |

---

## 🧪 Test the API

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "firstName": "Test",
    "lastName": "User",
    "phone": "9876543210",
    "role": "OFFICIAL"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

### Create Booking
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "pickupLocation": {
      "latitude": 28.6139,
      "longitude": 77.2090,
      "address": "NIC HQ, Delhi"
    },
    "dropLocation": {
      "latitude": 28.5244,
      "longitude": 77.1855,
      "address": "Ministry of Transport"
    },
    "requestedDateTime": "2024-01-15T14:30:00Z",
    "journeyDurationMinutes": 45,
    "numberOfPassengers": 2
  }'
```

---

## 🚀 Deployment

### Docker
```bash
docker build -t gfams-backend backend/
docker run -p 5000:5000 \
  -e MONGODB_URI=mongodb://mongo:27017/gfams \
  -e JWT_SECRET=your_secret \
  gfams-backend
```

### Environment Variables (Production)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gfams
JWT_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<strong-random-secret>
CORS_ORIGIN=https://yourdomain.com
```

---

## 📚 Documentation Files

| File | Purpose | Read Time |
|------|---------|-----------|
| QUICK_REFERENCE.md | Quick commands & endpoints | 5 min |
| backend/README.md | Backend overview | 10 min |
| backend/API_DOCUMENTATION.md | Complete API reference | 30 min |
| backend/ARCHITECTURE.md | System design & workflows | 20 min |
| FRONTEND_INTEGRATION.md | Frontend integration guide | 25 min |
| BACKEND_IMPLEMENTATION_SUMMARY.md | Complete summary | 15 min |

---

## ✅ Implementation Checklist

- ✅ Backend server (Express.js)
- ✅ Database models (MongoDB)
- ✅ Authentication & authorization
- ✅ Booking & allocation engine
- ✅ Driver management
- ✅ GPS tracking & monitoring
- ✅ Anomaly detection
- ✅ Admin APIs
- ✅ Audit logging
- ✅ Real-time communication (Socket.io)
- ✅ Security features
- ✅ Error handling
- ✅ Input validation
- ✅ Rate limiting
- ✅ Documentation
- ✅ Testing setup
- ✅ Deployment ready

---

## 🎓 Next Steps

### 1. Setup Backend
```bash
cd backend
npm install
npm run dev
```

### 2. Test API
- Use Postman or curl
- Test authentication flow
- Create test bookings

### 3. Integrate Frontend
- Follow FRONTEND_INTEGRATION.md
- Setup API client
- Connect Socket.io
- Implement protected routes

### 4. Deploy
- Build Docker image
- Configure production environment
- Deploy to server

---

## 📞 Support

For issues or questions:
1. Check QUICK_REFERENCE.md for common commands
2. Review API_DOCUMENTATION.md for endpoint details
3. See ARCHITECTURE.md for system design
4. Check FRONTEND_INTEGRATION.md for integration help

---

## 📄 License

Developed for NIC (National Informatics Centre)  
Follows Government IT Standards

---

## 👥 Contributors

- NIC Transport Division
- Backend Development Team

---

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** January 2024  
**Compliance:** Government IT Standards ✓

---

## 🎉 You're All Set!

The complete GFAMS backend is ready for:
- ✅ Development
- ✅ Testing
- ✅ Integration with frontend
- ✅ Production deployment

Start with [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for immediate setup!
