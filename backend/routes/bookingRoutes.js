import express from 'express';
import Joi from 'joi';
import { authenticate, authorize, validateRequest } from '../middleware/auth.js';
import * as bookingController from '../controllers/bookingController.js';

const router = express.Router();

// Validation schemas
const createBookingSchema = Joi.object({
  pickupLocation: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    address: Joi.string().required(),
  }).required(),
  dropLocation: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    address: Joi.string().required(),
  }).required(),
  requestedDateTime: Joi.date().required(),
  journeyDurationMinutes: Joi.number(),
  numberOfPassengers: Joi.number().default(1),
  specialRequirements: Joi.string(),
  isGuest: Joi.boolean().default(false),
  guestName: Joi.string(),
  guestDesignation: Joi.string(),
  sponsoringOfficer: Joi.string(),
});

const cancelBookingSchema = Joi.object({
  reason: Joi.string().required(),
});

const rateDriverSchema = Joi.object({
  score: Joi.number().min(1).max(5).required(),
  feedback: Joi.string(),
});

// Protected routes
router.post(
  '/',
  authenticate,
  authorize('OFFICIAL', 'HOG'),
  validateRequest(createBookingSchema),
  bookingController.createBooking
);

router.get('/:bookingId', authenticate, bookingController.getBooking);

router.get('/', authenticate, bookingController.getUserBookings);

router.put(
  '/:bookingId/cancel',
  authenticate,
  validateRequest(cancelBookingSchema),
  bookingController.cancelBooking
);

router.post(
  '/:bookingId/rate',
  authenticate,
  validateRequest(rateDriverSchema),
  bookingController.rateDriver
);

// Admin routes
router.get('/admin/pending', authenticate, authorize('ADMIN', 'COMPLIANCE_OFFICER'), bookingController.getPendingBookings);

export default router;
