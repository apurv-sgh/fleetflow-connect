import Booking from '../models/Booking.js';
import Driver from '../models/Driver.js';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';
import { allocateDriver, handleDriverResponse } from '../services/allocationService.js';
import { logAudit } from '../utils/auditUtils.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create booking request
 */
export const createBooking = async (req, res) => {
  try {
    const {
      pickupLocation,
      dropLocation,
      requestedDateTime,
      journeyDurationMinutes,
      numberOfPassengers,
      specialRequirements,
      isGuest,
      guestName,
      guestDesignation,
      sponsoringOfficer,
    } = req.validatedData;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Create booking
    const booking = new Booking({
      bookingId: `BK${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      official: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        designation: user.designation,
        department: user.department,
        authorityLevel: user.authorityLevel,
      },
      pickupLocation,
      dropLocation,
      requestedDateTime: new Date(requestedDateTime),
      journeyDurationMinutes,
      numberOfPassengers,
      specialRequirements,
      status: 'PENDING',
      guestBooking: {
        isGuest: isGuest || false,
        guestName,
        guestDesignation,
        sponsoringOfficer,
      },
      auditTrail: {
        createdBy: user._id,
        createdAt: new Date(),
      },
    });

    await booking.save();

    // Log audit
    await logAudit({
      actionType: 'CREATE',
      entityType: 'BOOKING',
      entityId: booking._id,
      userId: req.user.userId,
      userRole: req.user.role,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      changeDescription: `Booking created: ${booking.bookingId}`,
    });

    // Trigger allocation engine
    const allocationResult = await allocateDriver(booking, user);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking,
        allocation: allocationResult,
      },
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message,
    });
  }
};

/**
 * Get booking details
 */
export const getBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate('official.id', 'firstName lastName email')
      .populate('assignedDriver.id')
      .populate('assignedVehicle.id');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check authorization
    if (
      req.user.role !== 'ADMIN' &&
      req.user.role !== 'COMPLIANCE_OFFICER' &&
      booking.official.id._id.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access',
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message,
    });
  }
};

/**
 * Get user bookings
 */
export const getUserBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { 'official.id': req.user.userId };

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('assignedDriver.id', 'firstName lastName')
      .populate('assignedVehicle.id', 'registrationNumber model');

    const total = await Booking.countDocuments(query);

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
      message: 'Failed to fetch bookings',
      error: error.message,
    });
  }
};

/**
 * Cancel booking
 */
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.validatedData;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check authorization
    if (booking.official.id.toString() !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this booking',
      });
    }

    // Check if cancellation is allowed (within 30 minutes of scheduled time)
    const now = new Date();
    const scheduledTime = new Date(booking.requestedDateTime);
    const timeDiffMinutes = (scheduledTime - now) / (1000 * 60);

    if (timeDiffMinutes < 30 && booking.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Cancellation not allowed within 30 minutes of scheduled time',
      });
    }

    const oldStatus = booking.status;

    booking.status = 'CANCELLED';
    booking.cancellation = {
      cancelledAt: new Date(),
      cancelledBy: req.user.userId,
      reason,
    };

    await booking.save();

    // Log audit
    await logAudit({
      actionType: 'UPDATE',
      entityType: 'BOOKING',
      entityId: booking._id,
      userId: req.user.userId,
      userRole: req.user.role,
      oldValue: { status: oldStatus },
      newValue: { status: 'CANCELLED' },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      changeDescription: `Booking cancelled: ${reason}`,
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message,
    });
  }
};

/**
 * Rate driver after booking completion
 */
export const rateDriver = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { score, feedback } = req.validatedData;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed bookings',
      });
    }

    booking.rating = {
      score,
      feedback,
      ratedAt: new Date(),
      ratedBy: req.user.userId,
    };

    await booking.save();

    // Update driver rating
    const driver = await Driver.findById(booking.assignedDriver.id);
    if (driver) {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const recentBookings = await Booking.find({
        'assignedDriver.id': driver._id,
        'rating.ratedAt': { $gte: ninetyDaysAgo },
      });

      if (recentBookings.length > 0) {
        const avgRating =
          recentBookings.reduce((sum, b) => sum + (b.rating?.score || 0), 0) /
          recentBookings.length;
        driver.performanceMetrics.averageRating = parseFloat(avgRating.toFixed(2));
        driver.performanceMetrics.totalRatings = recentBookings.length;
        await driver.save();
      }
    }

    // Log audit
    await logAudit({
      actionType: 'CREATE',
      entityType: 'RATING',
      entityId: booking._id,
      userId: req.user.userId,
      userRole: req.user.role,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      changeDescription: `Driver rated: ${score}/5 stars`,
    });

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit rating',
      error: error.message,
    });
  }
};

/**
 * Get pending bookings (for admin)
 */
export const getPendingBookings = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'COMPLIANCE_OFFICER') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access',
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find({ status: 'PENDING' })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('official.id', 'firstName lastName designation')
      .populate('assignedDriver.id', 'firstName lastName');

    const total = await Booking.countDocuments({ status: 'PENDING' });

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
      message: 'Failed to fetch pending bookings',
      error: error.message,
    });
  }
};
