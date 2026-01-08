import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    licenseExpiry: {
      type: Date,
      required: true,
    },
    licenseDocument: {
      type: String,
      required: true,
    },
    insuranceCertificate: {
      type: String,
      required: true,
    },
    bankAccount: {
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String,
    },
    currentVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },
    availabilityStatus: {
      type: String,
      enum: ['ON', 'OFF'],
      default: 'OFF',
    },
    availabilityToggles: [
      {
        timestamp: { type: Date, default: Date.now },
        previousStatus: String,
        newStatus: String,
        reason: String,
        gpsLocation: {
          latitude: Number,
          longitude: Number,
        },
      },
    ],
    performanceMetrics: {
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      totalRatings: {
        type: Number,
        default: 0,
      },
      completionRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      onTimeArrivalPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      averageResponseTime: {
        type: Number,
        default: 0,
      },
      tripsCompletedMonth: {
        type: Number,
        default: 0,
      },
      tripsCompletedAllTime: {
        type: Number,
        default: 0,
      },
      lastRatingUpdate: Date,
    },
    tierCategory: {
      type: String,
      enum: ['TIER_1_RESERVED', 'TIER_2_PRIORITY', 'TIER_3_STANDARD', 'TIER_4_PROBATION'],
      default: 'TIER_3_STANDARD',
    },
    tierJustification: {
      rating: Number,
      completionRate: Number,
      recentPenalties: Number,
      eligibility: Boolean,
      lastReviewed: Date,
    },
    gpsLocation: {
      latitude: Number,
      longitude: Number,
      accuracy: Number,
      lastUpdated: Date,
      currentBookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        default: null,
      },
    },
    penaltyHistory: [
      {
        id: mongoose.Schema.Types.ObjectId,
        type: {
          type: String,
          enum: ['MINOR', 'MAJOR', 'CRITICAL'],
        },
        reason: String,
        date: Date,
        resolved: Boolean,
        penaltyImpact: String,
        adminNotes: String,
      },
    ],
    backgroundVerification: {
      status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING',
      },
      verifiedDate: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isRestricted: {
      type: Boolean,
      default: false,
    },
    restrictionReason: String,
    restrictionEndDate: Date,
    auditTrail: {
      createdDate: Date,
      lastProfileUpdate: Date,
      lastTierReview: Date,
    },
  },
  {
    timestamps: true,
    indexes: [
      { userId: 1 },
      { licenseNumber: 1 },
      { tierCategory: 1 },
      { availabilityStatus: 1 },
      { isActive: 1 },
      { 'performanceMetrics.averageRating': -1 },
    ],
  }
);

export default mongoose.model('Driver', driverSchema);
