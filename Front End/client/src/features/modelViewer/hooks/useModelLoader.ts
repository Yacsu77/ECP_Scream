import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import type { LoadedModel } from '@/store/useViewerStore'

export type LoaderStatus = 'idle' | 'loading' | 'loaded' | 'error'

interface UseModelLoaderReturn {
  object: THREE.Object3D | null
  status: LoaderStatus
  error: string | null
  progress: number
}

function createLoaderForFormat(format: 'glb' | 'stl'): GLTFLoader | STLLoader {
  if (format === 'glb') return new GLTFLoader()
  return new STLLoader()
}

function centerAndNormalize(object: THREE.Object3D): void {
  const box = new THREE.Box3().setFromObject(object)
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  const scale = maxDim > 0 ? 2 / maxDim : 1

  object.position.sub(center)
  object.scale.setScalar(scale)
}

export function useModelLoader(model: LoadedModel | null): UseModelLoaderReturn {
  const [object, setObject] = useState<THREE.Object3D | null>(null)
  const [status, setStatus] = useState<LoaderStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const abortRef = useRef(false)

  useEffect(() => {
    if (!model) {
      setObject(null)
      setStatus('idle')
      setError(null)
      setProgress(0)
      return
    }

    abortRef.current = false
    setStatus('loading')
    setError(null)
    setProgress(0)

    const loader = createLoaderForFormat(model.format)

    if (model.format === 'glb') {
      ;(loader as GLTFLoader).load(
        model.url,
        (gltf) => {
          if (abortRef.current) return
          centerAndNormalize(gltf.scene)
          setObject(gltf.scene)
          setStatus('loaded')
          setProgress(1)
        },
        (event) => {
          if (event.total > 0) setProgress(event.loaded / event.total)
        },
        (err) => {
          if (abortRef.current) return
          console.error('[ModelLoader] GLB error:', err)
          setError('Failed to load GLB model.')
          setStatus('error')
        }
      )
    } else {
      ;(loader as STLLoader).load(
        model.url,
        (geometry) => {
          if (abortRef.current) return
          geometry.computeVertexNormals()
          const material = new THREE.MeshStandardMaterial({
            color: 0x8b8bff,
            metalness: 0.3,
            roughness: 0.5,
          })
          const mesh = new THREE.Mesh(geometry, material)
          centerAndNormalize(mesh)
          setObject(mesh)
          setStatus('loaded')
          setProgress(1)
        },
        (event) => {
          if (event.total > 0) setProgress(event.loaded / event.total)
        },
        (err) => {
          if (abortRef.current) return
          console.error('[ModelLoader] STL error:', err)
          setError('Failed to load STL model.')
          setStatus('error')
        }
      )
    }

    return () => {
      abortRef.current = true
    }
  }, [model])

  return { object, status, error, progress }
}
