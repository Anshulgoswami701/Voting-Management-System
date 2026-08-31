import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  Save,
  Loader2,
  Vote,
} from "lucide-react";

import { toast } from "react-toastify";

function EditElection() {
  const navigate = useNavigate();
  const { id } = useParams();

  // ==========================================
  // STATES
  // ==========================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  // ==========================================
  // API
  // ==========================================

  const API_URL = `http://localhost:5000/api/elections/${id}`;

  // ==========================================
  // TODAY
  // ==========================================

  const today = new Date()
    .toISOString()
    .split("T")[0];

  // ==========================================
  // FORMAT DATE FOR INPUT
  // ==========================================

  const formatInputDate = (date) => {
    if (!date) return "";

    return new Date(date)
      .toISOString()
      .split("T")[0];
  };

  // ==========================================
  // FETCH ELECTION
  // ==========================================

  const fetchElection = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error(
          "Please login as admin first"
        );

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
            "Failed to fetch election"
        );

        return;
      }

      const election = data.election;

      setFormData({
        title: election.title || "",

        description:
          election.description || "",

        startDate: formatInputDate(
          election.startDate
        ),

        endDate: formatInputDate(
          election.endDate
        ),
      });
    } catch (error) {
      console.error(
        "Fetch election error:",
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
  // LOAD ELECTION
  // ==========================================

  useEffect(() => {
    fetchElection();
  }, [id]);

  // ==========================================
  // HANDLE CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // UPDATE ELECTION
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ------------------------------------------
    // REQUIRED FIELDS
    // ------------------------------------------

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.startDate ||
      !formData.endDate
    ) {
      toast.error(
        "Please fill all required fields"
      );

      return;
    }

    const startDate = new Date(
      `${formData.startDate}T00:00:00`
    );
    const endDate = new Date(
      `${formData.endDate}T00:00:00`
    );
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    if (startDate < todayDate) {
      toast.error(
        "Start date cannot be in the past"
      );

      return;
    }

    if (endDate < todayDate) {
      toast.error(
        "End date cannot be in the past"
      );

      return;
    }

    if (endDate <= startDate) {
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
      setSaving(true);

      // ----------------------------------------
      // PUT REQUEST
      // ----------------------------------------

      const response = await fetch(API_URL, {
        method: "PUT",

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
      // ERROR
      // ----------------------------------------

      if (!response.ok) {
        toast.error(
          data.message ||
            "Failed to update election"
        );

        return;
      }

      // ----------------------------------------
      // SUCCESS
      // ----------------------------------------

      toast.success(
        "Election updated successfully!"
      );

      // Go back to election details
      setTimeout(() => {
        navigate(
          `/admin/elections/${id}`
        );
      }, 800);
    } catch (error) {
      console.error(
        "Update election error:",
        error
      );

      toast.error(
        "Unable to connect to server"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // LOADING SCREEN
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
            Loading election...
          </p>

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
              navigate(
                `/admin/elections/${id}`
              )
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
              Edit Election
            </h1>

            <p className="text-xs text-slate-500">
              Update election information
            </p>
          </div>

        </div>

      </header>

      {/* ======================================
          FORM
      ====================================== */}

      <main className="max-w-3xl mx-auto p-5 lg:p-8">

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          {/* FORM HEADER */}

          <div className="p-6 border-b border-slate-200">

            <h2 className="text-2xl font-bold text-slate-900">
              Edit Election
            </h2>

            <p className="text-slate-500 mt-2">
              Update the details of this election.
            </p>

          </div>

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-6"
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
                placeholder="Enter election title"
                required
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
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
                placeholder="Enter election description"
                rows="5"
                required
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />

            </div>

            {/* DATES */}

            <div className="grid md:grid-cols-2 gap-5">

              {/* START DATE */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Start Date
                </label>

                <div className="relative">

                  <CalendarDays
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />

                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    min={today}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />

                </div>

                <p className="text-xs text-slate-400 mt-2">
                  Past dates cannot be selected.
                </p>

              </div>

              {/* END DATE */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  End Date
                </label>

                <div className="relative">

                  <CalendarDays
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />

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
                    className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />

                </div>

                <p className="text-xs text-slate-400 mt-2">
                  End date must be after start date.
                </p>

              </div>

            </div>

            {/* BUTTONS */}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-100">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/admin/elections/${id}`
                  )
                }
                disabled={saving}
                className="px-6 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
              >

                {saving ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={18} />

                    Update Election
                  </>
                )}

              </button>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
}

export default EditElection;