import { useViewerStore } from '@/store/useViewerStore'
import { RECORDING_MAX_DURATION_MS } from '@/lib/constants'

export function RecordingOverlay() {
  const { recordingStatus, recordingProgress, recordingError } = useViewerStore()

  const isVisible =
    recordingStatus === 'recording' ||
    recordingStatus === 'processing' ||
    recordingStatus === 'done' ||
    recordingStatus === 'error'

  if (!isVisible) return null

  const remainingSeconds = Math.ceil(
    ((1 - recordingProgress) * RECORDING_MAX_DURATION_MS) / 1000
  )

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {/* Recording: top status pill (Apple-style) */}
      {recordingStatus === 'recording' && (
        <>
          <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-xl border border-white/[0.08] shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff453a] opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff453a]" />
            </span>
            <span className="text-[12px] font-semibold text-white tracking-wide">REC</span>
            <span className="text-[11px] text-white/60 a-mono">{remainingSeconds}s</span>
          </div>

          {/* Hairline progress bar at top */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/[0.06] overflow-hidden">
            <div
              className="h-full bg-[#ff453a] transition-none"
              style={{ width: `${recordingProgress * 100}%` }}
            />
          </div>
        </>
      )}

      {/* Processing */}
      {recordingStatus === 'processing' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md pointer-events-auto">
          <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/[0.08] shadow-2xl">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-[14px] font-medium text-white a-title">Processing</p>
          </div>
        </div>
      )}

      {/* Done */}
      {recordingStatus === 'done' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md pointer-events-auto">
          <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/[0.08] shadow-2xl">
            <div className="w-12 h-12 bg-[#30d158] rounded-full flex items-center justify-center text-white text-2xl font-bold">
              ✓
            </div>
            <p className="text-[14px] font-semibold text-white a-title">Saved to Downloads</p>
          </div>
        </div>
      )}

      {/* Error */}
      {recordingStatus === 'error' && recordingError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md pointer-events-auto">
          <div className="flex flex-col items-center gap-2 px-8 py-6 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/[0.08] shadow-2xl max-w-sm">
            <div className="w-10 h-10 bg-[#ff453a]/20 rounded-full flex items-center justify-center text-[#ff453a] text-xl">
              !
            </div>
            <p className="text-[14px] font-semibold text-white a-title">Recording failed</p>
            <p className="text-[12px] text-[var(--apple-text-secondary)] text-center">{recordingError}</p>
          </div>
        </div>
      )}
    </div>
  )
}
