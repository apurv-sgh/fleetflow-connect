import express from 'express';
import Joi from 'joi';
import { authenticate, authorize, validateRequest } from '../middleware/auth.js';
import Vehicle from '../models/Vehicle.js';
import { logAudit } from '../utils/auditUtils.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Validation schemas
const createVehicleSchema = Joi.object({
  registrationNumber: Joi.string().required(),
  model: Joi.string().required(),
  manufacturer: Joi.string(),
  seatingCapacity: Joi.number().required(),
  fuelType: Joi.string().valid('PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID').required(),
  color: Joi.string(),
  yearOfManufacture: Joi.number(),
  registrationExpiry: Joi.date(),
  insuranceExpiry: Joi.date(),
  insurancePolicyNumber: Joi.string(),
});

const updateVehicleStatusSchema = Joi.object({
  status: Joi.string()
    .valid('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RESERVED', 'RETIRED')
    .required(),
  reason: Joi.string(),
});

/**
 * Create vehicle
 */
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  validateRequest(createVehicleSchema),
  async (req, res) => {
    try {
      const { registrationNumber, model, manufacturer, seatingCapacity, fuelType, color, yearOfManufacture, registrationExpiry, insuranceExpiry, insurancePolicyNumber } = req.validatedData;

      // Check if vehicle already exists
      const existingVehicle = await Vehicle.findOne({ registrationNumber });
      if (existingVehicle) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle already exists',
        });
      }

      const vehicle = new Vehicle({
        registrationNumber: registrationNumber.toUpperCase(),
        model,
        manufacturer,
        seatingCapacity,
        fuelType,
        color,
        yearOfManufacture,
        registrationExpiry: registrationExpiry ? new Date(registrationExpiry) : null,
        insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null,
        insurancePolicyNumber,
        status: 'AVAILABLE',
        isActive: true,
      });

      await vehicle.save();

      // Log audit
      await logAudit({
        actionType: 'CREATE',
        entityType: 'VEHICLE',
        entityId: vehicle._id,
        userId: req.user.userId,
        userRole: req.user.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        changeDescription: `Vehicle created: ${registrationNumber}`,
      });

      res.status(201).json({
        success: true,
        message: 'Vehicle created successfully',
        data: vehicle,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create vehicle',
        error: error.message,
      });
    }
  }
);

/**
 * Get all vehicles
 */
router.get('/', authenticate, authorize('ADMIN', 'COMPLIANCE_OFFICER'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = { isActive: true };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const vehicles = await Vehicle.find(query)
      .populate('currentDriver', 'firstName lastName')
      .populate('reservedFor', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Vehicle.countDocuments(query);

    res.json({
      success: true,
      data: {
        vehicles,
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
      message: 'Failed to fetch vehicles',
      error: error.message,
    });
  }
});

/**
 * Get vehicle details
 */
router.get('/:vehicleId', authenticate, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.vehicleId)
      .populate('currentDriver', 'firstName lastName email')
      .populate('reservedFor', 'firstName lastName email')
      .populate('driverHistory.driverId', 'firstName lastName');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    res.json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle',
      error: error.message,
    });
  }
});

/**
 * Update vehicle status
 */
router.put(
  '/:vehicleId/status',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  validateRequest(updateVehicleStatusSchema),
  async (req, res) => {
    try {
      const { status, reason } = req.validatedData;

      const vehicle = await Vehicle.findById(req.params.vehicleId);

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found',
        });
      }

      const oldStatus = vehicle.status;

      vehicle.status = status;
      vehicle.auditTrail.push({
        action: 'STATUS_UPDATE',
        timestamp: new Date(),
        user: req.user.userId,
        reason,
        oldValue: oldStatus,
        newValue: status,
      });

      await vehicle.save();

      // Log audit
      await logAudit({
        actionType: 'UPDATE',
        entityType: 'VEHICLE',
        entityId: vehicle._id,
        userId: req.user.userId,
        userRole: req.user.role,
        oldValue: { status: oldStatus },
        newValue: { status },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        changeDescription: `Vehicle status updated: ${oldStatus} → ${status}`,
      });

      res.json({
        success: true,
        message: 'Vehicle status updated',
        data: vehicle,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update vehicle status',
        error: error.message,
      });
    }
  }
);

/**
 * Get vehicle statistics
 */
router.get('/admin/stats', authenticate, authorize('ADMIN', 'COMPLIANCE_OFFICER'), async (req, res) => {
  try {
    const stats = {
      total: await Vehicle.countDocuments({ isActive: true }),
      available: await Vehicle.countDocuments({ status: 'AVAILABLE', isActive: true }),
      inUse: await Vehicle.countDocuments({ status: 'IN_USE', isActive: true }),
      maintenance: await Vehicle.countDocuments({ status: 'MAINTENANCE', isActive: true }),
      reserved: await Vehicle.countDocuments({ status: 'RESERVED', isActive: true }),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle statistics',
      error: error.message,
    });
  }
});

export default router;
