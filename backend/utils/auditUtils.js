import AuditLog from '../models/AuditLog.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Log an audit event
 * @param {object} params - Audit log parameters
 */
export const logAudit = async ({
  actionType,
  entityType,
  entityId,
  userId,
  userRole,
  oldValue,
  newValue,
  ipAddress,
  userAgent,
  status = 'SUCCESS',
  errorMessage = null,
  changeDescription = null,
  affectedFields = [],
}) => {
  try {
    const auditLog = new AuditLog({
      logId: `AUDIT_${uuidv4()}`,
      actionType,
      entityType,
      entityId,
      userId,
      userRole,
      oldValue,
      newValue,
      timestamp: new Date(),
      ipAddress,
      userAgent,
      status,
      errorMessage,
      changeDescription,
      affectedFields,
    });

    await auditLog.save();
    return auditLog;
  } catch (error) {
    console.error('Error logging audit:', error);
    // Don't throw - audit logging should not break main flow
  }
};

/**
 * Get audit logs with filters
 * @param {object} filters - Filter criteria
 * @param {number} page - Page number
 * @param {number} limit - Records per page
 */
export const getAuditLogs = async (filters = {}, page = 1, limit = 50) => {
  try {
    const skip = (page - 1) * limit;
    const query = {};

    if (filters.userId) query.userId = filters.userId;
    if (filters.entityType) query.entityType = filters.entityType;
    if (filters.actionType) query.actionType = filters.actionType;
    if (filters.status) query.status = filters.status;

    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
      if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
    }

    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'firstName lastName email role');

    const total = await AuditLog.countDocuments(query);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
};

/**
 * Export audit logs for compliance
 * @param {object} filters - Filter criteria
 */
export const exportAuditLogs = async (filters = {}) => {
  try {
    const query = {};

    if (filters.userId) query.userId = filters.userId;
    if (filters.entityType) query.entityType = filters.entityType;
    if (filters.actionType) query.actionType = filters.actionType;

    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
      if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
    }

    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .populate('userId', 'firstName lastName email role');

    return logs;
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    throw error;
  }
};
