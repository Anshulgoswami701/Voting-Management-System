import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  Pencil,
  Vote,
  Loader2,
  UserCircle,
} from "lucide-react";

import { toast } from "react-toastify";

function ElectionDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  // ==========================================
  // STATES
  // ==========================================

  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // API URL
  // ==========================================

  const API_URL = `http://localhost:5000/api/elections/${id}`;

  // ==========================================
  // FETCH ELECTION
  // ==========================================

  const fetchElection = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login as admin first");
        navigate("/login");
        return;
      }

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(
          data.message || "Failed to fetch election"
        );
        return;
      }

      setElection(data.election);
    } catch (error) {
      console.error(
        "Fetch election details error:",
        error
      );

      toast.error("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD DATA
  // ==========================================

  useEffect(() => {
    fetchElection();
  }, [id]);

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // STATUS
  // ==========================================

  const getStatusBadge = (status) => {
    if (status === "active") {
      return (
        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-600">
          Active
        </span>
      );
    }

    if (status === "ended") {
      return (
        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-slate-100 text-slate-600">
          Ended
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-orange-100 text-orange-600">
        Upcoming
      </span>
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2
            size={40}
            className="animate-spin text-indigo-600 mx-auto"
          />

          <p className="text-slate-500 mt-4">
            Loading election details...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ELECTION NOT FOUND
  // ==========================================

  if (!election) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-10 text-center max-w-md w-full shadow-sm border border-slate-200">

          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
            <Vote
              size={25}
              className="text-slate-400"
            />
          </div>

          <h2 className="text-xl font-bold text-slate-800 mt-5">
            Election Not Found
          </h2>

          <p className="text-slate-500 mt-2">
            The election you are looking for does not
            exist.
          </p>

          <button
            onClick={() =>
              navigate("/admin/elections")
            }
            className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 rounded-xl transition"
          >
            Back to Elections
          </button>

        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-100">

      {/* ======================================
          HEADER
      ====================================== */}

      <header className="min-h-20 h-auto bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

        <div className="flex items-center gap-4">

          <button
            onClick={() =>
              navigate("/admin/elections")
            }
            className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition"
            title="Back"
          >
            <ArrowLeft size={21} />
          </button>

          <div className="bg-indigo-100 text-indigo-600 p-2.5 rounded-xl">
            <Vote size={23} />
          </div>

          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Election Details
            </h1>

            <p className="text-xs text-slate-500">
              View election information
            </p>
          </div>

        </div>

        {/* EDIT BUTTON */}

        <button
          onClick={() =>
            navigate(
              `/admin/elections/${election._id}/edit`
            )
          }
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 rounded-xl transition"
        >
          <Pencil size={18} />
          Edit Election
        </button>

      </header>

      {/* ======================================
          CONTENT
      ====================================== */}

      <main className="max-w-5xl mx-auto p-5 lg:p-8">

        {/* TITLE */}

        <div className="mb-7">

          <h2 className="text-3xl font-bold text-slate-900">
            {election.title}
          </h2>

          <p className="text-slate-500 mt-2">
            Election information and details
          </p>

        </div>

        {/* ====================================
            MAIN CARD
        ==================================== */}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          {/* TOP SECTION */}

          <div className="p-6 lg:p-8 border-b border-slate-200">

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">

              <div>

                <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">
                  Election
                </p>

                <h3 className="text-2xl font-bold text-slate-900 mt-2">
                  {election.title}
                </h3>

              </div>

              <div>
                {getStatusBadge(
                  election.status
                )}
              </div>

            </div>

          </div>

          {/* DESCRIPTION */}

          <div className="p-6 lg:p-8 border-b border-slate-200">

            <h4 className="font-semibold text-slate-800">
              Description
            </h4>

            <p className="text-slate-500 mt-3 leading-relaxed">
              {election.description}
            </p>

          </div>

          {/* DATES */}

          <div className="p-6 lg:p-8">

            <h4 className="font-semibold text-slate-800 mb-5">
              Election Schedule
            </h4>

            <div className="grid md:grid-cols-2 gap-5">

              {/* START DATE */}

              <div className="border border-slate-200 rounded-2xl p-5">

                <div className="flex items-center gap-3">

                  <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl">
                    <CalendarDays size={21} />
                  </div>

                  <div>

                    <p className="text-sm text-slate-400">
                      Start Date
                    </p>

                    <p className="font-semibold text-slate-800 mt-1">
                      {formatDate(
                        election.startDate
                      )}
                    </p>

                  </div>

                </div>

              </div>

              {/* END DATE */}

              <div className="border border-slate-200 rounded-2xl p-5">

                <div className="flex items-center gap-3">

                  <div className="bg-orange-100 text-orange-600 p-3 rounded-xl">
                    <CalendarDays size={21} />
                  </div>

                  <div>

                    <p className="text-sm text-slate-400">
                      End Date
                    </p>

                    <p className="font-semibold text-slate-800 mt-1">
                      {formatDate(
                        election.endDate
                      )}
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* CREATED BY */}

          {election.createdBy && (
            <div className="px-6 lg:px-8 pb-8">

              <div className="border border-slate-200 rounded-2xl p-5">

                <div className="flex items-center gap-3">

                  <div className="bg-slate-100 text-slate-600 p-3 rounded-xl">
                    <UserCircle size={21} />
                  </div>

                  <div>

                    <p className="text-sm text-slate-400">
                      Created By
                    </p>

                    <p className="font-semibold text-slate-800 mt-1">
                      {election.createdBy.fullName}
                    </p>

                    {election.createdBy.email && (
                      <p className="text-sm text-slate-500 mt-1">
                        {election.createdBy.email}
                      </p>
                    )}

                  </div>

                </div>

              </div>

            </div>
          )}

        </div>

      </main>

    </div>
  );
}

export default ElectionDetails;