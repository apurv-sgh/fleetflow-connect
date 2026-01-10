import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import WebKiosk from "./pages/WebKiosk";
import Auth from "./pages/Auth";
import UserDashboard from "./pages/user/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import DriverDashboard from "./pages/driver/Dashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/kiosk" element={<WebKiosk />} />
          <Route path="/auth/:role" element={<Auth />} />
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute requiredRoles={["OFFICIAL", "HOG"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRoles={["ADMIN", "COMPLIANCE_OFFICER", "SUPER_ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/dashboard"
            element={
              <ProtectedRoute requiredRoles={["DRIVER"]}>
                <DriverDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;