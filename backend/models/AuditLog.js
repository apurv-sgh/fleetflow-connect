import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    logId: {
      type: String,
      unique: true,
      required: true,
    },
    actionType: {
      type: String,
      enum: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'LOGIN', 'LOGOUT'],
      required: true,
    },
    entityType: {
      type: String,
      enum: ['BOOKING', 'DRIVER', 'VEHICLE', 'USER', 'RATING', 'INCIDENT', 'SYSTEM'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userRole: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    ipAddress: String,
    userAgent: String,
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE'],
      default: 'SUCCESS',
    },
    errorMessage: String,
    changeDescription: String,
    affectedFields: [String],
  },
  {
    timestamps: false,
    indexes: [
      { logId: 1 },
      { userId: 1, timestamp: -1 },
      { entityType: 1, entityId: 1 },
      { actionType: 1 },
      { timestamp: -1 },
      { status: 1 },
    ],
  }
);

// TTL index for automatic deletion after 3 years
auditLogSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 94608000 } // 3 years
);

export default mongoose.model('AuditLog', auditLogSchema);
