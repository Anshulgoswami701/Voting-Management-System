import { useEffect, useRef, useState } from "react";
import * as HumanLib from "@vladmandic/human";

const humanConfig = {
  backend: "webgl",
  modelBasePath: "/models/human",
  filter: {
    enabled: true,
    equalization: true,
    flip: false,
  },
  face: {
    enabled: true,
    detector: {
      rotation: false,
      maxDetected: 1,
      minConfidence: 0.2,
      minSize: 120,
      scale: 1.2,
      iouThreshold: 0.2,
    },
    mesh: { enabled: false },
    attention: { enabled: false },
    iris: { enabled: false },
    description: { enabled: true, minConfidence: 0.2 },
    emotion: { enabled: false },
    antispoof: { enabled: false },
    liveness: { enabled: false },
  },
  body: { enabled: false },
  hand: { enabled: false },
  gesture: { enabled: false },
  object: { enabled: false },
  segmentation: { enabled: false },
};

const isValidDescriptor = (value) => Array.isArray(value) && value.length > 0 && value.every((entry) => Number.isFinite(entry));

const normalizeEmbedding = (embedding) => {
  if (!isValidDescriptor(embedding)) return null;
  
  let magnitude = 0;
  for (let i = 0; i < embedding.length; i++) {
    magnitude += embedding[i] * embedding[i];
  }
  magnitude = Math.sqrt(magnitude);
  
  if (magnitude === 0) return null;
  
  const normalized = new Array(embedding.length);
  for (let i = 0; i < embedding.length; i++) {
    normalized[i] = embedding[i] / magnitude;
  }
  return normalized;
};

const averageEmbeddings = (embeddings) => {
  if (!embeddings || embeddings.length === 0) return null;
  
  const normalized = embeddings.map(normalizeEmbedding).filter(e => e !== null);
  if (normalized.length === 0) return null;
  
  const length = normalized[0].length;
  const averaged = new Array(length).fill(0);
  
  for (let i = 0; i < normalized.length; i++) {
    for (let j = 0; j < length; j++) {
      averaged[j] += normalized[i][j];
    }
  }
  
  for (let j = 0; j < length; j++) {
    averaged[j] /= normalized.length;
  }
  
  return normalizeEmbedding(averaged);
};

const getFaceStatus = (state, faceCount = 0, failureReason = "") => {
  switch (state) {
    case "camera-loading":
      return "Camera loading...";
    case "no-face":
      return "No face detected. Position yourself in the frame.";
    case "multiple-faces":
      return "Multiple faces detected. Please keep only one person in view.";
    case "face-too-small":
      return "Face is too small. Move closer to the camera.";
    case "face-not-centered":
      return "Face is not centered. Keep your face near the center of the frame.";
    case "invalid-face":
      return "Face is not clear enough. Please adjust lighting and angle.";
    case "face-ready":
      return "Face is ready. Hold still while the descriptor is generated.";
    case "capturing":
      return "Capturing face...";
    case "descriptor-generated":
      return "Descriptor generated successfully.";
    case "webcam-error":
      return "Camera access denied or unavailable.";
    case "model-error":
      return "Face model could not be loaded.";
    case "face-detection-error":
      return "Face detection failed.";
    case "descriptor-error":
      return failureReason || "Descriptor generation failed.";
    default:
      return faceCount === 0
        ? "No face detected. Position yourself in the frame."
        : "Face detected. Keep your face centered and still.";
  }
};

function FaceVerificationCapture({ onFaceCaptured = () => {} }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const humanRef = useRef(null);
  const animationFrameRef = useRef(null);
  const captureLockRef = useRef(false);
  const capturedFramesRef = useRef([]);
  const REQUIRED_FRAMES = 8;

  const [status, setStatus] = useState(getFaceStatus("camera-loading"));
  const [faceCount, setFaceCount] = useState(0);
  const [captureState, setCaptureState] = useState("camera-loading");
  const [failureReason, setFailureReason] = useState("");
  const [descriptor, setDescriptor] = useState(null);
  const [framesCollected, setFramesCollected] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const stopCamera = () => {
      if (humanRef.current?.webcam?.stop) {
        humanRef.current.webcam.stop();
      }

      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };

    const initialize = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCaptureState("webcam-error");
        setFailureReason("This browser does not support webcam access.");
        setStatus(getFaceStatus("webcam-error", 0, "This browser does not support webcam access."));
        return;
      }

      try {
        const human = new HumanLib.Human(humanConfig);
        humanRef.current = human;

        human.draw.options.drawBoxes = true;
        human.draw.options.drawLabels = true;
        human.draw.options.drawPoints = false;

        await human.load();

        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas || cancelled) {
          return;
        }

        try {
          await human.webcam.start({
            element: video,
            crop: true,
            width: 640,
            height: 480,
            id: (await human.webcam.enumerate())[0]?.deviceId,
          });
        } catch (cameraError) {
          if (!cancelled) {
            setCaptureState("webcam-error");
            setFailureReason("Camera permission was denied or the camera is unavailable.");
            setStatus(getFaceStatus("webcam-error", 0, "Camera permission was denied or the camera is unavailable."));
          }
          return;
        }

        canvas.width = human.webcam.width || 640;
        canvas.height = human.webcam.height || 480;

        const processFrame = async () => {
          if (cancelled || !video || !canvas) {
            return;
          }

          try {
            if (!video.paused) {
              await human.detect(video);

              const detectedFaces = Array.isArray(human.result?.face) ? human.result.face : [];
              const currentFaceCount = detectedFaces.length;
              setFaceCount(currentFaceCount);

              const face = detectedFaces[0];

              if (currentFaceCount === 0) {
                setCaptureState("no-face");
                setFailureReason("");
                setStatus(getFaceStatus("no-face", 0));
                captureLockRef.current = false;
              } else if (currentFaceCount > 1) {
                setCaptureState("multiple-faces");
                setFailureReason("");
                setStatus(getFaceStatus("multiple-faces", currentFaceCount));
                captureLockRef.current = false;
              } else if (!face || !face.box) {
                setCaptureState("face-detection-error");
                setFailureReason("Unable to read face data from the current frame.");
                setStatus(getFaceStatus("face-detection-error", 1, "Unable to read face data from the current frame."));
                captureLockRef.current = false;
              } else {
                const [x, y, width, height] = face.box;
                const centerX = x + width / 2;
                const centerY = y + height / 2;
                const frameWidth = video.videoWidth || 640;
                const frameHeight = video.videoHeight || 480;
                const normalizedCenterX = centerX / frameWidth;
                const normalizedCenterY = centerY / frameHeight;
                const minFaceSize = 140;
                const isFaceTooSmall = width < minFaceSize || height < minFaceSize;
                const isFaceNotCentered = normalizedCenterX < 0.2 || normalizedCenterX > 0.8 || normalizedCenterY < 0.2 || normalizedCenterY > 0.8;
                const faceConfidence = Number.isFinite(face.faceScore) ? face.faceScore : Number.isFinite(face.boxScore) ? face.boxScore : 0;
                const hasUsableFaceScore = Number.isFinite(faceConfidence) && faceConfidence > 0;
                const descriptorCandidate = Array.isArray(face.embedding) ? face.embedding : [];
                const hasValidDescriptor = isValidDescriptor(descriptorCandidate);

                if (isFaceTooSmall) {
                  setCaptureState("face-too-small");
                  setFailureReason("");
                  setStatus(getFaceStatus("face-too-small", 1));
                  captureLockRef.current = false;
                } else if (isFaceNotCentered) {
                  setCaptureState("face-not-centered");
                  setFailureReason("");
                  setStatus(getFaceStatus("face-not-centered", 1));
                  captureLockRef.current = false;
                } else if (!hasUsableFaceScore && !hasValidDescriptor) {
                  setCaptureState("invalid-face");
                  setFailureReason("Face is not clear enough. Please adjust lighting and angle.");
                  setStatus(getFaceStatus("invalid-face", 1, "Face is not clear enough. Please adjust lighting and angle."));
                  captureLockRef.current = false;
                } else if (!hasValidDescriptor) {
                  setCaptureState("face-ready");
                  setFailureReason("");
                  setStatus(getFaceStatus("face-ready", 1));
                } else if (!captureLockRef.current) {
                  // Frame is valid - add to collection
                  const validDescriptor = descriptorCandidate.filter((value) => Number.isFinite(value));

                  if (!isValidDescriptor(validDescriptor)) {
                    setCaptureState("descriptor-error");
                    setFailureReason("Descriptor generation failed: invalid numeric values were returned.");
                    setStatus(getFaceStatus("descriptor-error", 1, "Descriptor generation failed: invalid numeric values were returned."));
                    return;
                  }

                  capturedFramesRef.current.push(validDescriptor);
                  const newCount = capturedFramesRef.current.length;
                  setFramesCollected(newCount);

                  if (newCount < REQUIRED_FRAMES) {
                    setCaptureState("capturing");
                    setFailureReason("");
                    setStatus(getFaceStatus("capturing", 1));
                  } else {
                    // All required frames collected - average them
                    captureLockRef.current = true;
                    setCaptureState("capturing");
                    setFailureReason("");
                    setStatus(getFaceStatus("capturing", 1));

                    setTimeout(() => {
                      if (!cancelled) {
                        const averagedDescriptor = averageEmbeddings(capturedFramesRef.current);

                        if (!isValidDescriptor(averagedDescriptor)) {
                          setCaptureState("descriptor-error");
                          setFailureReason("Failed to process captured frames. Please try again.");
                          setStatus(getFaceStatus("descriptor-error", 1, "Failed to process captured frames. Please try again."));
                          capturedFramesRef.current = [];
                          setFramesCollected(0);
                          captureLockRef.current = false;
                          return;
                        }

                        setDescriptor(averagedDescriptor);
                        setCaptureState("descriptor-generated");
                        setFailureReason("");
                        setStatus(getFaceStatus("descriptor-generated", 1));
                        onFaceCaptured(averagedDescriptor);
                      }
                    }, 150);
                  }
                }
              }

              const interpolated = human.next(human.result);
              human.draw.canvas(video, canvas);
              await human.draw.all(canvas, interpolated, {
                drawBoxes: true,
                drawLabels: true,
                drawPoints: false,
                color: "#f97316",
              });
            }

            animationFrameRef.current = requestAnimationFrame(processFrame);
          } catch (loopError) {
            if (!cancelled) {
              setCaptureState("face-detection-error");
              setFailureReason("Face detection failed while processing the current frame.");
              setStatus(getFaceStatus("face-detection-error", 0, "Face detection failed while processing the current frame."));
            }
          }
        };

        processFrame();
      } catch (loadError) {
        if (!cancelled) {
          setCaptureState("model-error");
          setFailureReason("The face model could not be loaded.");
          setStatus(getFaceStatus("model-error", 0, "The face model could not be loaded."));
        }
      }
    };

    initialize();

    return () => {
      cancelled = true;
      captureLockRef.current = false;
      capturedFramesRef.current = [];

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      stopCamera();
    };
  }, [onFaceCaptured]);

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
            Phase 1
          </p>
          <h2 className="text-xl font-semibold text-slate-900">Face verification setup</h2>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {faceCount} face{faceCount === 1 ? "" : "s"}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="block h-[360px] w-full object-cover"
        />
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-sm font-medium text-slate-800">{status}</p>
        <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-600">
          <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1">
            {captureState}
          </span>
          {captureState === "capturing" && framesCollected > 0 ? (
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-blue-700">
              {framesCollected}/{REQUIRED_FRAMES} frames
            </span>
          ) : null}
          {descriptor ? (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700">
              {descriptor.length} values (normalized)
            </span>
          ) : null}
        </div>
        <ul className="text-xs text-slate-600">
          <li>• Webcam preview is active.</li>
          <li>• Face detection and embedding generation occur in the browser.</li>
          <li>• Multiple frames are captured and averaged for better reliability.</li>
        </ul>
      </div>

      {failureReason ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {failureReason}
        </div>
      ) : null}
    </div>
  );
}

export default FaceVerificationCapture;
