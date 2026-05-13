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

### Preview the production build locally

```bash
cd "Front End/client"
npm run preview
```

Opens a local server (default **http://localhost:4173**) serving the same files you would ship to production.

---

## Deploy as a website (static hosting)

The frontend is a **static SPA** after build: upload the contents of `Front End/client/dist/` to any static host.

1. Build: `cd "Front End/client" && npm install && npm run build`
2. Publish the **`dist/`** folder (not `src/`):
   - [Vercel](https://vercel.com): import the repo, set **Root Directory** to `Front End/client`, framework Vite (build `npm run build`, output `dist`)
   - [Netlify](https://netlify.com): o repositório já inclui **`netlify.toml`** na raiz com `command` e `publish` corretos. Nos site settings do Netlify, **limpa** o “Build command” e **Publish directory** personalizados no painel (deixa o ficheiro mandar) **ou** usa manualmente:
     - **Build command:** `cd "Front End/client" && npm ci && npm run build`  
       (obrigatório usar `&&` entre comandos; sem isso o erro `cd: too many arguments` aparece.)
     - **Publish directory:** `Front End/client/dist`  
       (não uses só a raiz do repo; o Vite gera tudo dentro de `dist` do cliente.)
   - [Cloudflare Pages](https://pages.cloudflare.com): build command `npm run build`, output `dist`

No Node server is required in production for the main app (models load in the browser). The optional **Back end** is separate: deploy it only if you need server uploads (e.g. a small VPS or Railway/Render with `npm start` after `npm run build` in `Back end/`).

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| WebGL 2 | ✅ | ✅ | ✅ | ✅ |
| MediaRecorder MP4 | ✅ | ⚠️ WebM | ⚠️ WebM | ✅ |
| canvas.captureStream | ✅ | ✅ | ✅ | ✅ |
| OrbitControls | ✅ | ✅ | ✅ | ✅ |

> On Firefox and Safari, the recording outputs **WebM** format, not MP4. The filename will reflect this automatically.
