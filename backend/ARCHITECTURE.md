# GFAMS Backend - Architecture & Implementation Guide

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    GFAMS BACKEND ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              PRESENTATION LAYER (REST APIs)              │  │
│  │  /api/auth  /api/bookings  /api/drivers  /api/vehicles   │  │
│  └───────────────────���──────────────────────────────────────┘  │
│           ▲                                       ▲              │
│           │          Express.js + Socket.io      │              │
│           ▼                                       ▼              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          MIDDLEWARE LAYER (Auth & Validation)            │  │
│  │  Authentication | Authorization | Rate Limiting | Logging│  │
│  └──────────────────────────────────────────────────────────┘  │
│           ▲                                                      │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────────────────��────────────────────────────┐  │
│  │         BUSINESS LOGIC LAYER (Services)                  │  │
│  │  ┌─────────────────┐  ┌──────────────┐  ┌────────────┐  │  │
│  │  │Allocation       │  │Performance   │  │Anomaly     │  │  │
│  │  │Service          │  │Service       │  │Detection   │  │  │
│  │  └─────────────────┘  └──────────────┘  └────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│           ▲                                                      │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────────────────────���───────────────────────┐  │
│  │         DATA ACCESS LAYER (Controllers)                  │  │
│  │  Auth | Booking | Driver | Vehicle | Admin Controllers  │  │
│  └──────────────────────────────────────────────────────────┘  │
│           ▲                                                      │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         DATABASE LAYER (MongoDB Models)                  │  │
│  │  User | Driver | Vehicle | Booking | Rating | Audit     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
backend/
├── models/                          # MongoDB Schemas
│   ├── User.js                      # User model (Officials, HOGs, Drivers, Admins)
│   ├── Driver.js                    # Driver profile with performance metrics
│   ├── Vehicle.js                   # Vehicle inventory and status
│   ├── Booking.js                   # Booking requests and allocations
│   ├── Rating.js                    # Driver ratings from officials
│   ├── GPSLocationHistory.js         # Real-time GPS tracking history
│   ├── IncidentLog.js               # Incident and anomaly logs
│   └── AuditLog.js                  # Immutable audit trail
│
├── controllers/                     # Request handlers
│   ├── authController.js            # Authentication & user management
│   ├── bookingController.js         # Booking creation & management
��   ├── driverController.js          # Driver operations
│   └── adminController.js           # Admin operations (in routes)
│
├── services/                        # Business logic
│   ├── allocationService.js         # Three-tier allocation algorithm
│   ├── anomalyDetectionService.js   # Fraud & anomaly detection
│   └── performanceService.js        # Driver performance management
│
├── routes/                          # API endpoints
│   ├── authRoutes.js                # /api/auth
│   ├── bookingRoutes.js             # /api/bookings
│   ├── driverRoutes.js              # /api/drivers
│   ├── vehicleRoutes.js             # /api/vehicles
│   └── adminRoutes.js               # /api/admin
│
��── middleware/                      # Express middleware
│   └── auth.js                      # Authentication, authorization, validation
│
├── utils/                           # Utility functions
│   ├── authUtils.js                 # JWT & password utilities
│   ├── allocationUtils.js           # Distance & scoring calculations
│   ├── auditUtils.js                # Audit logging
│   └── logger.js                    # Winston logger
│
├── server.js                        # Main Express server & Socket.io
├── package.json                     # Dependencies
├── .env.example                     # Environment template
├── API_DOCUMENTATION.md             # API reference
└── ARCHITECTURE.md                  # This file
```

---

## 🔄 Core Workflows

### 1. Booking Creation & Allocation Flow

```
User submits booking request
    ↓
Validate booking details & user authorization
    ↓
Create booking record (status: PENDING)
    ↓
Trigger Allocation Engine
    ├─→ TIER 1: Find best-rated driver (rating ≥ 4.5)
    │   ├─→ Calculate distance using Haversine formula
    │   ├─→ Check ETA feasibility (≤ 30 minutes)
    │   ├─→ Verify GPS authenticity
    │   └─→ Send booking request to driver (60-sec window)
    │
    ├─→ If Tier 1 fails → TIER 2: Next nearest driver (rating ≥ 3.5)
    │   └─→ Same process as Tier 1
    │
    └─→ If Tier 2 fails → TIER 3: External service (Uber/Rapido)
        └─→ Query external APIs
        └─→ Show cost comparison to user
        └─→ User confirms external booking
    ↓
Driver receives notification
    ├─→ Accept → Booking confirmed (status: DRIVER_ACCEPTED)
    └─→ Reject → Fallback to next tier
    ↓
Log audit trail with all details
    ↓
Send confirmation to user with driver details & ETA
```

### 2. Driver Availability Toggle Flow

```
Driver toggles availability
    ↓
Check for abuse (5+ toggles in 30 minutes)
    ├─→ If abuse detected:
    │   ├─→ Create incident log
    │   ├─→ Apply 30-minute temporary lock
    │   └─→ Return error to driver
    │
    └─→ If normal:
        ├─→ Update availability status
        ├─→ Record toggle with GPS location & reason
        ├─→ Log audit trail
        └─→ Broadcast via Socket.io
```

### 3. GPS Anomaly Detection Flow

```
GPS location update received
    ↓
Check for spoofing (speed > 100 km/h between updates)
    ├─→ If spoofing detected:
    │   ├─→ Create CRITICAL incident
    │   ├─→ Flag driver for investigation
    │   └─→ Alert admin
    │
    ├─→ Check location consistency with reported status
    │   └─→ If inconsistency: Flag for review
    │
    └─→ Check for excessive idle time (30+ minutes)
        └─→ If idle: Create MINOR incident
    ↓
Update driver GPS location
    ↓
Broadcast location update via Socket.io
```

### 4. Driver Rating & Tier Categorization Flow

```
Booking completed
    ↓
User rates driver (1-5 stars)
    ↓
Create rating record
    ↓
Recalculate rolling 90-day average rating
    ↓
Update driver performance metrics
    ↓
Recategorize driver tier:
    ├─→ TIER_1_RESERVED: rating ≥ 4.5, completion ≥ 95%, no penalties
    ├─→ TIER_2_PRIORITY: rating 4.0-4.5, completion ≥ 90%, ≤ 1 penalty
    ├─→ TIER_3_STANDARD: rating 3.5-4.0, completion �� 85%
    └─→ TIER_4_PROBATION: rating < 3.5 or recent major incidents
    ↓
Log audit trail
    ↓
Broadcast tier change via Socket.io
```

---

## 🎯 Allocation Algorithm Details

### Scoring Formula

```
ALLOCATION_SCORE = 
    (0.5 × PROXIMITY_SCORE) +
    (0.3 × RATING_SCORE) +
    (0.1 × RELIABILITY_SCORE) +
    (0.1 × LOAD_BALANCE_SCORE)

Where:
  PROXIMITY_SCORE = (MAX_DISTANCE - driver_distance) / MAX_DISTANCE
  RATING_SCORE = driver_rating / 5.0
  RELIABILITY_SCORE = driver_completion_rate / 100
  LOAD_BALANCE_SCORE = (1 - (driver_trips_today / avg_trips_per_driver))
```

### Distance Calculation (Haversine Formula)

```javascript
const R = 6371000; // Earth's radius in meters
const dLat = ((lat2 - lat1) * π) / 180;
const dLon = ((lon2 - lon1) * π) / 180;
const a = sin²(dLat/2) + cos(lat1) × cos(lat2) × sin²(dLon/2);
const c = 2 × atan2(√a, √(1-a));
distance = R × c;
```

---

## 🔐 Security Implementation

### Authentication Flow

```
User Login
    ↓
Verify email & password
    ↓
Generate JWT tokens:
    ├─→ Access Token (1 hour expiry)
    └─→ Refresh Token (7 days expiry)
    ↓
Return tokens to client
    ↓
Client stores tokens (localStorage/sessionStorage)
    ↓
For each API request:
    ├─→ Include Authorization: Bearer <accessToken>
    ├─→ Server verifies token signature & expiry
    └─→ Extract user info from token payload
    ↓
If token expired:
    ├─→ Client sends refresh token
    ├─→ Server validates refresh token
    └─→ Return new access token
```

### Role-Based Access Control (RBAC)

```
Request arrives with Authorization header
    ↓
Extract & verify JWT token
    ↓
Get user role from token
    ↓
Check if role is in allowed roles for endpoint
    ├─→ If allowed: Proceed to controller
    └─→ If denied: Return 403 Forbidden
    ↓
Log unauthorized access attempt to audit trail
```

### Data Protection

```
Sensitive Data (passwords, license numbers, GPS history)
    ↓
├─→ At Rest: AES-256 encryption in MongoDB
├─→ In Transit: HTTPS/TLS 1.2+
├─→ In Memory: Cleared after use
└─→ Audit Trail: Immutable, encrypted logs
```

---

## 📊 Database Indexing Strategy

```javascript
// User indexes
{ email: 1 }                    // Fast email lookup
{ role: 1 }                     // Filter by role
{ isActive: 1 }                 // Active users only
{ createdAt: -1 }               // Recent users first

// Driver indexes
{ userId: 1 }                   // Unique driver per user
{ tierCategory: 1 }             // Filter by tier
{ availabilityStatus: 1 }       // Available drivers
{ 'performanceMetrics.averageRating': -1 }  // Top performers

// Booking indexes
{ 'official.id': 1 }            // User's bookings
{ 'assignedDriver.id': 1 }      // Driver's bookings
{ status: 1 }                   // Filter by status
{ requestedDateTime: 1 }        // Upcoming bookings
{ createdAt: -1 }               // Recent bookings

// GPS Location History (TTL index)
{ timestamp: 1 }                // Auto-delete after 30 days

// Audit Log (TTL index)
{ timestamp: 1 }                // Auto-delete after 3 years
```

---

## 🔄 Real-Time Communication (Socket.io)

### Event Flow

```
Client connects with auth token
    ↓
Server verifies token
    ↓
Client joins room based on role:
    ├─→ DRIVER: driver_<driverId>
    ├─→ OFFICIAL: official_<officialId>
    ├─→ ADMIN: admin_room
    └─→ BROADCAST: all_users
    ↓
Events emitted:
    ├─→ driver:availability-changed
    ├─→ vehicle:location-updated
    ├─→ booking:status-changed
    ├─→ booking:driver-responded
    ├─→ incident:new
    └─→ notification:alert
```

---

## 📈 Performance Optimization

### Caching Strategy

```
Frequently accessed data:
├─→ Driver tier categories (cache 1 hour)
├─→ Vehicle availability (cache 5 minutes)
├─→ Top performers list (cache 1 hour)
└─→ User permissions (cache session)

Cache invalidation:
├─→ On data update
├─→ On scheduled interval
└─→ Manual admin refresh
```

### Query Optimization

```
Use indexes for:
├─→ Filtering (status, role, tier)
├─→ Sorting (rating, createdAt)
├─→ Pagination (skip/limit)
└─→ Aggregation (analytics)

Avoid:
├─→ Full collection scans
├─→ Regex searches on large fields
├─→ Nested lookups without indexes
└─→ Sorting on non-indexed fields
```

---

## 🚀 Deployment Checklist

- [ ] Set all environment variables
- [ ] Configure MongoDB connection string
- [ ] Generate strong JWT secrets
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS for production domain
- [ ] Set up rate limiting
- [ ] Enable audit logging
- [ ] Configure backup strategy
- [ ] Set up monitoring & alerting
- [ ] Test all API endpoints
- [ ] Verify authentication flow
- [ ] Test Socket.io connections
- [ ] Load test the system
- [ ] Security audit
- [ ] Documentation review

---

## 📞 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```
Solution: Check MONGODB_URI in .env
Verify MongoDB is running
Check network connectivity
```

**JWT Token Expired**
```
Solution: Use refresh token to get new access token
Client should handle 401 responses
Implement token refresh logic
```

**CORS Error**
```
Solution: Add frontend URL to CORS_ORIGIN in .env
Verify credentials: true in Socket.io config
Check browser console for specific error
```

**GPS Spoofing False Positives**
```
Solution: Adjust speed threshold in anomalyDetectionService.js
Consider traffic conditions
Implement whitelist for known routes
```

---

## 📚 References

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Socket.io Documentation](https://socket.io/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [OWASP Security Guidelines](https://owasp.org/)

---

**Last Updated:** January 2024
**Version:** 1.0.0
**Maintained By:** NIC Transport Division
