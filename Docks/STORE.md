# Global State — useViewerStore

**Path:** `src/store/useViewerStore.ts`  
**Library:** Zustand with `subscribeWithSelector` middleware

---

## State Shape

```ts
interface ViewerState {
  // Data
  model: LoadedModel | null

  // Recording
  recordingStatus: RecordingStatus
  recordingProgress: number          // 0–1
  recordingError: string | null

  // Scene
  isControlsEnabled: boolean
  showStats: boolean
  autoSpin: boolean
}
```

### `LoadedModel`

```ts
interface LoadedModel {
  name: string          // Original filename
  format: 'glb' | 'stl'
  url: string           // Blob URL (memory only)
  size: number          // Bytes
}
```

### `RecordingStatus`

```ts
type RecordingStatus = 'idle' | 'recording' | 'processing' | 'done' | 'error'
```

| Status | Description |
|--------|-------------|
| `idle` | No recording in progress |
| `recording` | MediaRecorder is active |
| `processing` | MediaRecorder.stop() called, assembling Blob |
| `done` | Download triggered, reset pending |
| `error` | Recording failed |

---

## Actions

| Action | Signature | Description |
|--------|-----------|-------------|
| `setModel` | `(model: LoadedModel \| null) => void` | Load a new model and reset recording state |
| `setRecordingStatus` | `(status: RecordingStatus) => void` | Update recording status |
| `setRecordingProgress` | `(progress: number) => void` | Update 0–1 progress value |
| `setRecordingError` | `(error: string \| null) => void` | Set or clear error message |
| `setControlsEnabled` | `(enabled: boolean) => void` | Enable/disable OrbitControls |
| `setShowStats` | `(show: boolean) => void` | Toggle Stats.js panel |
| `setAutoSpin` | `(spin: boolean) => void` | Toggle GSAP auto-rotation flag |
| `resetRecording` | `() => void` | Reset all recording state to defaults |
| `clearModel` | `() => void` | Remove model and reset all state |

---

## Usage Pattern

```ts
// Reading
const model = useViewerStore((s) => s.model)
const { recordingStatus, recordingProgress } = useViewerStore()

// Writing (always through actions)
const { setModel, resetRecording } = useViewerStore()
setModel({ name: 'robot.glb', format: 'glb', url: blobUrl, size: 1024 })
```

---

## Subscription (outside React)

```ts
useViewerStore.subscribe(
  (s) => s.recordingStatus,
  (status) => console.log('Recording status changed:', status)
)
```
