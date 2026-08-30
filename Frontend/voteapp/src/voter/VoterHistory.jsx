import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, History, Loader2, Vote, CheckCircle2 } from "lucide-react";

function VoterHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/votes/history", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to load voting history");
        }

        setHistory(data.votes || []);
      } catch (error) {
        console.error("Fetch voting history error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [token, navigate]);

  const formatDate = (value) =>
    new Date(value).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="rounded-2xl bg-white p-8 text-center border border-slate-200 shadow-sm">
          <Loader2 className="mx-auto animate-spin text-indigo-600" size={30} />
          <p className="mt-4 text-slate-600">Loading your voting history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/voter/dashboard")}
              className="mb-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <h1 className="text-3xl font-bold text-slate-900">My Voting History</h1>
          </div>
        </div>

        {location.state?.successMessage && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {location.state.successMessage}
          </div>
        )}

        {history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <History className="mx-auto text-slate-400" size={36} />
            <h3 className="mt-4 text-lg font-semibold text-slate-800">No votes yet</h3>
            <p className="mt-2 text-sm text-slate-500">Your voting history will appear here after you cast a vote.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((vote) => (
              <div key={vote._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Election</p>
                    <h3 className="mt-2 text-xl font-bold text-slate-900">{vote.election?.title || "Election"}</h3>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 size={14} /> Vote Submitted
                  </span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Voting date</p>
                    <p className="mt-2 text-sm font-medium text-slate-700">{formatDate(vote.createdAt)}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Candidate</p>
                    <p className="mt-2 text-sm font-medium text-slate-700">{vote.candidate?.name || "Candidate selected"}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Status</p>
                    <p className="mt-2 text-sm font-medium text-slate-700">{vote.status || "Recorded"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default VoterHistory;
