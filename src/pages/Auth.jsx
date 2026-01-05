import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GovHeader from "@/components/layout/GovHeader";
import GovFooter from "@/components/layout/GovFooter";
import {
  Users,
  Shield,
  Car,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  IdCard,
  Building2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const roleConfig = {
  user: {
    icon: Users,
    title: "User Panel Login",
    subtitle: "Government Officials & HOGs",
    color: "text-info",
    bgColor: "bg-info/10",
    description: "Access vehicle booking, track requests, and view your booking history.",
    redirectPath: "/user/dashboard",
    idLabel: "Government Email ID",
    idPlaceholder: "yourname@nic.in",
  },
  admin: {
    icon: Shield,
    title: "Admin Panel Login",
    subtitle: "Transport Division Management",
    color: "text-primary",
    bgColor: "bg-primary/10",
    description: "Manage fleet operations, monitor vehicles, and oversee driver performance.",
    redirectPath: "/admin/dashboard",
    idLabel: "Admin Email ID",
    idPlaceholder: "admin@transport.nic.in",
  },
  driver: {
    icon: Car,
    title: "Driver Panel Login",
    subtitle: "Vehicle Operators",
    color: "text-success",
    bgColor: "bg-success/10",
    description: "Manage your availability, view assignments, and track your performance.",
    redirectPath: "/driver/dashboard",
    idLabel: "Driver License Number",
    idPlaceholder: "DL-0420110012345",
  },
};

const Auth = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    designation: "",
    department: "",
    phone: "",
    licenseNumber: "",
  });

  const config = roleConfig[role] || roleConfig.user;
  const Icon = config.icon;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Mock successful authentication
    toast({
      title: isLogin ? "Login Successful" : "Registration Successful",
      description: `Welcome to GFAMS ${config.title.replace(" Login", "")}`,
    });

    // Store mock user data
    localStorage.setItem("gfams_user", JSON.stringify({
      role: role,
      email: formData.email,
      name: formData.name || "Demo User",
    }));

    navigate(config.redirectPath);
    setIsLoading(false);
  };

  return (
    <div className="page-container">
      <GovHeader />

      <main className="flex-1 bg-gradient-to-b from-muted/50 to-background py-8 md:py-12">
        <div className="content-container max-w-lg mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate("/kiosk")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Web-Kiosk</span>
          </button>

          {/* Auth Card */}
          <div className="gov-card p-6 md:p-8 animate-slide-up">
            {/* Header */}
            <div className="text-center mb-8">
              <div className={`inline-flex h-16 w-16 rounded-xl ${config.bgColor} items-center justify-center mb-4`}>
                <Icon className={`h-8 w-8 ${config.color}`} />
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                {config.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {config.subtitle}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {config.description}
              </p>
            </div>

            {/* Toggle Login/Signup */}
            <div className="flex mb-6 bg-muted rounded-lg p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  isLogin
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  !isLogin
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Register
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <Label htmlFor="name" className="form-label">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    />
                  </div>

                  {role === "user" && (
                    <>
                      <div>
                        <Label htmlFor="designation" className="form-label">
                          Designation
                        </Label>
                        <Input
                          id="designation"
                          name="designation"
                          type="text"
                          placeholder="e.g., Senior Technical Director"
                          value={formData.designation}
                          onChange={handleInputChange}
                          required
                          className="form-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="department" className="form-label">
                          Department
                        </Label>
                        <Input
                          id="department"
                          name="department"
                          type="text"
                          placeholder="e.g., e-Governance Division"
                          value={formData.department}
                          onChange={handleInputChange}
                          required
                          className="form-input"
                        />
                      </div>
                    </>
                  )}

                  {role === "driver" && (
                    <div>
                      <Label htmlFor="licenseNumber" className="form-label">
                        <div className="flex items-center gap-2">
                          <IdCard className="h-4 w-4" />
                          Driving License Number
                        </div>
                      </Label>
                      <Input
                        id="licenseNumber"
                        name="licenseNumber"
                        type="text"
                        placeholder="DL-0420110012345"
                        value={formData.licenseNumber}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="phone" className="form-label">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="email" className="form-label">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {config.idLabel}
                  </div>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type={role === "driver" ? "text" : "email"}
                  placeholder={config.idPlaceholder}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>

              <div>
                <Label htmlFor="password" className="form-label">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </div>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={8}
                    className="form-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <Label htmlFor="confirmPassword" className="form-label">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Confirm Password
                    </div>
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    minLength={8}
                    className="form-input"
                  />
                </div>
              )}

              {isLogin && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                variant="gov"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : isLogin ? (
                  "Login to Portal"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Footer Note */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">
                By {isLogin ? "logging in" : "registering"}, you agree to the{" "}
                <a href="#" className="text-primary hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>{" "}
                of the National Informatics Centre.
              </p>
            </div>
          </div>

          {/* Help Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Need help?{" "}
              <a href="#" className="text-primary hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </main>

      <GovFooter />
    </div>
  );
};

export default Auth;
