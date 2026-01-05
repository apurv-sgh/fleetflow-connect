import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, ...params } = await req.json();
    console.log('Driver management action:', action, 'user:', user.id);

    // Toggle Availability with abuse detection
    if (action === 'toggle_availability') {
      const { isAvailable, reason, latitude, longitude } = params;

      // Get driver record
      const { data: driver, error: driverError } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (driverError || !driver) {
        return new Response(
          JSON.stringify({ error: 'Driver not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if driver is locked
      if (driver.toggle_lock_until && new Date(driver.toggle_lock_until) > new Date()) {
        const lockRemaining = Math.ceil((new Date(driver.toggle_lock_until).getTime() - Date.now()) / 60000);
        return new Response(
          JSON.stringify({ 
            error: 'Availability toggle is temporarily locked due to frequent changes',
            lockRemainingMinutes: lockRemaining
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get toggle count in last 30 minutes
      const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const { count: recentToggles } = await supabase
        .from('driver_availability_logs')
        .select('*', { count: 'exact', head: true })
        .eq('driver_id', driver.id)
        .gte('created_at', thirtyMinsAgo);

      const toggleCount = (recentToggles || 0) + 1;
      const isSuspicious = toggleCount >= 5;
      let lockUntil = null;

      // Apply lock if 5+ toggles in 30 minutes (as per GFAMS doc)
      if (isSuspicious) {
        lockUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min lock
        console.log('Driver toggle locked for suspicious activity:', driver.id);

        // Create incident for suspicious activity
        await supabase
          .from('incidents')
          .insert({
            incident_type: 'availability_fraud',
            severity: 'minor',
            driver_id: driver.id,
            description: `Driver toggled availability ${toggleCount} times in 30 minutes`,
            status: 'open'
          });
      }

      // Log availability change
      await supabase
        .from('driver_availability_logs')
        .insert({
          driver_id: driver.id,
          previous_status: driver.is_available,
          new_status: isAvailable,
          reason,
          latitude,
          longitude,
          is_suspicious: isSuspicious,
          toggle_count_at_time: toggleCount
        });

      // Update driver record
      const updateData: any = {
        is_available: isAvailable,
        availability_reason: isAvailable ? null : reason,
        last_availability_toggle: new Date().toISOString(),
        toggle_count_today: driver.toggle_count_today + 1
      };

      if (latitude && longitude) {
        updateData.current_latitude = latitude;
        updateData.current_longitude = longitude;
        updateData.gps_last_updated = new Date().toISOString();
      }

      if (lockUntil) {
        updateData.toggle_lock_until = lockUntil;
      }

      const { data: updatedDriver, error: updateError } = await supabase
        .from('drivers')
        .update(updateData)
        .eq('id', driver.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Log to audit
      await supabase
        .from('audit_logs')
        .insert({
          action: 'toggle_availability',
          entity_type: 'driver',
          entity_id: driver.id,
          user_id: user.id,
          old_values: { is_available: driver.is_available },
          new_values: { is_available: isAvailable }
        });

      return new Response(
        JSON.stringify({ 
          success: true, 
          driver: updatedDriver,
          warning: isSuspicious ? 'Your availability toggle has been temporarily locked due to frequent changes' : null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update GPS location
    if (action === 'update_location') {
      const { latitude, longitude, accuracy, speed, heading } = params;

      const { data: driver } = await supabase
        .from('drivers')
        .select('id, current_latitude, current_longitude, gps_last_updated')
        .eq('user_id', user.id)
        .single();

      if (!driver) {
        return new Response(
          JSON.stringify({ error: 'Driver not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // GPS spoofing detection (sudden jump > 100 km/h)
      let isSpoofingSuspected = false;
      if (driver.current_latitude && driver.current_longitude && driver.gps_last_updated) {
        const timeDiff = (Date.now() - new Date(driver.gps_last_updated).getTime()) / 3600000; // hours
        if (timeDiff > 0) {
          const distance = calculateDistance(
            driver.current_latitude,
            driver.current_longitude,
            latitude,
            longitude
          );
          const speedKmh = distance / timeDiff;
          if (speedKmh > 100) {
            isSpoofingSuspected = true;
            console.log('GPS spoofing suspected:', { driverId: driver.id, speedKmh });
            
            await supabase
              .from('incidents')
              .insert({
                incident_type: 'gps_spoofing',
                severity: 'major',
                driver_id: driver.id,
                description: `Suspicious GPS movement detected: ${Math.round(speedKmh)} km/h`,
                latitude,
                longitude,
                status: 'open'
              });
          }
        }
      }

      // Update driver location
      await supabase
        .from('drivers')
        .update({
          current_latitude: latitude,
          current_longitude: longitude,
          gps_last_updated: new Date().toISOString()
        })
        .eq('id', driver.id);

      // Log to GPS history
      await supabase
        .from('gps_location_history')
        .insert({
          driver_id: driver.id,
          latitude,
          longitude,
          accuracy,
          speed,
          heading,
          is_spoofing_suspected: isSpoofingSuspected
        });

      return new Response(
        JSON.stringify({ success: true, spoofingWarning: isSpoofingSuspected }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get driver dashboard data
    if (action === 'get_dashboard') {
      const { data: driver, error: driverError } = await supabase
        .from('drivers')
        .select(`
          *,
          current_vehicle:vehicles(*)
        `)
        .eq('user_id', user.id)
        .single();

      if (driverError) {
        return new Response(
          JSON.stringify({ error: 'Driver not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get active booking
      const { data: activeBooking } = await supabase
        .from('bookings')
        .select(`
          *,
          requester:profiles!requester_id(full_name, phone, designation)
        `)
        .eq('driver_id', driver.id)
        .in('status', ['assigned', 'en_route', 'arrived', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get recent bookings
      const { data: recentBookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('driver_id', driver.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get recent ratings
      const { data: recentRatings } = await supabase
        .from('ratings')
        .select('*')
        .eq('driver_id', driver.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get pending incidents
      const { data: incidents } = await supabase
        .from('incidents')
        .select('*')
        .eq('driver_id', driver.id)
        .neq('status', 'resolved')
        .order('created_at', { ascending: false });

      return new Response(
        JSON.stringify({
          driver,
          activeBooking,
          recentBookings,
          recentRatings,
          incidents,
          stats: {
            averageRating: driver.average_rating,
            totalTrips: driver.total_trips,
            completionRate: driver.completion_rate,
            onTimeRate: driver.on_time_rate,
            tripsToday: driver.trips_today,
            tripsThisMonth: driver.trips_this_month
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Accept/Reject booking
    if (action === 'respond_to_booking') {
      const { bookingId, accept } = params;

      const { data: driver } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!driver) {
        return new Response(
          JSON.stringify({ error: 'Driver not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (accept) {
        const { data: booking, error } = await supabase
          .from('bookings')
          .update({
            status: 'assigned',
            driver_accepted_at: new Date().toISOString()
          })
          .eq('id', bookingId)
          .eq('driver_id', driver.id)
          .select()
          .single();

        if (error) throw error;

        // Update driver availability
        await supabase
          .from('drivers')
          .update({ is_available: false })
          .eq('id', driver.id);

        return new Response(
          JSON.stringify({ success: true, booking }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Reject booking - trigger fallback allocation
        await supabase
          .from('bookings')
          .update({
            driver_id: null,
            status: 'pending'
          })
          .eq('id', bookingId)
          .eq('driver_id', driver.id);

        return new Response(
          JSON.stringify({ success: true, message: 'Booking rejected, will be reassigned' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Update booking status (journey progression)
    if (action === 'update_booking_status') {
      const { bookingId, status, latitude, longitude } = params;

      const { data: driver } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!driver) {
        return new Response(
          JSON.stringify({ error: 'Driver not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const updateData: any = { status };

      if (status === 'en_route') {
        // Driver started journey to pickup
      } else if (status === 'arrived') {
        updateData.driver_arrived_at = new Date().toISOString();
      } else if (status === 'in_progress') {
        updateData.journey_started_at = new Date().toISOString();
        updateData.actual_start_time = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.journey_completed_at = new Date().toISOString();
        updateData.actual_end_time = new Date().toISOString();

        // Make driver available again
        await supabase
          .from('drivers')
          .update({
            is_available: true,
            total_trips: supabase.rpc('increment', { x: 1 }),
            trips_this_month: supabase.rpc('increment', { x: 1 })
          })
          .eq('id', driver.id);

        // Update vehicle status
        const { data: booking } = await supabase
          .from('bookings')
          .select('vehicle_id')
          .eq('id', bookingId)
          .single();

        if (booking?.vehicle_id) {
          await supabase
            .from('vehicles')
            .update({ status: 'available' })
            .eq('id', booking.vehicle_id);
        }
      }

      const { data: updatedBooking, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId)
        .eq('driver_id', driver.id)
        .select()
        .single();

      if (error) throw error;

      // Log GPS for booking tracking
      if (latitude && longitude) {
        await supabase
          .from('gps_location_history')
          .insert({
            driver_id: driver.id,
            booking_id: bookingId,
            latitude,
            longitude
          });
      }

      return new Response(
        JSON.stringify({ success: true, booking: updatedBooking }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Driver management error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
