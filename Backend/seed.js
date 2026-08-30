require('dotenv').config();
const mongoose = require('mongoose');
const Election = require('./models/election');
const Candidate = require('./models/candidate');
const Vote = require('./models/vote');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // Get admin
    const admin = await User.findOne({ email: 'e2eadmin1788079188931@example.com' });
    if (!admin) {
      console.error('Admin not found');
      process.exit(1);
    }

    // Create voters
    const ts = Date.now();
    const v1 = await User.create({
      fullName: 'Voter One',
      email: `v1${ts}@test.com`,
      voterId: `VOT${ts}1`,
      password: await bcrypt.hash('Pass123', 10),
      role: 'voter',
      status: 'active',
    });

    const v2 = await User.create({
      fullName: 'Voter Two',
      email: `v2${ts}@test.com`,
      voterId: `VOT${ts}2`,
      password: await bcrypt.hash('Pass123', 10),
      role: 'voter',
      status: 'active',
    });

    const v3 = await User.create({
      fullName: 'Voter Three',
      email: `v3${ts}@test.com`,
      voterId: `VOT${ts}3`,
      password: await bcrypt.hash('Pass123', 10),
      role: 'voter',
      status: 'active',
    });

    console.log('✓ Voters created');

    // Create election
    const election = await Election.create({
      title: 'Presidential Election 2024',
      description: 'Choose your next president. This is a crucial election to determine the future direction of our nation.',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-02'),
      status: 'ended',
      resultsPublished: false,
      createdBy: admin._id,
    });

    console.log('✓ Election created');

    // Create candidates
    const c1 = await Candidate.create({
      name: 'John Smith',
      candidateId: 'C001',
      party: 'Democratic Party',
      position: 'President',
      manifesto: 'Focus on economy and education. Strong supporter of workers rights and sustainable development.',
      election: election._id,
    });

    const c2 = await Candidate.create({
      name: 'Jane Doe',
      candidateId: 'C002',
      party: 'Republican Party',
      position: 'President',
      manifesto: 'Focus on security and infrastructure. Committed to national defense and economic growth.',
      election: election._id,
    });

    const c3 = await Candidate.create({
      name: 'Mike Johnson',
      candidateId: 'C003',
      party: 'Independent',
      position: 'President',
      manifesto: 'Focus on environment and health. Believes in balanced approach to all issues.',
      election: election._id,
    });

    console.log('✓ Candidates created');

    // Create votes
    await Vote.create({ voter: v1._id, candidate: c1._id, election: election._id });
    await Vote.create({ voter: v2._id, candidate: c1._id, election: election._id });
    await Vote.create({ voter: v3._id, candidate: c2._id, election: election._id });

    console.log('✓ Votes created');
    console.log('\n📊 Results:');
    console.log('  John Smith (Democratic): 2 votes (67%)');
    console.log('  Jane Doe (Republican): 1 vote (33%)');
    console.log('  Mike Johnson (Independent): 0 votes (0%)');
    console.log('\n✓ Sample data successfully created!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

seedDatabase();
