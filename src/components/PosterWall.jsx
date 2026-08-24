import { Component, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  ChevronLeft,
  ChevronRight,
  // Download,
  LayoutGrid,
  Lightbulb,
  LogIn,
  Rows3,
  Star,
  // Volume2,
  // VolumeX,
  X,
} from 'lucide-react'
import * as THREE from 'three'
import { FILMS /*, DEFAULT_ATMOSPHERE */ } from '../data/site'
// import usePosterAudio from '../hooks/usePosterAudio'
import { useHorizontalSwipe } from '../hooks/usePointerSwipe'
import { cx } from '../utils/dom'
// import wallWhiteTex from '../assets/wall-white.jpg'
import imdbLogo from '../assets/imdb-logo.png'

// const GALLERY_BG_VIDEO = '/video/gallery-bg.mp4'
const GALLERY_WALL_COLOR = '#12100e'

const WALL_H = 6.2
// Match supplied posters (1024×717 ≈ 1.428) — ~30% larger on wall
const POSTER_W = 2.78
const POSTER_H = 1.95
const CAM_Z = 4.6
const CAM_Y = 3.4
const LOOK_Y = 3.2
const POSTER_Z = 0.07
const FOV_DEG = 40
const SPACING = 6.0
const SNAP_LOCK_MS = 780
const WALL_PAD = 8
const POSTER_TEX_W = 1024
const POSTER_TEX_H = 717
const DRAG_PX_PER_POSTER = 820
const DRAG_MOUSE_GAIN = 0.575
const DRAG_TOUCH_GAIN = 0.9775
const DRAG_FOLLOW = 14
const SNAP_FOLLOW = 2.55
const DRAG_COAST_SEC = 0.1
// const ROOM_ZOOM_MS = 560 // zoom enter/exit disabled

/** Camera Z so the poster plane covers the viewport (edge-to-edge). */
function posterCoverZ(aspect, fovDeg = FOV_DEG) {
  const vFov = THREE.MathUtils.degToRad(fovDeg)
  const distH = POSTER_H / (2 * Math.tan(vFov / 2))
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * Math.max(aspect, 0.01))
  const distW = POSTER_W / (2 * Math.tan(hFov / 2))
  return Math.min(distH, distW) + POSTER_Z
}

/** Enter-room dive — nearly full cover for a strong dive into the frame. */
function posterEnterZ(aspect, fovDeg = FOV_DEG) {
  const cover = posterCoverZ(aspect, fovDeg)
  return THREE.MathUtils.lerp(CAM_Z, cover, 0.95)
}

function posterWorldX(index) {
  return (index - (FILMS.length - 1) / 2) * SPACING
}

function nearestPosterIndex(worldX) {
  let best = 0
  let bestDist = Infinity
  for (let i = 0; i < FILMS.length; i += 1) {
    const d = Math.abs(posterWorldX(i) - worldX)
    if (d < bestDist) {
      bestDist = d
      best = i
    }
  }
  return best
}

const PALETTES = [
  ['#1a2332', '#3d5a80', '#e0fbfc'],
  ['#2b1d1a', '#8b4513', '#f4e4bc'],
  ['#1a1a2e', '#3d4a5c', '#c9a66b'],
]

function createPosterTexture(film, paletteIndex) {
  const w = POSTER_TEX_W
  const h = POSTER_TEX_H
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  const [c0, c1, c2] = PALETTES[paletteIndex % PALETTES.length]

  const grad = ctx.createLinearGradient(0, 0, w, h)
  grad.addColorStop(0, c0)
  grad.addColorStop(0.55, c1)
  grad.addColorStop(1, c2)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.78)
  vig.addColorStop(0, 'rgba(0,0,0,0)')
  vig.addColorStop(1, 'rgba(0,0,0,0.5)')
  ctx.fillStyle = vig
  ctx.fillRect(0, 0, w, h)

  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = '500 28px Figtree, sans-serif'
  ctx.fillText(film.index, 48, 80)

  ctx.fillStyle = '#ffffff'
  ctx.font = '600 58px Figtree, sans-serif'
  const words = film.title.toUpperCase().split(' ')
  let line = ''
  let y = h * 0.42
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > w - 96) {
      ctx.fillText(line, 48, y)
      line = word
      y += 68
    } else {
      line = test
    }
  })
  if (line) ctx.fillText(line, 48, y)

  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.font = '500 26px Figtree, sans-serif'
  ctx.fillText(String(film.year).toUpperCase(), 48, h - 80)
  ctx.font = '500 20px Figtree, sans-serif'
  ctx.fillText(film.credits.toUpperCase(), 48, h - 48)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

function loadPosterTexture(url) {
  // Cover-fit into landscape frame — no stretch; crop only if ratios differ
  const frameW = POSTER_TEX_W
  const frameH = POSTER_TEX_H
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = frameW
      canvas.height = frameH
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, frameW, frameH)

      const scale = Math.max(frameW / img.width, frameH / img.height)
      const drawW = img.width * scale
      const drawH = img.height * scale
      const ox = (frameW - drawW) / 2
      const oy = (frameH - drawH) / 2
      ctx.drawImage(img, ox, oy, drawW, drawH)

      const texture = new THREE.CanvasTexture(canvas)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = 8
      texture.needsUpdate = true
      resolve(texture)
    }
    img.onerror = reject
    img.src = url
  })
}

function useWallTexture(url) {
  const [map, setMap] = useState(null)

  useEffect(() => {
    let alive = true
    let loaded = null
    const loader = new THREE.TextureLoader()
    loader.load(
      url,
      (tex) => {
        if (!alive) {
          tex.dispose()
          return
        }
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = 8
        // Mirrored repeat = seamless look without hard tile edges
        tex.wrapS = THREE.MirroredRepeatWrapping
        tex.wrapT = THREE.MirroredRepeatWrapping
        tex.needsUpdate = true
        loaded = tex
        setMap(tex)
      },
      undefined,
      () => {
        if (alive) setMap(null)
      },
    )
    return () => {
      alive = false
      loaded?.dispose()
    }
  }, [url])

  return map
}

function useWallVideoTexture(src, enabled) {
  const [map, setMap] = useState(null)
  const [ready, setReady] = useState(0)

  useEffect(() => {
    if (!enabled) {
      setMap(null)
      setReady(0)
      return undefined
    }

    const video = document.createElement('video')
    video.src = src
    video.crossOrigin = 'anonymous'
    video.loop = true
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')

    const tex = new THREE.VideoTexture(video)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    tex.generateMipmaps = false
    tex.wrapS = THREE.MirroredRepeatWrapping
    tex.wrapT = THREE.MirroredRepeatWrapping

    let alive = true
    const tryPlay = () => {
      if (!alive) return
      video.play().catch(() => {})
    }
    const onMeta = () => {
      if (!alive) return
      setReady((n) => n + 1)
      tryPlay()
    }
    video.addEventListener('loadedmetadata', onMeta)
    video.addEventListener('canplay', tryPlay)
    video.load()
    tryPlay()
    setMap(tex)

    return () => {
      alive = false
      video.removeEventListener('loadedmetadata', onMeta)
      video.removeEventListener('canplay', tryPlay)
      video.pause()
      video.removeAttribute('src')
      video.load()
      tex.dispose()
      setMap(null)
      setReady(0)
    }
  }, [src, enabled])

  return { map, ready }
}

const FRAME_DEPTH = 0.04
const FRAME_LIP = 0.028
const FRAME_MAT = {
  color: '#3a3734',
  roughness: 0.72,
  metalness: 0.12,
}

function createBevelFrameGeometry(innerW, innerH) {
  const outerW = innerW + FRAME_LIP * 2
  const outerH = innerH + FRAME_LIP * 2
  const shape = new THREE.Shape()
  const ow = outerW / 2
  const oh = outerH / 2
  shape.moveTo(-ow, -oh)
  shape.lineTo(ow, -oh)
  shape.lineTo(ow, oh)
  shape.lineTo(-ow, oh)
  shape.closePath()

  const hole = new THREE.Path()
  const iw = innerW / 2
  const ih = innerH / 2
  hole.moveTo(-iw, -ih)
  hole.lineTo(-iw, ih)
  hole.lineTo(iw, ih)
  hole.lineTo(iw, -ih)
  hole.closePath()
  shape.holes.push(hole)

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: FRAME_DEPTH,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.006,
    bevelOffset: 0,
    bevelSegments: 2,
    curveSegments: 1,
  })
  geo.translate(0, 0, -FRAME_DEPTH / 2)
  geo.computeVertexNormals()
  return geo
}

const SHADOW_TEX = (() => {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  // Soft top-light blob — wide falloff so motion never reads as a hard slash
  const g = ctx.createRadialGradient(
    size / 2,
    size * 0.54,
    size * 0.08,
    size / 2,
    size * 0.5,
    size * 0.48,
  )
  g.addColorStop(0, 'rgba(8, 6, 4, 0.55)')
  g.addColorStop(0.35, 'rgba(8, 6, 4, 0.28)')
  g.addColorStop(0.65, 'rgba(8, 6, 4, 0.1)')
  g.addColorStop(1, 'rgba(8, 6, 4, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
})()

/** Soft cloud dapples — live on the plaster wall only (behind frames). */
const DRIFT_SHADOW_TEX = (() => {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, size, size)
  ;[
    [0.42, 0.48, 0.38, 0.55],
    [0.6, 0.38, 0.3, 0.4],
    [0.5, 0.64, 0.28, 0.35],
    [0.32, 0.55, 0.22, 0.28],
  ].forEach(([cx, cy, r, peak]) => {
    const g = ctx.createRadialGradient(
      size * cx,
      size * cy,
      0,
      size * cx,
      size * cy,
      size * r,
    )
    g.addColorStop(0, `rgba(22, 16, 10, ${peak})`)
    g.addColorStop(0.45, `rgba(22, 16, 10, ${peak * 0.45})`)
    g.addColorStop(1, 'rgba(22, 16, 10, 0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
  })
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
})()

const DRIFT_SHADOWS = [
  { speed: 0.048, ampX: 2.4, ampY: 0.7, phase: 0.3, w: 4.2, h: 2.8, opacity: 0.34 },
  { speed: 0.03, ampX: 3.1, ampY: 0.85, phase: 1.8, w: 5.2, h: 3.4, opacity: 0.26 },
  { speed: 0.062, ampX: 1.8, ampY: 0.5, phase: 4.0, w: 3.2, h: 2.1, opacity: 0.3 },
]

/** Drifting light patches on the gallery wall — never on poster frames. */
function WallDriftShadows({ camXRef, motionLite }) {
  const group = useRef()
  const mats = useRef([])
  const tRef = useRef(Math.random() * 20)

  useFrame((_, dt) => {
    if (!group.current || motionLite) return
    tRef.current += dt
    const t = tRef.current
    const camX = typeof camXRef?.current === 'number' ? camXRef.current : 0

    group.current.children.forEach((mesh, i) => {
      const cfg = DRIFT_SHADOWS[i]
      if (!cfg) return
      mesh.position.x =
        camX * 0.45 +
        Math.sin(t * cfg.speed + cfg.phase) * cfg.ampX +
        Math.sin(t * cfg.speed * 0.37 + cfg.phase * 1.3) * cfg.ampX * 0.3
      mesh.position.y =
        CAM_Y + 0.35 + Math.cos(t * cfg.speed * 0.8 + cfg.phase) * cfg.ampY
      // In front of plaster, still behind frames (~0.07)
      mesh.position.z = 0.03
      mesh.rotation.z = Math.sin(t * cfg.speed * 0.35 + cfg.phase) * 0.12
      const mat = mats.current[i]
      if (mat) {
        mat.opacity =
          cfg.opacity *
          (0.88 + 0.12 * Math.sin(t * cfg.speed * 1.05 + cfg.phase))
      }
    })
  })

  return (
    <group ref={group}>
      {DRIFT_SHADOWS.map((cfg, i) => (
        <mesh
          key={`wall-drift-${i}`}
          position={[0, CAM_Y + 0.35, 0.03]}
        >
          <planeGeometry args={[cfg.w, cfg.h]} />
          <meshBasicMaterial
            ref={(el) => {
              mats.current[i] = el
            }}
            map={DRIFT_SHADOW_TEX}
            color="#1a140f"
            transparent
            opacity={cfg.opacity}
            depthTest
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

// Soft protective-foil sheen — drifts with camera so light seems to travel
const FOIL_SHEEN_TEX = (() => {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, size, size)

  const streak = ctx.createLinearGradient(0, size * 0.15, size, size * 0.85)
  streak.addColorStop(0, 'rgba(255,255,255,0)')
  streak.addColorStop(0.38, 'rgba(255,252,245,0)')
  streak.addColorStop(0.48, 'rgba(255,252,245,0.55)')
  streak.addColorStop(0.52, 'rgba(255,255,255,0.72)')
  streak.addColorStop(0.58, 'rgba(255,252,245,0.4)')
  streak.addColorStop(0.7, 'rgba(255,255,255,0)')
  streak.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = streak
  ctx.fillRect(0, 0, size, size)

  const bloom = ctx.createRadialGradient(
    size * 0.42,
    size * 0.38,
    size * 0.02,
    size * 0.5,
    size * 0.48,
    size * 0.42,
  )
  bloom.addColorStop(0, 'rgba(255,255,255,0.35)')
  bloom.addColorStop(0.45, 'rgba(255,248,235,0.12)')
  bloom.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = bloom
  ctx.fillRect(0, 0, size, size)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
})()

function FramedPoster({
  filmIndex,
  x,
  active,
  texture,
  onSelect,
  spotlightOn,
  motionLite,
}) {
  const { camera, pointer } = useThree()
  const group = useRef()
  const shadowMesh = useRef()
  const foilSheen = useRef()
  const foilSheenMat = useRef()
  const foilBaseMat = useRef()
  const scale = useMemo(() => new THREE.Vector3(1, 1, 1), [])
  const shadowMat = useRef()
  const spotAmt = useRef(0)
  const tiltX = useRef(0)
  const tiltY = useRef(0)
  const shadowOffX = useRef(0.012)
  const shadowOffY = useRef(-0.03)
  const sheenUV = useMemo(() => new THREE.Vector2(0, 0), [])
  const sheenMap = useMemo(() => {
    const map = FOIL_SHEEN_TEX.clone()
    map.wrapS = THREE.ClampToEdgeWrapping
    map.wrapT = THREE.ClampToEdgeWrapping
    map.needsUpdate = true
    return map
  }, [])
  const frameGeo = useMemo(
    () => createBevelFrameGeometry(POSTER_W, POSTER_H),
    [],
  )

  useEffect(() => {
    return () => {
      frameGeo.dispose()
      sheenMap.dispose()
    }
  }, [frameGeo, sheenMap])

  useFrame((_, dt) => {
    if (!group.current || motionLite) return
    // Same damp as gallery lights — shadow tracks the light source fade
    spotAmt.current = THREE.MathUtils.damp(
      spotAmt.current,
      spotlightOn ? 1 : 0,
      4.2,
      dt,
    )
    const spot = spotAmt.current

    // Card tilt toward the cursor — R3F pointer is NDC (−1…1).
    // Vertical: invert so top leans toward the pointer.
    // Horizontal: positive Y rot (not inverted) — side lean was caving “inside”.
    const amp = active ? 1 : 0.35
    tiltX.current = THREE.MathUtils.damp(
      tiltX.current,
      -pointer.y * 0.03 * amp,
      5.2,
      dt,
    )
    tiltY.current = THREE.MathUtils.damp(
      tiltY.current,
      pointer.x * 0.038 * amp,
      5.2,
      dt,
    )
    const tx = tiltX.current
    const ty = tiltY.current

    group.current.rotation.x = tx
    group.current.rotation.y = ty
    // Parallax: vertical opposite to pointer; horizontal with the lean (not against it)
    group.current.position.x = x + pointer.x * 0.01 * amp
    group.current.position.y = CAM_Y - pointer.y * 0.008 * amp
    group.current.position.z = 0.07

    // Keep frame flush on the wall — spotlight is light only, not a pop-out
    const s = active ? 1.03 : 0.97
    scale.set(s, s, 1)
    group.current.scale.lerp(scale, 1 - Math.exp(-6 * dt))

    // Contact shadow stays wall-flush (counter-tilt) and lags the lean
    if (shadowMesh.current) {
      shadowMesh.current.rotation.x = -tx
      shadowMesh.current.rotation.y = -ty
      shadowOffX.current = THREE.MathUtils.damp(
        shadowOffX.current,
        0.012 - pointer.x * 0.014 * amp,
        3.2,
        dt,
      )
      shadowOffY.current = THREE.MathUtils.damp(
        shadowOffY.current,
        -0.03 + pointer.y * 0.012 * amp,
        3.2,
        dt,
      )
      shadowMesh.current.position.x = shadowOffX.current
      shadowMesh.current.position.y = shadowOffY.current
      shadowMesh.current.position.z = -0.055
      shadowMesh.current.visible = spot < 0.98
    }
    if (shadowMat.current) {
      const soft = active ? 0.42 : 0.28
      shadowMat.current.opacity = THREE.MathUtils.lerp(soft, 0, spot)
    }

    // Tin foil: room light only — front spotlight washes it, so hide under spot
    const viewX = THREE.MathUtils.clamp((camera.position.x - x) / 2.4, -1, 1)
    const viewY = THREE.MathUtils.clamp(
      (camera.position.y - CAM_Y) / 2.2,
      -0.5,
      0.5,
    )
    sheenUV.set(
      viewX * 0.28 + pointer.x * 0.2 + ty * 1.1,
      -viewX * 0.1 + viewY * 0.12 + pointer.y * 0.16 - tx * 0.9,
    )
    if (foilSheenMat.current?.map) {
      foilSheenMat.current.map.offset.lerp(sheenUV, 1 - Math.exp(-5.5 * dt))
    }
    const glance = 0.55 + (1 - Math.abs(viewX)) * 0.45
    if (foilSheenMat.current) {
      const roomPeak = (active ? 0.22 : 0.14) * glance
      foilSheenMat.current.opacity = THREE.MathUtils.damp(
        foilSheenMat.current.opacity,
        THREE.MathUtils.lerp(roomPeak, 0, spot),
        6,
        dt,
      )
    }
    if (foilBaseMat.current) {
      foilBaseMat.current.opacity = THREE.MathUtils.lerp(
        active ? 0.07 : 0.045,
        0,
        spot,
      )
    }
  })

  return (
    <group
      ref={group}
      position={[x, CAM_Y, 0.07]}
      onClick={(e) => {
        e.stopPropagation()
        onSelect?.(filmIndex)
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto'
      }}
    >
      {/* Soft contact shadow — top light, flush on the wall */}
      <mesh
        ref={shadowMesh}
        position={[0.012, -0.03, -0.055]}
        renderOrder={-1}
      >
        <planeGeometry args={[POSTER_W + 0.42, POSTER_H + 0.38]} />
        <meshBasicMaterial
          ref={shadowMat}
          map={SHADOW_TEX}
          transparent
          opacity={0.48}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Dark beveled gallery frame — catches room lights on edges */}
      <mesh geometry={frameGeo} castShadow receiveShadow>
        <meshStandardMaterial
          color={FRAME_MAT.color}
          roughness={FRAME_MAT.roughness}
          metalness={FRAME_MAT.metalness}
        />
      </mesh>

      {/* Inner mat — thin so the print isn’t boxed in */}
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[POSTER_W + 0.004, POSTER_H + 0.004]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.95} metalness={0} />
      </mesh>

      <mesh position={[0, 0, 0.02]} castShadow>
        <planeGeometry args={[POSTER_W, POSTER_H]} />
        <meshStandardMaterial map={texture} roughness={0.52} metalness={0.03} />
      </mesh>

      {/* Protective foil — thin clear coat over the print */}
      <mesh position={[0, 0, 0.029]}>
        <planeGeometry args={[POSTER_W, POSTER_H]} />
        <meshPhysicalMaterial
          ref={foilBaseMat}
          color="#f7fafc"
          transparent
          opacity={0.06}
          roughness={0.18}
          metalness={0.04}
          clearcoat={1}
          clearcoatRoughness={0.12}
          reflectivity={0.55}
          depthWrite={false}
        />
      </mesh>

      {/* Traveling sheen — follows gallery scroll / camera / mouse */}
      <mesh ref={foilSheen} position={[0, 0, 0.032]} renderOrder={2}>
        <planeGeometry args={[POSTER_W, POSTER_H]} />
        <meshBasicMaterial
          ref={foilSheenMat}
          map={sheenMap}
          transparent
          opacity={0.16}
          depthWrite={false}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

function GalleryWorld({
  activeIndex,
  onSelect,
  spotlightOn,
  wallVideo,
  scrubXRef,
  dragLiveRef,
  camXRef,
  camZRef,
  lookYRef,
  enterZRef,
  motionLite,
}) {
  const { camera, size, gl } = useThree()
  // Plain cream wall — image/video BG commented out
  // const plasterMap = useWallTexture(wallWhiteTex)
  // const { map: videoMap, ready: videoReady } = useWallVideoTexture(
  //   GALLERY_BG_VIDEO,
  //   wallVideo,
  // )
  // const wallMap = wallVideo ? videoMap || plasterMap : plasterMap
  const wallMap = null
  const videoReady = false
  const spotRef = useRef()
  const spotTarget = useRef()
  const keyLight = useRef()
  const ambientRef = useRef()
  const fillRef = useRef()
  const poolRefs = useRef([])
  const fixtureRef = useRef()
  const spotlightAmt = useRef(0)
  const lookYSmooth = useRef(LOOK_Y)
  const [posterMaps, setPosterMaps] = useState(() =>
    FILMS.map((film, filmIndex) => createPosterTexture(film, filmIndex)),
  )

  useEffect(() => {
    let alive = true
    const fallbacks = FILMS.map((film, filmIndex) =>
      createPosterTexture(film, filmIndex),
    )
    const loads = FILMS.map(async (film, filmIndex) => {
      if (!film.poster) return fallbacks[filmIndex]
      try {
        const tex = await loadPosterTexture(film.poster)
        fallbacks[filmIndex].dispose()
        return tex
      } catch {
        return fallbacks[filmIndex]
      }
    })

    Promise.all(loads).then((maps) => {
      if (!alive) {
        maps.forEach((m) => m.dispose())
        return
      }
      setPosterMaps(maps)
    })

    return () => {
      alive = false
    }
  }, [])

  const posters = useMemo(
    () =>
      FILMS.map((film, filmIndex) => ({
        film,
        filmIndex,
        x: posterWorldX(filmIndex),
        texture: posterMaps[filmIndex],
      })),
    [posterMaps],
  )

  const focusX = posters[activeIndex]?.x ?? 0
  const wallWidth =
    (posters[posters.length - 1]?.x ?? 0) -
    (posters[0]?.x ?? 0) +
    WALL_PAD * 2

  useEffect(() => {
    if (!wallMap) return undefined

    // Same tile size for photo + video — keep natural proportion, repeat across wall
    const src = wallMap.image
    if (!src) return undefined
    const srcW =
      src.videoWidth || src.naturalWidth || src.width || 16
    const srcH =
      src.videoHeight || src.naturalHeight || src.height || 9
    const aspect = srcW / Math.max(srcH, 1)
    const tileW = 3.6
    const tileH = tileW / aspect
    wallMap.repeat.set(wallWidth / tileW, WALL_H / tileH)
    wallMap.offset.set(0, 0)
    wallMap.needsUpdate = true
    return undefined
  }, [wallMap, wallWidth, wallVideo, videoReady])

  useEffect(() => {
    camera.fov = FOV_DEG
    camera.updateProjectionMatrix()
    camera.position.set(focusX, CAM_Y, CAM_Z)
    camera.up.set(0, 1, 0)
    camera.lookAt(focusX, LOOK_Y, 0)
  }, [camera])

  useEffect(() => {
    const aspect = size.width / Math.max(size.height, 1)
    const z = posterEnterZ(aspect, FOV_DEG)
    if (enterZRef) enterZRef.current = z
  }, [size.width, size.height, enterZRef])

  useEffect(() => {
    // Drop shadow-map passes while zooming / in the 2D gallery
    gl.shadowMap.enabled = !motionLite
  }, [gl, motionLite])

  useEffect(() => {
    return () => {
      posterMaps.forEach((tex) => tex.dispose())
    }
  }, [posterMaps])

  useFrame((_, dt) => {
    const dragging = dragLiveRef?.current
    const scrub = scrubXRef?.current
    const targetX =
      dragging && typeof scrub === 'number' ? scrub : focusX

    // Soft follow while dragging; slower ease when snapping to a frame
    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      targetX,
      dragging ? DRAG_FOLLOW : SNAP_FOLLOW,
      dt,
    )
    camera.position.y = CAM_Y
    const targetZ =
      typeof camZRef?.current === 'number' ? camZRef.current : CAM_Z
    // Snappier Z during enter/exit so we can keep the zoom short
    const zooming = Math.abs(camera.position.z - targetZ) > 0.04
    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      targetZ,
      zooming ? 11 : 6.4,
      dt,
    )
    const targetLookY =
      typeof lookYRef?.current === 'number' ? lookYRef.current : LOOK_Y
    // Keep look-target Y damped so enter/exit stays level on the poster
    if (lookYSmooth.current == null) lookYSmooth.current = LOOK_Y
    lookYSmooth.current = THREE.MathUtils.damp(
      lookYSmooth.current,
      targetLookY,
      zooming ? 11 : 6.4,
      dt,
    )
    camera.up.set(0, 1, 0)
    camera.lookAt(camera.position.x, lookYSmooth.current, 0)

    const camX = camera.position.x
    if (camXRef) camXRef.current = camX

    // During room zoom the camera is the only thing that must keep updating
    if (motionLite) return

    const follow = dragging ? 14 : 3.2

    spotlightAmt.current = THREE.MathUtils.damp(
      spotlightAmt.current,
      spotlightOn ? 1 : 0,
      4.2,
      dt,
    )
    const s = spotlightAmt.current

    if (ambientRef.current) {
      // Crush room light so only the cone reads
      ambientRef.current.intensity = THREE.MathUtils.lerp(0.85, 0.02, s)
    }
    if (fillRef.current) {
      fillRef.current.intensity = THREE.MathUtils.lerp(0.7, 0.015, s)
    }
    if (keyLight.current) {
      keyLight.current.position.x = THREE.MathUtils.damp(
        keyLight.current.position.x,
        camX - 0.6,
        follow,
        dt,
      )
      keyLight.current.position.y = 4.6
      keyLight.current.position.z = 3.2
      keyLight.current.intensity = THREE.MathUtils.lerp(2.35, 0.08, s)
    }

    poolRefs.current.forEach((light, i) => {
      if (!light) return
      const base = i === activeIndex ? 1.9 : 0.75
      const dimmed = i === activeIndex ? 0.05 : 0
      light.intensity = THREE.MathUtils.lerp(base, dimmed, s)
    })

    if (fixtureRef.current) {
      fixtureRef.current.position.x = THREE.MathUtils.damp(
        fixtureRef.current.position.x,
        camX,
        follow,
        dt,
      )
      fixtureRef.current.position.y = CAM_Y + 1.75
      fixtureRef.current.position.z = 2.35
      fixtureRef.current.visible = s > 0.02
      const glow = THREE.MathUtils.lerp(0, 2.1, s)
      fixtureRef.current.children.forEach((child) => {
        const mat = child.material
        if (mat && 'emissiveIntensity' in mat) {
          mat.emissiveIntensity = glow
        }
      })
    }

    if (spotTarget.current) {
      spotTarget.current.position.x = THREE.MathUtils.damp(
        spotTarget.current.position.x,
        camX,
        follow,
        dt,
      )
      spotTarget.current.position.y = CAM_Y
      spotTarget.current.position.z = 0.02
    }
    if (spotRef.current) {
      // Pull fixture back so a wider cone still frames one poster cleanly
      spotRef.current.position.x = THREE.MathUtils.damp(
        spotRef.current.position.x,
        camX,
        follow,
        dt,
      )
      spotRef.current.position.y = CAM_Y + 1.65
      spotRef.current.position.z = 2.55
      spotRef.current.intensity = THREE.MathUtils.lerp(0.85, 6.4, s)
      // Wider cone for landscape posters
      spotRef.current.angle = THREE.MathUtils.lerp(0.68, 0.58, s)
      spotRef.current.penumbra = THREE.MathUtils.lerp(0.9, 0.62, s)
      spotRef.current.distance = 14
      spotRef.current.decay = 1.35
      spotRef.current.target = spotTarget.current
      spotRef.current.target?.updateMatrixWorld()
    }
  })

  return (
    <>
      <color attach="background" args={[GALLERY_WALL_COLOR]} />
      <fog attach="fog" args={[GALLERY_WALL_COLOR, 18, 38]} />

      <ambientLight ref={ambientRef} intensity={0.85} color="#f7f2eb" />

      <directionalLight
        ref={keyLight}
        castShadow
        position={[focusX - 0.6, 4.6, 3.2]}
        intensity={2.35}
        color="#fffaf2"
        shadow-mapSize={[512, 512]}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={5}
        shadow-camera-bottom={-4}
        shadow-bias={-0.00035}
        shadow-normalBias={0.032}
        shadow-radius={2}
      />

      <directionalLight
        ref={fillRef}
        position={[focusX + 3.2, 2.2, 2.4]}
        intensity={0.7}
        color="#e0eaf5"
      />

      {posters.map((p, i) => (
        <pointLight
          key={`lamp-${p.filmIndex}`}
          ref={(el) => {
            poolRefs.current[i] = el
          }}
          position={[p.x, CAM_Y + 1.75, 2.15]}
          intensity={p.filmIndex === activeIndex ? 1.9 : 0.75}
          color="#ffeedc"
          distance={5.2}
          decay={2}
        />
      ))}

      {/* Physical gallery spotlight fixture above the focused poster */}
      <group ref={fixtureRef} position={[focusX, CAM_Y + 1.75, 2.35]} visible={false}>
        <mesh position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.34, 12]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.45} metalness={0.35} />
        </mesh>
        <mesh rotation={[0.62, 0, 0]} position={[0, -0.04, 0.1]}>
          <cylinderGeometry args={[0.22, 0.3, 0.18, 20]} />
          <meshStandardMaterial
            color="#1a1a1a"
            roughness={0.4}
            metalness={0.3}
            emissive="#fff2d6"
            emissiveIntensity={0}
          />
        </mesh>
        <mesh position={[0, -0.12, 0.16]}>
          <circleGeometry args={[0.14, 20]} />
          <meshStandardMaterial
            color="#fff8e8"
            emissive="#ffe7b0"
            emissiveIntensity={0}
            roughness={0.3}
          />
        </mesh>
      </group>

      <spotLight
        ref={spotRef}
        position={[focusX, CAM_Y + 1.65, 2.55]}
        angle={0.62}
        penumbra={0.9}
        intensity={0.85}
        color="#fffaf0"
        distance={14}
        decay={1.35}
      />
      <object3D ref={spotTarget} position={[focusX, CAM_Y, 0.02]} />

      <mesh
        key="wall-cream"
        position={[0, CAM_Y + 0.35, 0]}
        receiveShadow
      >
        <planeGeometry args={[wallWidth, WALL_H]} />
        <meshStandardMaterial
          color={GALLERY_WALL_COLOR}
          roughness={0.96}
          metalness={0}
        />
      </mesh>

      {/* Background only — depth-tested so frames occlude these patches */}
      <WallDriftShadows camXRef={camXRef} motionLite={motionLite} />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 2.2]}
        receiveShadow
      >
        <planeGeometry args={[wallWidth + 4, 9]} />
        <meshStandardMaterial color={GALLERY_WALL_COLOR} roughness={0.96} />
      </mesh>

      {posters.map((p) => (
        <FramedPoster
          key={p.film.title}
          filmIndex={p.filmIndex}
          x={p.x}
          active={p.filmIndex === activeIndex}
          texture={p.texture}
          onSelect={onSelect}
          spotlightOn={spotlightOn}
          motionLite={motionLite}
        />
      ))}
    </>
  )
}

class WallErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    console.warn('[PosterWall] WebGL / gallery failed:', error?.message || error)
  }

  retry = () => {
    this.setState({ error: null })
    this.props.onRetry?.()
  }

  render() {
    if (this.state.error) {
      return (
        <div className="poster-wall__fallback page-shell">
          <p>3D gallery couldn’t start — WebGL was blocked or unavailable.</p>
          <p className="poster-wall__fallback-hint">
            After hot-reload this often needs a hard refresh (Ctrl+Shift+R).
          </p>
          <button
            type="button"
            className="poster-wall__fallback-btn"
            onClick={this.retry}
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function probeWebGL() {
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: false }) ||
      canvas.getContext('webgl', { failIfMajorPerformanceCaveat: false })
    return Boolean(gl)
  } catch {
    return false
  }
}

export default function PosterWall() {
  const sectionRef = useRef(null)
  const indexRef = useRef(0)
  const lockRef = useRef(false)
  const roomLockRef = useRef(false)
  const roomTimerRef = useRef(0)
  const scrubXRef = useRef(posterWorldX(0))
  const dragLiveRef = useRef(false)
  const dragVelRef = useRef(0)
  const camXRef = useRef(posterWorldX(0))
  const camZRef = useRef(CAM_Z)
  const lookYRef = useRef(LOOK_Y)
  const enterZRef = useRef(
    posterEnterZ(
      typeof window !== 'undefined'
        ? window.innerWidth / Math.max(window.innerHeight, 1)
        : 16 / 9,
    ),
  )
  // Keep drag math on a ref so HMR / tweaks apply without remounting listeners
  const dragTuneRef = useRef({
    pxToWorld: SPACING / DRAG_PX_PER_POSTER,
    mouseGain: DRAG_MOUSE_GAIN,
    touchGain: DRAG_TOUCH_GAIN,
  })
  dragTuneRef.current = {
    pxToWorld: SPACING / DRAG_PX_PER_POSTER,
    mouseGain: DRAG_MOUSE_GAIN,
    touchGain: DRAG_TOUCH_GAIN,
  }
  const [activeIndex, setActiveIndex] = useState(0)
  const [spotlightOn, setSpotlightOn] = useState(false)
  // Sound feature disabled — keep for easy restore
  // const [soundOn, setSoundOn] = useState(true)
  // BG video feature disabled — keep state for easy restore
  // const [wallVideo, setWallVideo] = useState(false)
  const wallVideo = false
  const [canvasKey, setCanvasKey] = useState(0)
  const [webglOk, setWebglOk] = useState(true)
  const [pageScrollable, setPageScrollable] = useState(false)
  const [introReady, setIntroReady] = useState(false)
  // idle | zooming-in | slider | zooming-out
  const [roomPhase, setRoomPhase] = useState('idle')
  const roomPhaseRef = useRef(roomPhase)
  roomPhaseRef.current = roomPhase
  const [slideIndex, setSlideIndex] = useState(0)
  const slideIndexRef = useRef(0)
  slideIndexRef.current = slideIndex
  const active = FILMS[activeIndex]
  // const trackSrc = active.audio || DEFAULT_ATMOSPHERE
  // const isCustomTrack = Boolean(active.audio)
  const roomBusy = roomPhase !== 'idle'
  const roomZooming =
    roomPhase === 'zooming-in' || roomPhase === 'zooming-out'
  const roomOpen = roomPhase === 'slider'

  const slides = useMemo(() => {
    const head = {
      id: `film-${active.index}`,
      src: active.poster,
      title: active.title,
      caption: active.credits,
      alt: active.imageAlt || `${active.title} film poster`,
    }
    const rest = (active.gallery || []).map((item) => ({
      id: item.id,
      src: item.src,
      title: item.title,
      caption: item.caption,
      alt: item.alt,
    }))
    return [head, ...rest]
  }, [active])

  // usePosterAudio(trackSrc, soundOn)

  useEffect(() => {
    roomLockRef.current = roomBusy
  }, [roomBusy])

  useEffect(() => {
    const root = document.documentElement
    if (roomBusy) root.classList.add('is-gallery-focus')
    else root.classList.remove('is-gallery-focus')
    return () => root.classList.remove('is-gallery-focus')
  }, [roomBusy])

  // Smooth first open — stage + HUD ease in
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIntroReady(true)
      return undefined
    }
    const id = window.setTimeout(() => setIntroReady(true), 40)
    return () => window.clearTimeout(id)
  }, [])

  useEffect(() => {
    function measure() {
      const el = document.scrollingElement || document.documentElement
      setPageScrollable(el.scrollHeight > el.clientHeight + 2)
    }
    measure()
    window.addEventListener('resize', measure)
    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(measure)
        : null
    if (ro && sectionRef.current) ro.observe(sectionRef.current)
    return () => {
      window.removeEventListener('resize', measure)
      ro?.disconnect()
    }
  }, [])

  useEffect(() => {
    return () => {
      window.clearTimeout(roomTimerRef.current)
    }
  }, [])

  function goTo(next) {
    const clamped = Math.min(FILMS.length - 1, Math.max(0, next))
    if (clamped === indexRef.current) {
      scrubXRef.current = posterWorldX(clamped)
      return
    }
    indexRef.current = clamped
    scrubXRef.current = posterWorldX(clamped)
    setActiveIndex(clamped)
  }

  function step(dir) {
    if (lockRef.current || dragLiveRef.current || roomLockRef.current) return
    const next = indexRef.current + dir
    if (next < 0 || next >= FILMS.length) return
    lockRef.current = true
    goTo(next)
    window.setTimeout(() => {
      lockRef.current = false
    }, SNAP_LOCK_MS)
  }

  function stepSlide(dir) {
    setSlideIndex((i) => {
      const next = Math.min(slides.length - 1, Math.max(0, i + dir))
      slideIndexRef.current = next
      return next
    })
  }

  const stepSlideRef = useRef(stepSlide)
  stepSlideRef.current = stepSlide

  function enterRoom() {
    if (
      spotlightOn ||
      roomPhaseRef.current !== 'idle' ||
      dragLiveRef.current
    )
      return
    window.clearTimeout(roomTimerRef.current)
    scrubXRef.current = posterWorldX(indexRef.current)
    setSlideIndex(0)
    slideIndexRef.current = 0
    setRoomPhase('slider')
  }

  function closeRoom() {
    if (roomPhaseRef.current !== 'slider') return
    window.clearTimeout(roomTimerRef.current)
    setSlideIndex(0)
    slideIndexRef.current = 0
    lookYRef.current = LOOK_Y
    camZRef.current = CAM_Z
    setRoomPhase('idle')
  }

  const closeRoomRef = useRef(closeRoom)
  closeRoomRef.current = closeRoom

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return undefined

    const minX = posterWorldX(0)
    const maxX = posterWorldX(FILMS.length - 1)

    function onWheel(e) {
      // Room slider: keep exclusive wheel control
      if (roomPhaseRef.current === 'slider') {
        e.preventDefault()
        const delta = e.deltaY + e.deltaX
        if (Math.abs(delta) < 6) return
        stepSlideRef.current(delta > 0 ? 1 : -1)
        return
      }
      if (dragLiveRef.current || roomLockRef.current) return

      const absX = Math.abs(e.deltaX)
      const absY = Math.abs(e.deltaY)
      // Horizontal intent → next / prev film. Vertical → let the page scroll
      // so short viewports can reveal the full-size stage.
      if (absX >= absY && absX >= 6) {
        e.preventDefault()
        step(e.deltaX > 0 ? 1 : -1)
        return
      }
      if (absY < 6) return
      // Only hijack vertical wheel when the page cannot scroll further
      // in that direction (tall screens / already at edge).
      const scrollingEl = document.scrollingElement || document.documentElement
      const maxScroll = scrollingEl.scrollHeight - scrollingEl.clientHeight
      if (maxScroll <= 1) {
        e.preventDefault()
        step(e.deltaY > 0 ? 1 : -1)
      }
    }

    const drag = {
      active: false,
      lastX: 0,
      lastT: 0,
      moved: false,
      pointerId: null,
      gain: 1,
    }

    function onPointerDown(e) {
      if (roomLockRef.current) return
      if (e.pointerType === 'mouse' && e.button !== 0) return
      if (e.target.closest?.('button, a, input, textarea')) return
      const tune = dragTuneRef.current
      drag.active = true
      drag.lastX = e.clientX
      drag.lastT = performance.now()
      drag.moved = false
      drag.pointerId = e.pointerId
      drag.gain =
        e.pointerType === 'mouse' ? tune.mouseGain : tune.touchGain
      dragVelRef.current = 0
      dragLiveRef.current = true
      // Grab from live camera so mid-snap drags feel continuous
      scrubXRef.current = Math.min(
        maxX,
        Math.max(minX, camXRef.current),
      )
      el.classList.add('is-dragging')
      try {
        el.setPointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
    }

    function onPointerMove(e) {
      if (!drag.active || drag.pointerId !== e.pointerId) return
      const now = performance.now()
      const dtSec = Math.max((now - drag.lastT) / 1000, 1 / 240)
      const dxPx = drag.lastX - e.clientX
      drag.lastX = e.clientX
      drag.lastT = now
      if (!drag.moved && Math.abs(dxPx) > 1.5) {
        drag.moved = true
      }
      if (!drag.moved) return
      e.preventDefault()
      const worldDelta = dxPx * dragTuneRef.current.pxToWorld * drag.gain
      scrubXRef.current = Math.min(
        maxX,
        Math.max(minX, scrubXRef.current + worldDelta),
      )
      // EMA velocity for a short coast on release
      const instant = worldDelta / dtSec
      dragVelRef.current = dragVelRef.current * 0.78 + instant * 0.22
    }

    function endDrag(e) {
      if (!drag.active) return
      if (e && drag.pointerId != null && e.pointerId !== drag.pointerId) return
      const didMove = drag.moved
      drag.active = false
      drag.pointerId = null
      dragLiveRef.current = false
      el.classList.remove('is-dragging')
      if (e?.pointerId != null) {
        try {
          el.releasePointerCapture(e.pointerId)
        } catch {
          /* ignore */
        }
      }

      if (didMove) {
        const coast = THREE.MathUtils.clamp(
          dragVelRef.current * DRAG_COAST_SEC,
          -SPACING * 0.28,
          SPACING * 0.28,
        )
        const predicted = Math.min(
          maxX,
          Math.max(minX, scrubXRef.current + coast),
        )
        const nearest = nearestPosterIndex(predicted)
        goTo(nearest)
        dragVelRef.current = 0
        lockRef.current = true
        window.setTimeout(() => {
          lockRef.current = false
        }, SNAP_LOCK_MS)

        const blockClick = (ev) => {
          ev.preventDefault()
          ev.stopPropagation()
          el.removeEventListener('click', blockClick, true)
        }
        el.addEventListener('click', blockClick, true)
        window.setTimeout(() => {
          el.removeEventListener('click', blockClick, true)
        }, 0)
      }
    }

    function onKey(e) {
      if (roomPhaseRef.current === 'slider') {
        if (e.key === 'Escape') {
          e.preventDefault()
          closeRoomRef.current()
          return
        }
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault()
          stepSlideRef.current(1)
          return
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault()
          stepSlideRef.current(-1)
          return
        }
        return
      }
      if (e.key === 'Escape' && roomLockRef.current) {
        e.preventDefault()
        closeRoomRef.current()
        return
      }
      if (roomLockRef.current) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault()
        step(1)
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        step(-1)
      }
      if (e.key === 'l' || e.key === 'L') {
        setSpotlightOn((v) => !v)
      }
      if (e.key === 'm' || e.key === 'M') {
        setSoundOn((v) => !v)
      }
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', endDrag)
    el.addEventListener('pointercancel', endDrag)
    window.addEventListener('keydown', onKey)

    return () => {
      el.classList.remove('is-dragging')
      dragLiveRef.current = false
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', endDrag)
      el.removeEventListener('pointercancel', endDrag)
      window.removeEventListener('keydown', onKey)
      document.body.style.cursor = 'auto'
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className={`poster-wall${spotlightOn ? ' is-spotlight' : ''}${roomBusy ? ' is-room-busy' : ''}${roomZooming ? ' is-room-zooming' : ''}${roomOpen ? ' is-room-open' : ''}${introReady ? ' is-ready' : ' is-booting'}`}
      aria-label="Interactive 3D film gallery"
    >
      {/* HUD first so the stage (later sibling) paints above film copy while opening */}
      <div className="poster-wall__hud page-shell">
        {!roomBusy && (
          <div className="poster-wall__side-nav" aria-label="Film navigation">
            <button
              type="button"
              className="poster-wall__side-arrow poster-wall__side-arrow--prev"
              onClick={() => step(-1)}
              disabled={activeIndex <= 0}
              aria-label="Previous film"
            >
              <ChevronLeft size={22} strokeWidth={1.75} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="poster-wall__side-arrow poster-wall__side-arrow--next"
              onClick={() => step(1)}
              disabled={activeIndex >= FILMS.length - 1}
              aria-label="Next film"
            >
              <ChevronRight size={22} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        )}

        {!roomBusy && (
          <div className="poster-wall__enter-slot">
            <button
              type="button"
              className="poster-wall__enter"
              onClick={enterRoom}
              disabled={spotlightOn}
              aria-disabled={spotlightOn}
              title={
                spotlightOn
                  ? 'Turn off spotlight to view gallery'
                  : 'View gallery'
              }
            >
              <LogIn size={15} strokeWidth={1.75} aria-hidden="true" />
              View gallery
            </button>
          </div>
        )}

        <div key={active.title} className="poster-wall__rails" aria-live="polite">
          <aside className="poster-wall__rail poster-wall__rail--west">
            <div className="poster-wall__fame-rating">
              <div className="poster-wall__stars" aria-hidden="true">
                {Array.from({ length: 5 }, (_, i) => {
                  const filled =
                    active.rating != null &&
                    i < Math.round((active.rating / 10) * 5)
                  return (
                    <Star
                      key={i}
                      size={15}
                      strokeWidth={1.6}
                      className={
                        filled
                          ? 'poster-wall__star is-on'
                          : 'poster-wall__star'
                      }
                      fill={filled ? 'currentColor' : 'none'}
                    />
                  )
                })}
              </div>
              {active.rating != null ? (
                <p className="poster-wall__score">
                  <span className="poster-wall__score-num">
                    {active.rating.toFixed(1)}
                  </span>
                  <span className="poster-wall__score-den">
                    / {active.ratingOutOf}
                  </span>
                </p>
              ) : (
                <p className="poster-wall__score poster-wall__score--pending">
                  Coming soon
                </p>
              )}
            </div>

            {/* <p className="poster-wall__meta">
              Inducted {active.year} · Entry {active.index}
            </p> */}
            <h2 className="poster-wall__title">
              {(active.titleLines || [active.title]).map((line, i, lines) => (
                <span key={line}>
                  {line}
                  {i < lines.length - 1 ? <br /> : null}
                </span>
              ))}
            </h2>
            {/* <p className="poster-wall__credits">{active.credits}</p> */}

            <div className="poster-wall__actions">
              {active.imdb ? (
                <a
                  href={active.imdb}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="poster-wall__imdb"
                  aria-label={`${active.title} on IMDb`}
                  title="IMDb"
                >
                  <img
                    src={imdbLogo}
                    alt=""
                    className="poster-wall__imdb-logo"
                    width={128}
                    height={64}
                    decoding="async"
                  />
                </a>
              ) : (
                <span className="poster-wall__cta poster-wall__cta--muted">
                  In development
                </span>
              )}
              <button
                type="button"
                className={`poster-wall__spot-btn poster-wall__spot-btn--icon${spotlightOn ? ' is-on' : ''}`}
                onClick={() => setSpotlightOn((v) => !v)}
                aria-pressed={spotlightOn}
                aria-label={spotlightOn ? 'Spotlight on' : 'Spotlight off'}
                title={spotlightOn ? 'Spotlight on' : 'Spotlight'}
              >
                <Lightbulb size={16} strokeWidth={1.75} />
              </button>
            </div>
          </aside>

          <aside className="poster-wall__rail poster-wall__rail--east">
            <p className="poster-wall__rail-label">Synopsis</p>
            <p className="poster-wall__synopsis">{active.synopsis}</p>
          </aside>
        </div>

        <div className="poster-wall__progress" aria-hidden="true">
          <div
            className="poster-wall__progress-fill"
            style={{
              transform: `scaleX(${(activeIndex + 1) / FILMS.length})`,
            }}
          />
        </div>
      </div>

      <div className="poster-wall__stage">
        <WallErrorBoundary
          key={canvasKey}
          onRetry={() => {
            setWebglOk(probeWebGL())
            setCanvasKey((k) => k + 1)
          }}
        >
          {webglOk === false ? (
            <div className="poster-wall__fallback page-shell">
              <p>WebGL isn’t available in this tab right now.</p>
              <p className="poster-wall__fallback-hint">
                Hard-refresh (Ctrl+Shift+R) to clear a blocked GPU context.
              </p>
              <button
                type="button"
                className="poster-wall__fallback-btn"
                onClick={() => {
                  setWebglOk(probeWebGL())
                  setCanvasKey((k) => k + 1)
                }}
              >
                Try again
              </button>
            </div>
          ) : (
            <Canvas
              className="poster-wall__canvas"
              shadows
              dpr={[1, 1.25]}
              frameloop={roomOpen ? 'never' : 'always'}
              camera={{
                position: [0, CAM_Y, CAM_Z],
                fov: FOV_DEG,
                near: 0.1,
                far: 50,
              }}
              gl={{
                antialias: true,
                alpha: false,
                powerPreference: 'default',
                failIfMajorPerformanceCaveat: false,
                stencil: false,
                depth: true,
              }}
              onCreated={({ gl, size }) => {
                gl.setClearColor(GALLERY_WALL_COLOR, 1)
                gl.toneMapping = THREE.ACESFilmicToneMapping
                gl.toneMappingExposure = 1.48
                // Cap drawing buffer — tall stages + retina DPR can exhaust
                // GPU memory and trigger Chrome's context-loss block.
                const maxDpr = Math.min(window.devicePixelRatio || 1, 1.25)
                const maxEdge = 1680
                const w = Math.max(size.width, 1)
                const h = Math.max(size.height, 1)
                const dpr = Math.min(maxDpr, maxEdge / Math.max(w, h))
                gl.setPixelRatio(dpr)
                gl.setSize(w, h, false)
                enterZRef.current = posterEnterZ(w / h, FOV_DEG)

                const canvas = gl.domElement
                const onLost = (e) => {
                  e.preventDefault()
                  setWebglOk(false)
                }
                canvas.addEventListener('webglcontextlost', onLost, false)
                canvas.setAttribute('role', 'img')
                canvas.setAttribute('aria-hidden', 'true')
                canvas.setAttribute(
                  'aria-label',
                  'Decorative 3D film poster wall'
                )
              }}
            >
              <GalleryWorld
                activeIndex={activeIndex}
                spotlightOn={spotlightOn}
                wallVideo={wallVideo}
                scrubXRef={scrubXRef}
                dragLiveRef={dragLiveRef}
                camXRef={camXRef}
                camZRef={camZRef}
                lookYRef={lookYRef}
                enterZRef={enterZRef}
                motionLite={roomBusy}
                onSelect={(i) => {
                  if (
                    lockRef.current ||
                    dragLiveRef.current ||
                    roomLockRef.current
                  )
                    return
                  lockRef.current = true
                  goTo(i)
                  window.setTimeout(() => {
                    lockRef.current = false
                  }, SNAP_LOCK_MS)
                }}
              />
            </Canvas>
          )}
        </WallErrorBoundary>
      </div>

      {roomBusy && (
        <FrameImageSlider
          slides={slides}
          slideIndex={slideIndex}
          visible={roomOpen}
          onClose={closeRoom}
          onStep={stepSlide}
          onJump={(i) => {
            const next = Math.min(slides.length - 1, Math.max(0, i))
            slideIndexRef.current = next
            setSlideIndex(next)
          }}
        />
      )}
    </section>
  )
}

function FrameImageSlider({
  slides,
  slideIndex,
  visible,
  onClose,
  onStep,
  onJump,
}) {
  const [gridMode, setGridMode] = useState(false)
  const swipe = useHorizontalSwipe((dir) => {
    if (!gridMode) onStep(dir)
  })

  useEffect(() => {
    if (!visible) setGridMode(false)
  }, [visible])

  // Prefetch neighbors so swipes stay light without mounting every image
  useEffect(() => {
    if (gridMode) return undefined
    const nearby = [slideIndex - 1, slideIndex, slideIndex + 1]
    nearby.forEach((i) => {
      const src = slides[i]?.src
      if (!src) return
      const img = new Image()
      img.decoding = 'async'
      img.src = src
    })
  }, [slideIndex, slides, gridMode])

  /* Download disabled
  async function downloadCurrent() {
    const slide = slides[slideIndex]
    if (!slide?.src) return
    const filename = `${(slide.title || 'gallery')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')}.jpg`
    try {
      const res = await fetch(slide.src)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.rel = 'noopener'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      window.open(slide.src, '_blank', 'noopener,noreferrer')
    }
  }
  */

  return (
    <div
      className={cx(
        'poster-wall__frame-slider',
        visible && 'is-visible',
        gridMode && 'is-grid'
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Frame gallery"
      aria-hidden={!visible}
      {...swipe}
    >
      {!gridMode && (
        <div
          className="poster-wall__frame-slider-track"
          style={{ transform: `translate3d(${-slideIndex * 100}%, 0, 0)` }}
        >
          {slides.map((slide, i) => {
            const inView = Math.abs(i - slideIndex) <= 1
            return (
              <figure key={slide.id} className="poster-wall__frame-slide">
                {inView ? (
                  <img
                    src={slide.src}
                    alt={slide.alt || slide.title}
                    draggable={false}
                    loading={i === slideIndex ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                ) : null}
              </figure>
            )
          })}
        </div>
      )}

      {gridMode && (
        <div className="poster-wall__frame-grid page-shell">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              className={`poster-wall__frame-grid-item${i === slideIndex ? ' is-active' : ''}`}
              onClick={() => {
                onJump?.(i)
                setGridMode(false)
              }}
              aria-label={`Open ${slide.title}`}
              aria-current={i === slideIndex ? 'true' : undefined}
            >
              <img
                src={slide.src}
                alt={slide.alt || slide.title}
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}

      <div
        className="poster-wall__frame-slider-ui"
        hidden={!visible}
        aria-hidden={!visible}
      >
        <div className="poster-wall__frame-slider-tools">
          {/* Download disabled
          {!gridMode && (
            <button
              type="button"
              className="poster-wall__frame-slider-icon"
              onClick={downloadCurrent}
              aria-label="Download image"
              title="Download"
            >
              <Download size={16} strokeWidth={1.75} />
            </button>
          )}
          */}
          <button
            type="button"
            className={`poster-wall__frame-slider-icon${gridMode ? ' is-on' : ''}`}
            onClick={() => setGridMode((v) => !v)}
            aria-label={gridMode ? 'Slideshow view' : 'Grid view'}
            aria-pressed={gridMode}
            title={gridMode ? 'Slideshow' : 'Grid'}
          >
            {gridMode ? (
              <Rows3 size={16} strokeWidth={1.75} />
            ) : (
              <LayoutGrid size={16} strokeWidth={1.75} />
            )}
          </button>
          <button
            type="button"
            className="poster-wall__frame-slider-icon"
            onClick={onClose}
            aria-label="Close gallery"
            title="Close"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>

        {!gridMode && (
          <>
            <button
              type="button"
              className="poster-wall__frame-slider-arrow poster-wall__frame-slider-arrow--prev"
              onClick={() => onStep(-1)}
              disabled={slideIndex <= 0}
              aria-label="Previous image"
            >
              <ChevronLeft size={20} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              className="poster-wall__frame-slider-arrow poster-wall__frame-slider-arrow--next"
              onClick={() => onStep(1)}
              disabled={slideIndex >= slides.length - 1}
              aria-label="Next image"
            >
              <ChevronRight size={20} strokeWidth={1.75} />
            </button>
            <p className="poster-wall__frame-slider-meta">
              <span>{slides[slideIndex]?.title}</span>
              <span>
                {slideIndex + 1} / {slides.length}
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
