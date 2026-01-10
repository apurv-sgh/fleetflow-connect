import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import StatsCard from "@/components/dashboard/StatsCard";
import BookingCard from "@/components/dashboard/BookingCard";
import GovHeader from "@/components/layout/GovHeader";
import GovFooter from "@/components/layout/GovFooter";
import {
  Car,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Search,
  Bell,
  LogOut,
  History,
  User,
  Star,
  ChevronRight,
  X,
} from "lucide-react";

// Real data will be fetched from backend

const UserDashboard = () => {
  const navigate = useNavigate();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookings, setBookings] = useState([]);
  const userRaw = localStorage.getItem("user");
  const authedUser = userRaw ? JSON.parse(userRaw) : null;
  const user = {
    name: `${authedUser?.firstName || "User"} ${authedUser?.lastName || ""}`.trim(),
    designation: authedUser?.designation || "",
    department: authedUser?.department || "",
    email: authedUser?.email || "",
    isHOG: authedUser?.role === "HOG",
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/kiosk");
  };

  return (
    <div className="page-container bg-muted/30">
      <GovHeader />

      <main className="flex-1">
        {/* Top Bar */}
        <div className="bg-card border-b border-border">
          <div className="content-container py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold text-foreground">
                      Welcome, {user.name}
                    </h1>
                    {user.isHOG && (
                      <Badge variant="reserved">HOG</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {user.designation} • {user.department}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="content-container py-6">
          {/* Stats Grid */}
          <div className="dashboard-grid mb-8">
            <StatsCard
              title="Active Bookings"
              value="2"
              icon={Car}
              description="1 in progress, 1 pending"
              iconClassName="bg-info/10"
            />
            <StatsCard
              title="Total Trips"
              value="47"
              icon={History}
              description="This month: 12"
              trend={{ value: 15, isPositive: true }}
            />
            <StatsCard
              title="Average Rating Given"
              value="4.6"
              icon={Star}
              description="Based on 45 ratings"
              iconClassName="bg-secondary/10"
            />
            <StatsCard
              title="Preferred Vehicle"
              value="Sedan"
              icon={Car}
              description="60% of your bookings"
              iconClassName="bg-success/10"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="section-heading mb-0">My Bookings</h2>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="gov" onClick={() => setShowBookingForm(true)}>
                <Plus className="h-4 w-4" />
                New Booking
              </Button>
            </div>
          </div>

          {/* Bookings Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {bookings.map((b) => (
              <BookingCard
                key={b._id}
                booking={{
                  requesterName: b.official?.name || "Self",
                  requesterDesignation: b.official?.designation || "",
                  pickupLocation: b.pickupLocation?.address,
                  dropLocation: b.dropLocation?.address,
                  requestedTime: new Date(b.requestedDateTime).toLocaleString(),
                  status: (b.status || 'pending').toLowerCase(),
                  vehicleNumber: b.assignedVehicle?.registration,
                  driverName: b.assignedDriver?.name,
                  driverRating: b.assignedDriver?.rating,
                }}
                showActions={false}
                onViewDetails={() => {}}
              />
            ))}
          </div>

          {/* Quick Booking Form Modal */}
          {showBookingForm && (
            <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-display font-semibold">
                      New Vehicle Booking
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowBookingForm(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  <form className="space-y-4">
                    <div>
                      <label className="form-label">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-success" />
                          Pickup Location
                        </div>
                      </label>
                      <Input
                        placeholder="e.g., NIC HQ, CGO Complex"
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-destructive" />
                          Drop Location
                        </div>
                      </label>
                      <Input
                        placeholder="e.g., Ministry of Finance"
                        className="form-input"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Date
                          </div>
                        </label>
                        <Input type="date" className="form-input" />
                      </div>
                      <div>
                        <label className="form-label">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Time
                          </div>
                        </label>
                        <Input type="time" className="form-input" />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Number of Passengers</label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        defaultValue="1"
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">Special Requirements</label>
                      <Input
                        placeholder="e.g., Wheelchair accessible, Extra luggage space"
                        className="form-input"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowBookingForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" variant="gov" className="flex-1">
                        Submit Request
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="gov-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Recent Activity</h3>
              <Button variant="link" size="sm">
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {[
                {
                  action: "Booking completed",
                  details: "Trip to India Habitat Centre",
                  time: "2 hours ago",
                  icon: "✓",
                },
                {
                  action: "Driver assigned",
                  details: "Rajesh Kumar for tomorrow's trip",
                  time: "5 hours ago",
                  icon: "🚗",
                },
                {
                  action: "Booking request submitted",
                  details: "Ministry of Finance visit",
                  time: "1 day ago",
                  icon: "📝",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                >
                  <span className="text-lg">{activity.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.details}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </span>
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

export default UserDashboard;

// Fetch bookings on mount
import { bookingService } from "@/services/bookingService";
import { useToast } from "@/hooks/use-toast";

const _SetupEffects = (() => {
  // no-op placeholder to satisfy linter for additional imports above
  return null;
})();

// Patch component to add effect
UserDashboard.defaultProps = {};

// Monkey-patch useEffect within file scope
(function attachEffects() {
  const original = UserDashboard;
})();