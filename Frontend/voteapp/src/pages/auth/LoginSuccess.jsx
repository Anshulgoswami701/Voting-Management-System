import { useNavigate } from "react-router-dom";

function LoginSuccess() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const handleDashboard = () => {
    if (user?.role === "admin") {
      navigate("/admin/dashboard");
    } else if (user?.role === "voter") {
      navigate("/voter/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">

      <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">

        {/* SUCCESS ICON */}

        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl">
          ✓
        </div>

        {/* HEADING */}

        <h1 className="text-3xl font-bold text-slate-900">
          Login Successful
        </h1>

        {/* USER NAME */}

        <p className="text-slate-500 mt-3">
          Welcome, {user?.fullName || "User"}!
        </p>

        {/* ROLE */}

        <p className="text-sm text-slate-400 mt-2">
          Logged in as{" "}
          <span className="font-semibold capitalize">
            {user?.role || "User"}
          </span>
        </p>

        {/* DASHBOARD BUTTON */}

        <button
          onClick={handleDashboard}
          className="mt-7 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition"
        >
          Go to Dashboard
        </button>

      </div>

    </div>
  );
}

export default LoginSuccess;