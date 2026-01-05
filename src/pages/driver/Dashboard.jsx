import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatsCard from "@/components/dashboard/StatsCard";
import GovHeader from "@/components/layout/GovHeader";
import GovFooter from "@/components/layout/GovFooter";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useDriverData } from "@/hooks/useDriverData";
import {
  Car,
  MapPin,
  Star,
  Clock,
  Bell,
  LogOut,
  ToggleLeft,
  ToggleRight,
  Navigation,
  Phone,
  CheckCircle2,
  TrendingUp,
  History,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DriverDashboardContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, signOut } = useAuth();
  const { 
    driver, 
    activeBooking, 
    recentBookings, 
    stats, 
    loading, 
    toggleAvailability,
    updateBookingStatus
  } = useDriverData();

  const [isToggling, setIsToggling] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/kiosk");
  };

  const handleToggleAvailability = async () => {
    setIsToggling(true);
    try {
      // Get current position for GPS tracking
      let position = null;
      if (navigator.geolocation) {
        try {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
            });
          });
          position = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
        } catch (geoError) {
          console.warn("Could not get location:", geoError);
        }
      }

      const result = await toggleAvailability(!driver?.is_available, null, position);
      
      toast({
        title: driver?.is_available ? "Status: Unavailable" : "Status: Available",
        description: driver?.is_available ? "You won't receive new bookings" : "You can now receive bookings",
      });

      if (result?.warning) {
        toast({
          title: "Warning",
          description: result.warning,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update availability",
        variant: "destructive",
      });
    } finally {
      setIsToggling(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!activeBooking) return;
    
    try {
      let position = null;
      if (navigator.geolocation) {
        try {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          position = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        } catch (e) {
          console.warn("Could not get location");
        }
      }

      await updateBookingStatus(activeBooking.id, newStatus, position?.latitude, position?.longitude);
      
      toast({
        title: "Status Updated",
        description: `Booking status changed to ${newStatus.replace("_", " ")}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  const getTierLabel = (tier) => {
    const tierMap = {
      tier_1_reserved: "Reserved Pool",
      tier_2_priority: "Priority Pool",
      tier_3_standard: "Standard Pool",
      tier_4_probation: "Probation",
    };
    return tierMap[tier] || tier;
  };

  const getTierVariant = (tier) => {
    if (tier === "tier_1_reserved") return "tier1";
    if (tier === "tier_2_priority") return "tier2";
    if (tier === "tier_3_standard") return "tier3";
    return "destructive";
  };

  if (loading) {
    return (
      <div className="page-container bg-muted/30">
        <GovHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
        <GovFooter />
      </div>
    );
  }

  return (
    <div className="page-container bg-muted/30">
      <GovHeader />

      <main className="flex-1">
        {/* Top Bar */}
        <div className="bg-card border-b border-border">
          <div className="content-container py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center font-bold text-lg text-success">
                    {profile?.full_name?.charAt(0) || "D"}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card ${driver?.is_available ? "bg-success" : "bg-muted-foreground"}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold">{profile?.full_name || "Driver"}</h1>
                    {driver?.tier && (
                      <Badge variant={getTierVariant(driver.tier)}>{getTierLabel(driver.tier)}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {driver?.current_vehicle?.registration_number || "No vehicle assigned"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="content-container py-6 space-y-6">
          {/* Availability Toggle */}
          <div className="gov-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Availability Status</p>
                <p className="text-sm text-muted-foreground">
                  {driver?.is_available ? "You are accepting bookings" : "You are offline"}
                </p>
                {driver?.toggle_lock_until && new Date(driver.toggle_lock_until) > new Date() && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3" />
                    Toggle locked until {new Date(driver.toggle_lock_until).toLocaleTimeString()}
                  </p>
                )}
              </div>
              <Button
                variant={driver?.is_available ? "success" : "outline"}
                size="lg"
                onClick={handleToggleAvailability}
                disabled={isToggling || (driver?.toggle_lock_until && new Date(driver.toggle_lock_until) > new Date())}
                className="gap-2"
              >
                {isToggling ? (
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : driver?.is_available ? (
                  <ToggleRight className="h-5 w-5" />
                ) : (
                  <ToggleLeft className="h-5 w-5" />
                )}
                {driver?.is_available ? "Available" : "Unavailable"}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="dashboard-grid">
            <StatsCard 
              title="Rating" 
              value={(driver?.average_rating || 0).toFixed(1)} 
              icon={Star} 
              description={`${driver?.total_ratings || 0} ratings`} 
              iconClassName="bg-secondary/10" 
            />
            <StatsCard 
              title="Completion Rate" 
              value={`${driver?.completion_rate || 100}%`} 
              icon={CheckCircle2} 
              trend={{ value: 2, isPositive: true }} 
            />
            <StatsCard 
              title="Today's Trips" 
              value={String(driver?.trips_today || 0)} 
              icon={Car} 
              description="trips completed" 
            />
            <StatsCard 
              title="This Month" 
              value={String(driver?.trips_this_month || 0)} 
              icon={TrendingUp} 
              description="total trips" 
            />
          </div>

          {/* Current Booking */}
          {activeBooking && (
            <div className="gov-card p-6 border-2 border-success/30 bg-success/5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
                <span className="font-semibold text-success">Active Booking</span>
                <Badge variant="info">{activeBooking.status?.replace("_", " ")}</Badge>
              </div>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground">
                      {activeBooking.requester?.full_name || "Passenger"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activeBooking.requester?.designation}
                    </p>
                  </div>
                  <Badge variant="info">
                    {new Date(activeBooking.scheduled_datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Pickup</p>
                      <p className="text-sm">{activeBooking.pickup_address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Drop</p>
                      <p className="text-sm">{activeBooking.drop_address}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 flex-wrap">
                  {activeBooking.status === "assigned" && (
                    <Button variant="gov" className="flex-1 gap-2" onClick={() => handleUpdateStatus("en_route")}>
                      <Navigation className="h-4 w-4" /> Start Journey
                    </Button>
                  )}
                  {activeBooking.status === "en_route" && (
                    <Button variant="gov" className="flex-1 gap-2" onClick={() => handleUpdateStatus("arrived")}>
                      <CheckCircle2 className="h-4 w-4" /> Arrived at Pickup
                    </Button>
                  )}
                  {activeBooking.status === "arrived" && (
                    <Button variant="gov" className="flex-1 gap-2" onClick={() => handleUpdateStatus("in_progress")}>
                      <Car className="h-4 w-4" /> Start Trip
                    </Button>
                  )}
                  {activeBooking.status === "in_progress" && (
                    <Button variant="success" className="flex-1 gap-2" onClick={() => handleUpdateStatus("completed")}>
                      <CheckCircle2 className="h-4 w-4" /> Complete Trip
                    </Button>
                  )}
                  {activeBooking.requester?.phone && (
                    <Button variant="outline" className="gap-2" onClick={() => window.open(`tel:${activeBooking.requester.phone}`)}>
                      <Phone className="h-4 w-4" /> Call
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {!activeBooking && driver?.is_available && (
            <div className="gov-card p-6 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Waiting for Bookings</h3>
              <p className="text-sm text-muted-foreground">
                You'll receive a notification when a new booking is assigned to you.
              </p>
            </div>
          )}

          {/* Recent Trips */}
          <div className="gov-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <History className="h-5 w-5" /> Recent Trips
            </h3>
            {recentBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent trips</p>
            ) : (
              <div className="space-y-3">
                {recentBookings.slice(0, 5).map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">
                        {trip.pickup_address?.split(",")[0]} → {trip.drop_address?.split(",")[0]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(trip.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={trip.status === "completed" ? "success" : "outline"}>
                      {trip.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <GovFooter />
    </div>
  );
};

const DriverDashboard = () => (
  <ProtectedRoute allowedRoles={["driver"]}>
    <DriverDashboardContent />
  </ProtectedRoute>
);

export default DriverDashboard;
