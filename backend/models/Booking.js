import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      required: true,
    },
    official: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      name: String,
      designation: String,
      department: String,
      authorityLevel: Number,
    },
    pickupLocation: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
    dropLocation: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
    bookingDateTime: {
      type: Date,
      default: Date.now,
    },
    requestedDateTime: {
      type: Date,
      required: true,
    },
    journeyDurationMinutes: Number,
    numberOfPassengers: {
      type: Number,
      default: 1,
      min: 1,
    },
    specialRequirements: String,
    status: {
      type: String,
      enum: [
        'PENDING',
        'ASSIGNED',
        'DRIVER_ACCEPTED',
        'EN_ROUTE',
        'ARRIVED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED',
        'NO_SHOW',
      ],
      default: 'PENDING',
    },
    allocationMethod: {
      type: String,
      enum: ['TIER_1_BEST_DRIVER', 'TIER_2_NEXT_DRIVER', 'TIER_3_EXTERNAL', 'MANUAL_OVERRIDE'],
      default: null,
    },
    assignedDriver: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        default: null,
      },
      name: String,
      rating: Number,
      completionRate: Number,
      tier: String,
      acceptanceTime: Date,
      acceptanceStatus: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
        default: 'PENDING',
      },
    },
    assignedVehicle: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        default: null,
      },
      registration: String,
      model: String,
    },
    externalBooking: {
      provider: String,
      providerBookingId: String,
      cost: Number,
      eta: Number,
    },
    cost: {
      amount: Number,
      currency: {
        type: String,
        default: 'INR',
      },
      type: {
        type: String,
        enum: ['INTERNAL', 'EXTERNAL'],
        default: 'INTERNAL',
      },
    },
    journeyDetails: {
      actualStartTime: Date,
      actualEndTime: Date,
      actualDistance: Number,
      actualDuration: Number,
      routeTaken: [
        {
          latitude: Number,
          longitude: Number,
          timestamp: Date,
        },
      ],
    },
    rating: {
      score: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      feedback: String,
      ratedAt: Date,
      ratedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    cancellation: {
      cancelledAt: Date,
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      reason: String,
      refundAmount: Number,
    },
    auditTrail: {
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      approvedAt: Date,
      lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      lastModifiedAt: Date,
    },
    guestBooking: {
      isGuest: {
        type: Boolean,
        default: false,
      },
      guestName: String,
      guestDesignation: String,
      sponsoringOfficer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      sponsorVerificationStatus: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING',
      },
    },
  },
  {
    timestamps: true,
    indexes: [
      { bookingId: 1 },
      { 'official.id': 1 },
      { 'assignedDriver.id': 1 },
      { status: 1 },
      { requestedDateTime: 1 },
      { createdAt: -1 },
    ],
  }
);

export default mongoose.model('Booking', bookingSchema);
