const path = require("path");
const { spawn } = require("child_process");
const crypto = require("crypto");

const workerPath = path.join(__dirname, "..", "pad", "pad_worker.py");
let worker = null;
let workerOutput = "";
let workerReady = false;
const pendingRequests = new Map();

const startWorker = () => {
  if (worker && worker.exitCode === null) return worker;

  const executable = process.env.PAD_PYTHON_EXECUTABLE || "py";
  const args = process.env.PAD_PYTHON_EXECUTABLE ? [workerPath] : ["-3.13", workerPath];
  workerReady = false;
  workerOutput = "";
  worker = spawn(executable, args, { windowsHide: true });

  worker.stderr.on("data", () => {});
  worker.stdout.on("data", (chunk) => {
    workerOutput += chunk.toString();
    const lines = workerOutput.split(/\r?\n/);
    workerOutput = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const result = JSON.parse(line);
        if (result.ready) {
          workerReady = true;
          return;
        }
        const callback = pendingRequests.get(result.id);
        if (callback) {
          pendingRequests.delete(result.id);
          callback.resolve(result);
        }
      } catch {}
    }
  });

  worker.on("error", (error) => {
    for (const callback of pendingRequests.values()) callback.reject(error);
    pendingRequests.clear();
    worker = null;
  });
  worker.on("close", () => {
    for (const callback of pendingRequests.values()) {
      callback.reject(new Error("PAD worker stopped unexpectedly."));
    }
    pendingRequests.clear();
    worker = null;
  });

  return worker;
};

const runServerPad = (frames) => new Promise((resolve, reject) => {
  if (!Array.isArray(frames) || frames.length < 4 || frames.length > 12) {
    resolve({ passed: false, error: "Four to twelve camera frames are required." });
    return;
  }

  const frameImages = frames.map((frame) => typeof frame === "string" ? frame : frame?.image);
  const id = crypto.randomUUID();
  pendingRequests.set(id, { resolve, reject });
  const activeWorker = startWorker();
  if (!activeWorker?.stdin?.writable) {
    pendingRequests.delete(id);
    reject(new Error("PAD worker is unavailable."));
    return;
  }
  activeWorker.stdin.write(`${JSON.stringify({ id, frames: frameImages })}\n`);
});

const stopWorker = () => {
  if (worker) {
    worker.kill("SIGTERM");
    worker = null;
  }
  pendingRequests.clear();
};

startWorker();

module.exports = { runServerPad, startWorker, stopWorker };
