import express from 'express';
import Joi from 'joi';
import { authenticate, authorize, validateRequest } from '../middleware/auth.js';
import * as driverController from '../controllers/driverController.js';

const router = express.Router();

// Validation schemas
const registerDriverSchema = Joi.object({
  licenseNumber: Joi.string().required(),
  licenseExpiry: Joi.date().required(),
  licenseDocument: Joi.string().required(),
  insuranceCertificate: Joi.string().required(),
  bankAccount: Joi.object({
    accountNumber: Joi.string().required(),
    ifscCode: Joi.string().required(),
    accountHolderName: Joi.string().required(),
  }).required(),
});

const toggleAvailabilitySchema = Joi.object({
  reason: Joi.string(),
});

const updateGPSSchema = Joi.object({
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  accuracy: Joi.number(),
  speed: Joi.number(),
  heading: Joi.number(),
});

// Driver routes
router.post(
  '/register',
  authenticate,
  authorize('DRIVER'),
  validateRequest(registerDriverSchema),
  driverController.registerDriver
);

router.get('/profile', authenticate, authorize('DRIVER'), driverController.getDriverProfile);

router.post(
  '/availability/toggle',
  authenticate,
  authorize('DRIVER'),
  validateRequest(toggleAvailabilitySchema),
  driverController.toggleAvailability
);

router.post(
  '/gps/update',
  authenticate,
  authorize('DRIVER'),
  validateRequest(updateGPSSchema),
  driverController.updateGPSLocation
);

router.get(
  '/performance/dashboard',
  authenticate,
  authorize('DRIVER'),
  driverController.getPerformanceDashboard
);

router.get('/history/rides', authenticate, authorize('DRIVER'), driverController.getRideHistory);

// Admin routes
router.get(
  '/admin/all',
  authenticate,
  authorize('ADMIN', 'COMPLIANCE_OFFICER'),
  driverController.getAllDrivers
);

router.get(
  '/admin/top-performers',
  authenticate,
  authorize('ADMIN', 'COMPLIANCE_OFFICER'),
  driverController.getTopPerformersEndpoint
);

export default router;
