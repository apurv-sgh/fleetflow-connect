import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GovHeader from "@/components/layout/GovHeader";
import GovFooter from "@/components/layout/GovFooter";
import {
  Car,
  Users,
  Shield,
  Clock,
  MapPin,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Zap,
  Eye,
  FileCheck,
  Smartphone,
} from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Clock,
      title: "Reduced Booking Time",
      description: "From 2-4 hours to just 15-30 minutes with our automated allocation system.",
    },
    {
      icon: Eye,
      title: "Complete Transparency",
      description: "Merit-based driver assignment eliminates manual bias in allocations.",
    },
    {
      icon: MapPin,
      title: "Real-Time GPS Tracking",
      description: "Live vehicle tracking with geofencing and route monitoring.",
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Comprehensive dashboards for fleet utilization and driver metrics.",
    },
    {
      icon: Shield,
      title: "Enhanced Security",
      description: "Complete audit trails and compliance reporting for accountability.",
    },
    {
      icon: Zap,
      title: "Smart Allocation",
      description: "Intelligent 3-tier fallback mechanism for optimal driver assignment.",
    },
  ];

  const stats = [
    { value: "500+", label: "Vehicles Managed" },
    { value: "1200+", label: "Active Officials" },
    { value: "50K+", label: "Trips Completed" },
    { value: "98%", label: "Satisfaction Rate" },
  ];

  const processSteps = [
    {
      step: "01",
      title: "Submit Request",
      description: "Officials submit booking requests via the web portal with pickup, destination, and time details.",
    },
    {
      step: "02",
      title: "Smart Allocation",
      description: "System automatically selects the best available driver based on rating, proximity, and availability.",
    },
    {
      step: "03",
      title: "Real-Time Tracking",
      description: "Track your assigned vehicle in real-time with accurate ETA and driver details.",
    },
    {
      step: "04",
      title: "Rate & Feedback",
      description: "Post-journey rating system ensures continuous service improvement.",
    },
  ];

  return (
    <div className="page-container">
      <GovHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroBanner})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/60" />
          </div>
          
          <div className="relative z-10 content-container text-center text-primary-foreground py-16 md:py-24">
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-secondary/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-4">
                <FileCheck className="h-4 w-4" />
                <span>Government of India Initiative</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold leading-tight">
                Government Fleet Allocation
                <br />
                <span className="text-secondary">&amp; Management System</span>
              </h1>
              
              <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
                A comprehensive web-based solution for the Transport Division of the 
                National Informatics Centre (NIC) to automate and optimize vehicle 
                allocation for government officials.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button 
                  variant="hero" 
                  size="xl"
                  onClick={() => navigate("/kiosk")}
                  className="min-w-[200px]"
                >
                  Visit Web-Kiosk
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button 
                  variant="govOutline" 
                  size="xl"
                  className="min-w-[200px] border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
          
          {/* Decorative Wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path 
                d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
                className="fill-background"
              />
            </svg>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 md:py-16 bg-background">
          <div className="content-container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="text-center p-6 gov-card animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <p className="text-3xl md:text-4xl font-bold text-primary mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="content-container">
            <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
              <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground mb-4">
                Key Features
              </h2>
              <p className="text-muted-foreground">
                GFAMS brings modern technology to government fleet management, 
                ensuring efficiency, transparency, and accountability.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="gov-card p-6 space-y-4 hover:shadow-lg transition-shadow animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="content-container">
            <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
              <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground mb-4">
                How It Works
              </h2>
              <p className="text-muted-foreground">
                A simple 4-step process to book your government vehicle
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {processSteps.map((item, index) => (
                <div 
                  key={index}
                  className="relative p-6 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-6xl font-bold text-primary/10 absolute -top-2 left-4">
                    {item.step}
                  </div>
                  <div className="relative z-10 pt-8">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  {index < processSteps.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-6 w-6 text-primary/30" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* User Panels Section */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="content-container">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl md:text-4xl font-display font-bold mb-4">
                Three Integrated Portals
              </h2>
              <p className="text-primary-foreground/80">
                Role-based access for all stakeholders in the transport ecosystem
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Users,
                  title: "User Panel",
                  subtitle: "For Officials & HOGs",
                  features: [
                    "Quick vehicle booking",
                    "Real-time status tracking",
                    "Booking history",
                    "Driver ratings",
                  ],
                },
                {
                  icon: Shield,
                  title: "Admin Panel",
                  subtitle: "For Transport Division",
                  features: [
                    "Fleet management",
                    "GPS monitoring",
                    "Performance analytics",
                    "Audit & compliance",
                  ],
                },
                {
                  icon: Car,
                  title: "Driver Panel",
                  subtitle: "For Vehicle Operators",
                  features: [
                    "Availability toggle",
                    "Booking notifications",
                    "Performance dashboard",
                    "Trip history",
                  ],
                },
              ].map((panel, index) => (
                <div 
                  key={index}
                  className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-6 space-y-4 hover:bg-primary-foreground/15 transition-colors animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="h-14 w-14 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <panel.icon className="h-7 w-7 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{panel.title}</h3>
                    <p className="text-sm text-primary-foreground/70">{panel.subtitle}</p>
                  </div>
                  <ul className="space-y-2">
                    {panel.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center gap-2 text-sm text-primary-foreground/80">
                        <CheckCircle2 className="h-4 w-4 text-secondary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button 
                variant="hero" 
                size="xl"
                onClick={() => navigate("/kiosk")}
              >
                <Smartphone className="h-5 w-5" />
                Access Web-Kiosk Portal
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="content-container">
            <div className="gov-card p-8 md:p-12 text-center max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
                Ready to Experience Efficient Fleet Management?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Join the digital transformation of government vehicle allocation. 
                Access the Web-Kiosk to book vehicles, manage fleet, or track your trips.
              </p>
              <Button 
                variant="gov" 
                size="xl"
                onClick={() => navigate("/kiosk")}
              >
                Visit Web-Kiosk
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <GovFooter />
    </div>
  );
};

export default Index;