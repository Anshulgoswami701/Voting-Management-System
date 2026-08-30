import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Vote,
  Users,
  UserRound,
  BarChart3,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getStoredUser } from "../components/ProtectedRoute";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalVoters: 0,
    verifiedVoters: 0,
    totalElections: 0,
    activeElections: 0,
    upcomingElections: 0,
    completedElections: 0,
    totalCandidates: 0,
    totalVotes: 0,
  });
  const [recentElections, setRecentElections] = useState([]);
  const [recentVoters, setRecentVoters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getStoredUser();

    if (!currentUser || currentUser.role !== "admin") {
      clearAuthSession();
      navigate("/login", { replace: true });
      return;
    }

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          clearAuthSession();
          navigate("/login", { replace: true });
          return;
        }

        const response = await fetch("http://localhost:5000/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to load dashboard");
        }

        setStats(data.stats || stats);
        setRecentElections(data.recentElections || []);
        setRecentVoters(data.recentVoters || []);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-";

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-slate-800">
          <h1 className="text-xl font-bold">Voting System</h1>
          <p className="text-xs text-slate-400 mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <button type="button" onClick={() => navigate("/admin/dashboard")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>

          <button type="button" onClick={() => navigate("/admin/elections")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition">
            <Vote size={20} />
            <span>Elections</span>
          </button>

          <button type="button" onClick={() => navigate("/admin/candidates")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition">
            <UserRound size={20} />
            <span>Candidates</span>
          </button>

          <button type="button" onClick={() => navigate("/admin/voters")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition">
            <Users size={20} />
            <span>Voters</span>
          </button>

          <button type="button" onClick={() => navigate("/admin/results")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition">
            <BarChart3 size={20} />
            <span>Results</span>
          </button>
        </nav>

        <div className="px-4 py-5 border-t border-slate-800">
          <button type="button" onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800">Admin Dashboard</h2>
          <p className="text-slate-500 mt-2">Manage elections, candidates, voters and results.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            { label: "Elections", value: stats.totalElections, icon: Vote, tone: "blue" },
            { label: "Candidates", value: stats.totalCandidates, icon: UserRound, tone: "green" },
            { label: "Voters", value: stats.totalVoters, icon: Users, tone: "purple" },
            { label: "Votes Cast", value: stats.totalVotes, icon: BarChart3, tone: "orange" },
          ].map(({ label, value, icon: Icon, tone }) => (
            <div key={label} onClick={() => label === "Elections" ? navigate("/admin/elections") : label === "Candidates" ? navigate("/admin/candidates") : label === "Voters" ? navigate("/admin/voters") : navigate("/admin/results")} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{label}</p>
                  <h3 className="text-3xl font-bold text-slate-800 mt-2">{loading ? "—" : value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${tone === "blue" ? "bg-blue-100" : tone === "green" ? "bg-green-100" : tone === "purple" ? "bg-purple-100" : "bg-orange-100"}`}>
                  <Icon size={24} className={tone === "blue" ? "text-blue-600" : tone === "green" ? "text-green-600" : tone === "purple" ? "text-purple-600" : "text-orange-600"} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Recent Elections</h3>
            <div className="space-y-3">
              {recentElections.length === 0 ? (
                <p className="text-slate-500">No elections yet.</p>
              ) : (
                recentElections.map((election) => (
                  <div key={election._id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-slate-800">{election.title}</p>
                      <p className="text-xs text-slate-500">{formatDate(election.startDate)} → {formatDate(election.endDate)}</p>
                    </div>
                    <span className="text-xs font-medium rounded-full bg-slate-100 text-slate-700 px-2.5 py-1 capitalize">{election.status.replace("_", " ")}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Recent Voters</h3>
            <div className="space-y-3">
              {recentVoters.length === 0 ? (
                <p className="text-slate-500">No voters registered yet.</p>
              ) : (
                recentVoters.map((voter) => (
                  <div key={voter._id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-slate-800">{voter.fullName}</p>
                      <p className="text-xs text-slate-500">{voter.email}</p>
                    </div>
                    <span className={`text-xs font-medium rounded-full px-2.5 py-1 ${voter.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{voter.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;