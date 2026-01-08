import Driver from '../models/Driver.js';
import Booking from '../models/Booking.js';
import Vehicle from '../models/Vehicle.js';
import IncidentLog from '../models/IncidentLog.js';
import {
  calculateDistance,
  calculateAllocationScore,
  isFeasibleETA,
} from '../utils/allocationUtils.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * TIER 1: Find nearest best-rated driver (rating >= 4.5)
 */
export const findTier1Driver = async (pickupLat, pickupLon, excludeDriverIds = []) => {
  try {
    const drivers = await Driver.find({
      availabilityStatus: 'ON',
      isActive: true,
      isRestricted: false,
      tierCategory: 'TIER_1_RESERVED',
      'performanceMetrics.averageRating': { $gte: 4.5 },
      _id: { $nin: excludeDriverIds },
    })
      .populate('currentVehicle')
      .sort({ 'performanceMetrics.averageRating': -1 });

    if (!drivers.length) return null;

    // Calculate scores and sort by allocation score
    const scoredDrivers = drivers
      .map((driver) => {
        const distance = calculateDistance(
          pickupLat,
          pickupLon,
          driver.gpsLocation.latitude,
          driver.gpsLocation.longitude
        );

        return {
          driver,
          distance,
          score: calculateAllocationScore(driver, distance),
        };
      })
      .filter((d) => isFeasibleETA(d.distance / 1000)) // Rough ETA check
      .sort((a, b) => b.score - a.score);

    return scoredDrivers.length > 0 ? scoredDrivers[0].driver : null;
  } catch (error) {
    console.error('Error finding Tier 1 driver:', error);
    throw error;
  }
};

/**
 * TIER 2: Find next nearest available driver (rating >= 3.5)
 */
export const findTier2Driver = async (pickupLat, pickupLon, excludeDriverIds = []) => {
  try {
    const drivers = await Driver.find({
      availabilityStatus: 'ON',
      isActive: true,
      isRestricted: false,
      tierCategory: { $in: ['TIER_2_PRIORITY', 'TIER_3_STANDARD'] },
      'performanceMetrics.averageRating': { $gte: 3.5 },
      _id: { $nin: excludeDriverIds },
    })
      .populate('currentVehicle')
      .sort({ 'performanceMetrics.averageRating': -1 });

    if (!drivers.length) return null;

    const scoredDrivers = drivers
      .map((driver) => {
        const distance = calculateDistance(
          pickupLat,
          pickupLon,
          driver.gpsLocation.latitude,
          driver.gpsLocation.longitude
        );

        return {
          driver,
          distance,
          score: calculateAllocationScore(driver, distance),
        };
      })
      .filter((d) => isFeasibleETA(d.distance / 1000))
      .sort((a, b) => b.score - a.score);

    return scoredDrivers.length > 0 ? scoredDrivers[0].driver : null;
  } catch (error) {
    console.error('Error finding Tier 2 driver:', error);
    throw error;
  }
};

/**
 * TIER 3: Check external services (Uber, Rapido)
 */
export const checkExternalServices = async (pickupLat, pickupLon, dropLat, dropLon) => {
  try {
    // This would integrate with actual Uber/Rapido APIs
    // For now, returning mock data structure
    return {
      uber: {
        available: true,
        eta: 12,
        cost: 450,
      },
      rapido: {
        available: true,
        eta: 10,
        cost: 350,
      },
    };
  } catch (error) {
    console.error('Error checking external services:', error);
    return null;
  }
};

/**
 * Main allocation engine - implements three-tier fallback
 */
export const allocateDriver = async (booking, official) => {
  try {
    const pickupLat = booking.pickupLocation.latitude;
    const pickupLon = booking.pickupLocation.longitude;
    const excludedDrivers = [];

    // TIER 1: Best-rated driver
    let allocatedDriver = await findTier1Driver(pickupLat, pickupLon, excludedDrivers);
    let allocationMethod = 'TIER_1_BEST_DRIVER';

    if (!allocatedDriver) {
      // TIER 2: Next nearest driver
      allocatedDriver = await findTier2Driver(pickupLat, pickupLon, excludedDrivers);
      allocationMethod = 'TIER_2_NEXT_DRIVER';
    }

    if (!allocatedDriver) {
      // TIER 3: External service
      const externalOptions = await checkExternalServices(
        pickupLat,
        pickupLon,
        booking.dropLocation.latitude,
        booking.dropLocation.longitude
      );

      return {
        success: true,
        allocationMethod: 'TIER_3_EXTERNAL',
        externalBooking: externalOptions,
        message: 'No internal drivers available. External service options provided.',
      };
    }

    // Get available vehicle for driver
    const vehicle = allocatedDriver.currentVehicle;

    if (!vehicle) {
      throw new Error('Driver has no assigned vehicle');
    }

    // Update booking with allocation
    booking.assignedDriver = {
      id: allocatedDriver._id,
      name: allocatedDriver.userId.firstName + ' ' + allocatedDriver.userId.lastName,
      rating: allocatedDriver.performanceMetrics.averageRating,
      completionRate: allocatedDriver.performanceMetrics.completionRate,
      tier: allocatedDriver.tierCategory,
      acceptanceStatus: 'PENDING',
    };

    booking.assignedVehicle = {
      id: vehicle._id,
      registration: vehicle.registrationNumber,
      model: vehicle.model,
    };

    booking.allocationMethod = allocationMethod;
    booking.status = 'ASSIGNED';

    await booking.save();

    return {
      success: true,
      allocationMethod,
      driver: allocatedDriver,
      vehicle,
      booking,
    };
  } catch (error) {
    console.error('Error in allocation engine:', error);
    throw error;
  }
};

/**
 * Handle driver acceptance/rejection
 */
export const handleDriverResponse = async (bookingId, driverId, accepted) => {
  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (accepted) {
      booking.assignedDriver.acceptanceStatus = 'ACCEPTED';
      booking.assignedDriver.acceptanceTime = new Date();
      booking.status = 'DRIVER_ACCEPTED';
      await booking.save();

      return {
        success: true,
        message: 'Driver accepted booking',
        booking,
      };
    } else {
      // Driver rejected - try next tier
      booking.assignedDriver.acceptanceStatus = 'REJECTED';
      booking.status = 'PENDING';

      // Clear current assignment
      booking.assignedDriver = {
        acceptanceStatus: 'PENDING',
      };
      booking.assignedVehicle = {};

      await booking.save();

      // Retry allocation with excluded driver
      const updatedBooking = await Booking.findById(bookingId);
      const result = await allocateDriver(updatedBooking, booking.official);

      return {
        success: true,
        message: 'Driver rejected. Trying next tier.',
        result,
      };
    }
  } catch (error) {
    console.error('Error handling driver response:', error);
    throw error;
  }
};

/**
 * Categorize driver into tier based on metrics
 */
export const categorizeTier = async (driver) => {
  try {
    const { averageRating, completionRate } = driver.performanceMetrics;
    const recentPenalties = driver.penaltyHistory.filter(
      (p) => new Date() - new Date(p.date) < 180 * 24 * 60 * 60 * 1000 // 6 months
    ).length;

    let tier = 'TIER_3_STANDARD';
    let eligibility = true;

    if (averageRating >= 4.5 && completionRate >= 95 && recentPenalties === 0) {
      tier = 'TIER_1_RESERVED';
    } else if (averageRating >= 4.0 && completionRate >= 90 && recentPenalties <= 1) {
      tier = 'TIER_2_PRIORITY';
    } else if (averageRating >= 3.5 && completionRate >= 85) {
      tier = 'TIER_3_STANDARD';
    } else {
      tier = 'TIER_4_PROBATION';
      eligibility = false;
    }

    driver.tierCategory = tier;
    driver.tierJustification = {
      rating: averageRating,
      completionRate,
      recentPenalties,
      eligibility,
      lastReviewed: new Date(),
    };

    await driver.save();

    return driver;
  } catch (error) {
    console.error('Error categorizing tier:', error);
    throw error;
  }
};
