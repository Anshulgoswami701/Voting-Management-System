import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import LoginSuccess from "./pages/auth/LoginSuccess";
import AdminDashboard from "./admin/AdminDashboard";
import Elections from "./admin/Elections";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login-success" element={<LoginSuccess />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route
  path="/admin/elections"
  element={<Elections />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
