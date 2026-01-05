import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useAdminData = () => {
  const { session } = useAuth();
  const [stats, setStats] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [fleetLocations, setFleetLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const callAdminAPI = useCallback(async (action, params = {}) => {
    if (!session?.access_token) return null;

    try {
      const response = await supabase.functions.invoke("admin-api", {
        body: { action, ...params },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error) throw response.error;
      return response.data;
    } catch (err) {
      console.error(`Admin API error (${action}):`, err);
      throw err;
    }
  }, [session?.access_token]);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const data = await callAdminAPI("get_dashboard_stats");
      if (data) setStats(data.stats);
    } catch (err) {
      setError(err.message);
    }
  }, [callAdminAPI]);

  const fetchVehicles = useCallback(async () => {
    try {
      const data = await callAdminAPI("get_vehicles");
      if (data) setVehicles(data.vehicles || []);
    } catch (err) {
      setError(err.message);
    }
  }, [callAdminAPI]);

  const fetchDrivers = useCallback(async () => {
    try {
      const data = await callAdminAPI("get_drivers");
      if (data) setDrivers(data.drivers || []);
    } catch (err) {
      setError(err.message);
    }
  }, [callAdminAPI]);

  const fetchPendingBookings = useCallback(async () => {
    try {
      const data = await callAdminAPI("get_pending_bookings");
      if (data) setPendingBookings(data.bookings || []);
    } catch (err) {
      setError(err.message);
    }
  }, [callAdminAPI]);

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await callAdminAPI("get_alerts");
      if (data) setAlerts(data.incidents || []);
    } catch (err) {
      setError(err.message);
    }
  }, [callAdminAPI]);

  const fetchFleetLocations = useCallback(async () => {
    try {
      const data = await callAdminAPI("get_fleet_locations");
      if (data) setFleetLocations(data.drivers || []);
    } catch (err) {
      setError(err.message);
    }
  }, [callAdminAPI]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchDashboardStats(),
      fetchVehicles(),
      fetchDrivers(),
      fetchPendingBookings(),
      fetchAlerts(),
      fetchFleetLocations()
    ]);
    setLoading(false);
  }, [fetchDashboardStats, fetchVehicles, fetchDrivers, fetchPendingBookings, fetchAlerts, fetchFleetLocations]);

  useEffect(() => {
    if (session) {
      fetchAllData();

      // Set up realtime subscriptions
      const bookingsChannel = supabase
        .channel("admin-bookings")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "bookings" },
          () => {
            fetchPendingBookings();
            fetchDashboardStats();
          }
        )
        .subscribe();

      const driversChannel = supabase
        .channel("admin-drivers")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "drivers" },
          () => {
            fetchDrivers();
            fetchFleetLocations();
          }
        )
        .subscribe();

      // Refresh fleet locations every 30 seconds
      const locationInterval = setInterval(fetchFleetLocations, 30000);

      return () => {
        supabase.removeChannel(bookingsChannel);
        supabase.removeChannel(driversChannel);
        clearInterval(locationInterval);
      };
    }
  }, [session, fetchAllData, fetchPendingBookings, fetchDashboardStats, fetchDrivers, fetchFleetLocations]);

  const approveBooking = async (bookingId, driverId, vehicleId, notes) => {
    const result = await callAdminAPI("approve_booking", { bookingId, driverId, vehicleId, notes });
    await fetchPendingBookings();
    await fetchDashboardStats();
    return result;
  };

  const rejectBooking = async (bookingId, reason) => {
    const result = await callAdminAPI("reject_booking", { bookingId, reason });
    await fetchPendingBookings();
    await fetchDashboardStats();
    return result;
  };

  const manualAssign = async (bookingId, driverId, vehicleId, notes) => {
    const result = await callAdminAPI("manual_assign", { bookingId, driverId, vehicleId, notes });
    await fetchPendingBookings();
    await fetchDrivers();
    return result;
  };

  const updateDriverStatus = async (driverId, isActive, reason) => {
    const result = await callAdminAPI("update_driver_status", { driverId, isActive, reason });
    await fetchDrivers();
    return result;
  };

  const getAuditLogs = async (entityType, entityId, limit = 100) => {
    return callAdminAPI("get_audit_logs", { entityType, entityId, limit });
  };

  const getAnalytics = async (startDate, endDate) => {
    return callAdminAPI("get_analytics", { startDate, endDate });
  };

  return {
    stats,
    vehicles,
    drivers,
    pendingBookings,
    alerts,
    fleetLocations,
    loading,
    error,
    approveBooking,
    rejectBooking,
    manualAssign,
    updateDriverStatus,
    getAuditLogs,
    getAnalytics,
    refetch: fetchAllData
  };
};

export default useAdminData;
