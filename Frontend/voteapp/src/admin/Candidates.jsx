import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  // Add modal
  const [showForm, setShowForm] = useState(false);

  // View modal
  const [showView, setShowView] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Edit modal
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({
    id: "",
    name: "",
    party: "",
    election: "",
    symbol: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    party: "",
    election: "",
    symbol: "",
  });

  // ==========================================
  // LOAD CANDIDATES
  // ==========================================

  useEffect(() => {
    const savedCandidates = localStorage.getItem("candidates");

    if (savedCandidates) {
      setCandidates(JSON.parse(savedCandidates));
    }
  }, []);

  // ==========================================
  // FORM INPUT
  // ==========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // ADD CANDIDATE
  // ==========================================

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.party ||
      !formData.election
    ) {
      alert("Please fill all required fields");
      return;
    }

    const newCandidate = {
      id: Date.now(),
      name: formData.name,
      party: formData.party,
      election: formData.election,
      symbol: formData.symbol,
    };

    const updatedCandidates = [
      ...candidates,
      newCandidate,
    ];

    setCandidates(updatedCandidates);

    localStorage.setItem(
      "candidates",
      JSON.stringify(updatedCandidates)
    );

    setFormData({
      name: "",
      party: "",
      election: "",
      symbol: "",
    });

    setShowForm(false);
  };

  // ==========================================
  // VIEW CANDIDATE
  // ==========================================

  const handleView = (candidate) => {
    setSelectedCandidate(candidate);
    setShowView(true);
  };

  // ==========================================
  // OPEN EDIT
  // ==========================================

  const handleEdit = (candidate) => {
    setEditData({
      id: candidate.id,
      name: candidate.name || "",
      party: candidate.party || "",
      election: candidate.election || "",
      symbol: candidate.symbol || "",
    });

    setShowEdit(true);
  };

  // ==========================================
  // EDIT INPUT
  // ==========================================

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // UPDATE CANDIDATE
  // ==========================================

  const handleUpdate = (e) => {
    e.preventDefault();

    if (
      !editData.name ||
      !editData.party ||
      !editData.election
    ) {
      alert("Please fill all required fields");
      return;
    }

    const updatedCandidates = candidates.map(
      (candidate) =>
        candidate.id === editData.id
          ? {
              ...candidate,
              name: editData.name,
              party: editData.party,
              election: editData.election,
              symbol: editData.symbol,
            }
          : candidate
    );

    setCandidates(updatedCandidates);

    localStorage.setItem(
      "candidates",
      JSON.stringify(updatedCandidates)
    );

    setShowEdit(false);

    setEditData({
      id: "",
      name: "",
      party: "",
      election: "",
      symbol: "",
    });
  };

  // ==========================================
  // DELETE CANDIDATE
  // ==========================================

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this candidate?"
    );

    if (!confirmed) return;

    const updatedCandidates = candidates.filter(
      (candidate) => candidate.id !== id
    );

    setCandidates(updatedCandidates);

    localStorage.setItem(
      "candidates",
      JSON.stringify(updatedCandidates)
    );
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredCandidates = candidates.filter(
    (candidate) =>
      candidate.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      candidate.party
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      candidate.election
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 p-6">

      {/* ======================================
          HEADER
      ====================================== */}

     <div className="flex items-center justify-between mb-6">
  <div>
   <button
  type="button"
  onClick={() => navigate(-1)}
  className="mb-5 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-all duration-200 bg-white hover:text-indigo-600 hover:shadow-sm"
>
  <span className="text-lg leading-none transition-transform duration-200 group-hover:-translate-x-1">
    ←
  </span>
  <span>Back</span>
</button>

    <h1 className="text-3xl font-bold text-slate-900">
      Candidate Management
    </h1>

    <p className="text-slate-500 mt-1">
      Create, manage and monitor election candidates.
    </p>
  </div>

  <button
    onClick={() => setShowAddModal(true)}
    className="bg-indigo-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
  >
    + Add Candidate
  </button>
</div>

      {/* ======================================
          SEARCH
      ====================================== */}

      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">

        <div className="relative">

          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>

          <input
            type="text"
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-200 rounded-lg py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-indigo-500"
          />

        </div>

      </div>

      {/* ======================================
          CANDIDATE TABLE
      ====================================== */}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-200">

          <h2 className="text-lg font-semibold text-slate-900">
            All Candidates
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            {filteredCandidates.length} candidates found
          </p>

        </div>

        {filteredCandidates.length === 0 ? (

          <div className="py-16 text-center">

            <div className="text-5xl mb-4">
              👤
            </div>

            <h3 className="text-lg font-semibold text-slate-700">
              No candidates found
            </h3>

            <p className="text-slate-400 mt-1">
              Add a candidate to get started.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-50">

                <tr>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Candidate
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Party
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Election
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Symbol
                  </th>

                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredCandidates.map((candidate) => (

                  <tr
                    key={candidate.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >

                    {/* Candidate */}

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold">
                          {candidate.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>

                          <p className="font-semibold text-slate-800">
                            {candidate.name}
                          </p>

                          <p className="text-sm text-slate-400">
                            Candidate
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* Party */}

                    <td className="px-6 py-5 text-slate-600">
                      {candidate.party}
                    </td>

                    {/* Election */}

                    <td className="px-6 py-5 text-slate-600">
                      {candidate.election}
                    </td>

                    {/* Symbol */}

                    <td className="px-6 py-5">

                      {candidate.symbol ? (

                        <span className="px-3 py-1 bg-slate-100 rounded-md text-sm">
                          {candidate.symbol}
                        </span>

                      ) : (

                        <span className="text-slate-400">
                          —
                        </span>

                      )}

                    </td>

                    {/* Actions */}

                    <td className="px-6 py-5">

                      <div className="flex justify-end gap-2">

                        {/* VIEW */}

                        <button
                          onClick={() => handleView(candidate)}
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="View"
                        >
                          👁
                        </button>

                        {/* EDIT */}

                        <button
                          onClick={() => handleEdit(candidate)}
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit"
                        >
                          ✏️
                        </button>

                        {/* DELETE */}

                        <button
                          onClick={() =>
                            handleDelete(candidate.id)
                          }
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          🗑
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

      {/* ======================================
          ADD CANDIDATE MODAL
      ====================================== */}

      {showForm && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">

            {/* Modal Header */}

            <div className="flex items-center justify-between px-6 py-5 border-b">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Add Candidate
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Add a candidate to an election.
                </p>

              </div>

              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-700 text-xl"
              >
                ✕
              </button>

            </div>

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >

              {/* Name */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Candidate Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter candidate name"
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />

              </div>

              {/* Party */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Party *
                </label>

                <input
                  type="text"
                  name="party"
                  value={formData.party}
                  onChange={handleChange}
                  placeholder="Enter party name"
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />

              </div>

              {/* Election */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Election *
                </label>

                <input
                  type="text"
                  name="election"
                  value={formData.election}
                  onChange={handleChange}
                  placeholder="Enter election name"
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />

              </div>

              {/* Symbol */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Symbol
                </label>

                <input
                  type="text"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleChange}
                  placeholder="e.g. ⭐"
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />

              </div>

              {/* Buttons */}

              <div className="flex justify-end gap-3 pt-3">

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-3 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                >
                  Add Candidate
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ======================================
          VIEW CANDIDATE MODAL
      ====================================== */}

      {showView && selectedCandidate && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">

            {/* Header */}

            <div className="flex items-center justify-between px-6 py-5 border-b">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Candidate Details
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  View candidate information.
                </p>

              </div>

              <button
                onClick={() => setShowView(false)}
                className="text-slate-400 hover:text-slate-700 text-xl"
              >
                ✕
              </button>

            </div>

            {/* Details */}

            <div className="p-6 space-y-5">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold">
                  {selectedCandidate.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>

                  <h3 className="text-xl font-bold text-slate-800">
                    {selectedCandidate.name}
                  </h3>

                  <p className="text-sm text-slate-400">
                    Candidate
                  </p>

                </div>

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-400 uppercase">
                    Party
                  </p>

                  <p className="font-semibold text-slate-800 mt-1">
                    {selectedCandidate.party}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-400 uppercase">
                    Election
                  </p>

                  <p className="font-semibold text-slate-800 mt-1">
                    {selectedCandidate.election}
                  </p>
                </div>

              </div>

              <div className="bg-slate-50 rounded-lg p-4">

                <p className="text-xs text-slate-400 uppercase">
                  Symbol
                </p>

                <p className="font-semibold text-slate-800 mt-1">
                  {selectedCandidate.symbol || "No symbol"}
                </p>

              </div>

              <div className="flex justify-end">

                <button
                  onClick={() => setShowView(false)}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* ======================================
          EDIT CANDIDATE MODAL
      ====================================== */}

      {showEdit && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">

            {/* Header */}

            <div className="flex items-center justify-between px-6 py-5 border-b">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Edit Candidate
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Update candidate information.
                </p>

              </div>

              <button
                onClick={() => setShowEdit(false)}
                className="text-slate-400 hover:text-slate-700 text-xl"
              >
                ✕
              </button>

            </div>

            {/* Edit Form */}

            <form
              onSubmit={handleUpdate}
              className="p-6 space-y-5"
            >

              {/* Name */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Candidate Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleEditChange}
                  placeholder="Enter candidate name"
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />

              </div>

              {/* Party */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Party *
                </label>

                <input
                  type="text"
                  name="party"
                  value={editData.party}
                  onChange={handleEditChange}
                  placeholder="Enter party name"
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />

              </div>

              {/* Election */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Election *
                </label>

                <input
                  type="text"
                  name="election"
                  value={editData.election}
                  onChange={handleEditChange}
                  placeholder="Enter election name"
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />

              </div>

              {/* Symbol */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Symbol
                </label>

                <input
                  type="text"
                  name="symbol"
                  value={editData.symbol}
                  onChange={handleEditChange}
                  placeholder="e.g. ⭐"
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />

              </div>

              {/* Buttons */}

              <div className="flex justify-end gap-3 pt-3">

                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="px-5 py-3 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                >
                  Save Changes
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default Candidates;