import multer from 'multer'
import path from 'path'
import fs from 'fs'

const UPLOAD_DIR = path.resolve(__dirname, '../../uploads/temp')

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${unique}${ext}`)
  },
})

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void {
  const ext = path.extname(file.originalname).toLowerCase()
  if (ext === '.glb' || ext === '.stl') {
    cb(null, true)
  } else {
    cb(new Error(`Unsupported format: ${ext}. Only .glb and .stl are allowed.`))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
})
