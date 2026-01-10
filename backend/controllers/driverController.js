import Driver from '../models/Driver.js';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import { logAudit } from '../utils/auditUtils.js';
import { categorizeTier } from '../services/allocationService.js';
import { getDriverPerformanceDashboard, getTopPerformers } from '../services/performanceService.js';

// Register driver
export const registerDriver = async (req, res) => {
  try {
    const {
      licenseNumber,
      licenseExpiry,
      licenseDocument,
      insuranceCertificate,
      bankAccount,
    } = req.validatedData;

    // Check if driver already registered
    const existingDriver = await Driver.findOne({ userId: req.user.userId });
    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: 'Driver already registered',
      });
    }

    // Check if license already exists
    const licenseExists = await Driver.findOne({ licenseNumber });
    if (licenseExists) {
      return res.status(400).json({
        success: false,
        message: 'License number already registered',
      });
    }

    const driver = new Driver({
      userId: req.user.userId,
      licenseNumber,
      licenseExpiry: new Date(licenseExpiry),
      licenseDocument,
      insuranceCertificate,
      bankAccount,
      backgroundVerification: {
        status: 'PENDING',
      },
      auditTrail: {
        createdDate: new Date(),
      },
    });

    await driver.save();

    // Log audit
    await logAudit({
      actionType: 'CREATE',
      entityType: 'DRIVER',
      entityId: driver._id,
      userId: req.user.userId,
      userRole: 'DRIVER',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      changeDescription: `Driver registered: ${licenseNumber}`,
    });

    res.status(201).json({
      success: true,
      message: 'Driver registration submitted. Awaiting verification.',
      data: driver,
    });
  } catch (error) {
    console.error('Driver registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register driver',
      error: error.message,
    });
  }
};

//Get driver profile
export const getDriverProfile = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user.userId })
      .populate('userId', 'firstName lastName email phone')
      .populate('currentVehicle', 'registrationNumber model');

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found',
      });
    }

    res.json({
      success: true,
      data: driver,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch driver profile',
      error: error.message,
    });
  }
};

// Toggle driver availability
export const toggleAvailability = async (req, res) => {
  try {
    const { reason } = req.validatedData;

    const driver = await Driver.findOne({ userId: req.user.userId });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found',
      });
    }

    // Check for abuse (5+ toggles in 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const recentToggles = driver.availabilityToggles.filter(
      (toggle) => new Date(toggle.timestamp) > thirtyMinutesAgo
    );

    if (recentToggles.length >= 5) {
      driver.isRestricted = true;
      driver.restrictionReason = 'Suspicious availability toggling detected';
      driver.restrictionEndDate = new Date(Date.now() + 30 * 60 * 1000);
      await driver.save();

      return res.status(429).json({
        success: false,
        message: 'Too many availability toggles. Temporary lock applied (30 minutes).',
      });
    }

    const previousStatus = driver.availabilityStatus;
    const newStatus = previousStatus === 'ON' ? 'OFF' : 'ON';

    driver.availabilityToggles.push({
      timestamp: new Date(),
      previousStatus,
      newStatus,
      reason,
      gpsLocation: driver.gpsLocation,
    });

    driver.availabilityStatus = newStatus;

    await driver.save();

    // Log audit
    await logAudit({
      actionType: 'UPDATE',
      entityType: 'DRIVER',
      entityId: driver._id,
      userId: req.user.userId,
      userRole: 'DRIVER',
      oldValue: { availabilityStatus: previousStatus },
      newValue: { availabilityStatus: newStatus },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      changeDescription: `Availability toggled: ${previousStatus} → ${newStatus}`,
    });

    res.json({
      success: true,
      message: `Availability set to ${newStatus}`,
      data: {
        availabilityStatus: driver.availabilityStatus,
        toggleCount: recentToggles.length + 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle availability',
      error: error.message,
    });
  }
};

// Update GPS location
export const updateGPSLocation = async (req, res) => {
  try {
    const { latitude, longitude, accuracy, speed, heading } = req.validatedData;

    const driver = await Driver.findOne({ userId: req.user.userId });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found',
      });
    }

    driver.gpsLocation = {
      latitude,
      longitude,
      accuracy,
      speed,
      heading,
      lastUpdated: new Date(),
      currentBookingId: driver.gpsLocation.currentBookingId,
    };

    await driver.save();

    res.json({
      success: true,
      message: 'GPS location updated',
      data: {
        latitude,
        longitude,
        accuracy,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update GPS location',
      error: error.message,
    });
  }
};

// Get driver performance dashboard
export const getPerformanceDashboard = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user.userId });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found',
      });
    }

    const dashboard = await getDriverPerformanceDashboard(driver._id);

    res.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance dashboard',
      error: error.message,
    });
  }
};

// Get driver ride history
export const getRideHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const driver = await Driver.findOne({ userId: req.user.userId });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found',
      });
    }

    const skip = (page - 1) * limit;

    const bookings = await Booking.find({ 'assignedDriver.id': driver._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('official.id', 'firstName lastName designation');

    const total = await Booking.countDocuments({ 'assignedDriver.id': driver._id });

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ride history',
      error: error.message,
    });
  }
};

// Get all drivers (admin only)
export const getAllDrivers = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'COMPLIANCE_OFFICER') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access',
      });
    }

    const { tier, status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (tier) query.tierCategory = tier;
    if (status) query.availabilityStatus = status;

    const skip = (page - 1) * limit;

    const drivers = await Driver.find(query)
      .populate('userId', 'firstName lastName email phone')
      .populate('currentVehicle', 'registrationNumber model')
      .sort({ 'performanceMetrics.averageRating': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Driver.countDocuments(query);

    res.json({
      success: true,
      data: {
        drivers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch drivers',
      error: error.message,
    });
  }
};

// Get top performing drivers
export const getTopPerformersEndpoint = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topPerformers = await getTopPerformers(parseInt(limit));

    res.json({
      success: true,
      data: topPerformers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top performers',
      error: error.message,
    });
  }
};
