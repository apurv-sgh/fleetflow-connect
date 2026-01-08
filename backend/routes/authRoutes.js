import express from 'express';
import Joi from 'joi';
import { authenticate, authorize, validateRequest } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phone: Joi.string().required(),
  role: Joi.string()
    .valid('OFFICIAL', 'HOG', 'DRIVER', 'ADMIN', 'COMPLIANCE_OFFICER', 'SUPER_ADMIN')
    .required(),
  designation: Joi.string(),
  department: Joi.string(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string(),
  lastName: Joi.string(),
  phone: Joi.string(),
  designation: Joi.string(),
  department: Joi.string(),
  profileImage: Joi.string(),
});

// Public routes
router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.put('/profile', authenticate, validateRequest(updateProfileSchema), authController.updateProfile);
router.post('/logout', authenticate, authController.logout);

export default router;
