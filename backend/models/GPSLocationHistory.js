import mongoose from 'mongoose';

const gpsLocationHistorySchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    accuracy: Number,
    speed: Number,
    heading: Number,
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    statusAtTime: {
      type: String,
      enum: ['AVAILABLE', 'IN_USE', 'IDLE', 'MAINTENANCE'],
      default: 'AVAILABLE',
    },
    isAnomalous: {
      type: Boolean,
      default: false,
    },
    anomalyType: {
      type: String,
      enum: ['GPS_SPOOFING', 'LOCATION_JUMP', 'GEOFENCE_BREACH', 'NONE'],
      default: 'NONE',
    },
  },
  {
    timestamps: false,
    indexes: [
      { vehicleId: 1, timestamp: -1 },
      { driverId: 1, timestamp: -1 },
      { bookingId: 1 },
      { timestamp: -1 },
      { isAnomalous: 1 },
    ],
  }
);

// TTL index for automatic deletion after 30 days
gpsLocationHistorySchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 2592000 } // 30 days
);

export default mongoose.model('GPSLocationHistory', gpsLocationHistorySchema);
