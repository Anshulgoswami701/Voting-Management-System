import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ==============================
// AUTH
// ==============================
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import LoginSuccess from "./pages/auth/LoginSuccess";

// ==============================
// ADMIN
// ==============================
import AdminDashboard from "./admin/AdminDashboard";
import Elections from "./admin/Elections";
import ElectionDetails from "./admin/ElectionDetails";
import EditElection from "./admin/EditElection";
import Candidates from "./admin/Candidates";
import Voter from "./admin/Voter";
import VoterDetails from "./admin/VoterDetails";

// ==============================
// VOTER
// ==============================
import VoterDashboard from "./voter/VoterDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==============================
            DEFAULT
        ============================== */}
        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        {/* ==============================
            AUTH
        ============================== */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login-success"
          element={<LoginSuccess />}
        />

        {/* ==============================
            ADMIN DASHBOARD
        ============================== */}
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        {/* ==============================
            ADMIN ELECTIONS
        ============================== */}
        <Route
          path="/admin/elections"
          element={<Elections />}
        />

        <Route
          path="/admin/elections/:id"
          element={<ElectionDetails />}
        />

        <Route
          path="/admin/elections/:id/edit"
          element={<EditElection />}
        />

        {/* ==============================
            ADMIN CANDIDATES
        ============================== */}
        <Route
          path="/admin/candidates"
          element={<Candidates />}
        />

        {/* ==============================
            ADMIN VOTERS
        ============================== */}
        <Route
          path="/admin/voters"
          element={<Voter />}
        />

        <Route
          path="/admin/voters/:id"
          element={<VoterDetails />}
        />

        {/* ==============================
            VOTER DASHBOARD
        ============================== */}
        <Route
          path="/voter/dashboard"
          element={<VoterDashboard />}
        />

        {/* ==============================
            UNKNOWN ROUTE
        ============================== */}
        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;