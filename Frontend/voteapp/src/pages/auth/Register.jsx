import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const generateStrongPassword = () => {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const specials = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const all = upper + lower + numbers + specials;

  const picks = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    specials[Math.floor(Math.random() * specials.length)],
  ];

  while (picks.length < 12) {
    picks.push(all[Math.floor(Math.random() * all.length)]);
  }

  for (let i = picks.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [picks[i], picks[j]] = [picks[j], picks[i]];
  }

  return picks.join("");
};

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CreditCard,
  ShieldCheck,
  Vote,
  Shield,
  KeyRound,
} from "lucide-react";

import { clearAuthSession } from "../../components/ProtectedRoute";
import FaceVerificationCapture from "../../components/FaceVerificationCapture";

function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState("voter");
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [faceVerificationStatus, setFaceVerificationStatus] = useState("Face verification required before registration.");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    voterId: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminCode: "",
  });

  // ==========================
  // HANDLE INPUT CHANGE
  // ==========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================
  // HANDLE ROLE CHANGE
  // ==========================
  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);

    setFormData((prev) => ({
      ...prev,
      voterId: "",
      adminCode: "",
    }));
  };

  // ==========================
  // REGISTER
  // ==========================
  const handleGeneratePassword = () => {
    const suggestedPassword = generateStrongPassword();
    setFormData((prev) => ({
      ...prev,
      password: suggestedPassword,
      confirmPassword: suggestedPassword,
    }));
    toast.info("Strong password suggested.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (role === "voter" && !formData.voterId.trim()) {
      toast.error("Please enter a Voter ID.");
      return;
    }

    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!strongPasswordRegex.test(formData.password)) {
      toast.error("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (!termsAccepted) {
      toast.error("You must accept the Terms & Conditions and Privacy Policy before registering.");
      return;
    }

    const isValidFaceDescriptor = Array.isArray(faceDescriptor)
      && faceDescriptor.length >= 64
      && faceDescriptor.length <= 2048
      && faceDescriptor.every((value) => Number.isFinite(value));

    if (!isValidFaceDescriptor) {
      toast.error("Face verification is required before registration.");
      return;
    }

    // ==========================
    // BUILD REQUEST DATA
    // ==========================
    const registerData = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      role: role,
      termsAccepted,
      faceEmbedding: faceDescriptor,
    };

    // Voter ID only for voter
    if (role === "voter") {
      registerData.voterId = formData.voterId;
    }

    // Admin code only for admin
    if (role === "admin") {
      registerData.adminCode = formData.adminCode;
    }

    try {
      // ==========================
      // API REQUEST
      // ==========================
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(registerData),
        }
      );

      const data = await response.json();

      // ==========================
      // BACKEND ERROR
      // ==========================
      if (!response.ok) {
        toast.error(
          data.message || "Registration failed"
        );

        return;
      }

      // ==========================
      // SUCCESS
      // ==========================

      const accountType =
        data.user.role === "admin"
          ? "Admin"
          : "Voter";

      toast.success(
        `${accountType} registration successful!`
      );

      clearAuthSession();

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      toast.error(
        "Unable to connect to server. Please try again."
      );
    }
  };

  return (
    <>
      {/* ==========================
          TOAST CONTAINER
      ========================== */}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />

      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">

        <div className="w-full max-w-6xl grid lg:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-2xl">

          {/* ==========================
              LEFT SIDE
          ========================== */}

          <div className="hidden lg:flex relative bg-indigo-600 p-12 text-white flex-col justify-between overflow-hidden">

            <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500 rounded-full opacity-50" />

            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-700 rounded-full opacity-60" />

            <div className="relative z-10">

              {/* LOGO */}

              <div className="flex items-center gap-3 mb-10">

                <div className="bg-white/15 p-3 rounded-xl backdrop-blur-sm">
                  <Vote size={28} />
                </div>

                <span className="text-2xl font-bold">
                  Vote
                  <span className="text-indigo-200">
                    Manage
                  </span>
                </span>

              </div>

              {/* HEADING */}

              <h1 className="text-4xl font-bold leading-tight mb-6">
                Your Voice.
                <br />
                Your Vote.
                <br />
                Your Future.
              </h1>

              <p className="text-indigo-100 text-lg leading-relaxed max-w-md">
                Create your account and participate
                in a secure, transparent and modern
                voting experience.
              </p>

            </div>

            {/* FEATURES */}

            <div className="relative z-10 space-y-5">

              {/* FEATURE 1 */}

              <div className="flex items-center gap-4">

                <div className="bg-white/15 p-3 rounded-xl">
                  <ShieldCheck size={22} />
                </div>

                <div>

                  <p className="font-semibold">
                    Secure Registration
                  </p>

                  <p className="text-sm text-indigo-200">
                    Your information stays protected.
                  </p>

                </div>

              </div>

              {/* FEATURE 2 */}

              <div className="flex items-center gap-4">

                <div className="bg-white/15 p-3 rounded-xl">
                  <Vote size={22} />
                </div>

                <div>

                  <p className="font-semibold">
                    Fair Voting
                  </p>

                  <p className="text-sm text-indigo-200">
                    Every eligible voter gets a voice.
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* ==========================
              RIGHT SIDE
          ========================== */}

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
                  Create Account
                </h2>

                <p className="text-slate-500 mt-2">
                  Choose your account type to continue.
                </p>

              </div>

              {/* ==========================
                  ROLE SELECTOR
              ========================== */}

              <div className="mb-6">

                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Register as
                </label>

                <div className="grid grid-cols-2 gap-3">

                  {/* VOTER */}

                  <button
                    type="button"
                    onClick={() =>
                      handleRoleChange("voter")
                    }
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
                    onClick={() =>
                      handleRoleChange("admin")
                    }
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

              {/* ==========================
                  FORM
              ========================== */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* FULL NAME */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>

                  <div className="relative">

                    <User
                      size={19}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />

                  </div>

                </div>

                {/* ==========================
                    VOTER ID
                    ONLY FOR VOTER
                ========================== */}

                {role === "voter" && (
                  <div>

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Voter ID
                    </label>

                    <div className="relative">

                      <CreditCard
                        size={19}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        name="voterId"
                        value={formData.voterId}
                        onChange={handleChange}
                        placeholder="Enter your voter ID"
                        required
                        className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />

                    </div>

                  </div>
                )}

                {/* ==========================
                    ADMIN SECRET CODE
                    ONLY FOR ADMIN
                ========================== */}

                {role === "admin" && (
                  <div>

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Admin Secret Code
                    </label>

                    <div className="relative">

                      <KeyRound
                        size={19}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="password"
                        name="adminCode"
                        value={formData.adminCode}
                        onChange={handleChange}
                        placeholder="Enter admin secret code"
                        required
                        className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />

                    </div>

                    <p className="text-xs text-slate-400 mt-2">
                      Admin registration requires authorization.
                    </p>

                  </div>
                )}

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

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password
                  </label>

                  <div className="relative">

                    <Lock
                      size={19}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      required
                      className="w-full pl-11 pr-12 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >

                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}

                    </button>

                  </div>

                  <div className="mt-2 text-xs text-slate-500">
                    Must be 8+ chars with uppercase, lowercase, number, and special character.
                  </div>

                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="mt-3 w-full border border-indigo-200 bg-indigo-50 text-indigo-700 font-medium py-2.5 rounded-xl hover:bg-indigo-100 transition"
                  >
                    Suggest Strong Password
                  </button>

                </div>

                {/* CONFIRM PASSWORD */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Confirm Password
                  </label>

                  <div className="relative">

                    <Lock
                      size={19}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required
                      className="w-full pl-11 pr-12 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >

                      {showConfirmPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}

                    </button>

                  </div>

                </div>

                {/* TERMS */}

                <div className="flex items-start gap-3">

                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    required
                    className="mt-1 w-4 h-4 accent-indigo-600"
                  />

                  <p className="text-sm text-slate-500">
                    I agree to the{" "}
                    <button type="button" onClick={() => window.alert("Terms & Conditions\n\nThis platform is for secure voting and account management. Users must provide accurate information, maintain account security, and comply with election rules. Any misuse or attempted tampering may result in account restrictions.")} className="text-indigo-600 font-medium cursor-pointer underline">
                      Terms & Conditions
                    </button>{" "}
                    and{" "}
                    <button type="button" onClick={() => window.alert("Privacy Policy\n\nWe collect only the information required to operate the voting system, including account details, voting status, and election records. Data is used solely for authentication, election administration, transparency, and security. We do not sell personal information and we protect access through secure authentication and role-based controls.")} className="text-indigo-600 font-medium cursor-pointer underline">
                      Privacy Policy
                    </button>.
                  </p>

                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">Face verification</p>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${faceDescriptor ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {faceDescriptor ? "Ready" : "Required"}
                    </span>
                  </div>

                  <FaceVerificationCapture
                    onFaceCaptured={(descriptor) => {
                      setFaceDescriptor(descriptor);
                      setFaceVerificationStatus("Face verification complete. A valid descriptor has been captured.");
                    }}
                  />

                  <p className="mt-3 text-sm text-slate-600">{faceVerificationStatus}</p>
                </div>

                {/* SUBMIT */}

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition duration-200 shadow-lg shadow-indigo-200"
                >
                  Create{" "}
                  {role === "voter"
                    ? "Voter"
                    : "Admin"}{" "}
                  Account
                </button>

              </form>

              {/* LOGIN */}

              <p className="text-center text-sm text-slate-500 mt-7">

                Already have an account?{" "}

                <Link
                  to="/login"
                  className="text-indigo-600 font-semibold hover:text-indigo-700"
                >
                  Login
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
    </>
  );
}

export default Register;