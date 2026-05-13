import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { useFileUpload } from '@/hooks/useFileUpload'
import { useViewerStore } from '@/store/useViewerStore'
import { formatFileSize } from '@/lib/utils'

export function UploadZone() {
  const inputRef = useRef<HTMLInputElement>(null)
  const {
    isDragging,
    uploadError,
    isLoading,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleInputChange,
    clearError,
  } = useFileUpload()

  const { model } = useViewerStore()

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload 3D model"
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center',
          'min-h-[140px] rounded-2xl cursor-pointer select-none',
          'transition-all duration-200 ease-out',
          'border border-dashed',
          isDragging
            ? 'border-[#0a84ff] bg-[#0a84ff]/10 scale-[1.01]'
            : 'border-white/[0.12] bg-white/[0.02] hover:border-white/[0.22] hover:bg-white/[0.04]',
          uploadError && 'border-[#ff453a]/50 bg-[#ff453a]/5'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".glb,.stl"
          className="hidden"
          onChange={handleInputChange}
        />

        <div className="flex flex-col items-center gap-2.5 px-5 py-6 text-center pointer-events-none">
          {isLoading ? (
            <div className="w-8 h-8 border-2 border-[#0a84ff] border-t-transparent rounded-full animate-spin" />
          ) : (
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center text-lg',
                'transition-all duration-200',
                isDragging
                  ? 'bg-[#0a84ff]/20 scale-110'
                  : 'bg-white/[0.06]'
              )}
            >
              {isDragging ? '↓' : '+'}
            </div>
          )}

          <div>
            <p className="text-[13px] font-medium text-white a-title">
              {isDragging ? 'Release to upload' : 'Drop a 3D model'}
            </p>
            <p className="text-[11px] text-[var(--apple-text-tertiary)] mt-0.5">
              GLB or STL · up to 100 MB
            </p>
          </div>
        </div>
      </div>

      {model && (
        <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#30d158] shrink-0" />
          <span className="text-[12px] text-white font-medium truncate flex-1">
            {model.name}
          </span>
          <span className="text-[11px] text-[var(--apple-text-tertiary)] a-mono shrink-0">
            {formatFileSize(model.size)}
          </span>
        </div>
      )}

      {uploadError && (
        <div className="mt-2 flex items-center justify-between px-3 py-2 bg-[#ff453a]/10 border border-[#ff453a]/20 rounded-xl">
          <p className="text-[12px] text-[#ff6b62] font-medium">{uploadError.message}</p>
          <button
            onClick={(e) => { e.stopPropagation(); clearError() }}
            className="text-[#ff6b62] hover:text-white text-xs ml-2 font-bold"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
