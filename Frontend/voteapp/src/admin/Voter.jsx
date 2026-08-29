import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Eye,
  Lock,
  Unlock,
  Trash2,
  X,
  User,
  Mail,
  CreditCard,
  CalendarDays,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Voter() {
  const navigate = useNavigate();

  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // Modal state
  const [selectedVoter, setSelectedVoter] = useState(null);
  const [modalType, setModalType] = useState(null);

  // Action loading
  const [actionLoading, setActionLoading] = useState(false);

  // ==========================================
  // FETCH ALL VOTERS
  // ==========================================

  const fetchVoters = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/voters",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch voters"
        );
      }

      setVoters(data.voters || []);
    } catch (error) {
      console.error("Fetch voters error:", error);
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD VOTERS
  // ==========================================

  useEffect(() => {
    fetchVoters();
  }, []);

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const closeModal = () => {
    if (actionLoading) return;

    setSelectedVoter(null);
    setModalType(null);
  };

  // ==========================================
  // OPEN VIEW MODAL
  // ==========================================

  const handleView = (voter) => {
    setSelectedVoter(voter);
    setModalType("view");
  };

  // ==========================================
  // OPEN STATUS MODAL
  // ==========================================

  const handleStatusClick = (voter) => {
    setSelectedVoter(voter);
    setModalType("status");
  };

  // ==========================================
  // OPEN DELETE MODAL
  // ==========================================

  const handleDeleteClick = (voter) => {
    setSelectedVoter(voter);
    setModalType("delete");
  };

  // ==========================================
  // BLOCK / UNBLOCK VOTER
  // ==========================================

  const handleStatusChange = async () => {
    if (!selectedVoter) return;

    try {
      setActionLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const newStatus =
        selectedVoter.status === "active"
          ? "blocked"
          : "active";

      const response = await fetch(
        `http://localhost:5000/api/voters/${selectedVoter._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update voter status"
        );
      }

      // Refresh list
      await fetchVoters();

      closeModal();
    } catch (error) {
      console.error("Status update error:", error);
      setError(error.message || "Failed to update voter");
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // DELETE VOTER
  // ==========================================

  const handleDelete = async () => {
    if (!selectedVoter) return;

    try {
      setActionLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/voters/${selectedVoter._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete voter"
        );
      }

      // Remove voter immediately from UI
      setVoters((prev) =>
        prev.filter(
          (voter) => voter._id !== selectedVoter._id
        )
      );

      closeModal();
    } catch (error) {
      console.error("Delete voter error:", error);
      setError(error.message || "Failed to delete voter");
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={32}
            className="animate-spin text-indigo-600"
          />

          <p className="text-sm text-slate-500">
            Loading voters...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-100 p-5 md:p-8">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="mb-6 flex items-start justify-between">

        <div>
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="mb-5 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <h1 className="text-3xl font-bold text-slate-900">
            Voter Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View and manage registered voters.
          </p>
        </div>

        {/* REFRESH */}

        <button
          type="button"
          onClick={fetchVoters}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* ==========================================
          ERROR
      ========================================== */}

      {error && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-md p-1 hover:bg-red-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ==========================================
          VOTER TABLE
      ========================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* TABLE HEADER */}

        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">
            All Voters
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {voters.length}{" "}
            {voters.length === 1 ? "voter" : "voters"} found
          </p>
        </div>

        {/* EMPTY */}

        {voters.length === 0 ? (
          <div className="py-20 text-center">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <User
                size={26}
                className="text-slate-400"
              />
            </div>

            <h3 className="font-semibold text-slate-700">
              No voters registered
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Registered voters will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Voter
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Voter ID
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Voting
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>

                {voters.map((voter) => (

                  <tr
                    key={voter._id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >

                    {/* VOTER */}

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600">
                          {voter.fullName
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            {voter.fullName}
                          </p>

                          <p className="text-xs text-slate-400">
                            Voter
                          </p>
                        </div>

                      </div>

                    </td>

                    {/* VOTER ID */}

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {voter.voterId || "-"}
                    </td>

                    {/* EMAIL */}

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {voter.email}
                    </td>

                    {/* STATUS */}

                    <td className="px-6 py-4">

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                          voter.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            voter.status === "active"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />

                        {voter.status === "active"
                          ? "Active"
                          : "Blocked"}
                      </span>

                    </td>

                    {/* VOTING */}

                    <td className="px-6 py-4">

                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          voter.hasVoted
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {voter.hasVoted
                          ? "Voted"
                          : "Not Voted"}
                      </span>

                    </td>

                    {/* ACTIONS */}

                    <td className="px-6 py-4">

                      <div className="flex justify-end gap-2">

                        {/* VIEW */}

                        <button
                          type="button"
                          onClick={() => handleView(voter)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                          title="View voter"
                        >
                          <Eye size={17} />
                        </button>

                        {/* BLOCK / UNBLOCK */}

                        <button
                          type="button"
                          onClick={() =>
                            handleStatusClick(voter)
                          }
                          className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                            voter.status === "active"
                              ? "text-orange-500 hover:bg-orange-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={
                            voter.status === "active"
                              ? "Block voter"
                              : "Unblock voter"
                          }
                        >
                          {voter.status === "active" ? (
                            <Lock size={17} />
                          ) : (
                            <Unlock size={17} />
                          )}
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteClick(voter)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
                          title="Delete voter"
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ==========================================
          VIEW VOTER MODAL
      ========================================== */}

      {modalType === "view" && selectedVoter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Voter Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Registered voter information
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>

            </div>

            {/* PROFILE */}

            <div className="px-6 py-6">

              <div className="mb-6 flex items-center gap-4">

                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">
                  {selectedVoter.fullName
                    ?.charAt(0)
                    ?.toUpperCase()}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedVoter.fullName}
                  </h3>

                  <p className="text-sm text-slate-500">
                    Registered Voter
                  </p>
                </div>

              </div>

              {/* DETAILS */}

              <div className="space-y-3">

                {/* NAME */}

                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">

                  <div className="flex items-center gap-3">
                    <User
                      size={18}
                      className="text-slate-400"
                    />

                    <span className="text-sm text-slate-500">
                      Full Name
                    </span>
                  </div>

                  <span className="text-sm font-semibold text-slate-800">
                    {selectedVoter.fullName}
                  </span>

                </div>

                {/* VOTER ID */}

                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">

                  <div className="flex items-center gap-3">
                    <CreditCard
                      size={18}
                      className="text-slate-400"
                    />

                    <span className="text-sm text-slate-500">
                      Voter ID
                    </span>
                  </div>

                  <span className="text-sm font-semibold text-slate-800">
                    {selectedVoter.voterId || "-"}
                  </span>

                </div>

                {/* EMAIL */}

                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">

                  <div className="flex items-center gap-3">
                    <Mail
                      size={18}
                      className="text-slate-400"
                    />

                    <span className="text-sm text-slate-500">
                      Email
                    </span>
                  </div>

                  <span className="max-w[230px] truncate text-sm font-semibold text-slate-800">
                    {selectedVoter.email}
                  </span>

                </div>

                {/* REGISTRATION DATE */}

                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">

                  <div className="flex items-center gap-3">
                    <CalendarDays
                      size={18}
                      className="text-slate-400"
                    />

                    <span className="text-sm text-slate-500">
                      Registered
                    </span>
                  </div>

                  <span className="text-sm font-semibold text-slate-800">
                    {formatDate(
                      selectedVoter.createdAt
                    )}
                  </span>

                </div>

                {/* STATUS */}

                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">

                  <div className="flex items-center gap-3">
                    <ShieldCheck
                      size={18}
                      className="text-slate-400"
                    />

                    <span className="text-sm text-slate-500">
                      Account Status
                    </span>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      selectedVoter.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {selectedVoter.status === "active"
                      ? "Active"
                      : "Blocked"}
                  </span>

                </div>

                {/* VOTING */}

                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">

                  <div className="flex items-center gap-3">
                    <CheckCircle
                      size={18}
                      className="text-slate-400"
                    />

                    <span className="text-sm text-slate-500">
                      Voting Status
                    </span>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      selectedVoter.hasVoted
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {selectedVoter.hasVoted
                      ? "Voted"
                      : "Not Voted"}
                  </span>

                </div>

              </div>

            </div>

            {/* FOOTER */}

            <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ==========================================
          BLOCK / UNBLOCK MODAL
      ========================================== */}

      {modalType === "status" && selectedVoter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

            <div className="p-6">

              {/* ICON */}

              <div
                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
                  selectedVoter.status === "active"
                    ? "bg-orange-100"
                    : "bg-green-100"
                }`}
              >
                {selectedVoter.status === "active" ? (
                  <Lock
                    size={25}
                    className="text-orange-600"
                  />
                ) : (
                  <Unlock
                    size={25}
                    className="text-green-600"
                  />
                )}
              </div>

              {/* TEXT */}

              <div className="mt-4 text-center">

                <h2 className="text-xl font-bold text-slate-900">
                  {selectedVoter.status === "active"
                    ? "Block Voter?"
                    : "Unblock Voter?"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {selectedVoter.status === "active"
                    ? `Blocking ${selectedVoter.fullName} will prevent this voter from using the voting system.`
                    : `Unblocking ${selectedVoter.fullName} will allow this voter to use the voting system again.`}
                </p>

              </div>

              {/* ACTIONS */}

              <div className="mt-6 flex gap-3">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={actionLoading}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleStatusChange}
                  disabled={actionLoading}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 ${
                    selectedVoter.status === "active"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >

                  {actionLoading ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                      Please wait...
                    </>
                  ) : selectedVoter.status === "active" ? (
                    <>
                      <Lock size={16} />
                      Block Voter
                    </>
                  ) : (
                    <>
                      <Unlock size={16} />
                      Unblock Voter
                    </>
                  )}

                </button>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* ==========================================
          DELETE MODAL
      ========================================== */}

      {modalType === "delete" && selectedVoter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

            <div className="p-6">

              {/* WARNING ICON */}

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle
                  size={27}
                  className="text-red-600"
                />
              </div>

              {/* TEXT */}

              <div className="mt-4 text-center">

                <h2 className="text-xl font-bold text-slate-900">
                  Delete Voter?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Are you sure you want to permanently delete{" "}
                  <span className="font-semibold text-slate-700">
                    {selectedVoter.fullName}
                  </span>
                  ? This action cannot be undone.
                </p>

              </div>

              {/* ACTIONS */}

              <div className="mt-6 flex gap-3">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={actionLoading}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                >

                  {actionLoading ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete Voter
                    </>
                  )}

                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Voter;