# Components Reference

---

## UI Components

### `<Button />`
**Path:** `src/components/ui/Button.tsx`

A polymorphic, accessible button with multiple visual variants.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'ghost'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `isLoading` | `boolean` | `false` | Shows spinner, disables interaction |
| `leftIcon` | `ReactNode` | `undefined` | Icon rendered before label |
| `rightIcon` | `ReactNode` | `undefined` | Icon rendered after label |
| `...HTMLButtonAttributes` | — | — | All native button props forwarded |

**Usage:**
```tsx
<Button variant="danger" size="lg" leftIcon={<span>⏺</span>} onClick={startRecording}>
  Record Video (30s)
</Button>
```

---

### `<UploadZone />`
**Path:** `src/components/ui/UploadZone.tsx`

Drag-and-drop zone for uploading .glb and .stl files.

**Behaviour:**
- Accepts file via drag-and-drop or click-to-browse
- Validates format (`.glb` / `.stl`) and file size (max 100MB)
- Shows error inline if validation fails
- Shows the loaded model name once a file is accepted
- Connects directly to `useFileUpload` hook and `useViewerStore`

**No props** — fully connected to the global store.

---

### `<RecordingOverlay />`
**Path:** `src/components/ui/RecordingOverlay.tsx`

Overlay rendered on top of the 3D canvas that communicates recording state.

**States rendered:**

| `recordingStatus` | Visual |
|-------------------|--------|
| `'recording'` | Red pulsing border + REC badge + countdown + progress bar |
| `'processing'` | Blurred overlay + spinner |
| `'done'` | Blurred overlay + green checkmark + "Download started!" |
| `'error'` | Blurred overlay + error message |
| `'idle'` | Nothing (returns `null`) |

**No props** — reads from `useViewerStore`.

---

## Three.js Components

### `<Scene3D />`
**Path:** `src/components/three/Scene3D.tsx`

The main 3D canvas component. Composes all Three.js primitives, controls, and the recording button.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showStats` | `boolean` | `store.showStats` | Override for Stats.js panel |

**Internal responsibilities:**
- Creates the R3F `Canvas` with `preserveDrawingBuffer: true`
- Captures the canvas ref for `useRecording`
- Renders `SceneLights`, `ModelLoader`, `Controls`, `Environment`, `Grid`
- Renders `RecordingOverlay`
- Shows Record / Stop buttons

---

### `<ModelLoader />`
**Path:** `src/components/three/ModelLoader.tsx`

Imperative bridge between the React tree and the Three.js scene graph.  
Uses `useModelLoader` hook to load GLB/STL and imperatively adds/removes the object from the scene.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `modelRef` | `RefObject<THREE.Object3D \| null>` | Forwarded ref for GSAP access in `useRecording` |

---

### `<Controls />`
**Path:** `src/components/three/Controls.tsx`

Wraps `@react-three/drei`'s `OrbitControls` and syncs the `enabled` state from the store.

**Behaviour:**
- Enabled by default
- Automatically disabled when `store.isControlsEnabled === false` (during recording)
- Uses `enableDamping` with `dampingFactor: 0.08`
- Calls `invalidate()` via `useFrame` so R3F only re-renders when the user is interacting

---

## App Layout

### `App.tsx`
Root layout: sidebar + 3D canvas side by side.

```
┌─────────────────────┬─────────────────────────────────┐
│      Sidebar        │         Scene3D (canvas)        │
│  ─ Upload Zone      │  ─ 3D model                     │
│  ─ Model Info       │  ─ Grid floor                   │
│  ─ Options toggle   │  ─ RecordingOverlay              │
│  ─ Remove button    │  ─ Record / Stop button          │
└─────────────────────┴─────────────────────────────────┘
```
