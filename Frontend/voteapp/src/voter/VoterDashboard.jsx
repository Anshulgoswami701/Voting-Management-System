import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Vote,
  LogOut,
  User,
  ShieldCheck,
  CheckCircle,
  Clock3,
  CalendarDays,
  ArrowRight,
  Info,
  LockKeyhole,
} from "lucide-react";

import { clearAuthSession, getStoredUser } from "../components/ProtectedRoute";

function VoterDashboard() {
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const user = getStoredUser();

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setProfileLoading(false);
          return;
        }

        const response = await fetch("http://localhost:5000/api/voters/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Profile fetch failed");
        }

        const data = await response.json();
        setProfileUser(data.user || null);
      } catch (error) {
        console.error("Voter dashboard profile error:", error);
        setProfileUser(null);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const currentUser = profileUser || user;

  // ==========================================
  // LOGOUT
  // ==========================================
  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  // ==========================================
  // SESSION CHECK
  // ==========================================
  if (!user && !profileLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <ShieldCheck size={26} />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Session Expired
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Your login session is no longer available. Please login again.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const hasVoted = currentUser.hasVoted === true;
  const isActive = currentUser.status === "active";

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">

          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Vote size={21} />
            </div>

            <div>
              <h1 className="text-base font-bold text-slate-900">
                VoteManage
              </h1>

              <p className="text-[11px] text-slate-500">
                Voter Portal
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3">

            {/* USER */}
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                {currentUser.fullName?.charAt(0)?.toUpperCase()}
              </div>

              <div className="leading-tight">
                <p className="text-sm font-semibold text-slate-800">
                  {currentUser.fullName}
                </p>

                <p className="text-[11px] text-slate-400">
                  Voter
                </p>
              </div>
            </div>

            {/* LOGOUT */}
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}
      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8">

        {/* =================================================
            WELCOME
        ================================================= */}
        <section className="mb-7">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>
              <p className="mb-2 text-sm font-medium text-indigo-600">
                Voter Dashboard
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Welcome, {currentUser.fullName}
              </h2>

              <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base">
                Check your voter information, election status, and participate
                in active elections.
              </p>
            </div>

            {/* STATUS */}
            <div
              className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                  : "bg-red-50 text-red-700 ring-1 ring-red-100"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isActive ? "bg-emerald-500" : "bg-red-500"
                }`}
              />

              {isActive ? "Account Active" : "Account Blocked"}
            </div>

          </div>
        </section>

        {/* =================================================
            PROFILE SUMMARY
        ================================================= */}
        <section className="mb-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-2xl font-bold text-indigo-600 ring-8 ring-indigo-50/60">
                {currentUser.fullName?.charAt(0)?.toUpperCase()}
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {currentUser.fullName}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {currentUser.email}
                </p>

                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                  <LockKeyhole size={13} />
                  Your account is protected
                </div>
              </div>

            </div>

            <div className="rounded-xl bg-slate-50 px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Voter ID
              </p>

              <p className="mt-1 text-lg font-bold tracking-wide text-slate-900">
                {currentUser.voterId || "-"}
              </p>
            </div>

          </div>
        </section>

        {/* =================================================
            STATS
        ================================================= */}
        <section className="mb-7 grid grid-cols-1 gap-5 md:grid-cols-3">

          {/* VOTER ID */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Voter ID
                </p>

                <p className="mt-2 text-2xl font-bold tracking-wide text-slate-900">
                  {currentUser.voterId || "-"}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <User size={21} />
              </div>

            </div>

            <p className="mt-4 text-xs text-slate-400">
              Registered voter identification
            </p>
          </div>

          {/* VOTING STATUS */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Voting Status
                </p>

                {hasVoted ? (
                  <p className="mt-2 text-2xl font-bold text-emerald-600">
                    Voted
                  </p>
                ) : (
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    Not Voted
                  </p>
                )}
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  hasVoted
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-amber-50 text-amber-600"
                }`}
              >
                {hasVoted ? (
                  <CheckCircle size={21} />
                ) : (
                  <Clock3 size={21} />
                )}
              </div>

            </div>

            <p className="mt-4 text-xs text-slate-400">
              {hasVoted
                ? "Your vote has been recorded"
                : "You have not submitted a vote yet"}
            </p>
          </div>

          {/* ACCOUNT STATUS */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Account Status
                </p>

                <p
                  className={`mt-2 text-2xl font-bold ${
                    isActive ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {isActive ? "Active" : "Blocked"}
                </p>
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  isActive
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                <ShieldCheck size={21} />
              </div>

            </div>

            <p className="mt-4 text-xs text-slate-400">
              {isActive
                ? "You are eligible to participate"
                : "Contact the administrator"}
            </p>
          </div>

        </section>

        {/* =================================================
            ELECTION
        ================================================= */}
        <section className="mb-7">

          <div className="mb-4 flex items-center justify-between">

            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Current Election
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Participate in an active election
              </p>
            </div>

            <div className="hidden items-center gap-2 text-xs font-medium text-slate-400 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Election Active
            </div>

          </div>

          {/* ELECTION CARD */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 bg-gradient-to- from-indigo-50/80 to-white px-6 py-6 md:px-8">

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div className="flex items-start gap-4">

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
                    <Vote size={25} />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">

                      <h4 className="text-xl font-bold text-slate-900">
                        General Election
                      </h4>

                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        Active
                      </span>

                    </div>

                    <p className="mt-2 max-w-2xl text-sm text-slate-500">
                      Cast your vote for the available candidates in this
                      election.
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">

                  <CalendarDays
                    size={17}
                    className="text-slate-400"
                  />

                  <div>
                    <p className="text-[11px] text-slate-400">
                      Election Period
                    </p>

                    <p className="text-sm font-semibold text-slate-700">
                      Currently Open
                    </p>
                  </div>

                </div>

              </div>
            </div>

            {/* ELECTION BODY */}
            <div className="p-6 md:p-8">

              {hasVoted ? (
                /* ==========================================
                   ALREADY VOTED
                ========================================== */
                <div className="flex flex-col items-center justify-center py-8 text-center">

                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle size={32} />
                  </div>

                  <h4 className="mt-5 text-xl font-bold text-slate-900">
                    Your vote has been submitted
                  </h4>

                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Thank you for participating. Your vote has already been
                    recorded and you cannot vote again in this election.
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    <ShieldCheck size={17} />
                    Vote securely recorded
                  </div>

                </div>
              ) : (
                /* ==========================================
                   NOT VOTED
                ========================================== */
                <div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Status
                      </p>

                      <p className="mt-1 font-semibold text-slate-800">
                        Open for Voting
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Eligibility
                      </p>

                      <p className="mt-1 font-semibold text-emerald-600">
                        Eligible
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Voting
                      </p>

                      <p className="mt-1 font-semibold text-slate-800">
                        Not Submitted
                      </p>
                    </div>

                  </div>

                  {/* ACTION */}
                  <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-5 sm:flex-row sm:items-center">

                    <div>
                      <h5 className="font-semibold text-slate-900">
                        Ready to cast your vote?
                      </h5>

                      <p className="mt-1 text-sm text-slate-500">
                        Review the candidates carefully before submitting.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate("/voter/elections")}
                      disabled={!isActive}
                      className={`group flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition ${
                        isActive
                          ? "bg-indigo-600 hover:bg-indigo-700 hover:shadow-md"
                          : "cursor-not-allowed bg-slate-400"
                      }`}
                    >
                      Vote Now
                      <ArrowRight
                        size={17}
                        className="transition group-hover:translate-x-0.5"
                      />
                    </button>

                  </div>

                </div>
              )}

            </div>
          </div>
        </section>

        {/* =================================================
            INFORMATION
        ================================================= */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* HOW TO VOTE */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Info size={19} />
              </div>

              <h3 className="font-bold text-slate-900">
                Before You Vote
              </h3>

            </div>

            <div className="mt-5 space-y-3">

              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                  1
                </span>

                <p className="text-sm leading-6 text-slate-500">
                  Review all available candidates carefully.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                  2
                </span>

                <p className="text-sm leading-6 text-slate-500">
                  Select the candidate you want to vote for.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                  3
                </span>

                <p className="text-sm leading-6 text-slate-500">
                  Confirm your selection before submitting your vote.
                </p>
              </div>

            </div>
          </div>

          {/* SECURITY */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck size={19} />
              </div>

              <h3 className="font-bold text-slate-900">
                Secure Voting
              </h3>

            </div>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              Your voter account is protected by authenticated access.
              Only an active registered voter can participate in an election.
            </p>

            <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              <LockKeyhole size={16} />
              Secure & authenticated account
            </div>

          </div>

        </section>

        {/* =================================================
            FOOTER
        ================================================= */}
        <footer className="py-8 text-center">

          <p className="text-xs text-slate-400">
            VoteManage • Secure Online Voting Platform
          </p>

        </footer>

      </main>

      {/* =====================================================
          LOGOUT MODAL
      ===================================================== */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">

          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <LogOut size={21} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              Logout from your account?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              You will need to login again to access your voter dashboard.
            </p>

            <div className="mt-6 flex gap-3">

              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Logout
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default VoterDashboard;