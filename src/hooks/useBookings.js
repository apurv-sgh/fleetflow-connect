import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useBookings = () => {
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("bookings")
        .select(`
          *,
          driver:drivers(
            id,
            tier,
            average_rating,
            profile:profiles!user_id(full_name, phone)
          ),
          vehicle:vehicles(registration_number, model, make)
        `)
        .or(`requester_id.eq.${user.id},sponsor_officer_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      
      setBookings(data || []);
      
      // Find active booking
      const active = data?.find(b => 
        ["pending", "approved", "assigned", "en_route", "arrived", "in_progress"].includes(b.status)
      );
      setActiveBooking(active || null);
      
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookings();

      // Subscribe to realtime updates
      const channel = supabase
        .channel("user-bookings")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookings",
            filter: `requester_id=eq.${user.id}`
          },
          () => {
            fetchBookings();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const createBooking = async (bookingData) => {
    if (!profile) {
      throw new Error("User profile not found");
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        requester_id: profile.id,
        requester_type: bookingData.requesterType || "official",
        pickup_address: bookingData.pickupAddress,
        pickup_latitude: bookingData.pickupLatitude,
        pickup_longitude: bookingData.pickupLongitude,
        drop_address: bookingData.dropAddress,
        drop_latitude: bookingData.dropLatitude,
        drop_longitude: bookingData.dropLongitude,
        scheduled_datetime: bookingData.scheduledDatetime,
        estimated_duration_mins: bookingData.estimatedDuration,
        passenger_count: bookingData.passengerCount || 1,
        special_requirements: bookingData.specialRequirements,
        is_guest_booking: bookingData.isGuestBooking || false,
        guest_name: bookingData.guestName,
        guest_phone: bookingData.guestPhone
      })
      .select()
      .single();

    if (error) throw error;
    
    // Trigger driver allocation
    if (data) {
      await triggerAllocation(data.id, bookingData);
    }

    await fetchBookings();
    return data;
  };

  const triggerAllocation = async (bookingId, bookingData) => {
    try {
      const response = await supabase.functions.invoke("booking-allocation", {
        body: {
          action: "find_driver",
          bookingId,
          pickupLatitude: bookingData.pickupLatitude || 28.6139, // Default Delhi
          pickupLongitude: bookingData.pickupLongitude || 77.2090,
          requesterType: bookingData.requesterType || "official"
        }
      });

      return response.data;
    } catch (err) {
      console.error("Error triggering allocation:", err);
    }
  };

  const cancelBooking = async (bookingId, reason) => {
    const { error } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
        cancelled_by: profile?.id
      })
      .eq("id", bookingId);

    if (error) throw error;
    await fetchBookings();
  };

  const rateDriver = async (bookingId, driverId, rating, feedback) => {
    const { error } = await supabase
      .from("ratings")
      .insert({
        booking_id: bookingId,
        driver_id: driverId,
        rater_id: profile?.id,
        rating_score: rating,
        feedback_comment: feedback
      });

    if (error) throw error;
  };

  return {
    bookings,
    activeBooking,
    loading,
    error,
    createBooking,
    cancelBooking,
    rateDriver,
    refetch: fetchBookings
  };
};

export default useBookings;
