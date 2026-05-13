import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsType } from 'three-stdlib'
import { useViewerStore } from '@/store/useViewerStore'

export function Controls() {
  const controlsRef = useRef<OrbitControlsType>(null)
  const { isControlsEnabled } = useViewerStore()
  const { invalidate } = useThree()

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = isControlsEnabled
    }
  }, [isControlsEnabled])

  useFrame(() => {
    if (controlsRef.current?.enabled) {
      controlsRef.current.update()
      invalidate()
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      minDistance={1}
      maxDistance={20}
      enabled={isControlsEnabled}
      makeDefault
    />
  )
}
