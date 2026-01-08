import { verifyAccessToken } from '../utils/authUtils.js';
import { logAudit } from '../utils/auditUtils.js';

/**
 * Authentication middleware
 */
export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    req.token = token;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message,
    });
  }
};

/**
 * Role-based access control middleware
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      // Log unauthorized access attempt
      logAudit({
        actionType: 'UNAUTHORIZED_ACCESS',
        entityType: 'SYSTEM',
        entityId: req.user.userId,
        userId: req.user.userId,
        userRole: req.user.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        status: 'FAILURE',
        errorMessage: `Unauthorized access attempt. Required roles: ${allowedRoles.join(', ')}`,
      }).catch(console.error);

      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        requiredRoles: allowedRoles,
      });
    }

    next();
  };
};

/**
 * Request logging middleware
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });

  next();
};

/**
 * Error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Log error to audit
  if (req.user) {
    logAudit({
      actionType: 'ERROR',
      entityType: 'SYSTEM',
      entityId: req.user.userId,
      userId: req.user.userId,
      userRole: req.user.role,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'FAILURE',
      errorMessage: err.message,
    }).catch(console.error);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Validation middleware
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    req.validatedData = value;
    next();
  };
};

/**
 * Rate limiting middleware
 */
export const rateLimiter = (maxRequests = 100, windowMs = 900000) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();

    if (!requests.has(key)) {
      requests.set(key, []);
    }

    const userRequests = requests.get(key);
    const recentRequests = userRequests.filter((time) => now - time < windowMs);

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
      });
    }

    recentRequests.push(now);
    requests.set(key, recentRequests);

    next();
  };
};
