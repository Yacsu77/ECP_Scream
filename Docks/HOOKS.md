# Hooks Reference

---

## Cross-cutting Hooks (`src/hooks/`)

### `useTimer`
**Path:** `src/hooks/useTimer.ts`

High-precision countdown timer using `requestAnimationFrame`.

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `duration` | `number` | Total duration in milliseconds |
| `onTick` | `(elapsed, remaining) => void` | Called on every animation frame |
| `onComplete` | `() => void` | Called when elapsed >= duration |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| `elapsed` | `number` | Milliseconds elapsed |
| `remaining` | `number` | Milliseconds remaining |
| `progress` | `number` | 0–1 normalized progress |
| `isRunning` | `boolean` | Whether the timer is active |
| `start()` | `() => void` | Start the timer from 0 |
| `stop()` | `() => void` | Pause without resetting |
| `reset()` | `() => void` | Stop and reset to 0 |

**Example:**
```ts
const { remaining, progress, start } = useTimer({
  duration: 30_000,
  onComplete: () => recorder.stop(),
})
```

---

### `useFileUpload`
**Path:** `src/hooks/useFileUpload.ts`

Encapsulates drag-and-drop logic and file validation.

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| `isDragging` | `boolean` | True while a file is dragged over the zone |
| `uploadError` | `UploadError \| null` | Validation error (`format` or `size`) |
| `isLoading` | `boolean` | True while processing the file |
| `handleFile(file)` | `(File) => void` | Process a file directly |
| `handleDrop` | `DragEventHandler` | Drop event handler |
| `handleDragOver` | `DragEventHandler` | DragOver event handler |
| `handleDragLeave` | `DragEventHandler` | DragLeave event handler |
| `handleInputChange` | `ChangeEventHandler` | File input change handler |
| `clearError()` | `() => void` | Dismiss the current error |

**Validation rules:**
- Extension must be `.glb` or `.stl`
- File size must be ≤ 100MB

**Side effect:** Creates a blob URL via `URL.createObjectURL` and writes to `useViewerStore.setModel`.

---

## Feature Hooks (`src/features/modelViewer/hooks/`)

### `useModelLoader`
**Path:** `src/features/modelViewer/hooks/useModelLoader.ts`

Loads a GLB or STL file from a URL using the Factory pattern.

**Input:** `model: LoadedModel | null`

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| `object` | `THREE.Object3D \| null` | Loaded and normalized scene object |
| `status` | `'idle' \| 'loading' \| 'loaded' \| 'error'` | Current load state |
| `error` | `string \| null` | Error message if status is 'error' |
| `progress` | `number` | 0–1 load progress |

**Behaviour:**
- On each new `model`, disposes the previous one and starts a new load
- Calls `centerAndNormalize()` to fit model in a unit cube at origin
- STL files get a default `MeshStandardMaterial` (indigo-ish)
- Cleanup via `abortRef` to prevent state updates after unmount

---

### `useRecording`
**Path:** `src/features/modelViewer/hooks/useRecording.ts`

Orchestrates the full recording lifecycle.

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `canvasRef` | `RefObject<HTMLCanvasElement \| null>` | Reference to the Three.js canvas |
| `modelRef` | `RefObject<THREE.Object3D \| null>` | Reference to the loaded 3D object for GSAP |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| `startRecording()` | `() => void` | Begin recording (disables controls, starts GSAP spin, starts MediaRecorder + timer) |
| `stopRecording()` | `() => void` | Stop recording early and trigger download |

**Recording sequence:**
1. Detect supported MIME type (`video/mp4` preferred, fallback `video/webm`)
2. `canvas.captureStream(30)` → `MediaRecorder`
3. GSAP tween on `model.rotation.y` for smooth 360° rotation
4. `useTimer` provides progress updates to the store
5. On stop → assemble `Blob` → `file-saver.saveAs(blob, fileName)`
6. Auto-reset store after 3 seconds

---

### `useOrbitControls`
**Path:** `src/features/modelViewer/hooks/useOrbitControls.ts`

Low-level hook for manual `OrbitControls` instantiation (imperative Three.js API).  
Used as a reference implementation; the component layer uses `@react-three/drei`'s `<OrbitControls>` instead.

**Options:**

| Option | Type | Default |
|--------|------|---------|
| `enabled` | `boolean` | required |
| `enableDamping` | `boolean` | `true` |
| `dampingFactor` | `number` | `0.08` |
| `minDistance` | `number` | `1` |
| `maxDistance` | `number` | `20` |
| `autoRotate` | `boolean` | `false` |
| `autoRotateSpeed` | `number` | `2` |

**Returns:** `controlsRef: RefObject<OrbitControlsImpl | null>`
