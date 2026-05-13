# Recording Implementation

---

## Overview

Recording is implemented entirely client-side using:

- `HTMLCanvasElement.captureStream(fps)` — captures the live WebGL canvas as a `MediaStream`
- `MediaRecorder` — encodes the stream into video chunks
- `Blob` + `file-saver` — assembles and triggers download
- `GSAP` — drives smooth, deterministic rotation during recording

---

## Recording Flow (detailed)

```
startRecording()
│
├─ 1. Detect MIME type
│      getSupportedMimeType()
│      Priority: video/mp4;codecs=avc1 → video/mp4 → video/webm;codecs=vp9 → video/webm
│
├─ 2. Capture the canvas stream
│      canvas.captureStream(30)  ← 30 fps capture
│
├─ 3. Create MediaRecorder
│      new MediaRecorder(stream, { mimeType })
│
├─ 4. Lock UI
│      store.setControlsEnabled(false)   ← disables OrbitControls
│      store.setRecordingStatus('recording')
│
├─ 5. Start GSAP tween
│      gsap.to(model.rotation, { y: +360°×spinFactor, duration: 30, ease: 'none' })
│
├─ 6. Start timer (useTimer, 30s)
│      onTick → store.setRecordingProgress(progress)
│      onComplete → recorder.stop()
│
├─ 7. Collect data
│      recorder.ondataavailable → chunks.push(e.data)
│      (timeslice: 200ms for memory efficiency)
│
└─ 8. On stop
       Blob = new Blob(chunks, { type: mimeType })
       saveAs(blob, 'modelName_timestamp.mp4')
       store.setRecordingStatus('done')
       setTimeout → store.resetRecording() after 3s
```

---

## MIME Type & Format

The app prioritizes **MP4** but gracefully degrades to **WebM**:

```ts
const RECORDING_MIME_TYPES = [
  'video/mp4;codecs=avc1',   // Chrome macOS/Windows, Edge
  'video/mp4',               // Generic MP4
  'video/webm;codecs=vp9',   // Firefox, Chrome fallback
  'video/webm;codecs=vp8',   // Older Chrome
  'video/webm',              // Universal fallback
]
```

The filename extension is set to match: `mp4` or `webm`.

---

## `canvas.captureStream` Notes

- Requires the canvas to be created with `preserveDrawingBuffer: true`
- On R3F `Canvas`, this is set in the `gl` prop: `gl={{ preserveDrawingBuffer: true }}`
- Without this option, frames may be blank (the default WebGL buffers are swapped)

---

## GSAP Rotation

- `ease: 'none'` ensures a constant angular velocity — critical for smooth video
- The tween targets `model.rotation.y` directly
- The total rotation is: `2π × AUTO_SPIN_SPEED × durationInSeconds`
- `AUTO_SPIN_SPEED = 0.4` → ~0.4 full rotations over 30 seconds

To change the spin speed, update `AUTO_SPIN_SPEED` in `src/lib/constants.ts`.

---

## Early Stop

Calling `stopRecording()`:
1. Kills the GSAP tween immediately
2. Calls `MediaRecorder.stop()` (if not already stopped)
3. Calls `store.resetRecording()` which re-enables controls

The `onstop` handler still fires and the partial video is still downloaded.

---

## Memory Management

- Chunks are stored in a `useRef` array to avoid re-renders
- After `saveAs`, `chunksRef.current = []` releases the chunk memory
- The GSAP tween ref is killed and nulled on stop
- Blob URLs created by `useFileUpload` should be revoked via `URL.revokeObjectURL` when `clearModel()` is called (enhancement)

---

## Known Limitations

| Limitation | Workaround |
|-----------|-----------|
| Safari outputs WebM, not MP4 | Inform user; WebM is still playable |
| `video/mp4` may have no audio | This is expected — 3D scene has no audio |
| Very large models may cause frame drops during recording | Use Stats.js to verify FPS ≥ 28 |
| Recording requires a user gesture | `startRecording()` must be called from a click handler |
