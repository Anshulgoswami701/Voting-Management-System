# Face Verification Testing Guide

## Server Status

✅ **Backend**: Running on `http://localhost:5000`  
✅ **Frontend**: Running on `http://localhost:5174`

---

## Key Improvements Made

### 1. **Multi-Frame Capture** (FaceVerificationCapture.jsx)
- Now captures **8 consecutive valid frames** instead of 1
- Frames are collected only when face quality meets all criteria
- Shows frame collection progress: "3/8 frames"

### 2. **L2 Normalization** (All embeddings)
- **Frontend**: Embeddings are normalized before sending to backend
- **Backend**: Both stored and login embeddings are normalized before comparison
- Normalization makes embeddings invariant to lighting and camera conditions

### 3. **Averaging Embeddings**
- Multiple captured frames are averaged together
- Result is normalized again for consistency
- Reduces noise from single-frame variance

### 4. **Improved Backend Logging**
- Logs ALL face verification attempts (not just failures)
- Shows: `distance`, `threshold`, `result` (ACCEPTED/REJECTED)
- Distance is now in 6 decimal places for precision
- Look for console output: `Face verification attempt: { ... }`

### 5. **Prevent Repeated Verify Clicks**
- Added `isVerifyingFace` flag in Login component
- Prevents multiple simultaneous verification requests
- Shows warning if clicked while verification is in progress

---

## Testing Procedure

### **PHASE A: Same Person Registration → Multiple Login Tests**

#### Step 1: Register a Test Account
1. Navigate to `http://localhost:5174/register`
2. Select **Voter** role
3. Fill in form:
   - Full Name: `John Doe`
   - Voter ID: `V12345`
   - Email: `john@test.com`
   - Password: `TestPass123!`
4. Accept terms
5. **Face Verification Setup**:
   - Position your face in the camera
   - Keep face centered and still
   - Wait for all **8 frames to be collected** (progress shows "8/8 frames")
   - Component displays "Descriptor generated successfully"
   - Click register
6. ✅ Note: Check backend console for:
   ```
   Face verification attempt: {
     userId: "...",
     storedEmbeddingLength: 1024,
     receivedEmbeddingLength: 1024,
     normalizedDistance: 0.000000,  // Should be ~0 for same embedding
     threshold: 5.00,
     result: "ACCEPTED"
   }
   ```

#### Step 2: Login - First Attempt (Same Person)
1. Navigate to `http://localhost:5174/login`
2. Select **Voter** role
3. Enter credentials:
   - Email: `john@test.com`
   - Password: `TestPass123!`
4. Click Login
5. **Face Verification Screen**:
   - Position your face (same position as registration)
   - Collect 8 frames
   - Wait for "Descriptor generated successfully"
6. ✅ Expected: Login succeeds, redirects to `/voter/dashboard`
7. Check backend console for distance value

#### Step 3: Login - Second Attempt (Different Angle)
1. Logout (go to dashboard, click logout if available, or navigate back to login)
2. Login again with same credentials
3. **Face Verification Screen**:
   - This time, turn your head **slightly left** (different angle)
   - Keep face clearly visible and centered
   - Collect 8 frames
   - Wait for "Descriptor generated successfully"
4. ✅ Expected: Login succeeds despite different angle
5. Check backend console:
   - Distance should be **higher than Step 2** but still < threshold
   - Example: `normalizedDistance: 0.150000` (instead of 0.000000)

#### Step 4: Login - Third Attempt (Different Lighting)
1. Logout
2. Login again
3. **Face Verification Screen**:
   - This time, change lighting (move to different part of room)
   - Collect 8 frames
   - Wait for "Descriptor generated successfully"
4. ✅ Expected: Login succeeds with different lighting
5. Backend console: Distance should still be acceptable

#### Step 5: Measure Same-Person Baseline
- Record the distances from Steps 2, 3, 4
- **Same person distances should be**:
  - Identical angle/lighting: 0.0 - 0.1
  - Different angle: 0.1 - 0.3
  - Different lighting: 0.1 - 0.3
  - Maximum expected for same person: **0.5 or less**

---

### **PHASE B: Different Person Rejection Test**

#### Step 1: Register Second Account
1. Navigate to `http://localhost:5174/register`
2. Fill in:
   - Full Name: `Jane Smith`
   - Voter ID: `V67890`
   - Email: `jane@test.com`
   - Password: `TestPass123!`
3. Use **different person's face** for registration
4. Complete registration

#### Step 2: Try to Login as Different Person
1. Navigate to `http://localhost:5174/login`
2. Enter John's credentials:
   - Email: `john@test.com`
   - Password: `TestPass123!`
3. **Face Verification Screen**:
   - **Use Jane's face** (different person)
   - Collect 8 frames
   - Wait for completion
4. ❌ Expected: Login **FAILS** with message:
   - "Face verification failed. Please try again with a matching face."
5. Check backend console:
   - Distance should be **much higher** than same-person threshold
   - Example: `normalizedDistance: 1.500000+`
   - **Result: REJECTED**

#### Step 3: Measure Different-Person Baseline
- Record the distance from Step 2
- **Different person distances should be**:
  - Minimum expected: **> 0.8**
  - Typical: 1.0 - 2.0+

---

### **PHASE C: Correct Password + Wrong Face Test**

#### Prerequisites
- John's account already registered with his face
- Prepare to have a different person available

#### Step 1: Attempt Login
1. Navigate to `http://localhost:5174/login`
2. Enter John's credentials:
   - Email: `john@test.com`
   - Password: `TestPass123!`
3. **Face Verification Screen**:
   - Different person performs verification
   - Collect 8 frames
   - Wait for completion
4. ❌ Expected: Login **FAILS**
   - Message: "Face verification failed. Please try again with a matching face."
   - **Password was correct** but face didn't match
5. Verify backend console shows:
   - `result: "REJECTED"`
   - Distance > threshold

---

### **PHASE D: Correct Password + Matching Face Test**

#### Step 1: Successful Login
1. Navigate to `http://localhost:5174/login`
2. Enter John's credentials:
   - Email: `john@test.com`
   - Password: `TestPass123!`
3. **Face Verification Screen**:
   - John performs verification (original person)
   - Collect 8 frames
   - Wait for "Descriptor generated successfully"
4. ✅ Expected: Login succeeds
   - Redirects to `/voter/dashboard`
   - Shows voter information
5. Verify backend shows:
   - `result: "ACCEPTED"`
   - Distance < threshold

---

## Expected Backend Console Output

### ✅ Successful Verification
```
Face verification attempt: {
  userId: '670a1b2c3d4e5f6g7h8i9j0k',
  storedEmbeddingLength: 1024,
  receivedEmbeddingLength: 1024,
  normalizedDistance: '0.125432',
  threshold: 5.00,
  result: 'ACCEPTED'
}
```

### ❌ Failed Verification (Different Person)
```
Face verification attempt: {
  userId: '670a1b2c3d4e5f6g7h8i9j0k',
  storedEmbeddingLength: 1024,
  receivedEmbeddingLength: 1024,
  normalizedDistance: '1.847392',
  threshold: 5.00,
  result: 'REJECTED'
}
```

---

## Threshold Calibration

Based on your test results, the threshold may need adjustment:

| Scenario | Expected Distance | Current Threshold |
|----------|-------------------|-------------------|
| Same person, same conditions | 0.0 - 0.1 | 5.00 |
| Same person, different angle | 0.1 - 0.3 | ↑ |
| Same person, different lighting | 0.1 - 0.3 | ↑ |
| Different person | > 1.0 | ↑ |

**To adjust threshold after testing:**
1. Edit `.env` in Backend folder
2. Change: `FACE_MATCH_THRESHOLD=5.0`
3. Recommended: `FACE_MATCH_THRESHOLD=0.6` (based on same/diff person data)

---

## Troubleshooting

### Issue: "Face too small" / "Face not centered"
- **Solution**: Move closer to camera, ensure face is in center of frame

### Issue: "Face is not clear enough"
- **Solution**: Improve lighting, ensure no glare, look directly at camera

### Issue: Face verification collects < 8 frames
- **Solution**: Ensure face stays visible, centered, and of good quality throughout capture

### Issue: Same person sometimes accepted, sometimes rejected
- **Previous Problem**: Single-frame variance (now fixed with multi-frame averaging)
- **Debug**: Check backend console - distance should be consistent (+/- 0.05)

### Issue: Different person's face is accepted
- **This should NOT happen** after this fix
- If it does: Increase threshold in `.env` is NOT the solution
- Check: Are you testing with very similar faces? Genetic twins?

---

## Cleanup After Testing

After all tests are complete, perform these steps:

### 1. Remove Test Accounts (Optional)
```
MongoDB: Remove documents with emails john@test.com, jane@test.com
```

### 2. Verify Debug Logs Are Captured
- Copy console output showing successful and failed verifications
- Use for threshold determination

### 3. Finalize Threshold
- Based on test data, set appropriate `FACE_MATCH_THRESHOLD`
- Default (5.00) is very permissive
- Recommended: 0.6 - 0.8

### 4. Restart Backend Without Debug Logs (Optional)
- Current implementation logs all attempts (required for debugging)
- In production, filter logs to only failures if desired

---

## Summary Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5174
- [ ] Phase A: Same person - 3 successful logins with different conditions
- [ ] Phase B: Different person - login REJECTED
- [ ] Phase C: Correct password + wrong face - login REJECTED
- [ ] Phase D: Correct password + matching face - dashboard shown
- [ ] Recorded distance measurements for same-person and different-person
- [ ] Determined appropriate threshold value
- [ ] Verified multi-frame collection (8/8 frames shown)
- [ ] Verified normalization (descriptor.length shown as normalized values)
