const isVoterEligibleForElection = (election, voter) => {
  if (!election || !voter || voter.role !== "voter") return false;
  if (voter.status !== "active" || voter.accountStatus === "blocked") return false;
  if (voter.verificationStatus !== "verified") return false;

  if (election.eligibility === "selected_voters") {
    return (election.eligibleVoters || []).some(
      (voterId) => String(voterId) === String(voter._id)
    );
  }

  return true;
};

module.exports = { isVoterEligibleForElection };
