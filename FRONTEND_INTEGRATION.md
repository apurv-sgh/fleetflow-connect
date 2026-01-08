# GFAMS Frontend Integration Guide

## 🔗 Backend Integration Setup

This guide explains how to integrate the GFAMS React frontend with the backend API.

## 📦 Installation

### 1. Install Required Dependencies

```bash
cd frontend  # or root directory if frontend is there
npm install axios socket.io-client
```

### 2. Create API Client

Create `src/services/api.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### 3. Create Socket.io Client

Create `src/services/socket.js`:

```javascript
import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const initSocket = (token) => {
  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Event listeners
export const onDriverAvailabilityChanged = (callback) => {
  if (socket) socket.on('driver:availability-changed', callback);
};

export const onVehicleLocationUpdated = (callback) => {
  if (socket) socket.on('vehicle:location-updated', callback);
};

export const onBookingStatusChanged = (callback) => {
  if (socket) socket.on('booking:status-changed', callback);
};

export const onBookingDriverResponded = (callback) => {
  if (socket) socket.on('booking:driver-responded', callback);
};

export const onIncidentAlert = (callback) => {
  if (socket) socket.on('incident:new', callback);
};

// Event emitters
export const emitDriverAvailabilityUpdate = (data) => {
  if (socket) socket.emit('driver:availability-update', data);
};

export const emitGPSUpdate = (data) => {
  if (socket) socket.emit('driver:gps-update', data);
};

export const emitBookingStatusUpdate = (data) => {
  if (socket) socket.emit('booking:status-update', data);
};

export const emitDriverResponse = (data) => {
  if (socket) socket.emit('booking:driver-response', data);
};

export const emitIncidentAlert = (data) => {
  if (socket) socket.emit('incident:alert', data);
};
```

### 4. Create Auth Service

Create `src/services/authService.js`:

```javascript
import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { accessToken, refreshToken } = response.data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(response.data.data));
    return response.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },
};
```

### 5. Create Booking Service

Create `src/services/bookingService.js`:

```javascript
import api from './api';

export const bookingService = {
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  getBooking: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  },

  getUserBookings: async (status, page = 1, limit = 10) => {
    const response = await api.get('/bookings', {
      params: { status, page, limit },
    });
    return response.data;
  },

  cancelBooking: async (bookingId, reason) => {
    const response = await api.put(`/bookings/${bookingId}/cancel`, { reason });
    return response.data;
  },

  rateDriver: async (bookingId, score, feedback) => {
    const response = await api.post(`/bookings/${bookingId}/rate`, {
      score,
      feedback,
    });
    return response.data;
  },

  getPendingBookings: async (page = 1, limit = 20) => {
    const response = await api.get('/bookings/admin/pending', {
      params: { page, limit },
    });
    return response.data;
  },
};
```

### 6. Create Driver Service

Create `src/services/driverService.js`:

```javascript
import api from './api';

export const driverService = {
  registerDriver: async (driverData) => {
    const response = await api.post('/drivers/register', driverData);
    return response.data;
  },

  getDriverProfile: async () => {
    const response = await api.get('/drivers/profile');
    return response.data;
  },

  toggleAvailability: async (reason) => {
    const response = await api.post('/drivers/availability/toggle', { reason });
    return response.data;
  },

  updateGPSLocation: async (latitude, longitude, accuracy, speed, heading) => {
    const response = await api.post('/drivers/gps/update', {
      latitude,
      longitude,
      accuracy,
      speed,
      heading,
    });
    return response.data;
  },

  getPerformanceDashboard: async () => {
    const response = await api.get('/drivers/performance/dashboard');
    return response.data;
  },

  getRideHistory: async (page = 1, limit = 10) => {
    const response = await api.get('/drivers/history/rides', {
      params: { page, limit },
    });
    return response.data;
  },

  getAllDrivers: async (tier, status, page = 1, limit = 20) => {
    const response = await api.get('/drivers/admin/all', {
      params: { tier, status, page, limit },
    });
    return response.data;
  },

  getTopPerformers: async (limit = 10) => {
    const response = await api.get('/drivers/admin/top-performers', {
      params: { limit },
    });
    return response.data;
  },
};
```

### 7. Create Vehicle Service

Create `src/services/vehicleService.js`:

```javascript
import api from './api';

export const vehicleService = {
  createVehicle: async (vehicleData) => {
    const response = await api.post('/vehicles', vehicleData);
    return response.data;
  },

  getAllVehicles: async (status, page = 1, limit = 20) => {
    const response = await api.get('/vehicles', {
      params: { status, page, limit },
    });
    return response.data;
  },

  getVehicle: async (vehicleId) => {
    const response = await api.get(`/vehicles/${vehicleId}`);
    return response.data;
  },

  updateVehicleStatus: async (vehicleId, status, reason) => {
    const response = await api.put(`/vehicles/${vehicleId}/status`, {
      status,
      reason,
    });
    return response.data;
  },

  getVehicleStats: async () => {
    const response = await api.get('/vehicles/admin/stats');
    return response.data;
  },
};
```

### 8. Create Admin Service

Create `src/services/adminService.js`:

```javascript
import api from './api';

export const adminService = {
  getAuditLogs: async (filters = {}, page = 1, limit = 50) => {
    const response = await api.get('/admin/audit-logs', {
      params: { ...filters, page, limit },
    });
    return response.data;
  },

  exportAuditLogs: async (filters = {}) => {
    const response = await api.get('/admin/audit-logs/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },

  getIncidents: async (filters = {}, page = 1, limit = 20) => {
    const response = await api.get('/admin/incidents', {
      params: { ...filters, page, limit },
    });
    return response.data;
  },

  getGPSHistory: async (vehicleId, startDate, endDate, limit = 100) => {
    const response = await api.get(`/admin/gps-history/${vehicleId}`, {
      params: { startDate, endDate, limit },
    });
    return response.data;
  },

  getDashboardAnalytics: async () => {
    const response = await api.get('/admin/dashboard/analytics');
    return response.data;
  },

  getBookingAnalytics: async (startDate, endDate) => {
    const response = await api.get('/admin/analytics/bookings', {
      params: { startDate, endDate },
    });
    return response.data;
  },
};
```

## 🔌 Environment Configuration

Create `.env` in frontend root:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_GOOGLE_MAPS_API_KEY=your_key
```

## 🎯 Usage Examples

### Login & Store Tokens

```javascript
import { authService } from './services/authService';
import { initSocket } from './services/socket';

const handleLogin = async (email, password) => {
  try {
    const result = await authService.login(email, password);
    const { accessToken } = result.data;
    
    // Initialize Socket.io
    initSocket(accessToken);
    
    // Redirect based on role
    const user = JSON.parse(localStorage.getItem('user'));
    if (user.role === 'DRIVER') {
      navigate('/driver/dashboard');
    } else if (user.role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else {
      navigate('/user/dashboard');
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Create Booking

```javascript
import { bookingService } from './services/bookingService';

const handleCreateBooking = async (bookingData) => {
  try {
    const result = await bookingService.createBooking({
      pickupLocation: {
        latitude: 28.6139,
        longitude: 77.2090,
        address: 'NIC HQ, Delhi',
      },
      dropLocation: {
        latitude: 28.5244,
        longitude: 77.1855,
        address: 'Ministry of Transport',
      },
      requestedDateTime: new Date().toISOString(),
      journeyDurationMinutes: 45,
      numberOfPassengers: 2,
    });

    console.log('Booking created:', result.data);
    // Show allocation result to user
  } catch (error) {
    console.error('Booking creation failed:', error);
  }
};
```

### Listen to Real-Time Updates

```javascript
import { 
  onBookingStatusChanged, 
  onVehicleLocationUpdated,
  onDriverAvailabilityChanged 
} from './services/socket';

useEffect(() => {
  // Listen for booking status changes
  onBookingStatusChanged((data) => {
    console.log('Booking status updated:', data);
    // Update UI
  });

  // Listen for vehicle location updates
  onVehicleLocationUpdated((data) => {
    console.log('Vehicle location updated:', data);
    // Update map
  });

  // Listen for driver availability changes
  onDriverAvailabilityChanged((data) => {
    console.log('Driver availability changed:', data);
    // Update driver list
  });
}, []);
```

### Update GPS Location (Driver)

```javascript
import { driverService, emitGPSUpdate } from './services/driverService';

const updateDriverLocation = async () => {
  navigator.geolocation.watchPosition(
    async (position) => {
      const { latitude, longitude, accuracy } = position.coords;

      // Update backend
      await driverService.updateGPSLocation(
        latitude,
        longitude,
        accuracy,
        position.coords.speed,
        position.coords.heading
      );

      // Emit real-time update
      emitGPSUpdate({
        latitude,
        longitude,
        accuracy,
        timestamp: new Date(),
      });
    },
    (error) => console.error('Geolocation error:', error),
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  );
};
```

### Get Admin Analytics

```javascript
import { adminService } from './services/adminService';

const loadAnalytics = async () => {
  try {
    const analytics = await adminService.getDashboardAnalytics();
    console.log('Analytics:', analytics.data);
    // Update dashboard
  } catch (error) {
    console.error('Failed to load analytics:', error);
  }
};
```

## 🔐 Protected Routes

Create `src/components/ProtectedRoute.jsx`:

```javascript
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('accessToken');

  if (!token || !user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
```

## 📱 React Router Setup

Update `src/App.jsx`:

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import Auth from './pages/Auth';
import UserDashboard from './pages/user/Dashboard';
import DriverDashboard from './pages/driver/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute requiredRoles={['OFFICIAL', 'HOG']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/driver/dashboard"
          element={
            <ProtectedRoute requiredRoles={['DRIVER']}>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRoles={['ADMIN', 'COMPLIANCE_OFFICER']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

## 🧪 Testing API Calls

Use Postman or curl to test endpoints:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123","firstName":"Test","lastName":"User","phone":"9876543210","role":"OFFICIAL"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123"}'

# Create Booking (with token)
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"pickupLocation":{"latitude":28.6139,"longitude":77.2090,"address":"NIC"},"dropLocation":{"latitude":28.5244,"longitude":77.1855,"address":"Ministry"},"requestedDateTime":"2024-01-15T14:30:00Z"}'
```

## 📊 State Management (Optional)

For complex state, consider using Redux or Zustand:

```javascript
// Using Zustand
import create from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));
```

## 🚀 Deployment

### Frontend Build

```bash
npm run build
```

### Environment for Production

```env
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_SOCKET_URL=https://api.yourdomain.com
```

## 📞 Troubleshooting

**CORS Error**
- Ensure backend CORS_ORIGIN includes frontend URL
- Check browser console for specific error

**Token Expired**
- Refresh token automatically handled by interceptor
- Check localStorage for tokens

**Socket Connection Failed**
- Verify Socket.io URL is correct
- Check backend is running
- Verify auth token is valid

**API 404 Error**
- Check API_URL in .env
- Verify endpoint path
- Check backend routes

## 📚 References

- [Axios Documentation](https://axios-http.com/)
- [Socket.io Client](https://socket.io/docs/v4/client-api/)
- [React Router](https://reactrouter.com/)
- [Backend API Docs](./backend/API_DOCUMENTATION.md)

---

**Version:** 1.0.0  
**Last Updated:** January 2024
