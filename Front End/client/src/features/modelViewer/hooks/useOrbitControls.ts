import { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls.js'

interface UseOrbitControlsOptions {
  enabled: boolean
  enableDamping?: boolean
  dampingFactor?: number
  minDistance?: number
  maxDistance?: number
  autoRotate?: boolean
  autoRotateSpeed?: number
}

export function useOrbitControls(options: UseOrbitControlsOptions) {
  const {
    enabled,
    enableDamping = true,
    dampingFactor = 0.08,
    minDistance = 1,
    maxDistance = 20,
    autoRotate = false,
    autoRotateSpeed = 2,
  } = options

  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const { camera, gl } = useThree()

  useEffect(() => {
    const controls = new OrbitControlsImpl(camera, gl.domElement)
    controls.enableDamping = enableDamping
    controls.dampingFactor = dampingFactor
    controls.minDistance = minDistance
    controls.maxDistance = maxDistance
    controls.autoRotate = autoRotate
    controls.autoRotateSpeed = autoRotateSpeed
    controls.enabled = enabled
    controlsRef.current = controls

    return () => {
      controls.dispose()
      controlsRef.current = null
    }
  }, [camera, gl.domElement, enableDamping, dampingFactor, minDistance, maxDistance])

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = enabled
    }
  }, [enabled])

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate
      controlsRef.current.autoRotateSpeed = autoRotateSpeed
    }
  }, [autoRotate, autoRotateSpeed])

  return controlsRef
}
