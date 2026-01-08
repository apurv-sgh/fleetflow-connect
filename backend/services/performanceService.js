import Driver from '../models/Driver.js';
import Rating from '../models/Rating.js';

/**
 * Update driver rating after booking completion
 */
export const updateDriverRating = async (bookingId, driverId, score, feedback) => {
  try {
    const driver = await Driver.findById(driverId);

    if (!driver) {
      throw new Error('Driver not found');
    }

    // Create rating record
    const rating = new Rating({
      bookingId,
      driverId,
      ratedBy: null, // Will be set by controller
      score,
      feedback,
      timestamp: new Date(),
    });

    await rating.save();

    // Recalculate rolling 90-day average
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const recentRatings = await Rating.find({
      driverId,
      timestamp: { $gte: ninetyDaysAgo },
    });

    if (recentRatings.length > 0) {
      const averageRating =
        recentRatings.reduce((sum, r) => sum + r.score, 0) / recentRatings.length;

      driver.performanceMetrics.averageRating = parseFloat(averageRating.toFixed(2));
      driver.performanceMetrics.totalRatings = recentRatings.length;
      driver.performanceMetrics.lastRatingUpdate = new Date();

      await driver.save();
    }

    return {
      success: true,
      rating,
      updatedAverageRating: driver.performanceMetrics.averageRating,
    };
  } catch (error) {
    console.error('Error updating driver rating:', error);
    throw error;
  }
};

/**
 * Update driver performance metrics
 */
export const updateDriverMetrics = async (driverId, metrics) => {
  try {
    const driver = await Driver.findById(driverId);

    if (!driver) {
      throw new Error('Driver not found');
    }

    // Update provided metrics
    if (metrics.completionRate !== undefined) {
      driver.performanceMetrics.completionRate = metrics.completionRate;
    }

    if (metrics.onTimeArrivalPercentage !== undefined) {
      driver.performanceMetrics.onTimeArrivalPercentage = metrics.onTimeArrivalPercentage;
    }

    if (metrics.averageResponseTime !== undefined) {
      driver.performanceMetrics.averageResponseTime = metrics.averageResponseTime;
    }

    if (metrics.tripsCompletedMonth !== undefined) {
      driver.performanceMetrics.tripsCompletedMonth = metrics.tripsCompletedMonth;
    }

    if (metrics.tripsCompletedAllTime !== undefined) {
      driver.performanceMetrics.tripsCompletedAllTime = metrics.tripsCompletedAllTime;
    }

    await driver.save();

    return {
      success: true,
      metrics: driver.performanceMetrics,
    };
  } catch (error) {
    console.error('Error updating driver metrics:', error);
    throw error;
  }
};

/**
 * Add penalty to driver
 */
export const addPenalty = async (driverId, penaltyType, reason, severity = 'MINOR') => {
  try {
    const driver = await Driver.findById(driverId);

    if (!driver) {
      throw new Error('Driver not found');
    }

    const penalty = {
      id: new mongoose.Types.ObjectId(),
      type: penaltyType,
      reason,
      date: new Date(),
      resolved: false,
      penaltyImpact: `Rating reduced by ${severity === 'MINOR' ? 0.1 : severity === 'MAJOR' ? 0.3 : 0.5}`,
    };

    driver.penaltyHistory.push(penalty);

    // Reduce rating based on severity
    const ratingReduction = severity === 'MINOR' ? 0.1 : severity === 'MAJOR' ? 0.3 : 0.5;
    driver.performanceMetrics.averageRating = Math.max(
      0,
      driver.performanceMetrics.averageRating - ratingReduction
    );

    await driver.save();

    return {
      success: true,
      penalty,
      updatedRating: driver.performanceMetrics.averageRating,
    };
  } catch (error) {
    console.error('Error adding penalty:', error);
    throw error;
  }
};

/**
 * Get driver performance dashboard data
 */
export const getDriverPerformanceDashboard = async (driverId) => {
  try {
    const driver = await Driver.findById(driverId).populate('userId', 'firstName lastName email');

    if (!driver) {
      throw new Error('Driver not found');
    }

    // Get recent ratings
    const recentRatings = await Rating.find({ driverId })
      .sort({ timestamp: -1 })
      .limit(10);

    // Get performance trends
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const ratingsThisMonth = await Rating.find({
      driverId,
      timestamp: { $gte: thirtyDaysAgo },
    });

    const monthlyAverage =
      ratingsThisMonth.length > 0
        ? ratingsThisMonth.reduce((sum, r) => sum + r.score, 0) / ratingsThisMonth.length
        : 0;

    return {
      driver: {
        id: driver._id,
        name: `${driver.userId.firstName} ${driver.userId.lastName}`,
        email: driver.userId.email,
        tier: driver.tierCategory,
      },
      performanceMetrics: driver.performanceMetrics,
      recentRatings,
      monthlyAverage: parseFloat(monthlyAverage.toFixed(2)),
      penaltyHistory: driver.penaltyHistory,
      isRestricted: driver.isRestricted,
      restrictionReason: driver.restrictionReason,
    };
  } catch (error) {
    console.error('Error getting performance dashboard:', error);
    throw error;
  }
};

/**
 * Get top performing drivers
 */
export const getTopPerformers = async (limit = 10) => {
  try {
    const drivers = await Driver.find({
      isActive: true,
      isRestricted: false,
    })
      .populate('userId', 'firstName lastName email')
      .sort({ 'performanceMetrics.averageRating': -1 })
      .limit(limit);

    return drivers.map((driver) => ({
      id: driver._id,
      name: `${driver.userId.firstName} ${driver.userId.lastName}`,
      rating: driver.performanceMetrics.averageRating,
      completionRate: driver.performanceMetrics.completionRate,
      tier: driver.tierCategory,
      tripsCompleted: driver.performanceMetrics.tripsCompletedMonth,
    }));
  } catch (error) {
    console.error('Error getting top performers:', error);
    throw error;
  }
};
