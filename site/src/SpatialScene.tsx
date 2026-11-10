import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState, type PointerEvent, type RefObject } from 'react'
import { DoubleSide, MathUtils, PlaneGeometry, SRGBColorSpace, TextureLoader, type Group } from 'three'
import { profile } from './data'

interface SceneProps { playing: boolean; reducedMotion: boolean }
interface PortraitProps extends SceneProps { interaction: RefObject<{ x: number; y: number }> }

function Portrait({ playing, reducedMotion, interaction }: PortraitProps) {
  const stage = useRef<Group>(null)
  const portrait = useRef<Group>(null)
  const elapsed = useRef(0)
  const loadedTexture = useLoader(TextureLoader, profile.portrait)
  const [texture] = useState(() => {
    const prepared = loadedTexture.clone()
    prepared.colorSpace = SRGBColorSpace
    prepared.needsUpdate = true
    return prepared
  })
  const { viewport } = useThree()
  const scale = Math.min(viewport.height / 4.7, viewport.width / 4.3)
  const [geometry] = useState(() => {
    const surface = new PlaneGeometry(3.8 * 617 / 669, 3.8, 48, 48)
    const positions = surface.attributes.position
    for (let vertex = 0; vertex < positions.count; vertex++) {
      const horizontal = positions.getX(vertex)
      const vertical = positions.getY(vertex)
      const curvature = 0.18 * (1 - (horizontal / 1.76) ** 2)
      const faceDepth = 0.12 * Math.exp(-((horizontal - 0.06) ** 2 / 0.3 + (vertical - 0.65) ** 2 / 0.5))
      positions.setZ(vertex, curvature + faceDepth)
    }
    surface.computeVertexNormals()
    return surface
  })

  useEffect(() => () => { geometry.dispose(); texture.dispose() }, [geometry, texture])

  useFrame((_, delta) => {
    if (reducedMotion) return
    const step = Math.min(delta, 0.05)
    if (playing) elapsed.current += step
    if (portrait.current) {
      portrait.current.position.y = 0.08 + Math.sin(elapsed.current * 0.85) * 0.045
      portrait.current.rotation.y = Math.sin(elapsed.current * 0.5) * 0.025
    }
    if (stage.current) {
      stage.current.rotation.y = MathUtils.damp(stage.current.rotation.y, interaction.current.x * 0.2, 5, step)
      stage.current.rotation.x = MathUtils.damp(stage.current.rotation.x, -interaction.current.y * 0.075, 5, step)
    }
  })

  return (
    <group scale={scale}>
      <group ref={stage}>
        <group ref={portrait} position={[0, 0.08, 0]}>
          <mesh geometry={geometry}>
            <meshBasicMaterial map={texture} transparent alphaTest={0.035} side={DoubleSide} toneMapped={false} />
          </mesh>
        </group>
        <mesh position={[0, -1.65, -0.3]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.48, 1.495, 96]} />
          <meshBasicMaterial color="#77e7ce" transparent opacity={0.45} side={DoubleSide} />
        </mesh>
        <mesh position={[0, -1.65, -0.3]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.68, 1.685, 96]} />
          <meshBasicMaterial color="#84aaa0" transparent opacity={0.3} side={DoubleSide} />
        </mesh>
      </group>
    </group>
  )
}

export default function SpatialScene(props: SceneProps) {
  const interaction = useRef({ x: 0, y: 0 })
  function movePortrait(event: PointerEvent<HTMLDivElement>) {
    if (props.reducedMotion) return
    const bounds = event.currentTarget.getBoundingClientRect()
    interaction.current.x = MathUtils.clamp((event.clientX - bounds.left) / bounds.width * 2 - 1, -1, 1)
    interaction.current.y = MathUtils.clamp(1 - (event.clientY - bounds.top) / bounds.height * 2, -1, 1)
  }
  function resetPointer() { interaction.current = { x: 0, y: 0 } }

  return (
    <div className="portrait-stage" onPointerDown={movePortrait} onPointerMove={movePortrait} onPointerLeave={resetPointer} onPointerCancel={resetPointer} onPointerUp={event => { if (event.pointerType !== 'mouse') resetPointer() }}>
      <Canvas role="img" frameloop={props.reducedMotion ? 'demand' : 'always'} camera={{ position: [0, 0, 7], fov: 40 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'low-power' }} fallback={<div className="scene-fallback"><img src={profile.portrait} width="617" height="669" alt="Krishnanandh N" /></div>} aria-label="Interactive photo portrait of Krishnanandh N with 3D depth">
        <Portrait {...props} interaction={interaction} />
      </Canvas>
    </div>
  )
}