# Setup Guide

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| npm | ≥ 9 |

---

## Frontend Setup

```bash
cd "Front End/client"
npm install
npm run dev
```

The app opens at **http://localhost:5173**.

### Environment Variables (optional)

Create `Front End/client/.env.local`:

```env
VITE_SERVER_URL=http://localhost:3001
```

---

## Backend Setup (Optional)

The backend is only needed if you want to temporarily host model files on a server.  
The primary use case works 100% client-side without the backend.

```bash
cd "Back end"
npm install
npm run dev
```

Server starts at **http://localhost:3001**.

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/upload/model` | Upload a .glb or .stl file (multipart/form-data, field: `model`) |
| `DELETE` | `/api/upload/model/:filename` | Delete a previously uploaded file |
| `GET` | `/health` | Health check |
| `GET` | `/uploads/temp/:filename` | Serve uploaded files |

### Upload example (curl)

```bash
curl -X POST http://localhost:3001/api/upload/model \
  -F "model=@/path/to/model.glb"
```

---

## Production Build

```bash
cd "Front End/client"
npm run build
# Output in Front End/client/dist/
```

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| WebGL 2 | ✅ | ✅ | ✅ | ✅ |
| MediaRecorder MP4 | ✅ | ⚠️ WebM | ⚠️ WebM | ✅ |
| canvas.captureStream | ✅ | ✅ | ✅ | ✅ |
| OrbitControls | ✅ | ✅ | ✅ | ✅ |

> On Firefox and Safari, the recording outputs **WebM** format, not MP4. The filename will reflect this automatically.
