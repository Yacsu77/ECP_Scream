import { useCallback, useRef } from 'react'
import { saveAs } from 'file-saver'
import gsap from 'gsap'
import * as THREE from 'three'
import { useViewerStore } from '@/store/useViewerStore'
import { useTimer } from '@/hooks/useTimer'
import {
  getSupportedMimeType,
  getVideoExtension,
  generateFileName,
} from '@/lib/utils'
import {
  RECORDING_MAX_DURATION_MS,
  CAPTURE_FPS,
} from '@/lib/constants'

interface UseRecordingOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  modelRef: React.RefObject<THREE.Object3D | null>
}

interface UseRecordingReturn {
  startRecording: () => void
  stopRecording: () => void
}

export function useRecording({ canvasRef, modelRef }: UseRecordingOptions): UseRecordingReturn {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const spinTweenRef = useRef<gsap.core.Tween | null>(null)

  const {
    setRecordingStatus,
    setRecordingProgress,
    setRecordingError,
    setControlsEnabled,
    setAutoSpin,
    resetRecording,
    model,
    spinSpeed,
  } = useViewerStore()

  const stopRecording = useCallback(() => {
    spinTweenRef.current?.kill()
    spinTweenRef.current = null

    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop()
    }

    resetRecording()
  }, [resetRecording])

  const { start: startTimer, stop: stopTimer } = useTimer({
    duration: RECORDING_MAX_DURATION_MS,
    onTick: (_elapsed, _remaining) => {
      const progress = _elapsed / RECORDING_MAX_DURATION_MS
      setRecordingProgress(progress)
    },
    onComplete: () => {
      if (mediaRecorderRef.current?.state !== 'inactive') {
        setRecordingStatus('processing')
        mediaRecorderRef.current?.stop()
      }
    },
  })

  const startRecording = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      setRecordingError('Canvas not available.')
      return
    }

    const mimeType = getSupportedMimeType()
    const ext = getVideoExtension(mimeType)
    const fileName = generateFileName(model?.name ?? 'model', ext)

    chunksRef.current = []

    let stream: MediaStream
    try {
      stream = (canvas as HTMLCanvasElement & { captureStream: (fps: number) => MediaStream }).captureStream(CAPTURE_FPS)
    } catch (err) {
      console.error('[Recording] captureStream error:', err)
      setRecordingError('Could not capture canvas stream.')
      return
    }

    let recorder: MediaRecorder
    try {
      recorder = new MediaRecorder(stream, { mimeType })
    } catch (err) {
      console.error('[Recording] MediaRecorder error:', err)
      setRecordingError('MediaRecorder initialization failed.')
      return
    }

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.onstop = () => {
      stopTimer()
      const blob = new Blob(chunksRef.current, { type: mimeType })
      chunksRef.current = []
      saveAs(blob, fileName)
      setRecordingStatus('done')
      setControlsEnabled(true)
      setAutoSpin(false)

      setTimeout(() => resetRecording(), 3000)
    }

    recorder.onerror = (e) => {
      console.error('[Recording] error:', e)
      stopTimer()
      setRecordingError('Recording failed unexpectedly.')
      setControlsEnabled(true)
      setAutoSpin(false)
    }

    mediaRecorderRef.current = recorder

    setControlsEnabled(false)
    setAutoSpin(true)
    setRecordingStatus('recording')
    setRecordingProgress(0)

    // Total rotation = spinSpeed full turns over 30 seconds
    if (modelRef.current) {
      const totalRotation = Math.PI * 2 * spinSpeed * (RECORDING_MAX_DURATION_MS / 1000)
      spinTweenRef.current = gsap.to(modelRef.current.rotation, {
        y: modelRef.current.rotation.y + totalRotation,
        duration: RECORDING_MAX_DURATION_MS / 1000,
        ease: 'none',
      })
    }

    recorder.start(200)
    startTimer()
  }, [
    canvasRef,
    modelRef,
    model,
    spinSpeed,
    setRecordingStatus,
    setRecordingProgress,
    setRecordingError,
    setControlsEnabled,
    setAutoSpin,
    resetRecording,
    startTimer,
    stopTimer,
  ])

  return { startRecording, stopRecording }
}
