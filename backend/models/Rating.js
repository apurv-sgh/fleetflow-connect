import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
    },
    ratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    feedback: String,
    categories: {
      cleanliness: Number,
      driving: Number,
      communication: Number,
      professionalism: Number,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    indexes: [
      { driverId: 1 },
      { bookingId: 1 },
      { ratedBy: 1 },
      { timestamp: -1 },
    ],
  }
);

export default mongoose.model('Rating', ratingSchema);
