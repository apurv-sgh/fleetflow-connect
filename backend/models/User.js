import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    firstName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['OFFICIAL', 'HOG', 'DRIVER', 'ADMIN', 'COMPLIANCE_OFFICER', 'SUPER_ADMIN'],
      required: true,
    },
    designation: {
      type: String,
      required: false,
    },
    department: {
      type: String,
      required: false,
    },
    authorityLevel: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    profileImage: {
      type: String,
      default: null,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    ldapId: {
      type: String,
      default: null,
    },
    auditLog: [
      {
        action: String,
        timestamp: { type: Date, default: Date.now },
        ipAddress: String,
        userAgent: String,
      },
    ],
  },
  {
    timestamps: true,
    indexes: [
      { email: 1 },
      { role: 1 },
      { isActive: 1 },
      { createdAt: -1 },
    ],
  }
);

export default mongoose.model('User', userSchema);
