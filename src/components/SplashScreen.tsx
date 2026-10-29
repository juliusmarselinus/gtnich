'use client'

import { useEffect, useState } from 'react'

/**
 * Splash DapurTwin (±4 detik, sekali per sesi browser).
 *
 * Urutan:
 * 0.0s  titik-titik muncul di pinggir lalu tersedot ke tengah
 * 0.7s  ikon app "pop" + memantul
 * 1.1s  bentuk-bentuk menyebar keluar dari ikon, lalu melayang
 * 1.4s  telinga Dapi bergoyang, topi koki melompat, Dapi berkedip
 * 1.5s  huruf "DapurTwin" muncul satu per satu
 * 2.2s  tagline muncul, progress bar mengisi
 * 3.6s  ikon membesar, splash memudar ke landing
 *
 * Animasi baru dimulai setelah komponen ter-mount di browser, jadi tidak
 * "habis duluan" saat halaman masih loading.
 */

const LEAVE_AT = 3600
const DONE_AT = 4150

const SHAPES: { k: 'circle' | 'tri' | 'square' | 'x' | 'plus' | 'dot'; x: number; y: number; c: string; r: number }[] = [
  { k: 'circle', x: -118, y: -40, c: '#FF775D', r: 0 },
  { k: 'tri',    x: 112,  y: -52, c: '#FF8F28', r: 160 },
  { k: 'square', x: -108, y: 88,  c: '#8BBDF7', r: -120 },
  { k: 'x',      x: 118,  y: 96,  c: '#FF775D', r: 180 },
  { k: 'plus',   x: 6,    y: -140, c: '#FFBF25', r: 90 },
  { k: 'circle', x: -40,  y: 140, c: '#FFBF25', r: 0 },
  { k: 'dot',    x: -160, y: -150, c: '#E3CDB2', r: 0 },
  { k: 'dot',    x: 166,  y: -138, c: '#E3CDB2', r: 0 },
  { k: 'dot',    x: -166, y: 150, c: '#E3CDB2', r: 0 },
  { k: 'dot',    x: 158,  y: 164, c: '#E3CDB2', r: 0 },
]

// titik yang tersedot ke tengah di awal
const INTAKE = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2
  return { x: Math.round(Math.cos(a) * 220), y: Math.round(Math.sin(a) * 220), c: ['#FF8F28', '#FFBF25', '#FF775D', '#8BBDF7'][i % 4] }
})

const WORD = 'DapurTwin'.split('')

export default function SplashScreen() {
  const [show, setShow] = useState(true)
  const [ready, setReady] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    let seen = false
    try { seen = sessionStorage.getItem('dapi-splash') === '1' } catch {}
    if (new URLSearchParams(window.location.search).has('splash')) seen = false
    if (seen) { setShow(false); return }

    // mulai animasi di frame berikutnya, setelah halaman siap
    const raf = requestAnimationFrame(() => setReady(true))
    const a = setTimeout(() => setLeaving(true), LEAVE_AT)
    const b = setTimeout(() => {
      setShow(false)
      try { sessionStorage.setItem('dapi-splash', '1') } catch {}
    }, DONE_AT)
    return () => { cancelAnimationFrame(raf); clearTimeout(a); clearTimeout(b) }
  }, [])

  if (!show) return null

  return (
    <div
      role="status"
      aria-label="Memuat DapurTwin"
      className="fixed inset-0 z-50 grid place-items-center bg-white overflow-hidden"
      style={{ transition: 'opacity 500ms ease', opacity: leaving ? 0 : 1 }}
    >
      <style>{`
        @keyframes sp-intake {
          0% { transform: translate(var(--x), var(--y)) scale(0); opacity: 0 }
          30% { transform: translate(var(--x), var(--y)) scale(1); opacity: 1 }
          100% { transform: translate(0,0) scale(.3); opacity: 0 }
        }
        @keyframes sp-icon {
          0% { transform: scale(0) rotate(-20deg); opacity: 1 }
          50% { transform: scale(1.18) rotate(6deg) }
          68% { transform: scale(.92) rotate(-3deg) }
          84% { transform: scale(1.04) rotate(1deg) }
          100% { transform: scale(1) rotate(0); opacity: 1 }
        }
        @keyframes sp-ring { 0% { transform: scale(.6); opacity: .6 } 100% { transform: scale(2.4); opacity: 0 } }
        @keyframes sp-out {
          0% { transform: translate(0,0) scale(0) rotate(0); opacity: 0 }
          50% { opacity: 1 }
          100% { transform: translate(var(--x), var(--y)) scale(1) rotate(var(--r)); opacity: 1 }
        }
        @keyframes sp-drift {
          0%,100% { transform: translate(var(--x), var(--y)) rotate(var(--r)) }
          50% { transform: translate(calc(var(--x) * 1.06), calc(var(--y) * 1.06 - 6px)) rotate(calc(var(--r) + 25deg)) }
        }
        @keyframes sp-twinkle { 0%,100% { transform: scale(.3); opacity: .2 } 50% { transform: scale(1.1); opacity: 1 } }
        @keyframes sp-blink { 0%,40%,52%,100% { transform: scaleY(1) } 46% { transform: scaleY(.1) } }
        @keyframes sp-ear-l { 0%,100% { transform: rotate(0) } 25% { transform: rotate(-14deg) } 50% { transform: rotate(6deg) } }
        @keyframes sp-ear-r { 0%,100% { transform: rotate(0) } 25% { transform: rotate(14deg) } 50% { transform: rotate(-6deg) } }
        @keyframes sp-hat { 0%,100% { transform: translateY(0) rotate(0) } 30% { transform: translateY(-9px) rotate(-8deg) } 55% { transform: translateY(0) rotate(3deg) } }
        @keyframes sp-letter { 0% { transform: translateY(18px) scale(.6); opacity: 0 } 70% { transform: translateY(-4px) scale(1.08); opacity: 1 } 100% { transform: none; opacity: 1 } }
        @keyframes sp-fade-up { from { transform: translateY(10px); opacity: 0 } to { transform: none; opacity: 1 } }
        @keyframes sp-bar { from { transform: scaleX(0) } to { transform: scaleX(1) } }

        .sp-run .sp-intake { animation: sp-intake 700ms cubic-bezier(.5,0,.8,.4) both }
        .sp-run .sp-icon { animation: sp-icon 900ms cubic-bezier(.34,1.56,.64,1) 650ms both }
        .sp-run .sp-ring { animation: sp-ring 900ms ease-out 900ms both }
        .sp-run .sp-shape { animation: sp-out 700ms cubic-bezier(.2,.9,.3,1.2) both, sp-drift 3s ease-in-out infinite }
        .sp-run .sp-twinkle { transform-box: fill-box; transform-origin: center; animation: sp-twinkle 1.1s ease-in-out infinite }
        .sp-run .sp-blink { transform-box: fill-box; transform-origin: center; animation: sp-blink 1.8s ease-in-out 1.6s infinite }
        .sp-run .sp-ear-l { transform-box: view-box; transform-origin: 40px 56px; animation: sp-ear-l 900ms ease-in-out 1.4s 2 }
        .sp-run .sp-ear-r { transform-box: view-box; transform-origin: 72px 56px; animation: sp-ear-r 900ms ease-in-out 1.4s 2 }
        .sp-run .sp-hat { transform-box: view-box; transform-origin: 56px 44px; animation: sp-hat 800ms cubic-bezier(.34,1.56,.64,1) 1.5s 2 }
        .sp-run .sp-letter { display: inline-block; animation: sp-letter 450ms cubic-bezier(.34,1.56,.64,1) both }
        .sp-run .sp-tag { animation: sp-fade-up 500ms ease-out 2.2s both }
        .sp-run .sp-bar-wrap { animation: sp-fade-up 400ms ease-out 2.1s both }
        .sp-run .sp-bar { transform-origin: left; animation: sp-bar 1.4s cubic-bezier(.6,0,.2,1) 2.2s both }

        .sp-intake, .sp-icon, .sp-shape, .sp-letter, .sp-tag, .sp-bar-wrap { opacity: 0 }
        @media (prefers-reduced-motion: reduce) {
          .sp-run * { animation: none !important; opacity: 1 !important }
          .sp-intake, .sp-ring { display: none }
          .sp-shape { transform: translate(var(--x), var(--y)) }
        }
      `}</style>

      <div className={ready ? 'sp-run' : ''}>
        <div
          className="relative grid place-items-center"
          style={{ transition: 'transform 500ms cubic-bezier(.6,-0.3,.7,1)', transform: leaving ? 'scale(1.35)' : 'none' }}
        >
          {/* titik tersedot ke tengah */}
          {INTAKE.map((d, i) => (
            <span
              key={`in-${i}`}
              aria-hidden
              className="sp-intake absolute left-1/2 top-1/2 -ml-[5px] -mt-[5px] w-[10px] h-[10px] rounded-full"
              style={{ backgroundColor: d.c, ['--x' as string]: `${d.x}px`, ['--y' as string]: `${d.y}px`, animationDelay: `${i * 25}ms` }}
            />
          ))}

          {/* gelombang saat ikon mendarat */}
          <span aria-hidden className="sp-ring absolute w-[112px] h-[112px] rounded-[30px] border-4 border-[#FFBF25]" />

          {/* bentuk yang menyebar */}
          {SHAPES.map((s, i) => (
            <span
              key={i}
              aria-hidden
              className="sp-shape absolute left-1/2 top-1/2 -ml-[10px] -mt-[10px] w-5 h-5"
              style={{
                ['--x' as string]: `${s.x}px`,
                ['--y' as string]: `${s.y}px`,
                ['--r' as string]: `${s.r}deg`,
                animationDelay: `${1050 + i * 60}ms, ${1900 + i * 140}ms`,
              }}
            >
              <Shape kind={s.k} color={s.c} />
            </span>
          ))}

          {/* ikon app */}
          <div className="sp-icon relative w-[112px] h-[112px] rounded-[30px] overflow-hidden shadow-[0_14px_30px_-10px_rgba(233,165,15,0.6)]">
            <AppIcon />
          </div>
        </div>

        {/* nama, tagline, progress */}
        <div className="absolute left-0 right-0 top-1/2 mt-[96px] flex flex-col items-center">
          <p className="text-2xl font-black tracking-tight text-[#2B221C]" aria-label="DapurTwin">
            {WORD.map((ch, i) => (
              <span key={i} className="sp-letter" style={{ animationDelay: `${1500 + i * 55}ms` }} aria-hidden>
                {ch}
              </span>
            ))}
          </p>
          <p className="sp-tag mt-1 text-sm text-[#917A63]">Menyiapkan dapurmu...</p>
          <div className="sp-bar-wrap mt-4 w-32 h-1.5 rounded-full bg-[#F6E9D8] overflow-hidden">
            <div className="sp-bar h-full w-full rounded-full bg-[#FF8F28]" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Shape({ kind, color }: { kind: string; color: string }) {
  const p = { stroke: color, strokeWidth: 2.4, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg viewBox="0 0 20 20" width="20" height="20">
      {kind === 'circle' && <circle cx="10" cy="10" r="6.5" {...p} />}
      {kind === 'tri' && <path d="M10 3 L17 15.5 H3 Z" {...p} />}
      {kind === 'square' && <rect x="3.5" y="3.5" width="13" height="13" rx="1.5" {...p} />}
      {kind === 'x' && <path d="M4.5 4.5 L15.5 15.5 M15.5 4.5 L4.5 15.5" {...p} />}
      {kind === 'plus' && <path d="M10 3 V17 M3 10 H17" {...p} />}
      {kind === 'dot' && <circle cx="10" cy="10" r="2.2" fill={color} />}
    </svg>
  )
}

/** Ikon app: kepala Dapi bertopi koki di atas kotak kuning, dengan kilau. */
export function AppIcon() {
  const ink = '#2B221C'
  return (
    <svg viewBox="0 0 112 112" width="100%" height="100%" aria-hidden>
      <defs>
        <linearGradient id="ai-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFD766" />
          <stop offset="100%" stopColor="#FFBF25" />
        </linearGradient>
        <radialGradient id="ai-fur" cx="40%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFC27E" />
          <stop offset="60%" stopColor="#FF9A3A" />
          <stop offset="100%" stopColor="#E2700F" />
        </radialGradient>
      </defs>
      <rect width="112" height="112" fill="url(#ai-bg)" />

      {/* kilau */}
      <g fill="#fff">
        <path className="sp-twinkle" style={{ animationDelay: '0ms' }} d="M18 22 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2 z" />
        <path className="sp-twinkle" style={{ animationDelay: '400ms' }} d="M92 76 l1.5 4.5 l4.5 1.5 l-4.5 1.5 l-1.5 4.5 l-1.5 -4.5 l-4.5 -1.5 l4.5 -1.5 z" />
        <circle className="sp-twinkle" style={{ animationDelay: '800ms' }} cx="90" cy="24" r="2.5" />
        <circle className="sp-twinkle" style={{ animationDelay: '200ms' }} cx="20" cy="88" r="2" />
      </g>

      {/* telinga */}
      <g className="sp-ear-l">
        <path d="M30 62 L28 30 Q44 36 52 50 Z" fill="url(#ai-fur)" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
        <path d="M28 38 L28 30 L36 33 Z" fill={ink} />
      </g>
      <g className="sp-ear-r">
        <path d="M82 62 L84 30 Q68 36 60 50 Z" fill="url(#ai-fur)" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
        <path d="M84 38 L84 30 L76 33 Z" fill={ink} />
      </g>

      {/* kepala */}
      <path d="M56 42 C76 42 88 56 88 70 C88 86 74 96 56 96 C38 96 24 86 24 70 C24 56 36 42 56 42 Z" fill="url(#ai-fur)" stroke="#fff" strokeWidth="3" />
      <path d="M56 70 C66 70 76 77 78 86 C72 93 64 95 56 95 C48 95 40 93 34 86 C36 77 46 70 56 70 Z" fill="#FFF3DC" />

      {/* mata */}
      <g className="sp-blink">
        <ellipse cx="45" cy="70" rx="4.2" ry="5.5" fill={ink} />
        <ellipse cx="67" cy="70" rx="4.2" ry="5.5" fill={ink} />
      </g>
      <circle cx="46.5" cy="68" r="1.4" fill="#fff" />
      <circle cx="68.5" cy="68" r="1.4" fill="#fff" />
      <path d="M52 78 Q56 76 60 78 Q58 82 56 82 Q54 82 52 78 Z" fill={ink} />
      <path d="M51 85 Q53.5 88 56 85 Q58.5 88 61 85" stroke={ink} strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* topi koki */}
      <g className="sp-hat">
        <circle cx="46" cy="30" r="9" fill="#fff" />
        <circle cx="66" cy="30" r="9" fill="#fff" />
        <circle cx="56" cy="24" r="11" fill="#fff" />
        <rect x="41" y="29" width="30" height="15" rx="4" fill="#fff" />
        <rect x="41" y="38" width="30" height="6" rx="3" fill="#EADFD1" />
      </g>
    </svg>
  )
}
