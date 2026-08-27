import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import {
  Plus,
  Search,
  Calendar,
  Eye,
  Pencil,
  Trash2,
  X,
  Vote,
  Loader2,
} from "lucide-react";

import { toast } from "react-toastify";

function Elections() {
  // ==========================================
  // NAVIGATION
  // ==========================================

  const navigate = useNavigate();

  // ==========================================
  // STATES
  // ==========================================

  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  // DELETE MODAL
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    election: null,
  });

  const [deleting, setDeleting] = useState(false);

  // ==========================================
  // CURRENT DATE
  // ==========================================

  const today = new Date()
    .toISOString()
    .split("T")[0];

  // ==========================================
  // API URL
  // ==========================================

  const API_URL =
    "http://localhost:5000/api/elections";

  // ==========================================
  // GET ELECTIONS
  // ==========================================

  const fetchElections = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login as admin");
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
          data.message ||
            "Failed to fetch elections"
        );

        return;
      }

      setElections(data.elections || []);
    } catch (error) {
      console.error(
        "Fetch elections error:",
        error
      );

      toast.error(
        "Unable to connect to server"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD ELECTIONS
  // ==========================================

  useEffect(() => {
    fetchElections();
  }, []);

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // OPEN CREATE MODAL
  // ==========================================

  const openCreateModal = () => {
    setFormData({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
    });

    setShowModal(true);
  };

  // ==========================================
  // CLOSE CREATE MODAL
  // ==========================================

  const closeModal = () => {
    if (creating) return;

    setShowModal(false);

    setFormData({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
    });
  };

  // ==========================================
  // CREATE ELECTION
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ------------------------------------------
    // BASIC VALIDATION
    // ------------------------------------------

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.startDate ||
      !formData.endDate
    ) {
      toast.error("Please fill all fields");
      return;
    }

    // ------------------------------------------
    // START DATE
    // ------------------------------------------

    if (formData.startDate < today) {
      toast.error(
        "Start date cannot be in the past"
      );

      return;
    }

    // ------------------------------------------
    // END DATE
    // ------------------------------------------

    if (
      formData.endDate <=
      formData.startDate
    ) {
      toast.error(
        "End date must be after start date"
      );

      return;
    }

    // ------------------------------------------
    // TOKEN
    // ------------------------------------------

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error(
        "Please login as admin first"
      );

      navigate("/login");

      return;
    }

    try {
      setCreating(true);

      // ----------------------------------------
      // API REQUEST
      // ----------------------------------------

      const response = await fetch(API_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          title: formData.title.trim(),

          description:
            formData.description.trim(),

          startDate: formData.startDate,

          endDate: formData.endDate,
        }),
      });

      const data = await response.json();

      // ----------------------------------------
      // ERROR RESPONSE
      // ----------------------------------------

      if (!response.ok) {
        toast.error(
          data.message ||
            "Failed to create election"
        );

        return;
      }

      // ----------------------------------------
      // SUCCESS
      // ----------------------------------------

      toast.success(
        "Election created successfully!"
      );

      setShowModal(false);

      setFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
      });

      fetchElections();
    } catch (error) {
      console.error(
        "Create election error:",
        error
      );

      toast.error(
        "Unable to connect to server"
      );
    } finally {
      setCreating(false);
    }
  };

  // ==========================================
  // VIEW ELECTION
  // ==========================================

  const handleView = (id) => {
    navigate(`/admin/elections/${id}`);
  };

  // ==========================================
  // EDIT ELECTION
  // ==========================================

  const handleEdit = (id) => {
    navigate(`/admin/elections/${id}/edit`);
  };

  // ==========================================
  // OPEN DELETE MODAL
  // ==========================================

  const handleDelete = (election) => {
    setDeleteModal({
      open: true,
      election: election,
    });
  };

  // ==========================================
  // CLOSE DELETE MODAL
  // ==========================================

  const closeDeleteModal = () => {
    if (deleting) return;

    setDeleteModal({
      open: false,
      election: null,
    });
  };

  // ==========================================
  // CONFIRM DELETE
  // ==========================================

  const confirmDelete = async () => {
    const id = deleteModal.election?._id;

    if (!id) {
      toast.error("Election not found");
      return;
    }

    try {
      setDeleting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error(
          "Please login as admin first"
        );

        navigate("/login");

        return;
      }

      // ----------------------------------------
      // DELETE API
      // ----------------------------------------

      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      // ----------------------------------------
      // ERROR
      // ----------------------------------------

      if (!response.ok) {
        toast.error(
          data.message ||
            "Failed to delete election"
        );

        return;
      }

      // ----------------------------------------
      // SUCCESS
      // ----------------------------------------

      toast.success(
        "Election deleted successfully!"
      );

      // Remove from UI immediately
      setElections((prev) =>
        prev.filter(
          (election) =>
            election._id !== id
        )
      );

      // Close modal
      setDeleteModal({
        open: false,
        election: null,
      });
    } catch (error) {
      console.error(
        "Delete election error:",
        error
      );

      toast.error(
        "Unable to connect to server"
      );
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================
  // FILTER ELECTIONS
  // ==========================================

  const filteredElections =
    elections.filter((election) => {
      const matchesSearch =
        election.title
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        election.description
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        election.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

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
  // STATUS BADGE
  // ==========================================

  const getStatusBadge = (status) => {
    if (status === "active") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600">
          Active
        </span>
      );
    }

    if (status === "ended") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
          Ended
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-600">
        Upcoming
      </span>
    );
  };

  // ==========================================
  // JSX
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-100">

      {/* ======================================
          HEADER
      ====================================== */}

      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8">

        <div className="flex items-center gap-3">

          <div className="bg-indigo-100 text-indigo-600 p-2.5 rounded-xl">
            <Vote size={24} />
          </div>

        

          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Elections
            </h1>
           

            <p className="text-xs text-slate-500">
              Manage your elections
            </p>
          </div>

        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 rounded-xl transition"
        >
          <Plus size={18} />
          Create Election
        </button>

      </header>

      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <main className="p-5 lg:p-8">

        {/* BACK NAVIGATION */}
        <div className="mb-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
        </div>

        <div className="mb-7">

          <h2 className="text-3xl font-bold text-slate-900">
            Election Management
          </h2>

          <p className="text-slate-500 mt-2">
            Create, manage and monitor your elections.
          </p>

        </div>

        {/* ====================================
            SEARCH / FILTER
        ==================================== */}

        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5">

          <div className="grid md:grid-cols-[1fr_140px] gap-3">

            {/* SEARCH */}

            <div className="relative">

              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search elections..."
                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              />

            </div>

            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">
                All Status
              </option>

              <option value="upcoming">
                Upcoming
              </option>

              <option value="active">
                Active
              </option>

              <option value="ended">
                Ended
              </option>
            </select>

          </div>

        </div>

        {/* ====================================
            ELECTION TABLE
        ==================================== */}

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

          {/* TABLE HEADER */}

          <div className="p-5 border-b border-slate-200">

            <h3 className="font-semibold text-slate-900">
              All Elections
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              {filteredElections.length} election
              {filteredElections.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>

          </div>

          {/* LOADING */}

          {loading ? (

            <div className="py-20 flex flex-col items-center justify-center text-slate-400">

              <Loader2
                size={32}
                className="animate-spin mb-3"
              />

              <p>
                Loading elections...
              </p>

            </div>

          ) : filteredElections.length === 0 ? (

            /* EMPTY */

            <div className="py-20 flex flex-col items-center justify-center text-center">

              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">

                <Vote
                  size={22}
                  className="text-slate-400"
                />

              </div>

              <h3 className="font-semibold text-slate-700">
                No elections found
              </h3>

              <p className="text-sm text-slate-400 mt-1">
                Create your first election to get
                started.
              </p>

              <button
                onClick={openCreateModal}
                className="mt-5 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 rounded-xl transition"
              >
                <Plus size={18} />
                Create Election
              </button>

            </div>

          ) : (

            /* TABLE */

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="bg-slate-50 text-left text-xs uppercase text-slate-500">

                    <th className="px-5 py-4">
                      Election
                    </th>

                    <th className="px-5 py-4">
                      Start Date
                    </th>

                    <th className="px-5 py-4">
                      End Date
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredElections.map(
                    (election) => (

                      <tr
                        key={election._id}
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >

                        {/* ELECTION */}

                        <td className="px-5 py-5">

                          <p className="font-semibold text-slate-800">
                            {election.title}
                          </p>

                          <p className="text-sm text-slate-500 mt-1">
                            {election.description}
                          </p>

                        </td>

                        {/* START */}

                        <td className="px-5 py-5">

                          <div className="flex items-center gap-2 text-slate-600">

                            <Calendar size={16} />

                            {formatDate(
                              election.startDate
                            )}

                          </div>

                        </td>

                        {/* END */}

                        <td className="px-5 py-5">

                          <div className="flex items-center gap-2 text-slate-600">

                            <Calendar size={16} />

                            {formatDate(
                              election.endDate
                            )}

                          </div>

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-5">

                          {getStatusBadge(
                            election.status
                          )}

                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-5">

                          <div className="flex items-center justify-end gap-3">

                            {/* VIEW */}

                            <button
                              title="View"
                              onClick={() =>
                                handleView(
                                  election._id
                                )
                              }
                              className="text-slate-500 hover:text-indigo-600 transition"
                            >
                              <Eye size={18} />
                            </button>

                            {/* EDIT */}

                            <button
                              title="Edit"
                              onClick={() =>
                                handleEdit(
                                  election._id
                                )
                              }
                              className="text-slate-500 hover:text-indigo-600 transition"
                            >
                              <Pencil size={18} />
                            </button>

                            {/* DELETE */}

                            <button
                              title="Delete"
                              onClick={() =>
                                handleDelete(
                                  election
                                )
                              }
                              className="text-slate-500 hover:text-red-600 transition"
                            >
                              <Trash2 size={18} />
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </main>

      {/* ======================================
          CREATE ELECTION MODAL
      ====================================== */}

      {showModal && (

        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center px-4">

          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Create New Election
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Add details for your election.
                </p>

              </div>

              <button
                onClick={closeModal}
                disabled={creating}
                className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
              >
                <X size={20} />
              </button>

            </div>

            {/* MODAL FORM */}

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >

              {/* TITLE */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Election Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. College Student Election 2026"
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter election description..."
                  rows="3"
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none resize-none focus:ring-2 focus:ring-indigo-500"
                />

              </div>

              {/* DATES */}

              <div className="grid grid-cols-2 gap-4">

                {/* START DATE */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    min={today}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                </div>

                {/* END DATE */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Date
                  </label>

                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    min={
                      formData.startDate ||
                      today
                    }
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                </div>

              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={creating}
                  className="px-5 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
                >

                  {creating ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />

                      Create Election
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ======================================
          DELETE CONFIRMATION MODAL
      ====================================== */}

      {deleteModal.open && (

        <div
          className="fixed inset-0 z[60] bg-slate-950/60 flex items-center justify-center px-4"
          onClick={closeDeleteModal}
        >

          <div
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="p-7">

              {/* DELETE ICON */}

              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5">
                <Trash2 size={25} />
              </div>

              {/* HEADING */}

              <div className="text-center">

                <h2 className="text-xl font-bold text-slate-900">
                  Delete Election?
                </h2>

                <p className="text-slate-500 text-sm mt-2">
                  Are you sure you want to delete this election?
                </p>

              </div>

              {/* ELECTION NAME */}

              <div className="mt-5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">

                <p className="text-xs text-slate-400 uppercase font-semibold">
                  Election
                </p>

                <p className="font-semibold text-slate-800 mt-1">
                  {deleteModal.election?.title}
                </p>

              </div>

              {/* WARNING */}

              <p className="text-xs text-red-500 text-center mt-4">
                This action cannot be undone.
              </p>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 mt-7">

                {/* CANCEL */}

                <button
                  type="button"
                  disabled={deleting}
                  onClick={closeDeleteModal}
                  className="px-5 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                {/* DELETE */}

                <button
                  type="button"
                  disabled={deleting}
                  onClick={confirmDelete}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
                >

                  {deleting ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />

                      Delete Election
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

export default Elections;