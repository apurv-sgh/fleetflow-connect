import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    model: {
      type: String,
      required: true,
    },
    manufacturer: String,
    seatingCapacity: {
      type: Number,
      required: true,
      min: 1,
    },
    fuelType: {
      type: String,
      enum: ['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID'],
      required: true,
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RESERVED', 'RETIRED'],
      default: 'AVAILABLE',
    },
    reservedFor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    currentDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },
    currentBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    color: String,
    yearOfManufacture: Number,
    registrationExpiry: Date,
    insuranceExpiry: Date,
    insurancePolicyNumber: String,
    lastServiceDate: Date,
    nextServiceDueDate: Date,
    totalDistance: {
      type: Number,
      default: 0,
    },
    fuelEfficiency: Number,
    maintenanceHistory: [
      {
        date: Date,
        type: String,
        description: String,
        cost: Number,
        performedBy: String,
        nextDueDate: Date,
      },
    ],
    driverHistory: [
      {
        driverId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Driver',
        },
        assignmentDate: Date,
        unassignmentDate: Date,
        totalTrips: Number,
      },
    ],
    incidents: [
      {
        date: Date,
        type: String,
        description: String,
        severity: {
          type: String,
          enum: ['MINOR', 'MAJOR', 'CRITICAL'],
        },
        reportedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    auditTrail: [
      {
        action: String,
        timestamp: { type: Date, default: Date.now },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        reason: String,
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    indexes: [
      { registrationNumber: 1 },
      { status: 1 },
      { currentDriver: 1 },
      { reservedFor: 1 },
      { isActive: 1 },
    ],
  }
);

export default mongoose.model('Vehicle', vehicleSchema);
