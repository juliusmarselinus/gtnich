'use client'

import { useEffect, useId, useRef, useState } from 'react'

/**
 * Dapi si rubah dapur — maskot DapurTwin.
 * Bereaksi terhadap form login: telinga, mata, mulut, kaki depan, dan ekor
 * berubah halus per mood, warna latar ikut berganti.
 */
export type FaceMood = 'idle' | 'email' | 'password' | 'peek' | 'error' | 'success' | 'loading'

const MOODS: Record<FaceMood, { bg: string; say: string }> = {
  idle:     { bg: '#FFBF25', say: 'Halo! Masuk dulu, yuk.' },
  email:    { bg: '#FFD36B', say: 'Aku catat emailnya...' },
  password: { bg: '#FFE6A8', say: 'Aku tutup mata, aman!' },
  peek:     { bg: '#FFE6A8', say: 'Eh, kelihatan sedikit...' },
  loading:  { bg: '#FFBF25', say: 'Sebentar, cek dapur dulu...' },
  error:    { bg: '#FF9C86', say: 'Yah, coba cek lagi ya.' },
  success:  { bg: '#A9CFFA', say: 'Yeay, selamat datang!' },
}

const C = {
  fur: '#FF8F28',
  furDark: '#E2700F',
  cream: '#FFF3DC',
  ink: '#2B221C',
  scarf: '#FF775D',
  scarfDark: '#E05A42',
  blush: '#FF775D',
}

interface DapiFaceProps {
  mood: FaceMood
  /** 0..1 — arah lirikan saat mengetik email */
  typingProgress?: number
  size?: 'card' | 'splash'
  /** sembunyikan balon kata (dipakai splash) */
  hideBubble?: boolean
}

const ease = 'cubic-bezier(.34,1.56,.64,1)'
const t = (ms = 380) => `transform ${ms}ms ${ease}, opacity 220ms ease`

export default function DapiFace({ mood, typingProgress = 0, size = 'card', hideBubble }: DapiFaceProps) {
  const ref = useRef<HTMLDivElement>(null)
  // ID gradien unik per Dapi, supaya beberapa Dapi di satu halaman tidak saling bentrok
  const uid = useId().replace(/:/g, '')
  const [pointer, setPointer] = useState({ x: 0, y: 0 })

  // Saat idle, mata mengikuti kursor
  useEffect(() => {
    if (mood !== 'idle') return
    const onMove = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect()
      if (!r) return
      const dx = (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)
      const dy = (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)
      setPointer({ x: Math.max(-1, Math.min(1, dx)), y: Math.max(-1, Math.min(1, dy)) })
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [mood])

  let look = { x: 0, y: 0 }
  if (mood === 'idle') look = pointer
  if (mood === 'email') look = { x: -1 + typingProgress * 2, y: 1 }
  if (mood === 'loading') look = { x: 0.8, y: -1 }
  if (mood === 'error') look = { x: 0, y: 0.8 }
  if (mood === 'peek') look = { x: 0.4, y: 1 }

  const is = (...m: FaceMood[]) => m.includes(mood)
  const headTilt = is('email') ? -7 : is('loading') ? 6 : is('error') ? 0 : 0
  const headDrop = is('error') ? 6 : 0
  const earL = is('error') ? -38 : is('success') ? 8 : is('password', 'peek') ? -14 : 0
  const earR = is('error') ? 38 : is('success') ? -8 : is('password', 'peek') ? 14 : 0
  const happyEyes = is('success')
  const pawLeftUp = is('password', 'peek')
  const pawRightUp = is('password')

  const { bg, say } = MOODS[mood]
  const svgSize = size === 'splash' ? 300 : 176

  return (
    <div
      ref={ref}
      className={`relative h-full w-full flex flex-col items-center overflow-hidden ${size === 'splash' ? 'justify-center pt-24' : 'justify-end'}`}
      style={{ backgroundColor: bg, transition: 'background-color 450ms ease' }}
    >
      <style>{`
        @keyframes dapi-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-5px) } }
        @keyframes dapi-blink { 0%,93%,100% { transform: scaleY(1) } 96% { transform: scaleY(.1) } }
        @keyframes dapi-wag { 0%,100% { transform: rotate(-6deg) } 50% { transform: rotate(10deg) } }
        @keyframes dapi-wag-fast { 0%,100% { transform: rotate(-12deg) } 50% { transform: rotate(18deg) } }
        @keyframes dapi-twitch { 0%,80%,100% { transform: rotate(0) } 85% { transform: rotate(-12deg) } 90% { transform: rotate(4deg) } }
        @keyframes dapi-bubble { 0% { transform: scale(.7); opacity: 0 } 70% { transform: scale(1.05); opacity: 1 } 100% { transform: scale(1) } }
        .dapi-bob { animation: dapi-bob 3s ease-in-out infinite }
        .dapi-blink { transform-box: fill-box; transform-origin: center; animation: dapi-blink 4.2s infinite }
        .dapi-wag { transform-box: fill-box; transform-origin: 0% 100%; animation: dapi-wag 1.6s ease-in-out infinite }
        .dapi-wag-fast { transform-box: fill-box; transform-origin: 0% 100%; animation: dapi-wag-fast .35s ease-in-out infinite }
        .dapi-twitch { animation: dapi-twitch 1.4s ease-in-out infinite }
        .dapi-bubble { animation: dapi-bubble 360ms ${ease} }
        @media (prefers-reduced-motion: reduce) {
          .dapi-bob, .dapi-blink, .dapi-wag, .dapi-wag-fast, .dapi-twitch, .dapi-bubble { animation: none }
        }
      `}</style>

      {/* dekorasi latar lembut */}
      <span aria-hidden className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/25" />
      <span aria-hidden className="absolute top-8 right-6 w-14 h-14 rounded-full bg-white/20" />

      {/* balon kata */}
      {!hideBubble && (
        <div
          key={say}
          role="status"
          aria-live="polite"
          className="dapi-bubble absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-2xl bg-white px-4 py-2 text-sm font-bold text-[#2B221C] shadow-[0_4px_0_rgba(43,34,28,0.1)]"
        >
          {say}
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-white" />
        </div>
      )}

      <svg viewBox="0 0 240 260" width={svgSize} height={svgSize * 260 / 240} aria-hidden className="relative">
        <defs>
          <radialGradient id={`${uid}-fur`} cx="40%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#FFB565" />
            <stop offset="55%" stopColor={C.fur} />
            <stop offset="100%" stopColor={C.furDark} />
          </radialGradient>
          <radialGradient id={`${uid}-cream`} cx="50%" cy="25%" r="80%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FFE4BF" />
          </radialGradient>
          <linearGradient id={`${uid}-white`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#EADFD1" />
          </linearGradient>
        </defs>

        <g className="dapi-bob">
          {/* ekor */}
          <g transform="translate(166 240)">
            <g className={is('success') ? 'dapi-wag-fast' : 'dapi-wag'}>
              <path d="M0 0 C42 4 72 -28 62 -82 C52 -50 32 -32 4 -24 Z" fill={`url(#${uid}-fur)`} />
              <path d="M62 -82 C72 -60 68 -40 54 -26 C48 -42 54 -64 62 -82 Z" fill={`url(#${uid}-cream)`} />
            </g>
          </g>

          {/* badan: baju koki */}
          <path d="M62 216 Q120 194 178 216 L192 260 L48 260 Z" fill={`url(#${uid}-white)`} stroke="#E6D6C2" strokeWidth="2" />
          {/* bulu dada V di kerah */}
          <path d="M100 200 L120 230 L140 200 Z" fill={`url(#${uid}-cream)`} />
          {/* kerah */}
          <path d="M92 204 L120 232 L104 236 L84 212 Z" fill="#FFFFFF" stroke="#E6D6C2" strokeWidth="2" />
          <path d="M148 204 L120 232 L136 236 L156 212 Z" fill="#FFFFFF" stroke="#E6D6C2" strokeWidth="2" />
          {/* kancing */}
          {[[108, 244], [132, 244], [108, 256], [132, 256]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="3.5" fill={C.fur} />
          ))}
          {/* bayangan kepala di badan */}
          <ellipse cx="120" cy="208" rx="54" ry="8" fill={C.ink} opacity=".12" />

          {/* kepala */}
          <g
            style={{
              transformBox: 'view-box',
              transformOrigin: '120px 206px',
              transform: `translateY(${headDrop}px) rotate(${headTilt}deg)`,
              transition: t(420),
            }}
          >
            {/* telinga kiri — pangkalnya tertutup kepala supaya menyatu */}
            <g style={{ transformBox: 'view-box', transformOrigin: '84px 112px', transform: `rotate(${earL}deg)`, transition: t() }}>
              <g className={is('loading') ? 'dapi-twitch' : undefined} style={{ transformBox: 'view-box', transformOrigin: '84px 112px' }}>
                <path d="M58 132 L56 56 Q90 68 112 104 Z" fill={`url(#${uid}-fur)`} />
                <path d="M68 116 L66 74 Q86 84 100 104 Z" fill="#FFD9C2" />
                <path d="M56 74 L56 56 L72 62 Z" fill={C.ink} />
              </g>
            </g>
            {/* telinga kanan */}
            <g style={{ transformBox: 'view-box', transformOrigin: '156px 112px', transform: `rotate(${earR}deg)`, transition: t() }}>
              <path d="M182 132 L184 56 Q150 68 128 104 Z" fill={`url(#${uid}-fur)`} />
              <path d="M172 116 L174 74 Q154 84 140 104 Z" fill="#FFD9C2" />
              <path d="M184 74 L184 56 L168 62 Z" fill={C.ink} />
            </g>

            {/* kepala dengan jumbai pipi */}
            <path
              d="M120 86 C164 86 192 114 194 148 C195 166 187 180 174 188 L186 198 L160 198 C148 204 134 206 120 206 C106 206 92 204 80 198 L54 198 L66 188 C53 180 45 166 46 148 C48 114 76 86 120 86 Z"
              fill={`url(#${uid}-fur)`}
            />
            {/* kilau */}
            <ellipse cx="94" cy="108" rx="22" ry="9" fill="#fff" opacity=".22" transform="rotate(-18 94 108)" />
            {/* moncong krim (lebih kecil, jadi bukan seperti tudung) */}
            <path d="M120 144 C138 144 158 158 164 176 C156 196 138 204 120 204 C102 204 84 196 76 176 C82 158 102 144 120 144 Z" fill={`url(#${uid}-cream)`} />

            {/* pipi */}
            <ellipse cx="76" cy="170" rx="10" ry="6" fill={C.blush} style={{ opacity: is('error') ? 0 : 0.5, transition: 'opacity 250ms' }} />
            <ellipse cx="164" cy="170" rx="10" ry="6" fill={C.blush} style={{ opacity: is('error') ? 0 : 0.5, transition: 'opacity 250ms' }} />

            {/* alis */}
            <g stroke={C.ink} strokeWidth="4" strokeLinecap="round" style={{ opacity: is('error', 'email') ? 1 : 0, transition: 'opacity 220ms' }}>
              <path d={is('error') ? 'M84 126 L102 132' : 'M84 128 L102 124'} />
              <path d={is('error') ? 'M156 126 L138 132' : 'M156 128 L138 126'} />
            </g>

            {/* mata normal */}
            <g style={{ transform: `translate(${look.x * 5}px, ${look.y * 4}px) scaleY(${happyEyes ? 0.1 : 1})`, transformBox: 'fill-box', transformOrigin: 'center', transition: t(260), opacity: happyEyes ? 0 : 1 }}>
              <g className="dapi-blink">
                <ellipse cx="96" cy="148" rx="10" ry="13" fill={C.ink} />
                <ellipse cx="144" cy="148" rx="10" ry="13" fill={C.ink} />
                <circle cx="99" cy="143" r="3.5" fill="#fff" />
                <circle cx="147" cy="143" r="3.5" fill="#fff" />
              </g>
            </g>
            {/* mata senang ^ ^ */}
            <g stroke={C.ink} strokeWidth="5" strokeLinecap="round" fill="none" style={{ opacity: happyEyes ? 1 : 0, transition: 'opacity 220ms' }}>
              <path d="M86 152 Q96 138 106 152" />
              <path d="M134 152 Q144 138 154 152" />
            </g>

            {/* hidung */}
            <path d="M110 166 Q120 161 130 166 Q126 176 120 177 Q114 176 110 166 Z" fill={C.ink} />
            <ellipse cx="116" cy="166" rx="3" ry="1.6" fill="#fff" opacity=".5" />

            {/* mulut — beberapa bentuk, ganti dengan fade + scale */}
            {([
              ['idle', <path key="a" d="M108 183 Q114 191 120 183 Q126 191 132 183" stroke={C.ink} strokeWidth="3.5" strokeLinecap="round" fill="none" />],
              ['email', <ellipse key="b" cx="120" cy="188" rx="5" ry="6" fill={C.ink} />],
              ['loading', <path key="c" d="M112 187 L128 187" stroke={C.ink} strokeWidth="3.5" strokeLinecap="round" />],
              ['password', <path key="d" d="M110 185 Q120 191 130 185" stroke={C.ink} strokeWidth="3.5" strokeLinecap="round" fill="none" />],
              ['peek', <ellipse key="e" cx="120" cy="188" rx="4" ry="4" fill={C.ink} />],
              ['error', <path key="f" d="M110 193 Q120 183 130 193" stroke={C.ink} strokeWidth="3.5" strokeLinecap="round" fill="none" />],
              ['success', <g key="g"><path d="M104 181 Q120 209 136 181 Z" fill={C.ink} /><path d="M112 193 Q120 185 128 193 Q124 201 120 201 Q116 201 112 193 Z" fill={C.blush} /></g>],
            ] as [FaceMood, React.ReactNode][]).map(([m, el]) => (
              <g
                key={m}
                style={{
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  transform: `scale(${mood === m ? 1 : 0.4})`,
                  opacity: mood === m ? 1 : 0,
                  transition: t(320),
                }}
              >
                {el}
              </g>
            ))}

            {/* topi koki */}
            <g transform="translate(0 6)">
              <ellipse cx="120" cy="90" rx="38" ry="6" fill={C.ink} opacity=".12" />
              <circle cx="98" cy="58" r="19" fill={`url(#${uid}-white)`} />
              <circle cx="142" cy="58" r="19" fill={`url(#${uid}-white)`} />
              <circle cx="120" cy="46" r="24" fill={`url(#${uid}-white)`} />
              <rect x="88" y="58" width="64" height="30" rx="8" fill={`url(#${uid}-white)`} />
              <rect x="88" y="76" width="64" height="12" rx="6" fill="#EADFD1" />
              <circle cx="112" cy="40" r="6" fill="#fff" opacity=".9" />
            </g>
          </g>

          {/* kaki depan — naik menutup mata saat password */}
          <g style={{ transform: pawLeftUp ? 'translate(6px,-104px) rotate(-8deg)' : 'translate(0,0)', transformBox: 'view-box', transformOrigin: '90px 252px', transition: t(420) }}>
            <ellipse cx="90" cy="252" rx="20" ry="15" fill={`url(#${uid}-fur)`} />
            <ellipse cx="90" cy="250" rx="9" ry="6" fill="#FFD9C2" />
          </g>
          <g style={{ transform: pawRightUp ? 'translate(-6px,-104px) rotate(8deg)' : 'translate(0,0)', transformBox: 'view-box', transformOrigin: '150px 252px', transition: t(460) }}>
            <ellipse cx="150" cy="252" rx="20" ry="15" fill={`url(#${uid}-fur)`} />
            <ellipse cx="150" cy="250" rx="9" ry="6" fill="#FFD9C2" />
          </g>
        </g>
      </svg>
    </div>
  )
}
