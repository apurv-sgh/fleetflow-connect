import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useDriverData = () => {
  const { user, session } = useAuth();
  const [driver, setDriver] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDriverDashboard = useCallback(async () => {
    if (!session?.access_token) return;

    try {
      setLoading(true);
      const response = await supabase.functions.invoke("driver-management", {
        body: { action: "get_dashboard" },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error) throw response.error;

      const data = response.data;
      setDriver(data.driver);
      setActiveBooking(data.activeBooking);
      setRecentBookings(data.recentBookings || []);
      setStats(data.stats);
    } catch (err) {
      console.error("Error fetching driver dashboard:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (user && session) {
      fetchDriverDashboard();

      // Subscribe to booking updates
      const channel = supabase
        .channel("driver-bookings")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookings"
          },
          () => {
            fetchDriverDashboard();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, session, fetchDriverDashboard]);

  const toggleAvailability = async (isAvailable, reason = null, position = null) => {
    if (!session?.access_token) return;

    try {
      const response = await supabase.functions.invoke("driver-management", {
        body: {
          action: "toggle_availability",
          isAvailable,
          reason,
          latitude: position?.latitude,
          longitude: position?.longitude
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error) throw response.error;

      setDriver(response.data.driver);
      return response.data;
    } catch (err) {
      console.error("Error toggling availability:", err);
      throw err;
    }
  };

  const updateLocation = async (latitude, longitude, accuracy, speed, heading) => {
    if (!session?.access_token) return;

    try {
      const response = await supabase.functions.invoke("driver-management", {
        body: {
          action: "update_location",
          latitude,
          longitude,
          accuracy,
          speed,
          heading
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      return response.data;
    } catch (err) {
      console.error("Error updating location:", err);
    }
  };

  const respondToBooking = async (bookingId, accept) => {
    if (!session?.access_token) return;

    try {
      const response = await supabase.functions.invoke("driver-management", {
        body: {
          action: "respond_to_booking",
          bookingId,
          accept
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error) throw response.error;

      await fetchDriverDashboard();
      return response.data;
    } catch (err) {
      console.error("Error responding to booking:", err);
      throw err;
    }
  };

  const updateBookingStatus = async (bookingId, status, latitude, longitude) => {
    if (!session?.access_token) return;

    try {
      const response = await supabase.functions.invoke("driver-management", {
        body: {
          action: "update_booking_status",
          bookingId,
          status,
          latitude,
          longitude
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error) throw response.error;

      await fetchDriverDashboard();
      return response.data;
    } catch (err) {
      console.error("Error updating booking status:", err);
      throw err;
    }
  };

  return {
    driver,
    activeBooking,
    recentBookings,
    stats,
    loading,
    error,
    toggleAvailability,
    updateLocation,
    respondToBooking,
    updateBookingStatus,
    refetch: fetchDriverDashboard
  };
};

export default useDriverData;
