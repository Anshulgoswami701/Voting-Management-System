const fs = require("fs");
const path = require("path");
const { runServerPad } = require("./services/padService");

const toDataUrl = (filePath) => {
  const image = fs.readFileSync(filePath).toString("base64");
  return `data:image/jpeg;base64,${image}`;
};

const makeFrames = (filePath, forgedScores = false) => Array.from({ length: 6 }, () => ({
  image: toDataUrl(filePath),
  real: forgedScores ? 1 : undefined,
  live: forgedScores ? 1 : undefined,
  isLive: forgedScores ? true : undefined,
}));

const run = async () => {
  const realSample = process.env.PAD_REAL_SAMPLE;
  const spoofSample = process.env.PAD_SPOOF_SAMPLE;

  if (!realSample || !spoofSample) {
    console.log("PAD fixture test skipped: set PAD_REAL_SAMPLE and PAD_SPOOF_SAMPLE to camera-captured fixtures.");
    return;
  }

  for (const [name, filePath, expected] of [
    ["real person", realSample, true],
    ["static/spoof sample", spoofSample, false],
  ]) {
    const result = await runServerPad(makeFrames(path.resolve(filePath), name === "static/spoof sample"));
    if (result.passed !== expected) {
      throw new Error(`${name} expected passed=${expected}, received ${JSON.stringify(result)}`);
    }
    console.log(`${name}: PAD ${result.passed ? "PASS" : "REJECT"}; frame count: ${result.frameCount}; average score: ${Number(result.averageScore || 0).toFixed(6)}; threshold: ${result.threshold}`);
  }

  console.log("forged client PAD scores: ignored; decision came from server-side frame inference");
};

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
