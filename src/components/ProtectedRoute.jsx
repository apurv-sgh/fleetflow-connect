import { Navigate } from 'react-router-dom';

// Usage: <ProtectedRoute requiredRoles={["ADMIN","OFFICIAL"]}><Component/></ProtectedRoute>
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const token = localStorage.getItem('accessToken');
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  if (!token || !user) {
    return <Navigate to="/auth/user" replace />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    // Unauthorized - redirect to user's default dashboard
    if (user.role === 'DRIVER') return <Navigate to="/driver/dashboard" replace />;
    if (user.role === 'ADMIN' || user.role === 'COMPLIANCE_OFFICER' || user.role === 'SUPER_ADMIN') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/user/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
