import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate allocation score for a driver
function calculateAllocationScore(driver: any, pickupLat: number, pickupLon: number, maxDistance: number): number {
  const distance = calculateDistance(
    driver.current_latitude,
    driver.current_longitude,
    pickupLat,
    pickupLon
  );
  
  // Weights as per GFAMS document
  const W_PROXIMITY = 0.5;
  const W_RATING = 0.3;
  const W_RELIABILITY = 0.1;
  const W_LOAD_BALANCE = 0.1;
  
  const proximityScore = (maxDistance - distance) / maxDistance;
  const ratingScore = (driver.average_rating || 0) / 5.0;
  const reliabilityScore = (driver.completion_rate || 100) / 100;
  const loadBalanceScore = Math.max(0, 1 - (driver.trips_today || 0) / 10);
  
  return (
    W_PROXIMITY * proximityScore +
    W_RATING * ratingScore +
    W_RELIABILITY * reliabilityScore +
    W_LOAD_BALANCE * loadBalanceScore
  );
}

// Estimate ETA based on distance (rough estimate: 30 km/h average in city)
function estimateETA(distance: number): number {
  const avgSpeed = 30; // km/h
  return Math.round((distance / avgSpeed) * 60); // minutes
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, bookingId, pickupLatitude, pickupLongitude, requesterType } = await req.json();

    console.log('Booking allocation request:', { action, bookingId, pickupLatitude, pickupLongitude, requesterType });

    if (action === 'find_driver') {
      // Get all available drivers with GPS
      const { data: drivers, error: driversError } = await supabase
        .from('drivers')
        .select(`
          id,
          user_id,
          current_latitude,
          current_longitude,
          average_rating,
          completion_rate,
          trips_today,
          tier,
          current_vehicle_id,
          is_available,
          toggle_lock_until
        `)
        .eq('is_available', true)
        .eq('is_active', true)
        .eq('is_verified', true)
        .not('current_latitude', 'is', null)
        .not('current_longitude', 'is', null);

      if (driversError) {
        console.error('Error fetching drivers:', driversError);
        throw driversError;
      }

      if (!drivers || drivers.length === 0) {
        console.log('No available drivers found');
        return new Response(
          JSON.stringify({ 
            success: false, 
            tier: 'tier_3_external',
            message: 'No internal drivers available. Consider external booking.',
            suggestedDrivers: [] 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Filter out drivers with toggle lock
      const now = new Date();
      const availableDrivers = drivers.filter(d => 
        !d.toggle_lock_until || new Date(d.toggle_lock_until) < now
      );

      if (availableDrivers.length === 0) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            tier: 'tier_3_external',
            message: 'All available drivers are temporarily locked.',
            suggestedDrivers: [] 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Calculate max distance for normalization
      const distances = availableDrivers.map(d => 
        calculateDistance(d.current_latitude, d.current_longitude, pickupLatitude, pickupLongitude)
      );
      const maxDistance = Math.max(...distances, 50); // At least 50km for normalization

      // Score and sort all drivers with computed properties
      interface ScoredDriver {
        id: string;
        user_id: string;
        current_latitude: number;
        current_longitude: number;
        average_rating: number;
        completion_rate: number;
        trips_today: number;
        tier: string;
        current_vehicle_id: string;
        is_available: boolean;
        toggle_lock_until: string | null;
        distance: number;
        score: number;
        eta: number;
      }

      const scoreDriver = (driver: any): ScoredDriver => {
        const distance = calculateDistance(driver.current_latitude, driver.current_longitude, pickupLatitude, pickupLongitude);
        return {
          ...driver,
          distance,
          score: calculateAllocationScore(driver, pickupLatitude, pickupLongitude, maxDistance),
          eta: estimateETA(distance)
        };
      };

      const allScoredDrivers = availableDrivers.map(scoreDriver);

      // For HOGs: prefer reserved pool drivers (tier_1)
      // For Officials: start with best available
      let tier1Drivers: ScoredDriver[] = allScoredDrivers.filter(d => 
        d.tier === 'tier_1_reserved' && 
        (d.average_rating || 0) >= 4.5
      ).sort((a, b) => b.score - a.score);
      
      let tier2Drivers: ScoredDriver[] = allScoredDrivers.filter(d => 
        (d.tier === 'tier_2_priority' || d.tier === 'tier_1_reserved') &&
        (d.average_rating || 0) >= 3.5
      ).sort((a, b) => b.score - a.score);
      
      let tier3Drivers: ScoredDriver[] = allScoredDrivers.filter(d => 
        (d.average_rating || 0) >= 3.0
      ).sort((a, b) => b.score - a.score);

      // Filter by feasible ETA (< 30 minutes as per document)
      const feasibleTier1 = tier1Drivers.filter(d => d.eta <= 30);
      const feasibleTier2 = tier2Drivers.filter(d => d.eta <= 30);
      const feasibleTier3 = tier3Drivers.filter(d => d.eta <= 45);

      let selectedTier = 'tier_1_best_driver';
      let suggestedDrivers: ScoredDriver[] = feasibleTier1.slice(0, 3);

      if (suggestedDrivers.length === 0) {
        selectedTier = 'tier_2_fallback';
        suggestedDrivers = feasibleTier2.slice(0, 3);
      }

      if (suggestedDrivers.length === 0) {
        selectedTier = 'tier_3_external';
        suggestedDrivers = feasibleTier3.slice(0, 3);
      }

      // For HOGs, always try reserved pool first
      if (requesterType === 'hog' && feasibleTier1.length > 0) {
        selectedTier = 'tier_1_best_driver';
        suggestedDrivers = feasibleTier1.slice(0, 3);
      }

      console.log(`Found ${suggestedDrivers.length} drivers in ${selectedTier}`);

      return new Response(
        JSON.stringify({
          success: suggestedDrivers.length > 0,
          tier: selectedTier,
          suggestedDrivers: suggestedDrivers.map(d => ({
            id: d.id,
            userId: d.user_id,
            distance: Math.round(d.distance * 10) / 10,
            eta: d.eta,
            rating: d.average_rating,
            completionRate: d.completion_rate,
            score: Math.round(d.score * 100) / 100,
            vehicleId: d.current_vehicle_id,
            tier: d.tier
          })),
          totalAvailable: availableDrivers.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'assign_driver') {
      const { driverId, vehicleId, allocationMethod } = await req.json();
      
      // Update booking with driver assignment
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .update({
          driver_id: driverId,
          vehicle_id: vehicleId,
          allocation_method: allocationMethod || 'tier_1_best_driver',
          status: 'assigned',
          driver_accepted_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (bookingError) {
        console.error('Error assigning driver:', bookingError);
        throw bookingError;
      }

      // Update driver trips count
      await supabase
        .from('drivers')
        .update({
          trips_today: supabase.rpc('increment', { x: 1 }),
          is_available: false
        })
        .eq('id', driverId);

      // Update vehicle status
      await supabase
        .from('vehicles')
        .update({ status: 'in_use' })
        .eq('id', vehicleId);

      // Create notification for driver
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
            title: 'New Booking Assignment',
            message: `You have been assigned a new booking: ${booking.booking_number}`,
            type: 'booking',
            related_entity_type: 'booking',
            related_entity_id: bookingId
          });
      }

      // Log to audit
      await supabase
        .from('audit_logs')
        .insert({
          action: 'update',
          entity_type: 'booking',
          entity_id: bookingId,
          new_values: { driver_id: driverId, status: 'assigned' }
        });

      console.log('Driver assigned successfully:', { bookingId, driverId });

      return new Response(
        JSON.stringify({ success: true, booking }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Booking allocation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
