import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import LoginSuccess from "./pages/auth/LoginSuccess";

import AdminDashboard from "./admin/AdminDashboard";
import Elections from "./admin/Elections";
import ElectionDetails from "./admin/ElectionDetails";
import EditElection from "./admin/EditElection";
import Candidates from "./admin/Candidates";
import Voter from "./admin/Voter";
import VoterDetails from "./admin/VoterDetails";
import AdminResults from "./admin/AdminResults";

import VoterDashboard from "./voter/VoterDashboard";
import VoterElections from "./voter/VoterElections";
import VoterElectionDetails from "./voter/VoterElectionDetails";
import VoterHistory from "./voter/VoterHistory";
import VoterProfile from "./voter/VoterProfile";
import VoterResults from "./voter/VoterResults";
import ProtectedRoute, { getDashboardRoute, getStoredUser, isAuthenticated } from "./components/ProtectedRoute";

function App() {
  const [authState, setAuthState] = useState(() => ({
    user: getStoredUser(),
    isAuthenticated: isAuthenticated(),
  }));

  useEffect(() => {
    const syncAuthState = () => {
      setAuthState({
        user: getStoredUser(),
        isAuthenticated: isAuthenticated(),
      });
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("auth:change", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("auth:change", syncAuthState);
    };
  }, []);

  const redirectPath = authState.user ? getDashboardRoute() : "/login";

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={authState.isAuthenticated ? redirectPath : "/login"} replace />}
        />

        <Route
          path="/login"
          element={authState.isAuthenticated ? <Navigate to={redirectPath} replace /> : <Login />}
        />

        <Route
          path="/register"
          element={authState.isAuthenticated ? <Navigate to={redirectPath} replace /> : <Register />}
        />

        <Route path="/login-success" element={<LoginSuccess />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/elections"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Elections />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/elections/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ElectionDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/elections/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditElection />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/candidates"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Candidates />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/voters"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Voter />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/voters/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <VoterDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/results"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminResults />
            </ProtectedRoute>
          }
        />

        <Route
          path="/voter/dashboard"
          element={
            <ProtectedRoute allowedRoles={["voter"]}>
              <VoterDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/voter/elections"
          element={
            <ProtectedRoute allowedRoles={["voter"]}>
              <VoterElections />
            </ProtectedRoute>
          }
        />

        <Route
          path="/voter/elections/:id"
          element={
            <ProtectedRoute allowedRoles={["voter"]}>
              <VoterElectionDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/voter/history"
          element={
            <ProtectedRoute allowedRoles={["voter"]}>
              <VoterHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/voter/profile"
          element={
            <ProtectedRoute allowedRoles={["voter"]}>
              <VoterProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/voter/results/:electionId"
          element={
            <ProtectedRoute allowedRoles={["voter"]}>
              <VoterResults />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;