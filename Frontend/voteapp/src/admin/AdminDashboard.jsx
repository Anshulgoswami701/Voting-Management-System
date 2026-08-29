import {
  LayoutDashboard,
  Vote,
  Users,
  UserRound,
  BarChart3,
  UserCircle,
  Settings,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">

      {/* ==============================
          SIDEBAR
      ============================== */}

      <aside className="w-64 bg-slate-900 text-white flex flex-col">

        {/* LOGO */}

        <div className="px-6 py-5 border-b border-slate-800">
          <h1 className="text-xl font-bold">
            Voting System
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            Admin Panel
          </p>
        </div>

        {/* MENU */}

        <nav className="flex-1 px-4 py-6 space-y-2">

          {/* DASHBOARD */}

          <button
            onClick={() => navigate("/admin/dashboard")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <LayoutDashboard size={20} />

            <span>
              Dashboard
            </span>
          </button>

          {/* ELECTIONS */}

          <button
            onClick={() => navigate("/admin/elections")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <Vote size={20} />

            <span>
              Elections
            </span>
          </button>

          {/* CANDIDATES */}

          <button
            onClick={() => navigate("/admin/candidates")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <UserRound size={20} />

            <span>
              Candidates
            </span>
          </button>

          {/* VOTERS */}

          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <Users size={20} />

            <span>
              Voters
            </span>
          </button>

          {/* RESULTS */}

          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <BarChart3 size={20} />

            <span>
              Results
            </span>
          </button>

          {/* PROFILE */}

          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <UserCircle size={20} />

            <span>
              Profile
            </span>
          </button>

          {/* SETTINGS */}

          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <Settings size={20} />

            <span>
              Settings
            </span>
          </button>

        </nav>

        {/* LOGOUT */}

        <div className="px-4 py-5 border-t border-slate-800">

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
          >
            <LogOut size={20} />

            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>

      {/* ==============================
          MAIN CONTENT
      ============================== */}

      <main className="flex-1 p-8">

        <div className="mb-8">

          <h2 className="text-3xl font-bold text-slate-800">
            Admin Dashboard
          </h2>

          <p className="text-slate-500 mt-2">
            Manage elections, candidates, voters and results.
          </p>

        </div>

        {/* DASHBOARD CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* ELECTIONS */}

          <div
            onClick={() => navigate("/admin/elections")}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Elections
                </p>

                <h3 className="text-3xl font-bold text-slate-800 mt-2">
                  —
                </h3>
              </div>

              <div className="p-3 bg-blue-100 rounded-xl">
                <Vote
                  size={24}
                  className="text-blue-600"
                />
              </div>

            </div>
          </div>

          {/* CANDIDATES */}

          <div
            onClick={() => navigate("/admin/candidates")}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Candidates
                </p>

                <h3 className="text-3xl font-bold text-slate-800 mt-2">
                  —
                </h3>
              </div>

              <div className="p-3 bg-green-100 rounded-xl">
                <UserRound
                  size={24}
                  className="text-green-600"
                />
              </div>

            </div>
          </div>

          {/* VOTERS */}

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Voters
                </p>

                <h3 className="text-3xl font-bold text-slate-800 mt-2">
                  —
                </h3>
              </div>

              <div className="p-3 bg-purple-100 rounded-xl">
                <Users
                  size={24}
                  className="text-purple-600"
                />
              </div>

            </div>

          </div>

          {/* RESULTS */}

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Results
                </p>

                <h3 className="text-3xl font-bold text-slate-800 mt-2">
                  —
                </h3>
              </div>

              <div className="p-3 bg-orange-100 rounded-xl">
                <BarChart3
                  size={24}
                  className="text-orange-600"
                />
              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default AdminDashboard;