# GFAMS Backend - Complete Setup & API Documentation

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB 4.4+
- npm or yarn

### Installation

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start MongoDB**
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use local MongoDB installation
mongod
```

5. **Run the server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

---

## 📋 API Endpoints

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "9876543210",
  "role": "OFFICIAL",
  "designation": "Joint Secretary",
  "department": "Transport"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "...",
    "email": "user@example.com",
    "role": "OFFICIAL",
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": "...",
    "email": "user@example.com",
    "role": "OFFICIAL",
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <accessToken>

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "driverProfile": { ... } // if driver
  }
}
```

#### Refresh Token
```
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "..."
}

Response:
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

---

### Booking Endpoints

#### Create Booking
```
POST /api/bookings
Authorization: Bearer <accessToken>
Content-Type: application/json

{
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
  "numberOfPassengers": 2,
  "specialRequirements": "Wheelchair accessible"
}

Response:
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking": { ... },
    "allocation": {
      "success": true,
      "allocationMethod": "TIER_1_BEST_DRIVER",
      "driver": { ... },
      "vehicle": { ... }
    }
  }
}
```

#### Get Booking
```
GET /api/bookings/:bookingId
Authorization: Bearer <accessToken>

Response:
{
  "success": true,
  "data": { ... }
}
```

#### Get User Bookings
```
GET /api/bookings?status=COMPLETED&page=1&limit=10
Authorization: Bearer <accessToken>

Response:
{
  "success": true,
  "data": {
    "bookings": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

#### Cancel Booking
```
PUT /api/bookings/:bookingId/cancel
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "reason": "Schedule changed"
}

Response:
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": { ... }
}
```

#### Rate Driver
```
POST /api/bookings/:bookingId/rate
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "score": 5,
  "feedback": "Excellent service, very professional"
}

Response:
{
  "success": true,
  "message": "Rating submitted successfully",
  "data": { ... }
}
```

---

### Driver Endpoints

#### Register Driver
```
POST /api/drivers/register
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "licenseNumber": "DL1234567890123",
  "licenseExpiry": "2025-12-31",
  "licenseDocument": "url_to_document",
  "insuranceCertificate": "url_to_certificate",
  "bankAccount": {
    "accountNumber": "1234567890",
    "ifscCode": "SBIN0001234",
    "accountHolderName": "Driver Name"
  }
}

Response:
{
  "success": true,
  "message": "Driver registration submitted. Awaiting verification.",
  "data": { ... }
}
```

#### Get Driver Profile
```
GET /api/drivers/profile
Authorization: Bearer <accessToken>

Response:
{
  "success": true,
  "data": { ... }
}
```

#### Toggle Availability
```
POST /api/drivers/availability/toggle
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "reason": "End of shift"
}

Response:
{
  "success": true,
  "message": "Availability set to OFF",
  "data": {
    "availabilityStatus": "OFF",
    "toggleCount": 2
  }
}
```

#### Update GPS Location
```
POST /api/drivers/gps/update
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "latitude": 28.6139,
  "longitude": 77.2090,
  "accuracy": 15,
  "speed": 45,
  "heading": 180
}

Response:
{
  "success": true,
  "message": "GPS location updated",
  "data": {
    "latitude": 28.6139,
    "longitude": 77.2090,
    "accuracy": 15
  }
}
```

#### Get Performance Dashboard
```
GET /api/drivers/performance/dashboard
Authorization: Bearer <accessToken>

Response:
{
  "success": true,
  "data": {
    "driver": { ... },
    "performanceMetrics": { ... },
    "recentRatings": [ ... ],
    "monthlyAverage": 4.7,
    "penaltyHistory": [ ... ]
  }
}
```

#### Get Ride History
```
GET /api/drivers/history/rides?page=1&limit=10
Authorization: Bearer <accessToken>

Response:
{
  "success": true,
  "data": {
    "bookings": [ ... ],
    "pagination": { ... }
  }
}
```

---

### Vehicle Endpoints

#### Create Vehicle (Admin)
```
POST /api/vehicles
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "registrationNumber": "DL01AB1234",
  "model": "Toyota Innova",
  "manufacturer": "Toyota",
  "seatingCapacity": 7,
  "fuelType": "DIESEL",
  "color": "White",
  "yearOfManufacture": 2023,
  "registrationExpiry": "2025-12-31",
  "insuranceExpiry": "2025-12-31",
  "insurancePolicyNumber": "POL123456"
}

Response:
{
  "success": true,
  "message": "Vehicle created successfully",
  "data": { ... }
}
```

#### Get All Vehicles (Admin)
```
GET /api/vehicles?status=AVAILABLE&page=1&limit=20
Authorization: Bearer <accessToken>

Response:
{
  "success": true,
  "data": {
    "vehicles": [ ... ],
    "pagination": { ... }
  }
}
```

#### Get Vehicle Details
```
GET /api/vehicles/:vehicleId
Authorization: Bearer <accessToken>

Response:
{
  "success": true,
  "data": { ... }
}
```

#### Update Vehicle Status (Admin)
```
PUT /api/vehicles/:vehicleId/status
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "status": "MAINTENANCE",
  "reason": "Regular service"
}

Response:
{
  "success": true,
  "message": "Vehicle status updated",
  "data": { ... }
}
```

#### Get Vehicle Statistics (Admin)
```
GET /api/vehicles/admin/stats
Authorization: Bearer <accessToken>

Response:
{
  "success": true,
  "data": {
    "total": 50,
    "available": 35,
    "inUse": 10,
    "maintenance": 3,
    "reserved": 2
  }
}
```

---

### Admin Endpoints

#### Get Audit Logs
```
GET /api/admin/audit-logs?entityType=BOOKING&page=1&limit=50
Authorization: Bearer <accessToken>

Response:
{
  "success": true,
  "data": {
    "logs": [ ... ],
    "pagination": { ... }
  }
}
```

#### Export Audit Logs
```
GET /api/admin/audit-logs/export?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <accessToken>

Response: CSV file download
```

#### Get Incidents
```
GET /api/admin/incidents?severity=CRITICAL&page=1&limit=20
Authorization: Bearer <accessToken>

Response:
{
  "success": true,
  "data": {
    "incidents": [ ... ],
    "pagination": { ... }
  }
}
```

#### Get GPS History
```
GET /api/admin/gps-history/:vehicleId?startDate=2024-01-01&limit=100
Authorization: Bearer <accessToken>

Response:
{
  "success": true,
  "data": [ ... ]
}
```

#### Get Dashboard Analytics
```
GET /api/admin/dashboard/analytics
Authorization: Bearer <accessToken>

Response:
{
  "success": true,
  "data": {
    "bookings": { ... },
    "vehicles": { ... },
    "drivers": { ... },
    "incidents": { ... }
  }
}
```

#### Get Booking Analytics
```
GET /api/admin/analytics/bookings?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <accessToken>

Response:
{
  "success": true,
  "data": {
    "totalBookings": 150,
    "completedBookings": 145,
    "cancelledBookings": 5,
    "internalBookings": 120,
    "externalBookings": 30,
    "totalCost": 45000,
    "averageRating": 4.6
  }
}
```

---

## 🔐 Authentication

All protected endpoints require an `Authorization` header with a Bearer token:

```
Authorization: Bearer <accessToken>
```

Tokens expire after 1 hour. Use the refresh token to get a new access token:

```
POST /api/auth/refresh-token
{
  "refreshToken": "..."
}
```

---

## 👥 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| OFFICIAL | Create bookings, rate drivers, view own bookings |
| HOG | Create bookings (reserved pool), rate drivers, view own bookings |
| DRIVER | Register, toggle availability, update GPS, view performance |
| ADMIN | Full access to all resources, manage vehicles/drivers, approve bookings |
| COMPLIANCE_OFFICER | View audit logs, incidents, analytics (read-only) |
| SUPER_ADMIN | System configuration, user management |

---

## 🔄 Real-Time Events (Socket.io)

Connect to Socket.io for real-time updates:

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: accessToken
  }
});

// Listen for events
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

---

## 📊 Database Models

### User
- email, password, firstName, lastName, phone
- role, designation, department, authorityLevel
- isActive, isVerified, lastLogin
- auditLog

### Driver
- userId, licenseNumber, licenseExpiry
- currentVehicle, availabilityStatus
- performanceMetrics (rating, completionRate, etc.)
- tierCategory, penaltyHistory
- gpsLocation, backgroundVerification

### Vehicle
- registrationNumber, model, manufacturer
- seatingCapacity, fuelType, status
- currentDriver, reservedFor
- maintenanceHistory, driverHistory
- incidents, auditTrail

### Booking
- bookingId, official, pickupLocation, dropLocation
- requestedDateTime, status
- assignedDriver, assignedVehicle
- cost, rating, cancellation
- auditTrail, guestBooking

### Rating
- bookingId, driverId, ratedBy
- score (1-5), feedback, timestamp

### IncidentLog
- incidentId, incidentType, driverId
- description, severity, status
- reportedBy, adminAction

### AuditLog
- logId, actionType, entityType
- userId, oldValue, newValue
- timestamp, ipAddress, status

---

## 🛡️ Security Features

- JWT-based authentication with refresh tokens
- Role-Based Access Control (RBAC)
- Password hashing with bcrypt
- Rate limiting (1000 requests/15 minutes)
- CORS protection
- Helmet.js for HTTP headers
- Immutable audit logging
- Data encryption at rest and in transit
- Session timeout (15 minutes)

---

## 📝 Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

---

## 🧪 Testing

Run tests:
```bash
npm test
```

---

## 📦 Deployment

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t gfams-backend .
docker run -p 5000:5000 --env-file .env gfams-backend
```

### Environment Variables for Production

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/gfams
JWT_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<strong-random-secret>
CORS_ORIGIN=https://yourdomain.com
```

---

## 📞 Support

For issues or questions, contact the NIC Transport Division team.

---

**Last Updated:** January 2024
**Version:** 1.0.0
