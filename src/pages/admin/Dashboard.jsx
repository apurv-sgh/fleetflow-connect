import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import StatsCard from "@/components/dashboard/StatsCard";
import BookingCard from "@/components/dashboard/BookingCard";
import DriverCard from "@/components/dashboard/DriverCard";
import VehicleCard from "@/components/dashboard/VehicleCard";
import GovHeader from "@/components/layout/GovHeader";
import GovFooter from "@/components/layout/GovFooter";
import {
  Car,
  Users,
  MapPin,
  AlertTriangle,
  Search,
  Bell,
  LogOut,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  RefreshCw,
  ChevronRight,
  Shield,
  Fuel,
  Activity,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockBookings = [
  {
    id: "1",
    requesterId: "u1",
    requesterName: "Dr. Anita Sharma",
    requesterDesignation: "Senior Technical Director",
    pickupLocation: "NIC HQ, CGO Complex",
    dropLocation: "Ministry of Finance, North Block",
    requestedTime: "Today, 10:30 AM",
    status: "pending",
  },
  {
    id: "2",
    requesterId: "u2",
    requesterName: "Shri Vikram Patel",
    requesterDesignation: "Deputy Director",
    pickupLocation: "Shastri Bhawan",
    dropLocation: "India Gate",
    requestedTime: "Today, 11:00 AM",
    status: "pending",
  },
  {
    id: "3",
    requesterId: "u3",
    requesterName: "Smt. Priya Singh",
    requesterDesignation: "HOG - e-Governance",
    pickupLocation: "Vigyan Bhawan",
    dropLocation: "NIC HQ",
    requestedTime: "Today, 02:00 PM",
    status: "approved",
    vehicleNumber: "DL-01-AB-1234",
    driverName: "Rajesh Kumar",
    driverRating: 4.8,
  },
];

const mockDrivers = [
  {
    id: "d1",
    name: "Rajesh Kumar",
    phone: "+91 98765 43210",
    licenseNumber: "DL-0420110012345",
    rating: 4.8,
    totalRatings: 156,
    experience: 8,
    completionRate: 98,
    tier: 1,
    isAvailable: true,
    currentLocation: "NIC HQ, CGO Complex",
    vehicleNumber: "DL-01-AB-1234",
    vehicleType: "Sedan",
    totalTrips: 1250,
  },
  {
    id: "d2",
    name: "Amit Singh",
    phone: "+91 98765 43211",
    licenseNumber: "DL-0420110012346",
    rating: 4.5,
    totalRatings: 98,
    experience: 5,
    completionRate: 95,
    tier: 2,
    isAvailable: true,
    currentLocation: "Shastri Bhawan",
    vehicleNumber: "DL-01-CD-5678",
    vehicleType: "SUV",
    totalTrips: 780,
  },
  {
    id: "d3",
    name: "Suresh Yadav",
    phone: "+91 98765 43212",
    licenseNumber: "DL-0420110012347",
    rating: 4.2,
    totalRatings: 67,
    experience: 3,
    completionRate: 92,
    tier: 3,
    isAvailable: false,
    currentLocation: "En Route - India Gate",
    vehicleNumber: "DL-01-EF-9012",
    vehicleType: "Sedan",
    totalTrips: 450,
  },
];

const mockVehicles = [
  {
    id: "v1",
    registrationNumber: "DL-01-AB-1234",
    model: "Toyota Innova Crysta",
    type: "suv",
    seatingCapacity: 7,
    fuelType: "diesel",
    status: "available",
    pool: "reserved",
    assignedDriverName: "Rajesh Kumar",
    assignedHOGName: "Dr. P.K. Gupta",
    currentLocation: "NIC HQ Parking",
    totalKm: 45000,
  },
  {
    id: "v2",
    registrationNumber: "DL-01-CD-5678",
    model: "Maruti Ciaz",
    type: "sedan",
    seatingCapacity: 5,
    fuelType: "petrol",
    status: "in-use",
    pool: "non-reserved",
    assignedDriverName: "Amit Singh",
    currentLocation: "En Route",
    totalKm: 32000,
  },
  {
    id: "v3",
    registrationNumber: "DL-01-EF-9012",
    model: "Mahindra XUV500",
    type: "suv",
    seatingCapacity: 7,
    fuelType: "diesel",
    status: "maintenance",
    pool: "non-reserved",
    nextServiceDue: "2026-01-10",
    totalKm: 78000,
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("gfams_user");
    navigate("/kiosk");
  };

  const handleApproveBooking = (bookingId) => {
    toast({
      title: "Booking Approved",
      description: "Driver allocation in progress...",
    });
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "bookings", label: "Bookings", icon: Clock },
    { id: "drivers", label: "Drivers", icon: Users },
    { id: "vehicles", label: "Vehicles", icon: Car },
    { id: "tracking", label: "GPS Tracking", icon: MapPin },
  ];

  return (
    <div className="page-container bg-muted/30">
      <GovHeader />

      <main className="flex-1">
        {/* Top Bar */}
        <div className="bg-card border-b border-border">
          <div className="content-container py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">
                    Transport Division - Admin Panel
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Fleet Management Dashboard
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
                </Button>
                <Button variant="ghost" size="icon">
                  <RefreshCw className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-card border-b border-border sticky top-[73px] z-40">
          <div className="content-container">
            <nav className="flex gap-1 overflow-x-auto py-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="content-container py-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="dashboard-grid">
                <StatsCard
                  title="Total Vehicles"
                  value="45"
                  icon={Car}
                  description="32 available, 10 in-use, 3 maintenance"
                  iconClassName="bg-primary/10"
                />
                <StatsCard
                  title="Active Drivers"
                  value="38"
                  icon={Users}
                  description="28 available now"
                  trend={{ value: 5, isPositive: true }}
                />
                <StatsCard
                  title="Pending Bookings"
                  value="7"
                  icon={Clock}
                  description="Awaiting approval"
                  iconClassName="bg-warning/10"
                />
                <StatsCard
                  title="Trips Today"
                  value="24"
                  icon={TrendingUp}
                  description="18 completed, 6 in progress"
                  trend={{ value: 12, isPositive: true }}
                />
              </div>

              {/* Alerts */}
              <div className="gov-card p-4 bg-warning/5 border-warning/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">System Alerts</p>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      <li>• 3 vehicles due for service this week</li>
                      <li>• Driver Suresh Yadav has low completion rate (82%)</li>
                      <li>• 2 suspicious availability toggles detected</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Quick Views */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Pending Bookings */}
                <div className="gov-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Pending Approvals</h3>
                    <Button variant="link" size="sm" onClick={() => setActiveTab("bookings")}>
                      View All <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {mockBookings.filter(b => b.status === "pending").slice(0, 2).map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        onApprove={() => handleApproveBooking(booking.id)}
                        onReject={() => {}}
                        onViewDetails={() => {}}
                      />
                    ))}
                  </div>
                </div>

                {/* Available Drivers */}
                <div className="gov-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Available Drivers</h3>
                    <Button variant="link" size="sm" onClick={() => setActiveTab("drivers")}>
                      View All <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {mockDrivers.filter(d => d.isAvailable).map((driver) => (
                      <DriverCard
                        key={driver.id}
                        driver={driver}
                        compact
                        showActions={false}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Fleet Status */}
              <div className="gov-card p-6">
                <h3 className="font-semibold text-foreground mb-4">Fleet Status Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: "Available", count: 32, color: "bg-success" },
                    { label: "In Use", count: 10, color: "bg-info" },
                    { label: "Reserved", count: 8, color: "bg-primary" },
                    { label: "Maintenance", count: 3, color: "bg-warning" },
                    { label: "Retired", count: 2, color: "bg-muted-foreground" },
                  ].map((status, index) => (
                    <div key={index} className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className={`h-3 w-3 ${status.color} rounded-full mx-auto mb-2`} />
                      <p className="text-2xl font-bold text-foreground">{status.count}</p>
                      <p className="text-xs text-muted-foreground">{status.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="section-heading mb-0">All Booking Requests</h2>
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
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onApprove={() => handleApproveBooking(booking.id)}
                    onReject={() => {}}
                    onViewDetails={() => {}}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Drivers Tab */}
          {activeTab === "drivers" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="section-heading mb-0">Driver Management</h2>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search drivers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button variant="gov">Add Driver</Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockDrivers.map((driver) => (
                  <DriverCard
                    key={driver.id}
                    driver={driver}
                    onToggleAvailability={() => {}}
                    onViewProfile={() => {}}
                    onAssign={() => {}}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Vehicles Tab */}
          {activeTab === "vehicles" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="section-heading mb-0">Vehicle Fleet</h2>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search vehicles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button variant="gov">Add Vehicle</Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockVehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onViewDetails={() => {}}
                    onAssign={() => {}}
                    onMaintenance={() => {}}
                  />
                ))}
              </div>
            </div>
          )}

          {/* GPS Tracking Tab */}
          {activeTab === "tracking" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="section-heading mb-0">Live GPS Tracking</h2>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {/* Mock Map */}
              <div className="map-container flex items-center justify-center">
                <div className="text-center space-y-4">
                  <MapPin className="h-16 w-16 text-primary mx-auto animate-bounce-subtle" />
                  <div>
                    <p className="text-lg font-semibold text-foreground">Live Map View</p>
                    <p className="text-sm text-muted-foreground">
                      Connect to Mapbox or Google Maps for real-time vehicle tracking
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {[
                      { color: "bg-success", label: "Available (32)" },
                      { color: "bg-info", label: "In Transit (10)" },
                      { color: "bg-warning", label: "Idle (5)" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1 bg-card rounded-full text-xs">
                        <div className={`h-2 w-2 ${item.color} rounded-full`} />
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Vehicle List */}
              <div className="gov-card p-6">
                <h3 className="font-semibold text-foreground mb-4">Active Vehicles</h3>
                <div className="space-y-3">
                  {mockVehicles.filter(v => v.status !== "retired").map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${
                          vehicle.status === "available" ? "bg-success" :
                          vehicle.status === "in-use" ? "bg-info" : "bg-warning"
                        }`} />
                        <div>
                          <p className="font-medium text-foreground">{vehicle.registrationNumber}</p>
                          <p className="text-xs text-muted-foreground">{vehicle.model}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-foreground">{vehicle.currentLocation || "Unknown"}</p>
                        <Badge variant={vehicle.status === "available" ? "available" : vehicle.status === "in-use" ? "busy" : "maintenance"}>
                          {vehicle.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <GovFooter />
    </div>
  );
};

export default AdminDashboard;