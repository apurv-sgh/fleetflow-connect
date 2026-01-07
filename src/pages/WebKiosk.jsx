import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GovHeader from "@/components/layout/GovHeader";
import GovFooter from "@/components/layout/GovFooter";
import { Users, Shield, Car, ArrowRight, Building2, UserCog, Truck } from "lucide-react";

const WebKiosk = () => {
  const navigate = useNavigate();

  const portals = [
    {
      icon: Users,
      title: "User Panel",
      subtitle: "Government Officials & HOGs",
      description: "Book vehicles, track requests, view history, and rate drivers. Designed for government officials and Heads of Groups.",
      color: "bg-info/10 text-info",
      borderColor: "border-info/20 hover:border-info",
      route: "/auth/user",
      features: ["Vehicle Booking", "Status Tracking", "Booking History", "Driver Ratings"],
    },
    {
      icon: Shield,
      title: "Admin Panel",
      subtitle: "Transport Division Management",
      description: "Complete fleet oversight with vehicle allocation, driver management, GPS tracking, and comprehensive analytics.",
      color: "bg-primary/10 text-primary",
      borderColor: "border-primary/20 hover:border-primary",
      route: "/auth/admin",
      features: ["Fleet Management", "GPS Monitoring", "Driver Analytics", "Audit Reports"],
    },
    {
      icon: Car,
      title: "Driver Panel",
      subtitle: "Vehicle Operators",
      description: "Manage availability, receive booking notifications, track performance, and view trip history.",
      color: "bg-success/10 text-success",
      borderColor: "border-success/20 hover:border-success",
      route: "/auth/driver",
      features: ["Availability Toggle", "Trip Notifications", "Performance Stats", "Ride History"],
    },
  ];

  return (
    <div className="page-container">
      <GovHeader />

      <main className="flex-1 bg-gradient-to-b from-muted/50 to-background">
        {/* Header Section */}
        <section className="py-12 md:py-16 bg-primary text-primary-foreground">
          <div className="content-container text-center">
            <div className="inline-flex items-center gap-2 bg-secondary/20 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Building2 className="h-4 w-4" />
              <span>Transport Division Portal</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
              GFAMS Web-Kiosk
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              Select your portal below to access the Government Fleet Allocation 
              & Management System. Each portal is designed for specific user roles.
            </p>
          </div>
        </section>

        {/* Portal Cards */}
        <section className="py-12 md:py-20">
          <div className="content-container">
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {portals.map((portal, index) => (
                <div
                  key={index}
                  className={`gov-card p-6 md:p-8 flex flex-col space-y-6 border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${portal.borderColor} animate-slide-up`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Icon */}
                  <div className={`h-16 w-16 rounded-xl ${portal.color} flex items-center justify-center`}>
                    <portal.icon className="h-8 w-8" />
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h2 className="text-2xl font-display font-bold text-foreground">
                      {portal.title}
                    </h2>
                    <p className="text-sm font-medium text-muted-foreground">
                      {portal.subtitle}
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      {portal.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="flex-1">
                    <ul className="grid grid-cols-2 gap-2">
                      {portal.features.map((feature, fIndex) => (
                        <li 
                          key={fIndex} 
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="gov"
                    size="lg"
                    className="w-full"
                    onClick={() => navigate(portal.route)}
                  >
                    Enter {portal.title}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Access Section */}
        <section className="py-12 bg-muted/50">
          <div className="content-container">
            <div className="text-center mb-8">
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                Quick Information
              </h3>
              <p className="text-muted-foreground">
                Important guidelines for using the GFAMS portal
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card rounded-lg p-6 text-center space-y-3">
                <UserCog className="h-8 w-8 text-primary mx-auto" />
                <h4 className="font-semibold text-foreground">For Officials</h4>
                <p className="text-sm text-muted-foreground">
                  Use your official NIC email ID and government credentials to access the User Panel.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 text-center space-y-3">
                <Shield className="h-8 w-8 text-primary mx-auto" />
                <h4 className="font-semibold text-foreground">For Admins</h4>
                <p className="text-sm text-muted-foreground">
                  Transport Division administrators require special admin credentials for access.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 text-center space-y-3">
                <Truck className="h-8 w-8 text-primary mx-auto" />
                <h4 className="font-semibold text-foreground">For Drivers</h4>
                <p className="text-sm text-muted-foreground">
                  Registered drivers can login using their license number and assigned credentials.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="py-12">
          <div className="content-container">
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 md:p-8 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Need Assistance?
              </h3>
              <p className="text-muted-foreground mb-4">
                For technical support or queries, contact the Transport Division Helpdesk
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                <span className="text-primary font-semibold">📞 1800-111-555 (Toll Free)</span>
                <span className="text-muted-foreground">|</span>
                <span className="text-primary font-semibold">✉️ transport@nic.in</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <GovFooter />
    </div>
  );
};

export default WebKiosk;