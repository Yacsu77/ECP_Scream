import { Request, Response } from 'express'
import path from 'path'
import fs from 'fs'

export function uploadModel(req: Request, res: Response): void {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded.' })
    return
  }

  const { filename, originalname, size } = req.file
  const ext = path.extname(originalname).toLowerCase().replace('.', '')

  res.status(201).json({
    success: true,
    data: {
      filename,
      originalName: originalname,
      format: ext,
      size,
      url: `/uploads/temp/${filename}`,
    },
  })
}

export function deleteModel(req: Request, res: Response): void {
  const { filename } = req.params
  const filePath = path.resolve(__dirname, '../../uploads/temp', filename)

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ success: false, message: 'File not found.' })
    return
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      res.status(500).json({ success: false, message: 'Failed to delete file.' })
      return
    }
    res.status(200).json({ success: true, message: 'File deleted.' })
  })
}
