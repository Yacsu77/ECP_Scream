# Services Reference

---

## `ThreeSceneFacade`
**Path:** `src/features/modelViewer/services/threeSceneService.ts`

Encapsulates Three.js scene initialization as a Facade.  
Used by advanced integrations that bypass R3F (e.g., headless rendering, tests).

### Constructor

```ts
new ThreeSceneFacade(canvas: HTMLCanvasElement, config: SceneConfig)
```

**`SceneConfig`:**

| Field | Type | Default |
|-------|------|---------|
| `width` | `number` | required |
| `height` | `number` | required |
| `fov` | `number` | `45` |
| `near` | `number` | `0.1` |
| `far` | `number` | `1000` |
| `backgroundColor` | `number \| string` | `0x0a0a0f` |

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getScene()` | `THREE.Scene` | Access the underlying scene |
| `getCamera()` | `THREE.PerspectiveCamera` | Access the camera |
| `getRenderer()` | `THREE.WebGLRenderer` | Access the renderer |
| `addObject(obj)` | `void` | Add a 3D object to the scene |
| `removeObject(obj)` | `void` | Remove a 3D object from the scene |
| `resize(w, h)` | `void` | Update camera aspect + renderer size |
| `render()` | `void` | Trigger a single render frame |
| `dispose()` | `void` | Clean up renderer and lights |

**Lights included by default:**
- Ambient (white, 0.6)
- Directional (white, 1.2, castShadow)
- Fill (blue-ish, 0.4)
- Point rim (indigo, 0.8)

---

## `createModelLoader(format)` — Factory

```ts
function createModelLoader(format: SupportedFormat): GLTFLoader | STLLoader
```

Returns the appropriate Three.js loader based on file format.  
**All loader instantiation MUST go through this factory** (per Qualy_Code rules).

---

## `normalizeObject(object)` — Utility

```ts
function normalizeObject(object: THREE.Object3D): LoadedResult
```

Centers and scales a 3D object to fit in a 2-unit cube at the origin.

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| `object` | `THREE.Object3D` | The mutated (centered + scaled) object |
| `boundingBox` | `THREE.Box3` | The computed bounding box |
| `center` | `THREE.Vector3` | World center of the original object |
| `size` | `THREE.Vector3` | Dimensions of the original object |

---

## Backend API (`Back end/src/`)

### `POST /api/upload/model`

Upload a 3D model file.

**Request:** `multipart/form-data`, field name: `model`

**Response (201):**
```json
{
  "success": true,
  "data": {
    "filename": "1715000000000-123456789.glb",
    "originalName": "robot.glb",
    "format": "glb",
    "size": 2048576,
    "url": "/uploads/temp/1715000000000-123456789.glb"
  }
}
```

**Error responses:**

| Status | Cause |
|--------|-------|
| 400 | No file attached |
| 413 | File exceeds 100MB |
| 415 | Unsupported format |
| 500 | Disk write error |

---

### `DELETE /api/upload/model/:filename`

Delete a previously uploaded temporary file.

**Response (200):**
```json
{ "success": true, "message": "File deleted." }
```

---

### `GET /health`

```json
{ "status": "ok", "uptime": 42.3 }
```
