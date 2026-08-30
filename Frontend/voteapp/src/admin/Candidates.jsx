import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    candidateId: "",
    election: "",
    party: "",
    position: "",
    manifesto: "",
    description: "",
    photo: "",
  });
  const [editData, setEditData] = useState({
    id: "",
    name: "",
    candidateId: "",
    election: "",
    party: "",
    position: "",
    manifesto: "",
    description: "",
    photo: "",
  });

  const navigate = useNavigate();

  const fetchCandidates = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/api/candidates", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load candidates");

      setCandidates(data.candidates || []);
    } catch (error) {
      console.error("Fetch candidates error:", error);
      toast.error(error.message || "Unable to load candidates");
    } finally {
      setLoading(false);
    }
  };

  const fetchElections = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/elections", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load elections");
      setElections(data.elections || []);
    } catch (error) {
      console.error("Fetch elections error:", error);
    }
  };

  useEffect(() => {
    fetchElections();
    fetchCandidates();
  }, []);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleEditChange = (e) => setEditData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.candidateId || !formData.election || !formData.party) {
      toast.error("Name, candidate ID, election, and party are required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/candidates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to create candidate");

      toast.success("Candidate created successfully");
      setShowForm(false);
      setFormData({
        name: "",
        candidateId: "",
        election: "",
        party: "",
        position: "",
        manifesto: "",
        description: "",
        photo: "",
      });
      fetchCandidates();
    } catch (error) {
      toast.error(error.message || "Unable to create candidate");
    }
  };

  const handleView = (candidate) => {
    setSelectedCandidate(candidate);
    setShowView(true);
  };

  const handleEdit = (candidate) => {
    setEditData({
      id: candidate._id,
      name: candidate.name || "",
      candidateId: candidate.candidateId || "",
      election: candidate.election?._id || candidate.election || "",
      party: candidate.party || "",
      position: candidate.position || "",
      manifesto: candidate.manifesto || "",
      description: candidate.description || "",
      photo: candidate.photo || "",
    });
    setShowEdit(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editData.name || !editData.candidateId || !editData.election || !editData.party) {
      toast.error("Name, candidate ID, election, and party are required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/candidates/${editData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editData.name,
          candidateId: editData.candidateId,
          election: editData.election,
          party: editData.party,
          position: editData.position,
          manifesto: editData.manifesto,
          description: editData.description,
          photo: editData.photo,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update candidate");

      toast.success("Candidate updated successfully");
      setShowEdit(false);
      fetchCandidates();
    } catch (error) {
      toast.error(error.message || "Unable to update candidate");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this candidate?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/candidates/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete candidate");

      toast.success("Candidate deleted successfully");
      fetchCandidates();
    } catch (error) {
      toast.error(error.message || "Unable to delete candidate");
    }
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const target = `${candidate.name || ""} ${candidate.party || ""} ${candidate.election?.title || ""} ${candidate.candidateId || ""}`.toLowerCase();
    return target.includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="mb-5 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-all duration-200 bg-white hover:text-indigo-600 hover:shadow-sm"
          >
            <span className="text-lg leading-none">←</span>
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Candidate Management</h1>
          <p className="text-slate-500 mt-1">Create, manage and monitor election candidates.</p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          + Add Candidate
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
        <input
          type="text"
          placeholder="Search candidates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-slate-200 rounded-lg py-3 pl-4 pr-4 outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">All Candidates</h2>
          <p className="text-sm text-slate-500 mt-1">{filteredCandidates.length} candidates found</p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500">Loading candidates...</div>
        ) : filteredCandidates.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-4">👤</div>
            <h3 className="text-lg font-semibold text-slate-700">No candidates found</h3>
            <p className="text-slate-400 mt-1">Add a candidate to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Candidate</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Party</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Election</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Candidate ID</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((candidate) => (
                  <tr key={candidate._id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold">
                          {(candidate.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{candidate.name}</p>
                          <p className="text-sm text-slate-400">Candidate</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-slate-600">{candidate.party || "-"}</td>
                    <td className="px-6 py-5 text-slate-600">{candidate.election?.title || "-"}</td>
                    <td className="px-6 py-5 text-slate-600">{candidate.candidateId || "-"}</td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => handleView(candidate)} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="View">👁</button>
                        <button type="button" onClick={() => handleEdit(candidate)} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Edit">✏️</button>
                        <button type="button" onClick={() => handleDelete(candidate._id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Add Candidate</h2>
                <p className="text-sm text-slate-500 mt-1">Add a candidate to an election.</p>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700 text-xl">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Full name" className="border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500" required />
                <input name="candidateId" value={formData.candidateId} onChange={handleChange} placeholder="Candidate ID" className="border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500" required />
                <select name="election" value={formData.election} onChange={handleChange} className="border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500" required>
                  <option value="">Select election</option>
                  {elections.filter((e) => e.status !== "ended").map((e) => (
                    <option key={e._id} value={e._id}>{e.title}</option>
                  ))}
                </select>
                <input name="party" value={formData.party} onChange={handleChange} placeholder="Party" className="border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500" required />
                <input name="position" value={formData.position} onChange={handleChange} placeholder="Position" className="border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500" />
                <input name="photo" value={formData.photo} onChange={handleChange} placeholder="Photo URL (optional)" className="border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500" />
              </div>

              <textarea name="manifesto" value={formData.manifesto} onChange={handleChange} placeholder="Manifesto" rows="3" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500" />
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" rows="3" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500" />

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Save Candidate</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Edit Candidate</h2>
                <p className="text-sm text-slate-500 mt-1">Update candidate information.</p>
              </div>
              <button type="button" onClick={() => setShowEdit(false)} className="text-slate-400 hover:text-slate-700 text-xl">✕</button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="name" value={editData.name} onChange={handleEditChange} placeholder="Full name" className="border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500" required />
                <input name="candidateId" value={editData.candidateId} onChange={handleEditChange} placeholder="Candidate ID" className="border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500" required />
                <select name="election" value={editData.election} onChange={handleEditChange} className="border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500" required>
                  <option value="">Select election</option>
                  {elections.map((e) => (
                    <option key={e._id} value={e._id}>{e.title}</option>
                  ))}
                </select>
                <input name="party" value={editData.party} onChange={handleEditChange} placeholder="Party" className="border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500" required />
                <input name="position" value={editData.position} onChange={handleEditChange} placeholder="Position" className="border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500" />
                <input name="photo" value={editData.photo} onChange={handleEditChange} placeholder="Photo URL (optional)" className="border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500" />
              </div>

              <textarea name="manifesto" value={editData.manifesto} onChange={handleEditChange} placeholder="Manifesto" rows="3" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500" />
              <textarea name="description" value={editData.description} onChange={handleEditChange} placeholder="Description" rows="3" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500" />

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowEdit(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Update Candidate</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showView && selectedCandidate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <h2 className="text-xl font-bold text-slate-900">Candidate Details</h2>
              <button type="button" onClick={() => setShowView(false)} className="text-slate-400 hover:text-slate-700 text-xl">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-slate-400">Name</p>
                <p className="font-semibold text-slate-800">{selectedCandidate.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Candidate ID</p>
                <p className="font-semibold text-slate-800">{selectedCandidate.candidateId}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Party</p>
                <p className="font-semibold text-slate-800">{selectedCandidate.party}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Election</p>
                <p className="font-semibold text-slate-800">{selectedCandidate.election?.title || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Position</p>
                <p className="font-semibold text-slate-800">{selectedCandidate.position || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Manifesto</p>
                <p className="text-slate-700 whitespace-pre-wrap">{selectedCandidate.manifesto || selectedCandidate.description || "No manifesto provided."}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Candidates;
