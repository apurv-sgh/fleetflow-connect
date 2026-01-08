# GFAMS Backend - Complete Implementation

## 📋 Overview

This is a production-ready backend for the Government Fleet Allocation & Management System (GFAMS) developed for NIC's Transport Division. It implements a complete three-tier intelligent vehicle allocation algorithm with real-time GPS tracking, driver performance management, and comprehensive audit logging.

## ✨ Key Features

### 🚗 Vehicle Allocation
- **Three-Tier Intelligent Algorithm**
  - Tier 1: Nearest best-rated driver (rating ≥ 4.5)
  - Tier 2: Next nearest available driver (rating ≥ 3.5)
  - Tier 3: External service fallback (Uber, Rapido)
- Haversine distance calculation
- ETA feasibility checking
- Fair workload distribution

### 👨‍💼 Driver Management
- Performance-based tier categorization
- Real-time availability toggle with abuse detection
- GPS location tracking with spoofing detection
- Rating aggregation (rolling 90-day average)
- Penalty & incident management
- Comprehensive performance dashboard

### 📍 Real-Time Tracking
- Live GPS location updates
- Route visualization
- Geofencing with breach alerts
- Anomaly detection (spoofing, idle time, location inconsistency)
- 30-day rolling location history

### 🔐 Security & Compliance
- JWT-based authentication with refresh tokens
- Role-Based Access Control (RBAC)
- Multi-factor authentication ready
- Immutable audit logging (3-year retention)
- Data encryption at rest and in transit
- Rate limiting & DDoS protection
- Session timeout management

### 📊 Analytics & Reporting
- Real-time dashboard analytics
- Booking statistics & trends
- Driver performance leaderboards
- Cost analysis (internal vs external)
- Compliance reporting
- CSV/Excel export capabilities

### 🔔 Real-Time Communication
- Socket.io for live updates
- Booking notifications
- Driver availability changes
- Incident alerts
- Location updates

## 🛠️ Tech Stack

- **Runtime:** Node.js 16+
- **Framework:** Express.js 4.18+
- **Database:** MongoDB 4.4+
- **Real-Time:** Socket.io 4.7+
- **Authentication:** JWT + bcrypt
- **Validation:** Joi
- **Logging:** Winston
- **Security:** Helmet, CORS, Rate Limiting
- **Distance Calculation:** Geolib

## 📦 Installation

### Prerequisites
- Node.js 16 or higher
- MongoDB 4.4 or higher
- npm or yarn

### Step 1: Clone & Navigate
```bash
cd backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Step 4: Start MongoDB
```bash
# Using Docker (recommended)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use local MongoDB
mongod
```

### Step 5: Run Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:5000`

## 🚀 Quick Start Example

### 1. Register as Official
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "official@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "9876543210",
    "role": "OFFICIAL",
    "designation": "Joint Secretary",
    "department": "Transport"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "official@example.com",
    "password": "SecurePass123"
  }'
```

### 3. Create Booking
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

## 📚 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference with all endpoints, request/response examples, and error codes.

## 🏗️ Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system architecture, database schema, workflows, and implementation details.

## 📁 Project Structure

```
backend/
├── models/                  # MongoDB schemas
├── controllers/             # Request handlers
├── services/                # Business logic
├── routes/                  # API endpoints
├── middleware/              # Express middleware
├── utils/                   # Utility functions
├── server.js                # Main server
├── package.json
├── .env.example
├── API_DOCUMENTATION.md
└── ARCHITECTURE.md
```

## 🔑 Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development
API_URL=http://localhost:5000

# Database
MONGODB_URI=mongodb://localhost:27017/gfams

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# External Services
GOOGLE_MAPS_API_KEY=your_key
UBER_API_KEY=your_key
RAPIDO_API_KEY=your_key

# SMS & Email
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# Logging
LOG_LEVEL=debug
LOG_FILE=logs/app.log

# GPS Tracking
GPS_UPDATE_INTERVAL_ACTIVE=30000
GPS_UPDATE_INTERVAL_IDLE=120000
GPS_HISTORY_RETENTION_DAYS=30

# Booking
BOOKING_ACCEPTANCE_TIMEOUT=60000
BOOKING_CANCELLATION_WINDOW_MINUTES=30

# Driver
DRIVER_AVAILABILITY_TOGGLE_LIMIT=5
DRIVER_AVAILABILITY_TOGGLE_WINDOW_MINUTES=30

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
SESSION_TIMEOUT_MINUTES=15
```

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **OFFICIAL** | Create bookings, rate drivers, view own bookings |
| **HOG** | Create bookings (reserved pool), rate drivers |
| **DRIVER** | Register, toggle availability, update GPS, view performance |
| **ADMIN** | Full access, manage vehicles/drivers, approve bookings |
| **COMPLIANCE_OFFICER** | View audit logs, incidents, analytics (read-only) |
| **SUPER_ADMIN** | System configuration, user management |

## 🔄 Core Workflows

### Booking Creation
1. User submits booking request
2. System validates authorization
3. Allocation engine runs (Tier 1 → Tier 2 → Tier 3)
4. Driver receives notification (60-second window)
5. On acceptance: Booking confirmed, user notified
6. On rejection: Fallback to next tier
7. Audit trail logged

### Driver Availability Toggle
1. Driver toggles availability
2. System checks for abuse (5+ toggles in 30 min)
3. If abuse: Apply 30-minute lock
4. If normal: Update status, record toggle
5. Broadcast via Socket.io
6. Log audit trail

### GPS Anomaly Detection
1. GPS location update received
2. Check for spoofing (speed > 100 km/h)
3. Check location consistency with reported status
4. Check for excessive idle time (30+ min)
5. Create incident if anomaly detected
6. Alert admin if critical
7. Update driver location

## 🔐 Security Features

- ✅ JWT authentication with refresh tokens
- ✅ Role-Based Access Control (RBAC)
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Rate limiting (1000 requests/15 minutes)
- ✅ CORS protection
- ✅ Helmet.js for HTTP headers
- ✅ Immutable audit logging
- ✅ Data encryption at rest & in transit
- ✅ Session timeout (15 minutes)
- ✅ GPS spoofing detection
- ✅ Availability fraud detection

## 📊 Database Models

### User
- Authentication & profile management
- Role-based access control
- Audit trail of login/logout events

### Driver
- License & insurance verification
- Performance metrics (rating, completion rate, etc.)
- Tier categorization
- Penalty history
- GPS location tracking
- Availability toggle history

### Vehicle
- Inventory management
- Status tracking (available, in-use, maintenance, reserved)
- Maintenance schedule
- Driver assignment history
- Incident tracking

### Booking
- Booking request & allocation details
- Driver & vehicle assignment
- Journey tracking
- Rating & feedback
- Cancellation handling
- Guest booking support

### Rating
- Driver ratings from officials
- Feedback comments
- Category-wise ratings (cleanliness, driving, etc.)

### IncidentLog
- Anomaly detection (GPS spoofing, availability fraud, etc.)
- Severity levels (minor, major, critical)
- Admin actions & resolutions

### AuditLog
- Immutable audit trail
- All user actions logged
- 3-year retention
- Compliance-ready

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- authController.test.js

# Run with coverage
npm test -- --coverage
```

## 📈 Performance Metrics

- **Booking Response Time:** < 500ms
- **GPS Update Frequency:** 30 seconds (active), 2 minutes (idle)
- **Database Query Time:** < 100ms (with indexes)
- **API Rate Limit:** 1000 requests/15 minutes
- **Session Timeout:** 15 minutes
- **Token Expiry:** 1 hour (access), 7 days (refresh)

## 🚀 Deployment

### Docker Deployment

```bash
# Build image
docker build -t gfams-backend .

# Run container
docker run -p 5000:5000 \
  -e MONGODB_URI=mongodb://mongo:27017/gfams \
  -e JWT_SECRET=your_secret \
  gfams-backend
```

### Docker Compose

```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      MONGODB_URI: mongodb://mongo:27017/gfams
      JWT_SECRET: your_secret
    depends_on:
      - mongo
  
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### Production Checklist

- [ ] Set strong JWT secrets
- [ ] Configure production MongoDB
- [ ] Enable HTTPS/TLS
- [ ] Set CORS for production domain
- [ ] Configure rate limiting
- [ ] Enable audit logging
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Load test
- [ ] Security audit
- [ ] Documentation review

## 📞 Support & Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Check MongoDB is running
- Verify MONGODB_URI in .env
- Check network connectivity

**JWT Token Expired**
- Use refresh token endpoint
- Implement token refresh in frontend
- Check token expiry settings

**CORS Error**
- Add frontend URL to CORS_ORIGIN
- Verify credentials setting
- Check browser console

**GPS Spoofing False Positives**
- Adjust speed threshold
- Consider traffic conditions
- Implement route whitelist

## 📝 Logging

Logs are stored in `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only

Configure log level in `.env`:
```env
LOG_LEVEL=debug  # debug, info, warn, error
```

## 🔄 Real-Time Events

Connect to Socket.io for live updates:

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: accessToken }
});

socket.on('driver:availability-changed', (data) => {
  console.log('Driver availability updated:', data);
});

socket.on('vehicle:location-updated', (data) => {
  console.log('Vehicle location updated:', data);
});

socket.on('booking:status-changed', (data) => {
  console.log('Booking status changed:', data);
});

socket.on('incident:new', (data) => {
  console.log('New incident:', data);
});
```

## 📚 Additional Resources

- [API Documentation](./API_DOCUMENTATION.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [Express.js Docs](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Socket.io Docs](https://socket.io/docs/)

## 📄 License

This project is developed for NIC (National Informatics Centre) and follows government IT standards.

## 👥 Contributors

- NIC Transport Division
- Backend Development Team

## 📞 Contact

For issues, questions, or support, contact the NIC Transport Division team.

---

**Version:** 1.0.0  
**Last Updated:** January 2024  
**Status:** Production Ready ✅
