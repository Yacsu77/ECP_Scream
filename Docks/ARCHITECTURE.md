# Architecture

## Overview

3DModelVideoRecorder is a **client-heavy** Single Page Application (SPA).  
No authentication, no persistent storage — the loaded model exists only in memory for the duration of the browser tab.

```
Browser Tab
│
├── React App (Vite + React 18 + TypeScript)
│   ├── UI Layer        → components/ui/
│   ├── 3D Layer        → components/three/  +  @react-three/fiber
│   ├── Feature Logic   → features/modelViewer/
│   │   ├── hooks/      → useModelLoader, useRecording, useOrbitControls
│   │   └── services/   → ThreeSceneFacade, createModelLoader
│   ├── Cross-cutting hooks → hooks/ (useFileUpload, useTimer)
│   ├── Global State    → store/useViewerStore (Zustand)
│   └── Lib             → lib/constants.ts, lib/utils.ts
│
└── Optional: Node.js + Express Backend
    └── POST /api/upload/model → multer → uploads/temp/
```

---

## Data Flow

### Upload Flow

```
User drops file
    → useFileUpload.handleFile()
        → validates format + size
        → URL.createObjectURL(file) ← blob URL (memory only)
        → store.setModel({ name, format, url, size })
            → useModelLoader detects model change
                → creates GLTFLoader or STLLoader (Factory)
                    → loads from blob URL
                        → centerAndNormalize(object)
                            → scene.add(object)
```

### Recording Flow

```
User clicks "Record Video (30s)"
    → useRecording.startRecording()
        → store.setControlsEnabled(false)  ← disables OrbitControls
        → store.setRecordingStatus('recording')
        → GSAP auto-spin tween on model.rotation.y
        → canvas.captureStream(30) → MediaRecorder.start()
        → useTimer starts (30s countdown)
            → onTick → store.setRecordingProgress(n)
                → RecordingOverlay renders progress bar
            → onComplete OR user clicks Stop
                → MediaRecorder.stop()
                    → onstop: Blob assembled → file-saver.saveAs()
                        → store.setRecordingStatus('done')
                            → auto-reset after 3s
```

---

## Folder Structure

```
ECP_Scream/
├── Front End/
│   └── client/
│       ├── src/
│       │   ├── assets/models/         # Example .glb/.stl files (git-ignored)
│       │   ├── components/
│       │   │   ├── ui/
│       │   │   │   ├── Button.tsx
│       │   │   │   ├── UploadZone.tsx
│       │   │   │   └── RecordingOverlay.tsx
│       │   │   └── three/
│       │   │       ├── Scene3D.tsx    # Main canvas + layout
│       │   │       ├── ModelLoader.tsx
│       │   │       └── Controls.tsx
│       │   ├── features/
│       │   │   └── modelViewer/
│       │   │       ├── hooks/
│       │   │       │   ├── useModelLoader.ts
│       │   │       │   ├── useRecording.ts
│       │   │       │   └── useOrbitControls.ts
│       │   │       └── services/
│       │   │           └── threeSceneService.ts
│       │   ├── hooks/
│       │   │   ├── useFileUpload.ts
│       │   │   └── useTimer.ts
│       │   ├── lib/
│       │   │   ├── constants.ts
│       │   │   └── utils.ts
│       │   ├── store/
│       │   │   └── useViewerStore.ts
│       │   ├── styles/
│       │   │   └── globals.css
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── index.html
│       ├── vite.config.ts
│       └── package.json
│
├── Back end/
│   └── src/
│       ├── controllers/uploadController.ts
│       ├── routes/uploadRoutes.ts
│       ├── middleware/errorHandler.ts
│       ├── config/multerConfig.ts
│       └── server.ts
│
├── Docks/                    # Documentation (this folder)
├── Qualy_Code.md             # Code quality standards
└── ContextoInicial.json      # Project specification
```

---

## Design Patterns Applied

### Factory Pattern
`createModelLoader(format)` in `threeSceneService.ts` returns the correct Three.js loader based on file format. Components never instantiate loaders directly.

### Facade Pattern
`ThreeSceneFacade` encapsulates scene creation, camera, lights, and renderer. External code interacts with the facade's public API, not raw Three.js primitives.

### Observer / Pub-Sub
Zustand's `subscribeWithSelector` middleware enables fine-grained subscriptions. Components only re-render when the specific slice of state they use changes.

### Command Pattern
`startRecording` and `stopRecording` in `useRecording.ts` are self-contained commands that handle all side effects (GSAP, MediaRecorder, store updates) in isolation.

---

## Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Framework | React 18 + Vite | Fast HMR, modern tooling |
| Language | TypeScript (strict) | Type safety, maintainability |
| 3D | Three.js + @react-three/fiber | Declarative 3D in React |
| Helpers | @react-three/drei | OrbitControls, Environment, Grid, Stats |
| Animation | GSAP | Smooth, performant tweens |
| State | Zustand | Minimal, subscription-based |
| Styling | Tailwind CSS v4 | Utility-first, no runtime |
| Recording | MediaRecorder API | Native, zero extra dependencies |
| Download | file-saver | Cross-browser blob download |
| Backend | Express + Multer | Minimal REST for optional hosting |
