import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export type RecordingStatus = 'idle' | 'recording' | 'processing' | 'done' | 'error'

export interface LoadedModel {
  name: string
  format: 'glb' | 'stl'
  url: string
  size: number
}

export interface ViewerState {
  model: LoadedModel | null
  recordingStatus: RecordingStatus
  recordingProgress: number
  recordingError: string | null
  isControlsEnabled: boolean
  showStats: boolean
  autoSpin: boolean

  // Scene customization
  bgColor: string
  spinSpeed: number
  showGrid: boolean

  setModel: (model: LoadedModel | null) => void
  setRecordingStatus: (status: RecordingStatus) => void
  setRecordingProgress: (progress: number) => void
  setRecordingError: (error: string | null) => void
  setControlsEnabled: (enabled: boolean) => void
  setShowStats: (show: boolean) => void
  setAutoSpin: (spin: boolean) => void
  setBgColor: (color: string) => void
  setSpinSpeed: (speed: number) => void
  setShowGrid: (show: boolean) => void
  resetRecording: () => void
  clearModel: () => void
}

export const DEFAULT_BG = '#0a0a0f'

export const useViewerStore = create<ViewerState>()(
  subscribeWithSelector((set) => ({
    model: null,
    recordingStatus: 'idle',
    recordingProgress: 0,
    recordingError: null,
    isControlsEnabled: true,
    showStats: false,
    autoSpin: false,

    bgColor: DEFAULT_BG,
    spinSpeed: 1.0,
    showGrid: true,

    setModel: (model) => set({ model, recordingStatus: 'idle', recordingProgress: 0 }),
    setRecordingStatus: (status) => set({ recordingStatus: status }),
    setRecordingProgress: (progress) => set({ recordingProgress: progress }),
    setRecordingError: (error) => set({ recordingError: error }),
    setControlsEnabled: (enabled) => set({ isControlsEnabled: enabled }),
    setShowStats: (show) => set({ showStats: show }),
    setAutoSpin: (spin) => set({ autoSpin: spin }),
    setBgColor: (color) =>
      set((state) => ({
        bgColor: color,
        // When the user changes background away from the default,
        // hide the grid so only the model is visible — per UX spec.
        showGrid: color === DEFAULT_BG ? state.showGrid : false,
      })),
    setSpinSpeed: (speed) => set({ spinSpeed: speed }),
    setShowGrid: (show) => set({ showGrid: show }),

    resetRecording: () =>
      set({
        recordingStatus: 'idle',
        recordingProgress: 0,
        recordingError: null,
        isControlsEnabled: true,
        autoSpin: false,
      }),

    clearModel: () =>
      set({
        model: null,
        recordingStatus: 'idle',
        recordingProgress: 0,
        recordingError: null,
        isControlsEnabled: true,
        autoSpin: false,
      }),
  }))
)
