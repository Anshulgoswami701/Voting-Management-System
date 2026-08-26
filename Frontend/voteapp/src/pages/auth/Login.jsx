import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Vote,
  User,
  Shield,
} from "lucide-react";

function Login() {
  const [role, setRole] = useState("voter");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const loginData = {
      ...formData,
      role,
    };

    console.log("Login Data:", loginData);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-2xl">

        {/* LEFT SIDE */}
        <div className="hidden lg:flex relative bg-indigo-600 p-12 text-white flex-col justify-between overflow-hidden">

          <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500 rounded-full opacity-50" />

          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-700 rounded-full opacity-60" />

          <div className="relative z-10">

            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="bg-white/15 p-3 rounded-xl backdrop-blur-sm">
                <Vote size={28} />
              </div>

              <span className="text-2xl font-bold">
                Vote<span className="text-indigo-200">Manage</span>
              </span>
            </div>

            <h1 className="text-4xl font-bold leading-tight mb-6">
              Welcome
              <br />
              Back!
            </h1>

            <p className="text-indigo-100 text-lg leading-relaxed max-w-md">
              Login to access your voting account and participate
              in a secure and transparent election.
            </p>
          </div>

          {/* FEATURES */}
          <div className="relative z-10 space-y-5">

            <div className="flex items-center gap-4">
              <div className="bg-white/15 p-3 rounded-xl">
                <ShieldCheck size={22} />
              </div>

              <div>
                <p className="font-semibold">
                  Secure Authentication
                </p>

                <p className="text-sm text-indigo-200">
                  Your account is protected.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white/15 p-3 rounded-xl">
                <Vote size={22} />
              </div>

              <div>
                <p className="font-semibold">
                  Your Vote Matters
                </p>

                <p className="text-sm text-indigo-200">
                  Make your voice count.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="p-6 sm:p-10 lg:p-12">
          <div className="max-w-md mx-auto">

            {/* MOBILE LOGO */}
            <div className="flex lg:hidden items-center justify-center gap-2 mb-8">

              <div className="bg-indigo-600 text-white p-2.5 rounded-xl">
                <Vote size={24} />
              </div>

              <span className="text-xl font-bold text-slate-900">
                VoteManage
              </span>

            </div>

            {/* HEADING */}
            <div className="mb-7">
              <h2 className="text-3xl font-bold text-slate-900">
                Welcome Back
              </h2>

              <p className="text-slate-500 mt-2">
                Login to your voting account.
              </p>
            </div>

            {/* ROLE SELECTOR */}
            <div className="mb-6">

              <label className="block text-sm font-medium text-slate-700 mb-3">
                Login as
              </label>

              <div className="grid grid-cols-2 gap-3">

                {/* VOTER */}
                <button
                  type="button"
                  onClick={() => setRole("voter")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition ${
                    role === "voter"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                      : "border-slate-200 text-slate-500 hover:border-indigo-300"
                  }`}
                >
                  <User size={19} />
                  <span className="font-semibold">
                    Voter
                  </span>
                </button>

                {/* ADMIN */}
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition ${
                    role === "admin"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                      : "border-slate-200 text-slate-500 hover:border-indigo-300"
                  }`}
                >
                  <Shield size={19} />
                  <span className="font-semibold">
                    Admin
                  </span>
                </button>

              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* EMAIL */}
              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>

                <div className="relative">

                  <Mail
                    size={19}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />

                </div>

              </div>

              {/* PASSWORD */}
              <div>

                <div className="flex items-center justify-between mb-2">

                  <label className="text-sm font-medium text-slate-700">
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
                  >
                    Forgot Password?
                  </button>

                </div>

                <div className="relative">

                  <Lock
                    size={19}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-11 pr-12 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>

                </div>

              </div>

              {/* REMEMBER */}
              <div className="flex items-center gap-3">

                <input
                  type="checkbox"
                  className="w-4 h-4 accent-indigo-600"
                />

                <span className="text-sm text-slate-500">
                  Remember me
                </span>

              </div>

              {/* LOGIN */}
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition duration-200 shadow-lg shadow-indigo-200"
              >
                Login as {role === "voter" ? "Voter" : "Admin"}
              </button>

            </form>

            {/* REGISTER */}
            <p className="text-center text-sm text-slate-500 mt-7">
              Don't have an account?{" "}

              <Link
                to="/register"
                className="text-indigo-600 font-semibold hover:text-indigo-700"
              >
                Create Account
              </Link>
            </p>

            {/* SECURITY */}
            <div className="flex items-center justify-center gap-2 mt-8 text-xs text-slate-400">
              <ShieldCheck size={15} />
              Secure & trusted voting platform
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;