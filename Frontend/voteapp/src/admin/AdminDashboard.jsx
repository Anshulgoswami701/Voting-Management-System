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
} from "lucide-react";

function AdminDashboard() {
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

            {/* Elections */}

            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition">
              <Vote size={20} />

              <span>
                Elections
              </span>
            </button>

            {/* Candidates */}

            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition">
              <UserRound size={20} />

              <span>
                Candidates
              </span>
            </button>

            {/* Voters */}

            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition">
              <Users size={20} />

              <span>
                Voters
              </span>
            </button>

            {/* Results */}

            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition">
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

            {/* Profile */}

            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition">
              <UserCircle size={20} />

              <span>
                Profile
              </span>
            </button>

            {/* Settings */}

            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition">
              <Settings size={20} />

              <span>
                Settings
              </span>
            </button>

          </div>

        </nav>

        {/* LOGOUT */}

        <div className="p-4 border-t border-slate-800">

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-slate-800 transition">

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
                Admin User
              </p>

              <p className="text-xs text-slate-500">
                Administrator
              </p>
            </div>

          </div>

        </header>

        {/* CONTENT */}

        <section className="p-8">

          <h1 className="text-3xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="text-slate-500 mt-2">
            Welcome back, Admin User 👋
          </p>

          {/* NEXT STEPS WILL COME HERE */}

          <div className="mt-8 bg-white rounded-2xl p-8 border border-slate-200">

            <h2 className="text-xl font-semibold text-slate-800">
              Dashboard Content
            </h2>

            <p className="text-slate-500 mt-2">
              We will build the dashboard cards here.
            </p>

          </div>

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;