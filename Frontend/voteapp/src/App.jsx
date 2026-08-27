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

        {/* ==============================
            ELECTION DETAILS
        ============================== */}

        <Route
          path="/admin/elections/:id"
          element={<ElectionDetails />}
        />

        {/* ==============================
            EDIT ELECTION
        ============================== */}

        <Route
          path="/admin/elections/:id/edit"
          element={<EditElection />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;