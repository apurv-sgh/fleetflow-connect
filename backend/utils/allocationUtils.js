import { getDistance } from 'geolib';

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in meters
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  return getDistance(
    { latitude: lat1, longitude: lon1 },
    { latitude: lat2, longitude: lon2 }
  );
};

/**
 * Calculate proximity score (0-1)
 * @param {number} distance - Distance in meters
 * @param {number} maxDistance - Maximum distance threshold in meters
 * @returns {number} Proximity score
 */
export const calculateProximityScore = (distance, maxDistance = 50000) => {
  if (distance >= maxDistance) return 0;
  return (maxDistance - distance) / maxDistance;
};

/**
 * Calculate rating score (0-1)
 * @param {number} rating - Driver rating (1-5)
 * @returns {number} Rating score
 */
export const calculateRatingScore = (rating) => {
  return Math.min(rating / 5, 1);
};

/**
 * Calculate reliability score (0-1)
 * @param {number} completionRate - Completion rate (0-100)
 * @returns {number} Reliability score
 */
export const calculateReliabilityScore = (completionRate) => {
  return Math.min(completionRate / 100, 1);
};

/**
 * Calculate load balance score (0-1)
 * @param {number} driverTripsToday - Trips completed by driver today
 * @param {number} avgTripsPerDriver - Average trips per driver
 * @returns {number} Load balance score
 */
export const calculateLoadBalanceScore = (driverTripsToday, avgTripsPerDriver) => {
  if (avgTripsPerDriver === 0) return 1;
  return Math.max(1 - (driverTripsToday / avgTripsPerDriver), 0);
};

/**
 * Calculate overall allocation score for a driver
 * Weights: Proximity (50%), Rating (30%), Reliability (10%), Load Balance (10%)
 * @param {object} driver - Driver object with metrics
 * @param {number} distance - Distance to pickup location
 * @returns {number} Overall allocation score (0-1)
 */
export const calculateAllocationScore = (driver, distance) => {
  const proximityScore = calculateProximityScore(distance);
  const ratingScore = calculateRatingScore(driver.performanceMetrics.averageRating);
  const reliabilityScore = calculateReliabilityScore(driver.performanceMetrics.completionRate);
  const loadBalanceScore = calculateLoadBalanceScore(
    driver.performanceMetrics.tripsCompletedMonth,
    10 // Average trips per driver per month
  );

  return (
    0.5 * proximityScore +
    0.3 * ratingScore +
    0.1 * reliabilityScore +
    0.1 * loadBalanceScore
  );
};

/**
 * Check if ETA is feasible (within 30 minutes)
 * @param {number} eta - Estimated time in minutes
 * @returns {boolean} Is feasible
 */
export const isFeasibleETA = (eta) => {
  return eta <= 30;
};

/**
 * Detect GPS spoofing based on speed
 * @param {number} distance - Distance traveled in meters
 * @param {number} timeDiffSeconds - Time difference in seconds
 * @returns {boolean} Is spoofing detected
 */
export const detectGPSSpoofing = (distance, timeDiffSeconds) => {
  const speedMps = distance / timeDiffSeconds;
  const speedKmh = speedMps * 3.6;
  // Flag if speed exceeds 100 km/h (unrealistic for urban driving)
  return speedKmh > 100;
};

/**
 * Check if location is within geofence
 * @param {number} lat - Current latitude
 * @param {number} lon - Current longitude
 * @param {number} centerLat - Geofence center latitude
 * @param {number} centerLon - Geofence center longitude
 * @param {number} radiusMeters - Geofence radius in meters
 * @returns {boolean} Is within geofence
 */
export const isWithinGeofence = (lat, lon, centerLat, centerLon, radiusMeters) => {
  const distance = calculateDistance(lat, lon, centerLat, centerLon);
  return distance <= radiusMeters;
};
