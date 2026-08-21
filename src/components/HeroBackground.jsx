import { useEffect, useRef } from 'react'
import { HERO_IMAGE, HERO_IMAGE_ALT } from '../data/site'

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  v_uv.y = 1.0 - v_uv.y;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FRAG = `
precision mediump float;
uniform sampler2D u_img;
uniform vec2 u_res;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_strength;
varying vec2 v_uv;

void main() {
  vec2 uv = v_uv;

  // Soft ambient water drift
  float ax = sin(uv.y * 7.5 + u_time * 0.55) * 0.0018;
  float ay = cos(uv.x * 6.2 + u_time * 0.42) * 0.0016;
  uv += vec2(ax, ay) * u_strength;

  // Mouse-following ripples
  vec2 m = u_mouse;
  float d = distance(uv, m);
  float falloff = exp(-d * 5.5);
  float wave = sin(d * 36.0 - u_time * 3.2) * 0.0045 * falloff;
  vec2 dir = normalize(uv - m + 0.0001);
  uv += dir * wave * u_strength;

  // Second slower swell
  float swell = sin(d * 14.0 - u_time * 1.4) * 0.0022 * falloff;
  uv += dir * swell * u_strength;

  uv = clamp(uv, 0.001, 0.999);
  vec4 color = texture2D(u_img, uv);

  // Tiny caustic shimmer near cursor
  float shimmer = sin((uv.x + uv.y) * 40.0 + u_time * 2.0) * 0.012 * falloff * u_strength;
  color.rgb += shimmer;

  gl_FragColor = color;
}
`

function createShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Full-bleed hero with a subtle mouse-following water ripple. */
export default function HeroBackground() {
  const canvasRef = useRef(null)
  const imgRef = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return undefined
    if (prefersReducedMotion()) return undefined

    let raf = 0
    let running = true
    let gl = null
    let program = null
    let texture = null
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    const strength = { v: 0, t: 0 }

    function initGl() {
      gl = canvas.getContext('webgl', {
        alpha: false,
        antialias: false,
        premultipliedAlpha: false,
      })
      if (!gl) return false

      const vs = createShader(gl, gl.VERTEX_SHADER, VERT)
      const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAG)
      if (!vs || !fs) return false

      program = gl.createProgram()
      gl.attachShader(program, vs)
      gl.attachShader(program, fs)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false
      gl.useProgram(program)

      const buf = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW
      )
      const loc = gl.getAttribLocation(program, 'a_pos')
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

      texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)

      gl.uniform1i(gl.getUniformLocation(program, 'u_img'), 0)
      return true
    }

    function resize() {
      if (!gl || !canvas) return
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
      const w = Math.max(1, Math.floor(window.innerWidth * dpr))
      const h = Math.max(1, Math.floor(window.innerHeight * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
      gl.uniform2f(gl.getUniformLocation(program, 'u_res'), w, h)
    }

    function onMove(e) {
      const x = e.clientX / window.innerWidth
      const y = e.clientY / window.innerHeight
      mouse.tx = x
      mouse.ty = y
      strength.t = 1
    }

    function onLeave() {
      strength.t = 0.35
    }

    function frame(t) {
      if (!running || !gl || !program) return
      const time = t * 0.001
      mouse.x += (mouse.tx - mouse.x) * 0.08
      mouse.y += (mouse.ty - mouse.y) * 0.08
      strength.v += (strength.t - strength.v) * 0.05

      gl.uniform2f(gl.getUniformLocation(program, 'u_mouse'), mouse.x, mouse.y)
      gl.uniform1f(gl.getUniformLocation(program, 'u_time'), time)
      gl.uniform1f(gl.getUniformLocation(program, 'u_strength'), 0.55 + strength.v * 0.7)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      raf = requestAnimationFrame(frame)
    }

    function start() {
      if (!initGl()) {
        canvas.style.display = 'none'
        return
      }
      canvas.classList.add('is-live')
      resize()
      window.addEventListener('resize', resize, { passive: true })
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('pointerleave', onLeave, { passive: true })
      raf = requestAnimationFrame(frame)
    }

    if (img.complete && img.naturalWidth) start()
    else img.addEventListener('load', start, { once: true })

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      if (gl && texture) gl.deleteTexture(texture)
      if (gl && program) gl.deleteProgram(program)
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      className="hero-water pointer-events-none absolute inset-0 z-0 overflow-hidden bg-black"
      aria-hidden="true"
    >
      <img
        ref={imgRef}
        src={HERO_IMAGE}
        alt={HERO_IMAGE_ALT}
        className="hero-water__fallback absolute inset-0 h-full w-full object-cover"
        decoding="async"
        fetchPriority="high"
      />
      <canvas ref={canvasRef} className="hero-water__canvas" />
      <div className="absolute inset-0 z-[2] bg-black/15" />
    </div>
  )
}
