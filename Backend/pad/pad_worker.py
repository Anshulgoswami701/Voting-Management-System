import base64
import json
import os
import sys

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.abspath(__file__))
VENDOR = os.path.join(ROOT, "vendor", "Silent-Face-Anti-Spoofing")
os.chdir(VENDOR)
sys.path.insert(0, VENDOR)

from src.anti_spoof_predict import AntiSpoofPredict
from src.generate_patches import CropImage
from src.utility import parse_model_name

MODEL_DIR = os.path.join(VENDOR, "resources", "anti_spoof_models")
MODEL_PATHS = [
    os.path.join(MODEL_DIR, "2.7_80x80_MiniFASNetV2.pth"),
    os.path.join(MODEL_DIR, "4_0_0_80x80_MiniFASNetV1SE.pth"),
]
PAD_THRESHOLD = float(os.environ.get("PAD_REAL_THRESHOLD", "0.60"))


def predict_frame(predictor, cropper, encoded):
    if not isinstance(encoded, str) or "," not in encoded:
        raise ValueError("Invalid frame encoding")
    raw = base64.b64decode(encoded.split(",", 1)[1], validate=True)
    image = cv2.imdecode(np.frombuffer(raw, dtype=np.uint8), cv2.IMREAD_COLOR)
    if image is None or image.size == 0:
        raise ValueError("Frame could not be decoded")

    bbox = predictor.get_bbox(image)
    prediction = np.zeros((1, 3), dtype=np.float32)
    for model_path in MODEL_PATHS:
        height, width, _, scale = parse_model_name(os.path.basename(model_path))
        params = {
            "org_img": image,
            "bbox": bbox,
            "scale": scale,
            "out_w": width,
            "out_h": height,
            "crop": True,
        }
        patch = cropper.crop(**params)
        prediction += predictor.predict(patch, model_path)

    label = int(np.argmax(prediction))
    score = float(prediction[0][label] / 2)
    return {"real": label == 1, "score": score}


def main():
    request = json.loads(sys.stdin.read())
    frames = request.get("frames")
    if not isinstance(frames, list) or not 6 <= len(frames) <= 12:
        raise ValueError("Six to twelve frames are required")

    predictor = AntiSpoofPredict(-1)
    cropper = CropImage()
    results = [predict_frame(predictor, cropper, frame) for frame in frames]
    scores = [result["score"] for result in results]
    real_count = sum(1 for result in results if result["real"])
    passed = real_count == len(results) and float(np.mean(scores)) >= PAD_THRESHOLD
    print(json.dumps({
        "passed": passed,
        "frameCount": len(results),
        "realFrameCount": real_count,
        "averageScore": float(np.mean(scores)),
        "threshold": PAD_THRESHOLD,
    }))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(json.dumps({"passed": False, "error": str(error)}))
        sys.exit(1)
