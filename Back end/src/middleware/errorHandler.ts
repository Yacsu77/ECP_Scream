import { Request, Response, NextFunction } from 'express'
import multer from 'multer'

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[ErrorHandler]', err.message)

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ success: false, message: 'File too large. Max 100MB allowed.' })
      return
    }
    res.status(400).json({ success: false, message: err.message })
    return
  }

  if (err.message.startsWith('Unsupported format')) {
    res.status(415).json({ success: false, message: err.message })
    return
  }

  res.status(500).json({ success: false, message: 'Internal server error.' })
}
