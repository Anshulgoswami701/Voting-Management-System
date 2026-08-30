import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Award, TrendingUp, BarChart3, Users } from "lucide-react";
import { toast } from "react-toastify";

function VoterResults() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==========================================
  // FETCH ELECTION
  // ==========================================
  useEffect(() => {
    const fetchElection = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5000/api/elections/voter/${electionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          setError("Election not found");
          return;
        }

        const data = await response.json();
        setElection(data.election);
      } catch (error) {
        setError("Failed to load election");
        console.error(error);
      }
    };

    fetchElection();
  }, [electionId]);

  // ==========================================
  // FETCH RESULTS
  // ==========================================
  useEffect(() => {
    if (!electionId) return;

    const fetchResults = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5000/api/results/${electionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          const data = await response.json();
          setError(data.message || "Results not available");
          return;
        }

        const data = await response.json();
        setResults(data.result);
        setError(null);
      } catch (error) {
        setError("Failed to load results");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [electionId]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to- br from-slate-900 to-slate-800 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-red-600/30 bg-red-900/20 p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-300 mb-2">
            Results Not Available
          </h2>
          <p className="text-lg text-red-200 mb-6">{error}</p>
          <button
            onClick={() => navigate("/voter/elections")}
            className="rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-indigo-700"
          >
            Back to Elections
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to- br from-slate-900 to-slate-800">
      {/* HEADER */}
      <div className="sticky top-0 z-40 border-b border-slate-700 bg-slate-950/80 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/voter/elections")}
            className="rounded-lg border border-slate-600 bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 transition"
          >
            <ChevronLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-white">Election Results</h1>
            <p className="text-base text-slate-400 mt-1">
              {election?.title || "Loading..."}
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="inline-flex h-16 w-16 animate-spin rounded-full border-4 border-slate-600 border-t-indigo-500 mb-4" />
              <p className="text-lg text-slate-300">Loading results...</p>
            </div>
          </div>
        ) : results ? (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* ELECTION INFO & STATS */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800 overflow-hidden">
              <div className="bg-gradient-to- r from-indigo-600 to-indigo-700 px-8 py-8">
                <h2 className="text-4xl font-bold text-white mb-2">
                  {results.election.title}
                </h2>
                <p className="text-lg text-indigo-200">
                  Official Election Results
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 p-8 border-b border-slate-700">
                <div className="rounded-xl bg-gradient-to- br from-slate-700 to-slate-800 p-6 text-center">
                  <Users size={36} className="mx-auto text-indigo-400 mb-3" />
                  <p className="text-base text-slate-400 uppercase tracking-wide">Total Votes Cast</p>
                  <p className="mt-3 text-5xl font-bold text-white">
                    {results.totalVotes}
                  </p>
                </div>

                <div className="rounded-xl bg-gradient-to- br from-slate-700 to-slate-800 p-6 text-center">
                  <BarChart3 size={36} className="mx-auto text-purple-400 mb-3" />
                  <p className="text-base text-slate-400 uppercase tracking-wide">Candidates</p>
                  <p className="mt-3 text-5xl font-bold text-white">
                    {results.results.length}
                  </p>
                </div>

                <div className="rounded-xl bg-gradient-to- br from-slate-700 to-slate-800 p-6 text-center">
                  <TrendingUp size={36} className="mx-auto text-emerald-400 mb-3" />
                  <p className="text-base text-slate-400 uppercase tracking-wide">Status</p>
                  <p className="mt-3 text-lg font-bold text-emerald-300 uppercase">
                    Published
                  </p>
                </div>
              </div>
            </div>

            {/* WINNER HIGHLIGHT */}
            {results.winner && (
              <div className="rounded-2xl border-2 border-yellow-500/50 bg-gradient-to- br from-yellow-900/30 to-yellow-800/20 overflow-hidden">
                <div className="bg-gradient-to- r from-yellow-600 to-yellow-700 px-8 py-8">
                  <div className="flex items-center gap-4">
                    <Award size={48} className="text-yellow-300" />
                    <div>
                      <p className="text-xl text-yellow-200 font-semibold uppercase">🏆 Election Winner</p>
                      <h3 className="text-4xl font-bold text-white mt-2">
                        {results.winner.name}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      {results.winner.party && (
                        <p className="text-sm text-slate-400 uppercase tracking-widest">Political Party</p>
                      )}
                      <p className="mt-2 text-3xl font-bold text-yellow-300">
                        {results.winner.party || "Independent"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400 uppercase tracking-widest">Vote Share</p>
                      <p className="mt-2 text-5xl font-bold text-white">
                        {results.winner.percentage}%
                      </p>
                      <p className="text-lg text-slate-300 mt-2">
                        {results.winner.votes} votes total
                      </p>
                    </div>
                  </div>

                  {/* WINNER PROGRESS BAR */}
                  <div className="mt-6">
                    <p className="text-sm text-slate-400 mb-3 uppercase tracking-wide">Vote Distribution</p>
                    <div className="h-6 overflow-hidden rounded-full bg-slate-700 border-2 border-yellow-500/30">
                      <div
                        className="h-full bg-gradient-to- r from-yellow-500 to-yellow-400 transition-all duration-700 shadow-lg shadow-yellow-500/50"
                        style={{ width: `${results.winner.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DETAILED RESULTS TABLE */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800 overflow-hidden">
              <div className="bg-gradient-to- r from-indigo-600 to-indigo-700 px-8 py-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <BarChart3 size={28} />
                  Complete Results by Candidate
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-700/50">
                      <th className="px-8 py-4 text-left text-lg font-semibold text-slate-300">Rank</th>
                      <th className="px-8 py-4 text-left text-lg font-semibold text-slate-300">Candidate Name</th>
                      <th className="px-8 py-4 text-left text-lg font-semibold text-slate-300">Party Affiliation</th>
                      <th className="px-8 py-4 text-center text-lg font-semibold text-slate-300">Vote Count</th>
                      <th className="px-8 py-4 text-center text-lg font-semibold text-slate-300">Vote %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.results
                      .sort((a, b) => b.votes - a.votes)
                      .map((candidate, index) => (
                        <tr
                          key={candidate.candidateId}
                          className="border-b border-slate-700 hover:bg-slate-700/50 transition"
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center justify-center">
                              <span className={`h-12 w-12 rounded-full flex items-center justify-center text-xl font-bold text-white ${
                                index === 0 ? 'bg-yellow-600 shadow-lg shadow-yellow-500/50' : 
                                index === 1 ? 'bg-gray-500' : 
                                'bg-orange-700'
                              }`}>
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-xl font-bold text-white">
                              {candidate.name}
                            </p>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-base text-slate-300">
                              {candidate.party || "Independent"}
                            </p>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <p className="text-2xl font-bold text-indigo-300">
                              {candidate.votes}
                            </p>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <p className="text-2xl font-bold text-white">
                              {candidate.percentage}%
                            </p>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* VISUAL BREAKDOWN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.results
                .sort((a, b) => b.votes - a.votes)
                .map((candidate, index) => (
                  <div
                    key={candidate.candidateId}
                    className="rounded-xl bg-gradient-to- br from-slate-700 to-slate-800 p-6 border border-slate-600 hover:border-slate-500 transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-slate-400 uppercase tracking-wide font-semibold">
                          {index === 0 ? '🥇 Rank 1st' : index === 1 ? '🥈 Rank 2nd' : index === 2 ? '🥉 Rank 3rd' : `Rank #${index + 1}`}
                        </p>
                        <h4 className="text-2xl font-bold text-white mt-2">
                          {candidate.name}
                        </h4>
                        <p className="text-base text-indigo-300 mt-1 font-semibold">
                          {candidate.party || "Independent"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Total Votes</p>
                        <p className="text-4xl font-bold text-white mt-1">
                          {candidate.votes}
                        </p>
                      </div>
                    </div>

                    {/* PROGRESS BAR */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Vote Share</span>
                        <span className="text-lg font-bold text-white">{candidate.percentage}%</span>
                      </div>
                      <div className="h-4 overflow-hidden rounded-full bg-slate-600">
                        <div
                          className={`h-full transition-all duration-500 ${
                            index === 0
                              ? 'bg-gradient-to- r from-yellow-500 to-yellow-400'
                              : 'bg-gradient-to- r from-indigo-500 to-indigo-400'
                          }`}
                          style={{ width: `${candidate.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/voter/elections")}
                className="flex-1 rounded-lg bg-slate-700 hover:bg-slate-600 px-6 py-4 text-lg font-bold text-white transition"
              >
                ← View Other Elections
              </button>
              <button
                onClick={() => navigate("/voter/history")}
                className="flex-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-6 py-4 text-lg font-bold text-white transition"
              >
                📋 View My Voting History
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default VoterResults;
