const fs = require('fs')
const path = require('path')

const sr = 44100
const dur = 22
const n = sr * dur

function clamp(v) {
  return Math.max(-1, Math.min(1, v))
}

const L = new Float32Array(n)
const R = new Float32Array(n)

let b0 = 0
let b1 = 0
let b2 = 0
let b3 = 0
let b4 = 0
let b5 = 0
let b6 = 0
let hpL = 0
let prevL = 0
let hpR = 0
let prevR = 0
let lpL = 0
let lpR = 0

for (let i = 0; i < n; i++) {
  const t = i / sr
  const fade = Math.min(1, t / 1.4, (dur - t) / 1.4)
  const breath = 0.9 + 0.1 * Math.sin(2 * Math.PI * 0.03 * t)

  const white = Math.random() * 2 - 1
  b0 = 0.99886 * b0 + white * 0.0555179
  b1 = 0.99332 * b1 + white * 0.0750759
  b2 = 0.969 * b2 + white * 0.153852
  b3 = 0.8665 * b3 + white * 0.3104856
  b4 = 0.55 * b4 + white * 0.5329522
  b5 = -0.7616 * b5 - white * 0.016898
  let pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.09
  b6 = white * 0.115926

  // Soft airy tones — gallery / white-cube calm (no sub-bass drone)
  const air =
    Math.sin(2 * Math.PI * 196 * t) * 0.016 +
    Math.sin(2 * Math.PI * 246.9 * t) * 0.012 +
    Math.sin(2 * Math.PI * 311.1 * t) * 0.009 +
    Math.sin(2 * Math.PI * 392 * t) *
      0.007 *
      (0.55 + 0.45 * Math.sin(2 * Math.PI * 0.045 * t))

  const shimmer =
    Math.sin(2 * Math.PI * 987.8 * t) *
      0.003 *
      (0.5 + 0.5 * Math.sin(2 * Math.PI * 0.09 * t)) +
    Math.sin(2 * Math.PI * 1318.5 * t) * 0.002

  let sL = pink * 0.7 + air + shimmer
  let sR =
    pink * 0.65 +
    air * 0.96 +
    shimmer * 1.08 +
    Math.sin(2 * Math.PI * 329.6 * t) * 0.0035

  // High-pass — remove basement rumble
  hpL = 0.996 * (hpL + sL - prevL)
  prevL = sL
  sL = hpL
  hpR = 0.996 * (hpR + sR - prevR)
  prevR = sR
  sR = hpR

  // Soft low-pass — silky, not harsh
  lpL += 0.08 * (sL - lpL)
  sL = lpL
  lpR += 0.08 * (sR - lpR)
  sR = lpR

  L[i] = clamp(sL * fade * breath * 0.85)
  R[i] = clamp(sR * fade * breath * 0.85)
}

const data = Buffer.alloc(n * 4)
for (let i = 0; i < n; i++) {
  data.writeInt16LE((L[i] * 32767) | 0, i * 4)
  data.writeInt16LE((R[i] * 32767) | 0, i * 4 + 2)
}

const header = Buffer.alloc(44)
header.write('RIFF', 0)
header.writeUInt32LE(36 + data.length, 4)
header.write('WAVE', 8)
header.write('fmt ', 12)
header.writeUInt32LE(16, 16)
header.writeUInt16LE(1, 20) // PCM
header.writeUInt16LE(2, 22) // stereo
header.writeUInt32LE(sr, 24)
header.writeUInt32LE(sr * 4, 28)
header.writeUInt16LE(4, 32)
header.writeUInt16LE(16, 34)
header.write('data', 36)
header.writeUInt32LE(data.length, 40)

const out = path.join(__dirname, '..', 'public', 'audio', 'default-atmosphere.wav')
fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, Buffer.concat([header, data]))
console.log('Wrote', out, (fs.statSync(out).size / 1024).toFixed(1) + 'kb')
