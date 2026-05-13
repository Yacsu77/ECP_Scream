import { SUPPORTED_FORMATS, type SupportedFormat, RECORDING_MIME_TYPES } from './constants'

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? ''
}

export function isSupportedFormat(filename: string): boolean {
  const ext = getFileExtension(filename)
  return (SUPPORTED_FORMATS as readonly string[]).includes(ext)
}

export function getModelFormat(filename: string): SupportedFormat | null {
  const ext = getFileExtension(filename)
  if ((SUPPORTED_FORMATS as readonly string[]).includes(ext)) {
    return ext as SupportedFormat
  }
  return null
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatDuration(ms: number): string {
  const seconds = Math.ceil(ms / 1000)
  return `${seconds}s`
}

export function getSupportedMimeType(): string {
  for (const mime of RECORDING_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(mime)) return mime
  }
  return 'video/webm'
}

export function getVideoExtension(mimeType: string): string {
  if (mimeType.startsWith('video/mp4')) return 'mp4'
  return 'webm'
}

export function generateFileName(modelName: string, ext: string): string {
  const base = modelName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  return `${base}_${timestamp}.${ext}`
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
