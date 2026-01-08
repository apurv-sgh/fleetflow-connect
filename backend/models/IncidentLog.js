import mongoose from 'mongoose';

const incidentLogSchema = new mongoose.Schema(
  {
    incidentId: {
      type: String,
      unique: true,
      required: true,
    },
    incidentType: {
      type: String,
      enum: [
        'GPS_SPOOFING',
        'AVAILABILITY_FRAUD',
        'SAFETY_INCIDENT',
        'MISCONDUCT',
        'NO_SHOW',
        'VEHICLE_DAMAGE',
        'PASSENGER_COMPLAINT',
        'GEOFENCE_BREACH',
        'EXCESSIVE_IDLE_TIME',
      ],
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    description: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['MINOR', 'MAJOR', 'CRITICAL'],
      required: true,
    },
    evidence: [
      {
        type: String,
        description: String,
      },
    ],
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
    adminAction: {
      actionTaken: String,
      actionDate: Date,
      actionBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      penaltyApplied: {
        type: String,
        enum: ['NONE', 'WARNING', 'SUSPENSION', 'TERMINATION'],
        default: 'NONE',
      },
      penaltyDuration: Number,
    },
    status: {
      type: String,
      enum: ['OPEN', 'UNDER_INVESTIGATION', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
    },
    resolution: {
      resolutionDate: Date,
      resolutionNotes: String,
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    auditTrail: [
      {
        action: String,
        timestamp: { type: Date, default: Date.now },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        notes: String,
      },
    ],
  },
  {
    timestamps: true,
    indexes: [
      { incidentId: 1 },
      { driverId: 1 },
      { incidentType: 1 },
      { severity: 1 },
      { status: 1 },
      { reportedAt: -1 },
    ],
  }
);

export default mongoose.model('IncidentLog', incidentLogSchema);
