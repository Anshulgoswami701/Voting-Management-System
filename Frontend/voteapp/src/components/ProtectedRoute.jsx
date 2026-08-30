import { Navigate, useLocation } from "react-router-dom";

const decodeJwtPayload = (token) => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

    return JSON.parse(atob(padded));
  } catch (error) {
    return null;
  }
};

export const persistAuthSession = (token, userData) => {
  if (!token || !userData) return;

  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(userData));
  window.dispatchEvent(new Event("auth:change"));
};

export const clearAuthSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("auth:change"));
};

export const isAuthenticated = () => !!getStoredUser();

export const getStoredUser = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      localStorage.removeItem("user");
    }
    return null;
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    clearAuthSession();
    return null;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  if (payload.exp && Number(payload.exp) <= nowInSeconds) {
    clearAuthSession();
    return null;
  }

  const role = payload.role || payload.userRole;
  if (!role) {
    clearAuthSession();
    return null;
  }

  let savedUser = null;
  try {
    const savedUserRaw = localStorage.getItem("user");
    savedUser = savedUserRaw ? JSON.parse(savedUserRaw) : null;
  } catch (error) {
    savedUser = null;
  }

  const user = {
    role,
    fullName: savedUser?.fullName || payload.fullName || payload.name || "User",
    email: savedUser?.email || payload.email || "",
    voterId: savedUser?.voterId || payload.voterId || "",
    status: savedUser?.status || payload.status || "active",
    hasVoted: typeof savedUser?.hasVoted === "boolean" ? savedUser.hasVoted : (payload.hasVoted ?? false),
  };

  const savedUserValue = localStorage.getItem("user");
  if (!savedUserValue || JSON.stringify(user) !== savedUserValue) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  return user;
};

export const getDashboardRoute = () => {
  const user = getStoredUser();

  if (user?.role === "admin") return "/admin/dashboard";
  if (user?.role === "voter") return "/voter/dashboard";
  return "/login";
};

function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/voter/dashboard"} replace />;
  }

  return children;
}

export default ProtectedRoute;
