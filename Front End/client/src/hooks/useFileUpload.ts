import { useState, useCallback, useRef } from 'react'
import { isSupportedFormat, getModelFormat, formatFileSize } from '@/lib/utils'
import { useViewerStore } from '@/store/useViewerStore'

export interface UploadError {
  type: 'format' | 'size' | 'read'
  message: string
}

interface UseFileUploadReturn {
  isDragging: boolean
  uploadError: UploadError | null
  isLoading: boolean
  handleFile: (file: File) => void
  handleDrop: (e: React.DragEvent<HTMLElement>) => void
  handleDragOver: (e: React.DragEvent<HTMLElement>) => void
  handleDragLeave: (e: React.DragEvent<HTMLElement>) => void
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  clearError: () => void
}

const MAX_FILE_SIZE_MB = 100

export function useFileUpload(): UseFileUploadReturn {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<UploadError | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const dragCounterRef = useRef(0)

  const { setModel, clearModel } = useViewerStore()

  const handleFile = useCallback(
    (file: File) => {
      setUploadError(null)

      if (!isSupportedFormat(file.name)) {
        setUploadError({
          type: 'format',
          message: `Format not supported. Use .glb or .stl files.`,
        })
        return
      }

      const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024
      if (file.size > maxBytes) {
        setUploadError({
          type: 'size',
          message: `File too large (${formatFileSize(file.size)}). Max: ${MAX_FILE_SIZE_MB}MB.`,
        })
        return
      }

      const format = getModelFormat(file.name)!
      setIsLoading(true)
      clearModel()

      const url = URL.createObjectURL(file)
      setModel({ name: file.name, format, url, size: file.size })
      setIsLoading(false)
    },
    [setModel, clearModel]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounterRef.current = 0
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    dragCounterRef.current -= 1
    if (dragCounterRef.current === 0) setIsDragging(false)
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    dragCounterRef.current += 1
    setIsDragging(true)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
      e.target.value = ''
    },
    [handleFile]
  )

  const clearError = useCallback(() => setUploadError(null), [])

  return {
    isDragging,
    uploadError,
    isLoading,
    handleFile,
    handleDrop: (e) => { handleDragEnter(e); handleDrop(e) },
    handleDragOver,
    handleDragLeave,
    handleInputChange,
    clearError,
  }
}
