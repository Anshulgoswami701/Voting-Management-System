# Face Verification & Liveness Development Guide

## 1. Project Context

This project is a MERN-based Voting Management System.

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- Role-based authorization
- Admin and Voter middleware

### Frontend
- React
- Vite
- React Router

### Existing User Roles
- Admin
- Voter

The existing voting, election, candidate, voter, authentication, and results functionality must continue working after implementing face verification.

---

# 2. Main Goal

Add biometric face verification to the existing user authentication system.

The system will use:

1. Face detection
2. Face capture
3. Face embedding generation
4. Face embedding comparison
5. Liveness detection in later phases

The system must verify that the face presented during login sufficiently matches the face registered by the same user.

Face verification is an additional authentication factor. It must not replace the existing password authentication.

---

# 3. Important Security Principle

Face movement or liveness checks must NOT be treated as absolute proof that a real human is present.

Liveness detection is a presentation-attack mitigation layer.

The implementation should be designed to make simple photo and replay attacks more difficult, but it must not claim to provide perfect anti-spoofing security.

---

# 4. Development Phases

The feature MUST be implemented in exactly three phases.

Do NOT implement Phase 2 or Phase 3 while Phase 1 is still being developed or tested.

---

# PHASE 1 — Face Verification

## 4.1 Registration Flow

During voter registration:

Existing registration fields must continue working.

After entering the required registration information:

1. Open the webcam.
2. Detect the user's face.
3. Ensure exactly one face is present.
4. Check that the face is sufficiently visible and properly positioned.
5. Capture a suitable face image/frame.
6. Generate a face embedding from the captured face.
7. Send the embedding securely to the backend.
8. Store the face embedding with the user record.

The raw captured face image should NOT be stored unless there is a clear technical requirement for doing so.

---

## 4.2 Login Flow

The existing login flow must remain:

Email/username + password

Face verification will be added as an additional verification step.

Login flow:

1. User enters existing login credentials.
2. Backend verifies the password.
3. If password verification fails, reject login.
4. If password verification succeeds, request face verification.
5. Open the webcam.
6. Detect exactly one face.
7. Check face position and quality.
8. Capture a suitable frame.
9. Generate a face embedding.
10. Compare the new embedding with the stored embedding.
11. Apply a properly configurable similarity/distance threshold.
12. If the face matches, allow login.
13. If the face does not match, reject login.

The stored face embedding must NEVER be sent to the frontend unnecessarily.

---

# 5. Face Detection

A face detection model/library must be used to determine:

- Whether a face exists
- Where the face is located in the camera frame
- Whether exactly one face is present
- Whether the face is sufficiently large
- Whether the face is inside the usable camera area

Example conceptual flow:

Camera
→ Face Detection
→ Face Position Check
→ Face Quality Check
→ Capture

The implementation should not simply capture an arbitrary frame immediately after detecting a face.

---

# 6. Face Embedding

Face detection and face recognition/embedding generation are separate responsibilities.

Face detection answers:

"Where is the face?"

Face recognition/embedding generation answers:

"Which facial representation should be compared?"

The system should:

1. Detect the face.
2. Crop/align the face when required by the selected model.
3. Generate a numerical face embedding.
4. Store the registered embedding in the database.
5. Generate a new embedding during login.
6. Compare the login embedding against the stored embedding.

Do NOT compare embeddings using exact array equality.

Example of incorrect logic:

embedding1 === embedding2

Two images of the same person will not necessarily produce identical numerical arrays.

Use the similarity/distance method appropriate for the selected face-recognition model.

The threshold must be configurable and should be determined through testing rather than chosen arbitrarily.

---

# 7. Database Requirements

The User model may be extended to store a face verification template/embedding.

Conceptually:

User
- name
- email
- password
- role
- existing fields
- faceEmbedding

Do not unnecessarily change existing User fields.

Do not store raw camera images by default.

Do not expose face embeddings to the frontend.

Do not log face embeddings.

Do not include biometric data in normal API responses unless explicitly required.

---

# 8. PHASE 2 — Movement-Based Liveness

Phase 2 will be implemented ONLY after Phase 1 is stable and tested.

Phase 2 must NOT include eye blinking.

The liveness system should use facial movement/actions such as:

- Turn face left
- Turn face right
- Open mouth

The system should use face landmarks/key points where necessary.

Conceptual flow:

Camera
→ Face Detection
→ Face Tracking/Landmarks
→ Liveness Challenge
→ Turn Left
→ Turn Right
→ Open Mouth
→ Liveness Passed
→ Capture Face
→ Generate Embedding
→ Compare With Registered Embedding
→ Match = Login
→ No Match = Reject

The challenge sequence should preferably not always be identical.

If practical, use randomized challenges to make simple prerecorded sequences harder to replay.

Liveness success must NOT automatically mean the user is authenticated.

The face must still be compared against the registered face embedding.

---

# 9. PHASE 3 — Final Liveness

Phase 3 will be implemented ONLY after Phase 2 is stable and tested.

Keep all Phase 2 functionality and add eye-blink detection.

Liveness actions:

- Turn face left
- Turn face right
- Open mouth
- Blink

Conceptual flow:

Camera
→ Face Detection
→ Face Tracking/Landmarks
→ Liveness Challenges
→ Left/Right Movement
→ Mouth Movement
→ Blink
→ Liveness Passed
→ Capture Face
→ Generate Embedding
→ Compare With Registered Embedding
→ Match = Login
→ No Match = Reject

---

# 10. Error Handling

The system must handle:

- Camera permission denied
- Camera unavailable
- No face detected
- Multiple faces detected
- Face partially outside frame
- Face too small
- Poor image quality
- Face embedding generation failure
- Face comparison failure
- Liveness failure
- Network/API failure
- Missing face embedding
- User has not registered a face
- Timeout during face verification

The user should receive a clear but security-conscious error message.

Do not reveal unnecessary biometric or authentication information.

For example, avoid exposing sensitive details about stored biometric data.

---

# 11. Existing Functionality Protection

Do NOT unnecessarily modify:

- Voting logic
- Election logic
- Candidate logic
- Results logic
- Admin functionality
- Voter functionality
- Existing password hashing
- Existing JWT implementation
- Existing role authorization
- Existing routes unrelated to authentication

The existing system must continue working.

Make the minimum required changes.

---

# 12. File Modification Rules

Before modifying any file:

1. Inspect the existing implementation.
2. Identify the exact reason the file needs to change.
3. Tell me which files will be modified.
4. Explain what will change in each file.
5. Do not modify unrelated files.

Do not rewrite an entire existing file when a small modification is sufficient.

Preserve existing coding style where practical.

Do not create duplicate authentication logic.

Do not create duplicate face verification logic.

Reusable face-related functionality should be kept in appropriate components/services rather than duplicated across Register.jsx and Login.jsx.

---

# 13. Dependency Rules

Before installing a new package:

1. Check the existing package.json.
2. Determine whether an existing dependency can perform the required task.
3. If a new dependency is required, explain:
   - Package name
   - Purpose
   - Why it is required
   - Whether it works with the existing React/Vite environment
   - Whether it is suitable for browser-based webcam processing

Do not install unnecessary packages.

Do not replace the existing technology stack without explicit approval.

---

# 14. Model Selection Rules

Before implementing face detection, face landmarks, face embeddings, or liveness:

First inspect the available/current libraries and recommend the appropriate model/library.

The recommendation must consider:

- Browser compatibility
- React/Vite compatibility
- Model size
- Performance on normal laptops
- Accuracy
- Face detection capability
- Face landmark capability
- Embedding generation capability
- Ease of integration
- Whether processing can happen locally in the browser
- Privacy implications
- Maintenance and package compatibility

Do not select a model only because it is popular.

Explain the reason for the model selection before implementation.

---

# 15. Privacy and Security

Biometric information must be handled carefully.

Rules:

- Do not expose stored embeddings to the frontend.
- Do not log embeddings.
- Do not put embeddings in localStorage.
- Do not put embeddings in URL parameters.
- Do not expose biometric data in unnecessary API responses.
- Do not store raw face images unless explicitly required.
- Keep existing password hashing.
- Keep existing JWT authentication.
- Keep existing authorization middleware.
- Protect face-related backend endpoints appropriately.
- Rate-limit repeated verification attempts where appropriate.

The face verification system must not bypass existing authentication and authorization controls.

---

# 16. Testing Requirements

Each phase must be tested before moving to the next phase.

## Phase 1 tests

### Registration
- Valid user + valid face → registration succeeds
- No face → registration rejected
- Multiple faces → registration rejected
- Poor face position → registration rejected
- Face too small → registration rejected
- Embedding generation failure → registration rejected gracefully

### Login
- Correct password + matching face → login succeeds
- Correct password + different face → login rejected
- Wrong password → login rejected
- No face → login rejected
- Multiple faces → login rejected
- Camera denied → login rejected gracefully
- Missing registered embedding → verification handled safely

## Phase 2 tests

- Correct movement → liveness succeeds
- Incorrect movement → liveness fails
- No movement → liveness fails
- Face disappears → liveness fails
- Multiple faces → liveness fails
- Liveness succeeds but face does not match → login rejected
- Liveness fails → login rejected

## Phase 3 tests

All Phase 2 tests plus:

- Correct blink → accepted
- No blink → rejected
- Incorrect blink/action → rejected
- Liveness succeeds but face does not match → login rejected

---

# 17. Development Workflow

The feature must be developed incrementally.

Follow this order:

1. Inspect existing authentication code.
2. Select face detection/embedding technology.
3. Install only required dependencies.
4. Build camera access.
5. Implement face detection.
6. Implement face position/quality checks.
7. Implement face capture.
8. Implement embedding generation.
9. Add embedding storage to User model.
10. Integrate embedding into registration.
11. Integrate face verification into login.
12. Test Phase 1 completely.
13. Only then start Phase 2.
14. Test Phase 2 completely.
15. Only then start Phase 3.
16. Test Phase 3 completely.

Do not jump directly to the final implementation.

---

# 18. Copilot Instructions

IMPORTANT:

Do not implement the entire feature in one step.

Work phase-by-phase and task-by-task.

Before writing code for any task:

1. Inspect the relevant existing files.
2. Explain the current implementation.
3. List the files that need modification.
4. Explain why each file needs modification.
5. Identify possible risks.
6. Then implement only the requested task.

After implementation:

1. Explain what changed.
2. List modified files.
3. Explain how to test the change.
4. Do not automatically start the next phase.

Never assume that existing code can be safely replaced.

Never modify unrelated functionality.

If there is an architectural conflict or security concern, stop and explain it before making the change.

---

# 19. Current Implementation Status

Phase 1: NOT STARTED

Phase 2: NOT STARTED

Phase 3: NOT STARTED

Do not implement Phase 2 or Phase 3 until explicitly instructed.

---

# 20. Final Architecture Goal

The final authentication architecture should conceptually be:

Registration:

Basic Details
→ Face Detection
→ Face Position/Quality Check
→ Face Capture
→ Face Embedding
→ Store Embedding


Login:

Credentials
→ Password Verification
→ Camera
→ Face Detection
→ Liveness Verification
→ Face Capture
→ Face Embedding
→ Compare With Stored Embedding
→ Login / Reject


Phase 1:

Password + Face Verification


Phase 2:

Password + Movement-Based Liveness + Face Verification


Phase 3:

Password + Movement-Based Liveness + Blink + Face Verification