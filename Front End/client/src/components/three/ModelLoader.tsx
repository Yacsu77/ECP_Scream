import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useModelLoader } from '@/features/modelViewer/hooks/useModelLoader'
import { useViewerStore } from '@/store/useViewerStore'

interface ModelLoaderProps {
  modelRef?: React.RefObject<THREE.Object3D | null>
}

export function ModelLoader({ modelRef }: ModelLoaderProps) {
  const { model } = useViewerStore()
  const { object, status, error } = useModelLoader(model)
  const sceneRef = useRef<THREE.Object3D | null>(null)
  const { scene } = useThree()

  useEffect(() => {
    if (sceneRef.current) {
      scene.remove(sceneRef.current)
      sceneRef.current = null
    }

    if (object) {
      scene.add(object)
      sceneRef.current = object
      if (modelRef) {
        (modelRef as React.MutableRefObject<THREE.Object3D | null>).current = object
      }
    }

    return () => {
      if (sceneRef.current) {
        scene.remove(sceneRef.current)
      }
    }
  }, [object, scene, modelRef])

  if (status === 'loading') {
    return null
  }

  if (status === 'error') {
    console.error('[ModelLoader]', error)
    return null
  }

  return null
}
