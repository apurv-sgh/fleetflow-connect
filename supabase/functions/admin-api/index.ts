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

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'super_admin', 'compliance_officer'])
      .maybeSingle();

    if (!userRole) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, ...params } = await req.json();
    console.log('Admin API action:', action, 'by:', user.id);

    // Get dashboard stats
    if (action === 'get_dashboard_stats') {
      const today = new Date().toISOString().split('T')[0];

      // Parallel queries for efficiency
      const [
        vehiclesResult,
        driversResult,
        bookingsResult,
        incidentsResult
      ] = await Promise.all([
        supabase.from('vehicles').select('status', { count: 'exact' }),
        supabase.from('drivers').select('is_available, is_active', { count: 'exact' }),
        supabase.from('bookings').select('status, created_at', { count: 'exact' }),
        supabase.from('incidents').select('status', { count: 'exact' }).eq('status', 'open')
      ]);

      const vehicles = vehiclesResult.data || [];
      const drivers = driversResult.data || [];
      const bookings = bookingsResult.data || [];

      const stats = {
        totalVehicles: vehicles.length,
        availableVehicles: vehicles.filter(v => v.status === 'available').length,
        inUseVehicles: vehicles.filter(v => v.status === 'in_use').length,
        maintenanceVehicles: vehicles.filter(v => v.status === 'maintenance').length,
        
        totalDrivers: drivers.length,
        activeDrivers: drivers.filter(d => d.is_active).length,
        availableDrivers: drivers.filter(d => d.is_available && d.is_active).length,
        
        totalBookings: bookings.length,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        activeBookings: bookings.filter(b => ['assigned', 'en_route', 'arrived', 'in_progress'].includes(b.status)).length,
        completedToday: bookings.filter(b => b.status === 'completed' && b.created_at?.startsWith(today)).length,
        
        openIncidents: incidentsResult.count || 0
      };

      return new Response(
        JSON.stringify({ stats }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all vehicles with driver info
    if (action === 'get_vehicles') {
      const { data: vehicles, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          current_driver:drivers(
            id,
            user_id,
            tier,
            average_rating,
            is_available,
            current_latitude,
            current_longitude
          ),
          reserved_for_profile:profiles!reserved_for(full_name, designation)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ vehicles }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all drivers with profiles
    if (action === 'get_drivers') {
      const { data: drivers, error } = await supabase
        .from('drivers')
        .select(`
          *,
          profile:profiles!user_id(full_name, email, phone, avatar_url),
          current_vehicle:vehicles(registration_number, model, make)
        `)
        .order('average_rating', { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ drivers }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get pending bookings for approval
    if (action === 'get_pending_bookings') {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          *,
          requester:profiles!requester_id(full_name, designation, department, phone),
          driver:drivers(
            id,
            tier,
            average_rating,
            profile:profiles!user_id(full_name)
          ),
          vehicle:vehicles(registration_number, model)
        `)
        .eq('status', 'pending')
        .order('scheduled_datetime', { ascending: true });

      if (error) throw error;

      return new Response(
        JSON.stringify({ bookings }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Approve booking
    if (action === 'approve_booking') {
      const { bookingId, driverId, vehicleId, notes } = params;

      const { data: booking, error } = await supabase
        .from('bookings')
        .update({
          status: 'approved',
          driver_id: driverId,
          vehicle_id: vehicleId,
          admin_notes: notes,
          approved_by: user.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      // Create notification for requester
      await supabase
        .from('notifications')
        .insert({
          user_id: booking.requester_id,
          title: 'Booking Approved',
          message: `Your booking ${booking.booking_number} has been approved`,
          type: 'booking',
          related_entity_type: 'booking',
          related_entity_id: bookingId
        });

      // Log to audit
      await supabase
        .from('audit_logs')
        .insert({
          action: 'approval',
          entity_type: 'booking',
          entity_id: bookingId,
          user_id: user.id,
          user_role: userRole.role,
          new_values: { status: 'approved', driver_id: driverId }
        });

      return new Response(
        JSON.stringify({ success: true, booking }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Reject booking
    if (action === 'reject_booking') {
      const { bookingId, reason } = params;

      const { data: booking, error } = await supabase
        .from('bookings')
        .update({
          status: 'rejected',
          cancellation_reason: reason,
          cancelled_by: user.id,
          cancelled_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('notifications')
        .insert({
          user_id: booking.requester_id,
          title: 'Booking Rejected',
          message: `Your booking ${booking.booking_number} has been rejected: ${reason}`,
          type: 'booking',
          related_entity_type: 'booking',
          related_entity_id: bookingId
        });

      await supabase
        .from('audit_logs')
        .insert({
          action: 'rejection',
          entity_type: 'booking',
          entity_id: bookingId,
          user_id: user.id,
          user_role: userRole.role,
          new_values: { status: 'rejected', reason }
        });

      return new Response(
        JSON.stringify({ success: true, booking }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get live GPS data for fleet map
    if (action === 'get_fleet_locations') {
      const { data: drivers, error } = await supabase
        .from('drivers')
        .select(`
          id,
          user_id,
          current_latitude,
          current_longitude,
          gps_last_updated,
          is_available,
          tier,
          average_rating,
          profile:profiles!user_id(full_name),
          current_vehicle:vehicles(
            id,
            registration_number,
            model,
            status
          )
        `)
        .eq('is_active', true)
        .not('current_latitude', 'is', null)
        .not('current_longitude', 'is', null);

      if (error) throw error;

      return new Response(
        JSON.stringify({ 
          drivers,
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get suspicious activities/alerts
    if (action === 'get_alerts') {
      const { data: incidents, error } = await supabase
        .from('incidents')
        .select(`
          *,
          driver:drivers(
            id,
            tier,
            profile:profiles!user_id(full_name)
          ),
          vehicle:vehicles(registration_number)
        `)
        .in('status', ['open', 'investigating'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get recent suspicious availability toggles
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: suspiciousToggles } = await supabase
        .from('driver_availability_logs')
        .select(`
          *,
          driver:drivers(
            id,
            profile:profiles!user_id(full_name)
          )
        `)
        .eq('is_suspicious', true)
        .gte('created_at', oneDayAgo)
        .order('created_at', { ascending: false });

      return new Response(
        JSON.stringify({ incidents, suspiciousToggles }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Manual override - assign driver
    if (action === 'manual_assign') {
      const { bookingId, driverId, vehicleId, notes } = params;

      const { data: booking, error } = await supabase
        .from('bookings')
        .update({
          driver_id: driverId,
          vehicle_id: vehicleId,
          allocation_method: 'manual_override',
          status: 'assigned',
          admin_notes: notes,
          approved_by: user.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      // Update driver and vehicle
      await supabase.from('drivers').update({ is_available: false }).eq('id', driverId);
      await supabase.from('vehicles').update({ status: 'in_use' }).eq('id', vehicleId);

      // Notify driver
      const { data: driver } = await supabase
        .from('drivers')
        .select('user_id')
        .eq('id', driverId)
        .single();

      if (driver) {
        await supabase
          .from('notifications')
          .insert({
            user_id: driver.user_id,
            title: 'Manual Booking Assignment',
            message: `You have been manually assigned to booking ${booking.booking_number}`,
            type: 'booking',
            related_entity_type: 'booking',
            related_entity_id: bookingId
          });
      }

      await supabase
        .from('audit_logs')
        .insert({
          action: 'update',
          entity_type: 'booking',
          entity_id: bookingId,
          user_id: user.id,
          user_role: userRole.role,
          new_values: { driver_id: driverId, allocation_method: 'manual_override' }
        });

      return new Response(
        JSON.stringify({ success: true, booking }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Restrict/unrestrict driver
    if (action === 'update_driver_status') {
      const { driverId, isActive, reason } = params;

      const { data: driver, error } = await supabase
        .from('drivers')
        .update({
          is_active: isActive,
          is_available: isActive ? false : false // Force unavailable
        })
        .eq('id', driverId)
        .select()
        .single();

      if (error) throw error;

      if (!isActive) {
        await supabase
          .from('incidents')
          .insert({
            incident_type: 'misconduct',
            severity: 'major',
            driver_id: driverId,
            reported_by: user.id,
            description: `Driver deactivated by admin: ${reason}`,
            status: 'open'
          });
      }

      await supabase
        .from('audit_logs')
        .insert({
          action: 'update',
          entity_type: 'driver',
          entity_id: driverId,
          user_id: user.id,
          user_role: userRole.role,
          old_values: { is_active: !isActive },
          new_values: { is_active: isActive, reason }
        });

      return new Response(
        JSON.stringify({ success: true, driver }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get audit logs
    if (action === 'get_audit_logs') {
      const { entityType, entityId, limit = 100 } = params;

      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (entityType) {
        query = query.eq('entity_type', entityType);
      }
      if (entityId) {
        query = query.eq('entity_id', entityId);
      }

      const { data: logs, error } = await query;

      if (error) throw error;

      return new Response(
        JSON.stringify({ logs }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get analytics data
    if (action === 'get_analytics') {
      const { startDate, endDate } = params;

      // Bookings by status
      const { data: bookingsByStatus } = await supabase
        .from('bookings')
        .select('status')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      // Driver performance
      const { data: driverPerformance } = await supabase
        .from('drivers')
        .select('tier, average_rating, completion_rate, total_trips')
        .eq('is_active', true);

      // Vehicle utilization
      const { data: vehicleUtil } = await supabase
        .from('vehicles')
        .select('status');

      // Group bookings by status
      const statusCounts: Record<string, number> = {};
      (bookingsByStatus || []).forEach(b => {
        const status = b.status as string;
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      // Group drivers by tier
      const tierCounts: Record<string, number> = {};
      (driverPerformance || []).forEach(d => {
        const tier = d.tier as string;
        tierCounts[tier] = (tierCounts[tier] || 0) + 1;
      });

      const avgRating = driverPerformance && driverPerformance.length > 0
        ? driverPerformance.reduce((sum, d) => sum + (d.average_rating || 0), 0) / driverPerformance.length
        : 0;

      const vehicleStatusCounts: Record<string, number> = {};
      (vehicleUtil || []).forEach(v => {
        const status = v.status as string;
        vehicleStatusCounts[status] = (vehicleStatusCounts[status] || 0) + 1;
      });

      return new Response(
        JSON.stringify({
          bookingsByStatus: statusCounts,
          driversByTier: tierCounts,
          avgDriverRating: avgRating,
          vehiclesByStatus: vehicleStatusCounts
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Admin API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
