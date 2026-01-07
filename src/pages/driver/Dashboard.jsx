import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatsCard from "@/components/dashboard/StatsCard";
import GovHeader from "@/components/layout/GovHeader";
import GovFooter from "@/components/layout/GovFooter";
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
  AlertTriangle,
  History,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAvailable, setIsAvailable] = useState(true);

  const driver = {
    name: "Rajesh Kumar",
    licenseNumber: "DL-0420110012345",
    rating: 4.8,
    totalRatings: 156,
    tier: 1,
    completionRate: 98,
    vehicleNumber: "DL-01-AB-1234",
    vehicleModel: "Toyota Innova Crysta",
  };

  const currentBooking = {
    id: "1",
    passengerName: "Dr. Anita Sharma",
    designation: "Senior Technical Director",
    pickup: "NIC HQ, CGO Complex",
    drop: "Ministry of Finance, North Block",
    time: "10:30 AM",
    phone: "+91 98765 43210",
  };

  const handleToggleAvailability = () => {
    setIsAvailable(!isAvailable);
    toast({
      title: isAvailable ? "Status: Unavailable" : "Status: Available",
      description: isAvailable ? "You won't receive new bookings" : "You can now receive bookings",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("gfams_user");
    navigate("/kiosk");
  };

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
                    {driver.name.charAt(0)}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card ${isAvailable ? "bg-success" : "bg-muted-foreground"}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold">{driver.name}</h1>
                    <Badge variant="tier1">Reserved Pool</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{driver.vehicleNumber}</p>
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
                  {isAvailable ? "You are accepting bookings" : "You are offline"}
                </p>
              </div>
              <Button
                variant={isAvailable ? "success" : "outline"}
                size="lg"
                onClick={handleToggleAvailability}
                className="gap-2"
              >
                {isAvailable ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                {isAvailable ? "Available" : "Unavailable"}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="dashboard-grid">
            <StatsCard title="Rating" value={driver.rating.toFixed(1)} icon={Star} description={`${driver.totalRatings} ratings`} iconClassName="bg-secondary/10" />
            <StatsCard title="Completion Rate" value={`${driver.completionRate}%`} icon={CheckCircle2} trend={{ value: 2, isPositive: true }} />
            <StatsCard title="Today's Trips" value="3" icon={Car} description="₹450 earned" />
            <StatsCard title="This Month" value="47" icon={TrendingUp} description="₹12,500 earned" />
          </div>

          {/* Current Booking */}
          {currentBooking && (
            <div className="gov-card p-6 border-2 border-success/30 bg-success/5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
                <span className="font-semibold text-success">Active Booking</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{currentBooking.passengerName}</p>
                    <p className="text-sm text-muted-foreground">{currentBooking.designation}</p>
                  </div>
                  <Badge variant="info">{currentBooking.time}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Pickup</p>
                      <p className="text-sm">{currentBooking.pickup}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Drop</p>
                      <p className="text-sm">{currentBooking.drop}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="gov" className="flex-1 gap-2">
                    <Navigation className="h-4 w-4" /> Navigate
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Phone className="h-4 w-4" /> Call
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Recent Trips */}
          <div className="gov-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <History className="h-5 w-5" /> Recent Trips
            </h3>
            <div className="space-y-3">
              {[
                { from: "India Gate", to: "NIC HQ", time: "Yesterday, 4:30 PM", rating: 5 },
                { from: "Shastri Bhawan", to: "Vigyan Bhawan", time: "Yesterday, 2:00 PM", rating: 4 },
                { from: "NIC HQ", to: "IGI Airport T3", time: "Jan 3, 9:00 AM", rating: 5 },
              ].map((trip, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{trip.from} → {trip.to}</p>
                    <p className="text-xs text-muted-foreground">{trip.time}</p>
                  </div>
                  <div className="flex items-center gap-1 text-secondary">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-medium">{trip.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <GovFooter />
    </div>
  );
};

export default DriverDashboard;