import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { getAuditLogs, exportAuditLogs } from '../utils/auditUtils.js';
import GPSLocationHistory from '../models/GPSLocationHistory.js';
import IncidentLog from '../models/IncidentLog.js';
import Booking from '../models/Booking.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';

const router = express.Router();

/**
 * Get audit logs
 */
router.get(
  '/audit-logs',
  authenticate,
  authorize('ADMIN', 'COMPLIANCE_OFFICER', 'SUPER_ADMIN'),
  async (req, res) => {
    try {
      const { userId, entityType, actionType, status, startDate, endDate, page = 1, limit = 50 } = req.query;

      const filters = {
        userId,
        entityType,
        actionType,
        status,
        startDate,
        endDate,
      };

      const result = await getAuditLogs(filters, parseInt(page), parseInt(limit));

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch audit logs',
        error: error.message,
      });
    }
  }
);

/**
 * Export audit logs
 */
router.get(
  '/audit-logs/export',
  authenticate,
  authorize('ADMIN', 'COMPLIANCE_OFFICER', 'SUPER_ADMIN'),
  async (req, res) => {
    try {
      const { userId, entityType, actionType, startDate, endDate } = req.query;

      const filters = {
        userId,
        entityType,
        actionType,
        startDate,
        endDate,
      };

      const logs = await exportAuditLogs(filters);

      // Convert to CSV
      const csv = convertToCSV(logs);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');
      res.send(csv);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to export audit logs',
        error: error.message,
      });
    }
  }
);

/**
 * Get incident logs
 */
router.get(
  '/incidents',
  authenticate,
  authorize('ADMIN', 'COMPLIANCE_OFFICER', 'SUPER_ADMIN'),
  async (req, res) => {
    try {
      const { driverId, incidentType, severity, status, page = 1, limit = 20 } = req.query;

      const query = {};
      if (driverId) query.driverId = driverId;
      if (incidentType) query.incidentType = incidentType;
      if (severity) query.severity = severity;
      if (status) query.status = status;

      const skip = (page - 1) * limit;

      const incidents = await IncidentLog.find(query)
        .populate('driverId', 'firstName lastName')
        .populate('vehicleId', 'registrationNumber')
        .populate('reportedBy', 'firstName lastName')
        .sort({ reportedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await IncidentLog.countDocuments(query);

      res.json({
        success: true,
        data: {
          incidents,
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
        message: 'Failed to fetch incidents',
        error: error.message,
      });
    }
  }
);

/**
 * Get GPS location history
 */
router.get(
  '/gps-history/:vehicleId',
  authenticate,
  authorize('ADMIN', 'COMPLIANCE_OFFICER', 'SUPER_ADMIN'),
  async (req, res) => {
    try {
      const { vehicleId } = req.params;
      const { startDate, endDate, limit = 100 } = req.query;

      const query = { vehicleId };

      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      const locations = await GPSLocationHistory.find(query)
        .sort({ timestamp: -1 })
        .limit(parseInt(limit));

      res.json({
        success: true,
        data: locations,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch GPS history',
        error: error.message,
      });
    }
  }
);

/**
 * Get admin dashboard analytics
 */
router.get(
  '/dashboard/analytics',
  authenticate,
  authorize('ADMIN', 'COMPLIANCE_OFFICER', 'SUPER_ADMIN'),
  async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const analytics = {
        bookings: {
          total: await Booking.countDocuments(),
          today: await Booking.countDocuments({ createdAt: { $gte: today } }),
          completed: await Booking.countDocuments({ status: 'COMPLETED' }),
          pending: await Booking.countDocuments({ status: 'PENDING' }),
          cancelled: await Booking.countDocuments({ status: 'CANCELLED' }),
        },
        vehicles: {
          total: await Vehicle.countDocuments({ isActive: true }),
          available: await Vehicle.countDocuments({ status: 'AVAILABLE', isActive: true }),
          inUse: await Vehicle.countDocuments({ status: 'IN_USE', isActive: true }),
          maintenance: await Vehicle.countDocuments({ status: 'MAINTENANCE', isActive: true }),
        },
        drivers: {
          total: await Driver.countDocuments({ isActive: true }),
          available: await Driver.countDocuments({ availabilityStatus: 'ON', isActive: true }),
          restricted: await Driver.countDocuments({ isRestricted: true }),
        },
        incidents: {
          total: await IncidentLog.countDocuments(),
          open: await IncidentLog.countDocuments({ status: 'OPEN' }),
          critical: await IncidentLog.countDocuments({ severity: 'CRITICAL' }),
        },
      };

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analytics',
        error: error.message,
      });
    }
  }
);

/**
 * Get booking analytics
 */
router.get(
  '/analytics/bookings',
  authenticate,
  authorize('ADMIN', 'COMPLIANCE_OFFICER', 'SUPER_ADMIN'),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      const query = {};
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const bookings = await Booking.find(query);

      const analytics = {
        totalBookings: bookings.length,
        completedBookings: bookings.filter((b) => b.status === 'COMPLETED').length,
        cancelledBookings: bookings.filter((b) => b.status === 'CANCELLED').length,
        internalBookings: bookings.filter((b) => b.cost.type === 'INTERNAL').length,
        externalBookings: bookings.filter((b) => b.cost.type === 'EXTERNAL').length,
        totalCost: bookings.reduce((sum, b) => sum + (b.cost?.amount || 0), 0),
        averageRating:
          bookings.filter((b) => b.rating?.score).length > 0
            ? (
                bookings
                  .filter((b) => b.rating?.score)
                  .reduce((sum, b) => sum + b.rating.score, 0) /
                bookings.filter((b) => b.rating?.score).length
              ).toFixed(2)
            : 0,
      };

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch booking analytics',
        error: error.message,
      });
    }
  }
);

// Helper function to convert to CSV
const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csv = [headers.join(',')];

  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header];
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return `"${value}"`;
    });
    csv.push(values.join(','));
  });

  return csv.join('\n');
};

export default router;
