import { useEffect } from 'react'

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
uniform vec2 u_img_size;
uniform vec2 u_cover_scale;
uniform vec2 u_cover_offset;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_strength;
varying vec2 v_uv;

void main() {
  // Match CSS object-fit: cover + object-position
  vec2 canvas_px = v_uv * u_res;
  vec2 img_px = (canvas_px - u_cover_offset) / u_cover_scale;
  vec2 uv = img_px / u_img_size;

  float ax = sin(uv.y * 7.5 + u_time * 0.55) * 0.0018;
  float ay = cos(uv.x * 6.2 + u_time * 0.42) * 0.0016;
  uv += vec2(ax, ay) * u_strength;

  vec2 m = u_mouse;
  // Mouse is in canvas UV — convert to texture UV space for distance
  vec2 mouse_px = m * u_res;
  vec2 mouse_img = (mouse_px - u_cover_offset) / u_cover_scale;
  vec2 mouse_uv = mouse_img / u_img_size;

  float d = distance(uv, mouse_uv);
  float falloff = exp(-d * 5.5);
  float wave = sin(d * 36.0 - u_time * 3.2) * 0.0045 * falloff;
  vec2 dir = normalize(uv - mouse_uv + 0.0001);
  uv += dir * wave * u_strength;

  float swell = sin(d * 14.0 - u_time * 1.4) * 0.0022 * falloff;
  uv += dir * swell * u_strength;

  uv = clamp(uv, 0.001, 0.999);
  vec4 color = texture2D(u_img, uv);

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

function parseObjectPosition(value = 'center center') {
  const parts = String(value).trim().split(/\s+/)
  const axis = (token, fallback) => {
    if (token == null) return fallback
    if (token === 'center') return 0.5
    if (token === 'left' || token === 'top') return 0
    if (token === 'right' || token === 'bottom') return 1
    if (token.endsWith('%')) return Number(token.slice(0, -1)) / 100
    return fallback
  }
  if (parts.length === 1) {
    const n = axis(parts[0], 0.5)
    return { x: n, y: n }
  }
  return { x: axis(parts[0], 0.5), y: axis(parts[1], 0.5) }
}

/**
 * Mouse-following water ripple on a canvas over an image.
 * `intensity` scales distortion (1 = full, 0.5 = half).
 * `objectPosition` matches CSS object-position when the image uses object-fit: cover.
 */
export default function useWaterRipple({
  enabled,
  canvasRef,
  imgRef,
  wrapRef,
  intensity = 1,
  objectPosition = 'center center',
}) {
  useEffect(() => {
    if (!enabled) return undefined
    if (prefersReducedMotion()) return undefined

    const canvas = canvasRef.current
    const img = imgRef.current
    const wrap = wrapRef.current
    if (!canvas || !img || !wrap) return undefined

    const gain = Math.max(0, intensity)
    const pos = parseObjectPosition(objectPosition)
    let raf = 0
    let running = true
    let gl = null
    let program = null
    let texture = null
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    const strength = { v: 0, t: 1 }

    function setCoverUniforms() {
      if (!gl || !program || !img.naturalWidth) return
      const imgW = img.naturalWidth
      const imgH = img.naturalHeight
      const cW = canvas.width
      const cH = canvas.height
      const scale = Math.max(cW / imgW, cH / imgH)
      const dw = imgW * scale
      const dh = imgH * scale
      const ox = (cW - dw) * pos.x
      const oy = (cH - dh) * pos.y
      gl.uniform2f(gl.getUniformLocation(program, 'u_img_size'), imgW, imgH)
      gl.uniform2f(gl.getUniformLocation(program, 'u_cover_scale'), scale, scale)
      gl.uniform2f(gl.getUniformLocation(program, 'u_cover_offset'), ox, oy)
    }

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
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
      } catch {
        return false
      }

      gl.uniform1i(gl.getUniformLocation(program, 'u_img'), 0)
      return true
    }

    function resize() {
      if (!gl || !canvas || !wrap) return
      const rect = wrap.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
      const w = Math.max(1, Math.floor(rect.width * dpr))
      const h = Math.max(1, Math.floor(rect.height * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
      gl.uniform2f(gl.getUniformLocation(program, 'u_res'), w, h)
      setCoverUniforms()
    }

    function onMove(e) {
      const rect = wrap.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      mouse.tx = (e.clientX - rect.left) / rect.width
      mouse.ty = (e.clientY - rect.top) / rect.height
      strength.t = 1
    }

    function onLeave() {
      strength.t = 0.25
    }

    function frame(t) {
      if (!running || !gl || !program) return
      const time = t * 0.001
      mouse.x += (mouse.tx - mouse.x) * 0.1
      mouse.y += (mouse.ty - mouse.y) * 0.1
      strength.v += (strength.t - strength.v) * 0.08

      gl.uniform2f(gl.getUniformLocation(program, 'u_mouse'), mouse.x, mouse.y)
      gl.uniform1f(gl.getUniformLocation(program, 'u_time'), time)
      gl.uniform1f(
        gl.getUniformLocation(program, 'u_strength'),
        (0.65 + strength.v * 0.85) * gain
      )
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
      wrap.addEventListener('pointermove', onMove, { passive: true })
      wrap.addEventListener('pointerleave', onLeave, { passive: true })
      window.addEventListener('resize', resize, { passive: true })
      raf = requestAnimationFrame(frame)
    }

    if (img.complete && img.naturalWidth) start()
    else img.addEventListener('load', start, { once: true })

    return () => {
      running = false
      cancelAnimationFrame(raf)
      wrap.removeEventListener('pointermove', onMove)
      wrap.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', resize)
      canvas.classList.remove('is-live')
      if (gl && texture) gl.deleteTexture(texture)
      if (gl && program) gl.deleteProgram(program)
    }
  }, [enabled, canvasRef, imgRef, wrapRef, intensity, objectPosition])
}
