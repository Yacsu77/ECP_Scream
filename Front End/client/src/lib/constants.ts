export const RECORDING_MAX_DURATION_MS = 30_000

export const SUPPORTED_FORMATS = ['glb', 'stl'] as const
export type SupportedFormat = (typeof SUPPORTED_FORMATS)[number]

export const MIME_TYPES: Record<SupportedFormat, string> = {
  glb: 'model/gltf-binary',
  stl: 'model/stl',
}

export const RECORDING_MIME_TYPES = [
  'video/mp4;codecs=avc1',
  'video/mp4',
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
]

export const CAPTURE_FPS = 30

export const AUTO_SPIN_SPEED = 0.4

export const CAMERA_POSITION: [number, number, number] = [0, 1.5, 4]
export const CAMERA_FOV = 45
export const CAMERA_NEAR = 0.1
export const CAMERA_FAR = 1000

export const LIGHT_AMBIENT_INTENSITY = 0.6
export const LIGHT_DIRECTIONAL_INTENSITY = 1.2
export const LIGHT_DIRECTIONAL_POSITION: [number, number, number] = [5, 8, 5]

export const STATS_PANEL = 0

export const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001'
