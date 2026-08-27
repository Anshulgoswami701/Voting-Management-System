import {
  LayoutDashboard,
  Vote,
  Users,
  UserRound,
  BarChart3,
  Settings,
  UserCircle,
  LogOut,
  Menu,
  CalendarDays,
  CheckCircle,
  UserCheck,
  ClipboardList,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  // ==========================================
  // GET LOGGED-IN ADMIN
  // ==========================================

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">

        {/* LOGO */}

        <div className="h-20 flex items-center px-6 border-b border-slate-800">

          <div className="bg-indigo-600 p-2.5 rounded-xl mr-3">
            <Vote size={25} />
          </div>

          <div>
            <h1 className="text-lg font-bold">
              Online Voting
            </h1>

            <p className="text-indigo-400 text-sm">
              System
            </p>
          </div>

        </div>


        {/* NAVIGATION */}

        <nav className="flex-1 px-4 py-6">

          {/* DASHBOARD */}

          <button
            onClick={() => navigate("/admin/dashboard")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600 text-white"
          >
            <LayoutDashboard size={20} />

            <span className="font-medium">
              Dashboard
            </span>
          </button>


          {/* MANAGEMENT */}

          <div className="mt-8">

            <p className="text-xs font-semibold text-slate-500 uppercase px-4 mb-3">
              Management
            </p>


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

          </div>


          {/* SYSTEM */}

          <div className="mt-8">

            <p className="text-xs font-semibold text-slate-500 uppercase px-4 mb-3">
              System
            </p>


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

          </div>

        </nav>


        {/* LOGOUT */}

        <div className="p-4 border-t border-slate-800">

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-slate-800 transition"
          >
            <LogOut size={20} />

            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>


      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <main className="flex-1">

        {/* HEADER */}

        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">

          <div className="flex items-center gap-3">

            <button className="text-slate-600">
              <Menu size={24} />
            </button>

            <h2 className="text-xl font-semibold text-slate-800">
              Admin Dashboard
            </h2>

          </div>


          {/* ADMIN PROFILE */}

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">

              <UserCircle
                size={24}
                className="text-indigo-600"
              />

            </div>

            <div>

              <p className="font-semibold text-slate-800">
                {user?.fullName || "Admin User"}
              </p>

              <p className="text-xs text-slate-500">
                Administrator
              </p>

            </div>

          </div>

        </header>


        {/* =========================================
            DASHBOARD CONTENT
        ========================================= */}

        <section className="p-8">

          {/* PAGE TITLE */}

          <div>

            <h1 className="text-3xl font-bold text-slate-900">
              Dashboard
            </h1>

            <p className="text-slate-500 mt-2">
              Welcome back, {user?.fullName || "Admin User"} 👋
            </p>

          </div>


          {/* =========================================
              STATISTICS CARDS
          ========================================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-8">


            {/* TOTAL ELECTIONS */}

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Total Elections
                  </p>

                  <h2 className="text-3xl font-bold text-slate-900 mt-2">
                    0
                  </h2>

                  <p className="text-xs text-slate-400 mt-2">
                    All elections
                  </p>

                </div>

                <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl">
                  <CalendarDays size={23} />
                </div>

              </div>

            </div>


            {/* ACTIVE ELECTIONS */}

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Active Elections
                  </p>

                  <h2 className="text-3xl font-bold text-slate-900 mt-2">
                    0
                  </h2>

                  <p className="text-xs text-slate-400 mt-2">
                    Currently running
                  </p>

                </div>

                <div className="bg-green-100 text-green-600 p-3 rounded-xl">
                  <CheckCircle size={23} />
                </div>

              </div>

            </div>


            {/* TOTAL CANDIDATES */}

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Total Candidates
                  </p>

                  <h2 className="text-3xl font-bold text-slate-900 mt-2">
                    0
                  </h2>

                  <p className="text-xs text-slate-400 mt-2">
                    Registered candidates
                  </p>

                </div>

                <div className="bg-purple-100 text-purple-600 p-3 rounded-xl">
                  <UserCheck size={23} />
                </div>

              </div>

            </div>


            {/* TOTAL VOTERS */}

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Total Voters
                  </p>

                  <h2 className="text-3xl font-bold text-slate-900 mt-2">
                    0
                  </h2>

                  <p className="text-xs text-slate-400 mt-2">
                    Registered voters
                  </p>

                </div>

                <div className="bg-orange-100 text-orange-600 p-3 rounded-xl">
                  <ClipboardList size={23} />
                </div>

              </div>

            </div>

          </div>


          {/* =========================================
              RECENT ACTIVITY
          ========================================= */}

          <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm">

            <div className="p-6 border-b border-slate-200">

              <h2 className="text-lg font-semibold text-slate-800">
                Recent Activity
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Latest activity in the voting system
              </p>

            </div>

            <div className="p-8 text-center">

              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto">

                <BarChart3
                  size={22}
                  className="text-slate-400"
                />

              </div>

              <p className="text-slate-500 mt-3">
                No recent activity
              </p>

              <p className="text-sm text-slate-400 mt-1">
                Activity will appear here once the system is in use.
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;