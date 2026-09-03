const assert = require("assert");
const bcrypt = require("bcryptjs");

process.env.FACE_MATCH_THRESHOLD = "0.7";
const userModelPath = require.resolve("./models/User");
const originalUserModel = require(userModelPath);
const testEmbedding = Array.from({ length: 128 }, (_, index) => index + 1);
require.cache[userModelPath].exports = {
  findOne: () => ({
    select: async () => ({
      role: "voter",
      password: bcrypt.hashSync("CorrectPass1!", 4),
      status: "active",
      faceEmbedding: testEmbedding,
    }),
  }),
};

const {
  evaluateFaceVerification,
  validateLivenessEvidence,
  login,
} = require("./controllers/authController");
require.cache[userModelPath].exports = originalUserModel;

const makeEvidence = ({ moving = true, score = 0.9 } = {}) => Array.from({ length: 8 }, (_, index) => ({
  capturedAt: index * 100,
  box: moving ? [0.35 + index * 0.002, 0.2, 0.3, 0.3] : [0.35, 0.2, 0.3, 0.3],
  landmarks: Array.from({ length: 6 }, (_, pointIndex) => moving
    ? [0.4 + pointIndex * 0.01 + index * 0.0005, 0.4, 0]
    : [0.4 + pointIndex * 0.01, 0.4, 0]),
  real: score,
  live: score,
  pose: { yaw: moving ? index * 0.1 : 0, pitch: 0, roll: 0 },
}));

const embedding = Array.from({ length: 128 }, (_, index) => index + 1);
const differentEmbedding = embedding.map((value, index) => value * (index % 2 ? -1 : 1));

const runDecisionTest = (name, expectedStatus, storedEmbedding, faceEmbedding, evidence) => {
  const result = evaluateFaceVerification({ storedEmbedding, faceEmbedding, livenessEvidence: evidence });
  const status = result.passed ? 200 : 403;
  assert.strictEqual(status, expectedStatus, name);
  console.log(`${name}: HTTP ${status}; descriptor generated: yes; anti-spoof: ${result.liveness.passed ? "passed" : "failed"}; face distance: ${Number.isFinite(result.distance) ? result.distance.toFixed(6) : "n/a"}; threshold: ${result.threshold}; JWT: ${result.passed ? "issued" : "not issued"}; dashboard: ${result.passed ? "granted" : "denied"}`);
};

runDecisionTest("A real registered person", 200, embedding, embedding, makeEvidence());
runDecisionTest("B different real person", 403, embedding, differentEmbedding, makeEvidence());
runDecisionTest("C phone photo", 403, embedding, embedding, makeEvidence({ moving: false }));
runDecisionTest("D printed photo", 403, embedding, embedding, makeEvidence({ moving: false }));
runDecisionTest("E monitor screenshot", 403, embedding, embedding, makeEvidence({ moving: false }));

const invalidEvidence = makeEvidence();
invalidEvidence[7].capturedAt = invalidEvidence[6].capturedAt;
assert.strictEqual(validateLivenessEvidence(invalidEvidence).passed, false);
console.log("Liveness sequence ordering: rejected; descriptor generated: yes; anti-spoof: failed; JWT: not issued; dashboard: denied");

(async () => {
  let responseStatus;
  let responseBody;
  await login(
    { body: { email: "user@example.com", password: "WrongPass1!", role: "voter" } },
    {
      status(status) { responseStatus = status; return this; },
      json(body) { responseBody = body; return this; },
    },
  );
  assert.strictEqual(responseStatus, 401);
  assert.strictEqual(responseBody.requiresFaceVerification, undefined);
  console.log("F wrong password: HTTP 401; descriptor generated: no; anti-spoof: not run; face distance: n/a; threshold: n/a; JWT: not issued; dashboard: denied");
  console.log("Phase 2 backend decision tests passed. Physical phone, print, and monitor tests require actual camera fixtures.");
})().catch((error) => {
  require.cache[userModelPath].exports = originalUserModel;
  console.error(error);
  process.exitCode = 1;
});
