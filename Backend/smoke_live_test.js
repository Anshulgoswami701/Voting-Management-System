require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Election = require('./models/election');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB_CONNECT_OK');

    const unique = Date.now();
    const adminEmail = `admin_live_${unique}@example.com`;
    const voterEmail = `voter_live_${unique}@example.com`;

    const admin = await User.findOneAndUpdate(
      { email: adminEmail },
      {
        fullName: 'Live Admin',
        email: adminEmail,
        password: await bcrypt.hash('Secure@123', 10),
        role: 'admin',
        status: 'active',
        verificationStatus: 'verified',
        accountStatus: 'active',
        hasVoted: false
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    const voter = await User.findOneAndUpdate(
      { email: voterEmail },
      {
        fullName: 'Live Voter',
        email: voterEmail,
        voterId: `VOT${unique}`,
        password: await bcrypt.hash('Secure@123', 10),
        role: 'voter',
        status: 'active',
        verificationStatus: 'verified',
        accountStatus: 'active',
        hasVoted: false
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    const adminToken = jwt.sign({ userId: admin._id.toString(), role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const voterToken = jwt.sign({ userId: voter._id.toString(), role: 'voter' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const electionBody = {
      title: `Live Election ${unique}`,
      description: 'Live smoke test election',
      startDate: tomorrow.toISOString().slice(0, 10),
      endDate: inThreeDays.toISOString().slice(0, 10)
    };

    const electionRes = await fetch('http://localhost:5000/api/elections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify(electionBody)
    });

    const electionData = await electionRes.json();
    console.log('CREATE_ELECTION_STATUS', electionRes.status);
    console.log('CREATE_ELECTION_BODY', JSON.stringify(electionData));

    const electionId = electionData.election && electionData.election._id;
    if (!electionId) throw new Error('Election missing from create response');

    await Election.findByIdAndUpdate(electionId, {
      $set: {
        status: 'active',
        startDate: new Date(Date.now() - 60 * 1000),
        endDate: new Date(Date.now() + 2 * 60 * 60 * 1000)
      }
    });

    const candidateRes = await fetch('http://localhost:5000/api/candidates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Candidate One',
        candidateId: `C-${unique}-1`,
        election: electionId,
        party: 'Party A',
        description: 'Candidate one'
      })
    });

    const candidateData = await candidateRes.json();
    console.log('CREATE_CANDIDATE_STATUS', candidateRes.status);
    console.log('CREATE_CANDIDATE_BODY', JSON.stringify(candidateData));

    const candidateId = candidateData.candidate && candidateData.candidate._id;
    if (!candidateId) throw new Error('Candidate missing from create response');

    const listRes = await fetch(`http://localhost:5000/api/votes/election/${electionId}/candidates`, {
      headers: {
        Authorization: `Bearer ${voterToken}`
      }
    });
    const listData = await listRes.json();
    console.log('GET_CANDIDATES_STATUS', listRes.status);
    console.log('GET_CANDIDATES_BODY', JSON.stringify(listData));

    const voteRes = await fetch('http://localhost:5000/api/votes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${voterToken}`
      },
      body: JSON.stringify({ electionId, candidateId })
    });
    const voteData = await voteRes.json();
    console.log('SUBMIT_VOTE_STATUS', voteRes.status);
    console.log('SUBMIT_VOTE_BODY', JSON.stringify(voteData));

    await Election.findByIdAndUpdate(electionId, {
      $set: {
        status: 'ended',
        endDate: new Date(Date.now() - 60 * 1000),
        resultsPublished: false
      }
    });

    const publishRes = await fetch(`http://localhost:5000/api/results/${electionId}/publish`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      }
    });

    const publishData = await publishRes.json();
    console.log('PUBLISH_RESULTS_STATUS', publishRes.status);
    console.log('PUBLISH_RESULTS_BODY', JSON.stringify(publishData));

    const resultsRes = await fetch(`http://localhost:5000/api/results/${electionId}`, {
      headers: {
        Authorization: `Bearer ${voterToken}`
      }
    });
    const resultsData = await resultsRes.json();
    console.log('GET_RESULTS_STATUS', resultsRes.status);
    console.log('GET_RESULTS_BODY', JSON.stringify(resultsData));

    console.log('SUMMARY', JSON.stringify({
      electionId,
      candidateId,
      voterId: voter._id.toString(),
      adminId: admin._id.toString(),
      voteWinner: resultsData && resultsData.result && resultsData.result.winner
    }));

    await mongoose.disconnect();
  } catch (err) {
    console.error('LIVE_TEST_ERROR', err && err.stack ? err.stack : String(err));
    process.exit(1);
  }
})();
