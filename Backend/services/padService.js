const path = require("path");
const { spawn } = require("child_process");

const workerPath = path.join(__dirname, "..", "pad", "pad_worker.py");

const runServerPad = (frames) => new Promise((resolve, reject) => {
  if (!Array.isArray(frames) || frames.length < 6 || frames.length > 12) {
    resolve({ passed: false, error: "Six to twelve camera frames are required." });
    return;
  }

  const executable = process.env.PAD_PYTHON_EXECUTABLE || "py";
  const args = process.env.PAD_PYTHON_EXECUTABLE ? [workerPath] : ["-3.13", workerPath];
  const worker = spawn(executable, args, { windowsHide: true });
  let output = "";
  let errorOutput = "";

  worker.stdout.on("data", (chunk) => { output += chunk.toString(); });
  worker.stderr.on("data", (chunk) => { errorOutput += chunk.toString(); });
  worker.on("error", reject);
  worker.on("close", (code) => {
    const lines = output.trim().split(/\r?\n/).filter(Boolean);
    const lastLine = lines[lines.length - 1];
    try {
      const result = JSON.parse(lastLine || "{}");
      if (code !== 0 && !result.error) result.error = errorOutput.trim() || "PAD worker failed.";
      resolve(result);
    } catch (error) {
      reject(new Error(errorOutput.trim() || "PAD worker returned invalid output."));
    }
  });

  const frameImages = frames.map((frame) => typeof frame === "string" ? frame : frame?.image);
  worker.stdin.end(JSON.stringify({ frames: frameImages }));
});

module.exports = { runServerPad };
