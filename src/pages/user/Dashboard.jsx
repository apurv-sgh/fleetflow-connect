import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import StatsCard from "@/components/dashboard/StatsCard";
import BookingCard from "@/components/dashboard/BookingCard";
import GovHeader from "@/components/layout/GovHeader";
import GovFooter from "@/components/layout/GovFooter";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings } from "@/hooks/useBookings";
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
import { useToast } from "@/hooks/use-toast";

const UserDashboardContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, userRole, signOut } = useAuth();
  const { bookings, activeBooking, loading, createBooking, cancelBooking } = useBookings();
  
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    pickupAddress: "",
    dropAddress: "",
    date: "",
    time: "",
    passengerCount: 1,
    specialRequirements: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/kiosk");
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    
    if (!formData.pickupAddress || !formData.dropAddress || !formData.date || !formData.time) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const scheduledDatetime = new Date(`${formData.date}T${formData.time}`);
      
      await createBooking({
        pickupAddress: formData.pickupAddress,
        dropAddress: formData.dropAddress,
        scheduledDatetime: scheduledDatetime.toISOString(),
        passengerCount: formData.passengerCount,
        specialRequirements: formData.specialRequirements,
        requesterType: userRole || "official",
      });

      toast({
        title: "Booking Submitted",
        description: "Your vehicle request has been submitted successfully.",
      });

      setShowBookingForm(false);
      setFormData({
        pickupAddress: "",
        dropAddress: "",
        date: "",
        time: "",
        passengerCount: 1,
        specialRequirements: "",
      });
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to submit booking request.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBookings = bookings.filter(
    (b) =>
      b.pickup_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.drop_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.booking_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedBookings = bookings.filter((b) => b.status === "completed");
  const pendingBookings = bookings.filter((b) => ["pending", "approved", "assigned"].includes(b.status));

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
                      Welcome, {profile?.full_name || "User"}
                    </h1>
                    {userRole === "hog" && (
                      <Badge variant="reserved">HOG</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {profile?.designation || "Government Official"} • {profile?.department || "NIC"}
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
              value={pendingBookings.length.toString()}
              icon={Car}
              description={`${bookings.filter(b => b.status === "in_progress").length} in progress`}
              iconClassName="bg-info/10"
            />
            <StatsCard
              title="Total Trips"
              value={completedBookings.length.toString()}
              icon={History}
              description="Completed trips"
              trend={{ value: 15, isPositive: true }}
            />
            <StatsCard
              title="Average Rating Given"
              value="4.6"
              icon={Star}
              description="Based on your ratings"
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
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No Bookings Yet</h3>
              <p className="text-muted-foreground mb-4">Start by creating your first vehicle booking.</p>
              <Button variant="gov" onClick={() => setShowBookingForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Booking
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={{
                    id: booking.id,
                    requesterName: "Self",
                    requesterDesignation: profile?.designation || "",
                    pickupLocation: booking.pickup_address,
                    dropLocation: booking.drop_address,
                    requestedTime: new Date(booking.scheduled_datetime).toLocaleString(),
                    status: booking.status,
                    vehicleNumber: booking.vehicle?.registration_number,
                    driverName: booking.driver?.profile?.full_name,
                    driverRating: booking.driver?.average_rating,
                  }}
                  showActions={booking.status === "pending"}
                  onViewDetails={() => {}}
                  onCancel={() => cancelBooking(booking.id, "User cancelled")}
                />
              ))}
            </div>
          )}

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

                  <form onSubmit={handleSubmitBooking} className="space-y-4">
                    <div>
                      <label className="form-label">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-success" />
                          Pickup Location
                        </div>
                      </label>
                      <Input
                        placeholder="e.g., NIC HQ, CGO Complex"
                        value={formData.pickupAddress}
                        onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                        required
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
                        value={formData.dropAddress}
                        onChange={(e) => setFormData({ ...formData, dropAddress: e.target.value })}
                        required
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
                        <Input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          required
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="form-label">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Time
                          </div>
                        </label>
                        <Input
                          type="time"
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          required
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Number of Passengers</label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.passengerCount}
                        onChange={(e) => setFormData({ ...formData, passengerCount: parseInt(e.target.value) })}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">Special Requirements</label>
                      <Input
                        placeholder="e.g., Wheelchair accessible, Extra luggage space"
                        value={formData.specialRequirements}
                        onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
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
                      <Button type="submit" variant="gov" className="flex-1" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit Request"}
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
              {bookings.slice(0, 3).map((booking, index) => (
                <div
                  key={booking.id || index}
                  className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                >
                  <span className="text-lg">
                    {booking.status === "completed" ? "✓" : booking.status === "assigned" ? "🚗" : "📝"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {booking.status === "completed" ? "Booking completed" : 
                       booking.status === "assigned" ? "Driver assigned" : "Booking request"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {booking.pickup_address} → {booking.drop_address}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(booking.created_at).toLocaleDateString()}
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

const UserDashboard = () => (
  <ProtectedRoute allowedRoles={["official", "hog"]}>
    <UserDashboardContent />
  </ProtectedRoute>
);

export default UserDashboard;
