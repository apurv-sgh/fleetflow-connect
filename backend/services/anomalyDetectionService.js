import Driver from '../models/Driver.js';
import IncidentLog from '../models/IncidentLog.js';
import { v4 as uuidv4 } from 'uuid';
import { detectGPSSpoofing } from '../utils/allocationUtils.js';

/**
 * Check for suspicious availability toggling
 * Threshold: 5+ toggles in 30 minutes
 */
export const checkAvailabilityFraud = async (driverId) => {
  try {
    const driver = await Driver.findById(driverId);

    if (!driver) {
      throw new Error('Driver not found');
    }

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const recentToggles = driver.availabilityToggles.filter(
      (toggle) => new Date(toggle.timestamp) > thirtyMinutesAgo
    );

    if (recentToggles.length >= 5) {
      // Create incident
      const incident = new IncidentLog({
        incidentId: `INC_${uuidv4()}`,
        incidentType: 'AVAILABILITY_FRAUD',
        driverId,
        description: `Driver toggled availability ${recentToggles.length} times in 30 minutes`,
        severity: 'MAJOR',
        reportedBy: null, // System reported
        reportedAt: new Date(),
        status: 'OPEN',
      });

      await incident.save();

      // Apply temporary lock
      driver.isRestricted = true;
      driver.restrictionReason = 'Suspicious availability toggling detected';
      driver.restrictionEndDate = new Date(Date.now() + 30 * 60 * 1000); // 30 min lock
      await driver.save();

      return {
        fraudDetected: true,
        toggleCount: recentToggles.length,
        incidentId: incident.incidentId,
        action: 'TEMPORARY_LOCK_30_MIN',
      };
    }

    return {
      fraudDetected: false,
      toggleCount: recentToggles.length,
    };
  } catch (error) {
    console.error('Error checking availability fraud:', error);
    throw error;
  }
};

/**
 * Detect GPS spoofing and location inconsistencies
 */
export const detectGPSAnomaly = async (driverId, currentLat, currentLon, previousLat, previousLon, timeDiffSeconds) => {
  try {
    const driver = await Driver.findById(driverId);

    if (!driver) {
      throw new Error('Driver not found');
    }

    // Check for spoofing (unrealistic speed)
    const isSpoofing = detectGPSSpoofing(
      calculateDistance(currentLat, currentLon, previousLat, previousLon),
      timeDiffSeconds
    );

    if (isSpoofing) {
      const incident = new IncidentLog({
        incidentId: `INC_${uuidv4()}`,
        incidentType: 'GPS_SPOOFING',
        driverId,
        description: `GPS spoofing detected: unrealistic speed between updates`,
        severity: 'CRITICAL',
        reportedBy: null,
        reportedAt: new Date(),
        status: 'OPEN',
      });

      await incident.save();

      return {
        anomalyDetected: true,
        anomalyType: 'GPS_SPOOFING',
        incidentId: incident.incidentId,
        severity: 'CRITICAL',
      };
    }

    // Check for location inconsistency with reported status
    if (driver.availabilityStatus === 'OFF') {
      const reportedReason = driver.availabilityToggles[driver.availabilityToggles.length - 1]?.reason;

      if (reportedReason === 'ON_BREAK' && driver.gpsLocation.latitude !== currentLat) {
        // Driver is moving while on break - update location but flag
        return {
          anomalyDetected: true,
          anomalyType: 'LOCATION_INCONSISTENCY',
          message: 'Driver moving while reported on break',
        };
      }
    }

    return {
      anomalyDetected: false,
    };
  } catch (error) {
    console.error('Error detecting GPS anomaly:', error);
    throw error;
  }
};

/**
 * Check for excessive idle time
 */
export const checkExcessiveIdleTime = async (driverId, bookingId) => {
  try {
    const driver = await Driver.findById(driverId);

    if (!driver) {
      throw new Error('Driver not found');
    }

    // If driver is available but hasn't moved in 30+ minutes
    if (driver.availabilityStatus === 'ON') {
      const lastLocationUpdate = driver.gpsLocation.lastUpdated;
      const idleTimeMinutes = (Date.now() - new Date(lastLocationUpdate)) / (1000 * 60);

      if (idleTimeMinutes >= 30) {
        const incident = new IncidentLog({
          incidentId: `INC_${uuidv4()}`,
          incidentType: 'EXCESSIVE_IDLE_TIME',
          driverId,
          bookingId,
          description: `Driver idle for ${Math.round(idleTimeMinutes)} minutes while available`,
          severity: 'MINOR',
          reportedBy: null,
          reportedAt: new Date(),
          status: 'OPEN',
        });

        await incident.save();

        return {
          idleTimeDetected: true,
          idleTimeMinutes: Math.round(idleTimeMinutes),
          incidentId: incident.incidentId,
        };
      }
    }

    return {
      idleTimeDetected: false,
    };
  } catch (error) {
    console.error('Error checking idle time:', error);
    throw error;
  }
};

/**
 * Check for geofence breach
 */
export const checkGeofenceBreach = async (vehicleId, currentLat, currentLon, authorizedZones) => {
  try {
    // Check if current location is within any authorized zone
    const isWithinZone = authorizedZones.some((zone) => {
      const distance = calculateDistance(currentLat, currentLon, zone.centerLat, zone.centerLon);
      return distance <= zone.radiusMeters;
    });

    if (!isWithinZone) {
      const incident = new IncidentLog({
        incidentId: `INC_${uuidv4()}`,
        incidentType: 'GEOFENCE_BREACH',
        vehicleId,
        description: `Vehicle exited authorized zone at ${currentLat}, ${currentLon}`,
        severity: 'MAJOR',
        reportedBy: null,
        reportedAt: new Date(),
        status: 'OPEN',
      });

      await incident.save();

      return {
        breachDetected: true,
        incidentId: incident.incidentId,
        location: { latitude: currentLat, longitude: currentLon },
      };
    }

    return {
      breachDetected: false,
    };
  } catch (error) {
    console.error('Error checking geofence:', error);
    throw error;
  }
};

/**
 * Flag driver for investigation
 */
export const flagDriverForInvestigation = async (driverId, reason, severity = 'MAJOR') => {
  try {
    const driver = await Driver.findById(driverId);

    if (!driver) {
      throw new Error('Driver not found');
    }

    const incident = new IncidentLog({
      incidentId: `INC_${uuidv4()}`,
      incidentType: 'SUSPICIOUS_ACTIVITY',
      driverId,
      description: reason,
      severity,
      reportedBy: null,
      reportedAt: new Date(),
      status: 'OPEN',
    });

    await incident.save();

    // Optionally restrict driver
    if (severity === 'CRITICAL') {
      driver.isRestricted = true;
      driver.restrictionReason = reason;
      await driver.save();
    }

    return {
      success: true,
      incidentId: incident.incidentId,
      driverRestricted: severity === 'CRITICAL',
    };
  } catch (error) {
    console.error('Error flagging driver:', error);
    throw error;
  }
};

// Helper function
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
