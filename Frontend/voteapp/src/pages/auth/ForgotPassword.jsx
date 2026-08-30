import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Mail, ShieldCheck, ArrowLeft, Vote } from "lucide-react";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedEmail = email.trim();
    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Unable to process request.");
        return;
      }

      toast.success(data.message || "Reset instructions sent.");
      setTimeout(() => navigate("/login"), 1800);
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover draggable theme="light" />

      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-indigo-600 px-6 py-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/15 p-2 rounded-xl">
                <Vote size={22} />
              </div>
              <div>
                <h1 className="text-xl font-bold">Password Reset</h1>
                <p className="text-sm text-indigo-100">VoteManage</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <button type="button" onClick={() => navigate("/login")} className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 mb-5">
              <ArrowLeft size={16} />
              Back to Login
            </button>

            <div className="mb-6">
              <h2 className="text-3xl font-bold text-slate-900">Forgot Password?</h2>
              <p className="text-slate-500 mt-2">Enter your registered email to receive a secure reset link.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={19} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-semibold py-3.5 rounded-xl transition"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={15} />
              Secure password recovery
            </div>

            <p className="text-center text-sm text-slate-500 mt-6">
              Remembered your password?{' '}
              <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;
