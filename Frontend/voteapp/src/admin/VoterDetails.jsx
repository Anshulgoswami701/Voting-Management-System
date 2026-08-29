import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";

function VoterDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [voter, setVoter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH VOTER
  // ==========================================

  const fetchVoter = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/voters/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch voter"
        );
      }

      setVoter(data.voter);
    } catch (error) {
      console.error("Fetch voter error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoter();
  }, [id]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <div className="flex justify-center py-20">
          <p className="text-slate-600">
            Loading voter...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">

        <button
          onClick={() => navigate("/admin/voters")}
          className="mb-5 flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>

      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-100 p-5 md:p-8">

      <button
        onClick={() => navigate("/admin/voters")}
        className="mb-6 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
      >
        <ArrowLeft size={16} />
        Back to Voters
      </button>

      <div className="max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* HEADER */}

        <div className="border-b border-slate-200 px-6 py-6">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">
              {voter?.fullName
                ?.charAt(0)
                ?.toUpperCase()}
            </div>

            <div>

              <h1 className="text-2xl font-bold text-slate-900">
                {voter?.fullName}
              </h1>

              <p className="text-sm text-slate-500">
                Voter Details
              </p>

            </div>

          </div>

        </div>

        {/* DETAILS */}

        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">

          {/* FULL NAME */}

          <div>
            <p className="text-sm text-slate-400">
              Full Name
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              {voter?.fullName}
            </p>
          </div>

          {/* VOTER ID */}

          <div>
            <p className="text-sm text-slate-400">
              Voter ID
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              {voter?.voterId || "-"}
            </p>
          </div>

          {/* EMAIL */}

          <div>
            <p className="text-sm text-slate-400">
              Email
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              {voter?.email}
            </p>
          </div>

          {/* REGISTRATION DATE */}

          <div>
            <p className="text-sm text-slate-400">
              Registration Date
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              {voter?.createdAt
                ? new Date(
                    voter.createdAt
                  ).toLocaleDateString()
                : "-"}
            </p>
          </div>

          {/* STATUS */}

          <div>
            <p className="text-sm text-slate-400">
              Account Status
            </p>

            <div className="mt-2">

              {voter?.status === "active" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  <CheckCircle size={14} />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                  <XCircle size={14} />
                  Blocked
                </span>
              )}

            </div>
          </div>

          {/* VOTING STATUS */}

          <div>
            <p className="text-sm text-slate-400">
              Voting Status
            </p>

            <div className="mt-2">

              {voter?.hasVoted ? (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  Voted
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Not Voted
                </span>
              )}

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default VoterDetails;