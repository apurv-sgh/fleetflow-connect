import { io } from 'socket.io-client';

// Socket server URL from Vite env
// Example: VITE_SOCKET_URL=http://localhost:5000
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const initSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10,
  });

  socket.on('connect', () => {
    // eslint-disable-next-line no-console
    console.log('[socket] connected', socket.id);
  });

  socket.on('disconnect', (reason) => {
    // eslint-disable-next-line no-console
    console.log('[socket] disconnected', reason);
  });

  socket.on('connect_error', (err) => {
    // eslint-disable-next-line no-console
    console.error('[socket] connect_error', err.message);
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

// Emitters
export const emitDriverAvailabilityUpdate = (payload) => socket?.emit('driver:availability-update', payload);
export const emitGPSUpdate = (payload) => socket?.emit('driver:gps-update', payload);
export const emitBookingStatusUpdate = (payload) => socket?.emit('booking:status-update', payload);
export const emitDriverResponse = (payload) => socket?.emit('booking:driver-response', payload);
export const emitIncidentAlert = (payload) => socket?.emit('incident:alert', payload);

// Listeners
export const onDriverAvailabilityChanged = (cb) => socket?.on('driver:availability-changed', cb);
export const onVehicleLocationUpdated = (cb) => socket?.on('vehicle:location-updated', cb);
export const onBookingStatusChanged = (cb) => socket?.on('booking:status-changed', cb);
export const onBookingDriverResponded = (cb) => socket?.on('booking:driver-responded', cb);
export const onIncidentAlert = (cb) => socket?.on('incident:new', cb);
