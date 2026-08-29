import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditVoter() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    voterId: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchVoter = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `http://localhost:5000/api/voters/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch voter");
        }

        setFormData({
          fullName: data.voter.fullName || "",
          voterId: data.voter.voterId || "",
          email: data.voter.email || "",
        });
      } catch (error) {
        console.error("Fetch voter error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVoter();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/voters/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update voter");
      }

      setSuccess("Voter updated successfully.");

      setTimeout(() => {
        navigate("/admin/voters");
      }, 1000);
    } catch (error) {
      console.error("Update voter error:", error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <p className="text-slate-600">Loading voter...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-5 md:p-8">

      <button
        type="button"
        onClick={() => navigate("/admin/voters")}
        className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
      >
        ← Back
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          Edit Voter
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Update voter information.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
            {success}
          </div>
        )}

        {/* FULL NAME */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Full Name
          </label>

          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
          />
        </div>

        {/* VOTER ID */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Voter ID
          </label>

          <input
            type="text"
            name="voterId"
            value={formData.voterId}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
          />
        </div>

        {/* EMAIL */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Email
          </label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-3">

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/voters")}
            className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

        </div>

      </form>
    </div>
  );
}

export default EditVoter;