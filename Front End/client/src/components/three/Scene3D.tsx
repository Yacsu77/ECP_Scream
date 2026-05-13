import { useRef, Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Environment, Grid, Stats } from '@react-three/drei'
import * as THREE from 'three'
import { Controls } from './Controls'
import { ModelLoader } from './ModelLoader'
import { RecordingOverlay } from '@/components/ui/RecordingOverlay'
import { useViewerStore } from '@/store/useViewerStore'
import { useRecording } from '@/features/modelViewer/hooks/useRecording'
import { Button } from '@/components/ui/Button'
import {
  CAMERA_POSITION,
  CAMERA_FOV,
  CAMERA_NEAR,
  CAMERA_FAR,
} from '@/lib/constants'

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-5, -2, -5]} intensity={0.4} color="#8888ff" />
      <pointLight position={[-3, 3, -3]} intensity={0.8} color="#6366f1" distance={20} />
    </>
  )
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#4f46e5" wireframe />
    </mesh>
  )
}

/** Reactive background — lives inside Canvas to access the Three.js scene */
function SceneBackground() {
  const { scene, invalidate } = useThree()
  const bgColor = useViewerStore((s) => s.bgColor)

  useEffect(() => {
    scene.background = new THREE.Color(bgColor)
    invalidate()
  }, [bgColor, scene, invalidate])

  return null
}

interface Scene3DProps {
  showStats?: boolean
}

export function Scene3D({ showStats }: Scene3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const modelRef = useRef<THREE.Object3D | null>(null)

  const { model, recordingStatus, showStats: storeStats, bgColor, showGrid } = useViewerStore()
  const isRecording = recordingStatus === 'recording'

  const { startRecording, stopRecording } = useRecording({ canvasRef, modelRef })

  const displayStats = showStats ?? storeStats

  return (
    <div
      className="relative w-full h-full rounded-2xl overflow-hidden transition-colors duration-300"
      style={{ background: bgColor }}
    >
      <Canvas
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        camera={{
          fov: CAMERA_FOV,
          near: CAMERA_NEAR,
          far: CAMERA_FAR,
          position: CAMERA_POSITION,
        }}
        onCreated={({ gl }) => {
          canvasRef.current = gl.domElement
        }}
        shadows
        frameloop="demand"
      >
        <SceneBackground />
        <SceneLights />

        <Suspense fallback={<LoadingFallback />}>
          {model && <ModelLoader modelRef={modelRef} />}
          <Environment preset="city" />
        </Suspense>

        {showGrid && (
          <Grid
            args={[20, 20]}
            cellColor="#1e1e3f"
            sectionColor="#2a2a5a"
            fadeDistance={20}
            fadeStrength={1}
            position={[0, -1.2, 0]}
          />
        )}

        <Controls />
        {displayStats && <Stats />}
      </Canvas>

      <RecordingOverlay />

      {!model && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center select-none">
            <div className="text-5xl mb-4 opacity-30">📦</div>
            <p className="text-slate-400 text-sm font-medium">Upload a model to start</p>
            <p className="text-slate-600 text-xs mt-1">GLB or STL · max 100MB</p>
          </div>
        </div>
      )}

      {model && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3">
          {!isRecording ? (
            <Button
              variant="danger"
              size="md"
              onClick={startRecording}
              leftIcon={<RecIcon />}
            >
              Record Video (30s)
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="md"
              onClick={stopRecording}
              leftIcon={<StopIcon />}
            >
              Stop Recording
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

function RecIcon() {
  return (
    <span className="w-2.5 h-2.5 rounded-full bg-current animate-pulse" />
  )
}

function StopIcon() {
  return (
    <span className="w-2.5 h-2.5 rounded-sm bg-current" />
  )
}
