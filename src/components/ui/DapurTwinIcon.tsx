'use client'

import { useId } from 'react'

interface DapurTwinIconProps {
  size?: number
  className?: string
  /** isi kalau ikon berdiri sendiri (tanpa teks di sebelahnya) agar terbaca screen reader */
  title?: string
}

/** Ikon aplikasi DapurTwin: Dapi mengintip di atas latar kuning. Sumber file: app/icon.png & app/icon.svg */
export default function DapurTwinIcon({ size = 32, className, title }: DapurTwinIconProps) {
  const u = 'dt' + useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} className={className} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
    <defs>
    <clipPath id={`${u}clip`}><rect x="0" y="0" width="512" height="512" rx="116" /></clipPath>
    <linearGradient id={`${u}bg`} x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stopColor="#FFD24A" />
    <stop offset="100%" stopColor="#FFA800" />
    </linearGradient>
    <radialGradient id={`${u}fur`} cx="32%" cy="22%" r="85%">
    <stop offset="0%" stopColor="#FFD08A" />
    <stop offset="30%" stopColor="#FFA03C" />
    <stop offset="70%" stopColor="#F57F14" />
    <stop offset="100%" stopColor="#C8580A" />
    </radialGradient>
    <radialGradient id={`${u}paw`} cx="35%" cy="25%" r="80%">
    <stop offset="0%" stopColor="#FFC27A" />
    <stop offset="55%" stopColor="#FF9A33" />
    <stop offset="100%" stopColor="#D9650C" />
    </radialGradient>
    <radialGradient id={`${u}cream`} cx="50%" cy="20%" r="85%">
    <stop offset="0%" stopColor="#FFFFFF" />
    <stop offset="60%" stopColor="#FFF1DC" />
    <stop offset="100%" stopColor="#F6D3A6" />
    </radialGradient>
    <linearGradient id={`${u}hat`} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor="#FFFFFF" />
    <stop offset="100%" stopColor="#E6DCCF" />
    </linearGradient>
    <radialGradient id={`${u}eye`} cx="40%" cy="30%" r="75%">
    <stop offset="0%" stopColor="#5A4536" />
    <stop offset="100%" stopColor="#1A120D" />
    </radialGradient>
    <radialGradient id={`${u}bean`} cx="40%" cy="30%" r="75%">
    <stop offset="0%" stopColor="#FFB3A1" />
    <stop offset="100%" stopColor="#F0705A" />
    </radialGradient>
    <radialGradient id={`${u}glow`} cx="50%" cy="50%" r="50%">
    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
    </radialGradient>
    <linearGradient id={`${u}shade`} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor="#000000" stopOpacity="0" />
    <stop offset="100%" stopColor="#000000" stopOpacity="0.12" />
    </linearGradient>
    <filter id={`${u}b4`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" /></filter>
    <filter id={`${u}b10`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10" /></filter>
    <filter id={`${u}b24`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="24" /></filter>
    </defs>
    <g clipPath={`url(#${u}clip)`}>
    <rect x="0" y="0" width="512" height="512" fill={`url(#${u}bg)`} />
    <circle cx="110" cy="80" r="300" fill={`url(#${u}glow)`} />
    <g transform="rotate(-9 310 400)">
    <path d="M80 590 C70 440 150 300 310 292 C470 284 570 390 570 530 L570 640 L80 640 Z" fill="#000000" opacity="0.18" filter={`url(#${u}b24)`} transform="translate(-14 18)" />
    <path d="M150 352 C138 268 150 205 178 150 C222 186 258 228 278 292 Z" fill={`url(#${u}fur)`} />
    <path d="M172 320 C166 262 174 220 186 192 C212 214 232 246 244 288 Z" fill="#FFD3BE" />
    <path d="M168 176 L178 150 L198 168 Z" fill="#3A2A22" />
    <path d="M392 288 C420 226 460 186 512 166 C520 228 508 280 482 330 Z" fill={`url(#${u}fur)`} />
    <path d="M408 296 C430 250 458 220 494 200 C496 244 488 280 470 314 Z" fill="#FFD3BE" />
    <path d="M80 590 C70 440 150 300 310 292 C470 284 570 390 570 530 L570 640 L80 640 Z" fill={`url(#${u}fur)`} />
    <path d="M80 590 C70 440 150 300 310 292 C470 284 570 390 570 530" fill="none" stroke="#FFFFFF" strokeWidth="8" opacity="0.5" filter={`url(#${u}b4)`} />
    <ellipse cx="235" cy="350" rx="120" ry="44" fill="#FFFFFF" opacity="0.38" filter={`url(#${u}b10)`} transform="rotate(-14 235 350)" />
    <path d="M180 560 C188 470 245 430 322 430 C402 430 460 470 470 560 L476 640 L172 640 Z" fill={`url(#${u}cream)`} />
    <ellipse cx="300" cy="455" rx="70" ry="18" fill="#FFFFFF" opacity="0.7" filter={`url(#${u}b4)`} />
    <ellipse cx="200" cy="470" rx="34" ry="18" fill="#FF6E4E" opacity="0.5" filter={`url(#${u}b4)`} />
    <ellipse cx="452" cy="462" rx="34" ry="18" fill="#FF6E4E" opacity="0.5" filter={`url(#${u}b4)`} />
    <ellipse cx="252" cy="396" rx="31" ry="40" fill={`url(#${u}eye)`} />
    <ellipse cx="398" cy="390" rx="31" ry="40" fill={`url(#${u}eye)`} />
    <circle cx="263" cy="380" r="11" fill="#FFFFFF" />
    <circle cx="409" cy="374" r="11" fill="#FFFFFF" />
    <circle cx="244" cy="412" r="5" fill="#FFFFFF" opacity="0.8" />
    <circle cx="390" cy="406" r="5" fill="#FFFFFF" opacity="0.8" />
    <path d="M298 452 Q325 438 352 452 Q345 480 325 484 Q305 480 298 452 Z" fill="#2B1F18" />
    <ellipse cx="315" cy="452" rx="9" ry="4" fill="#FFFFFF" opacity="0.6" />
    <path d="M302 506 Q313 522 325 506 Q337 522 348 506" fill="none" stroke="#2B1F18" strokeWidth="8" strokeLinecap="round" />
    <ellipse cx="330" cy="292" rx="96" ry="16" fill="#7A3A00" opacity="0.25" filter={`url(#${u}b10)`} />
    <circle cx="282" cy="206" r="44" fill={`url(#${u}hat)`} />
    <circle cx="380" cy="206" r="44" fill={`url(#${u}hat)`} />
    <circle cx="331" cy="176" r="56" fill={`url(#${u}hat)`} />
    <rect x="252" y="210" width="158" height="68" rx="20" fill={`url(#${u}hat)`} />
    <rect x="252" y="252" width="158" height="28" rx="14" fill="#E2D5C4" />
    <ellipse cx="305" cy="160" rx="24" ry="12" fill="#FFFFFF" opacity="0.9" filter={`url(#${u}b4)`} />
    </g>
    <ellipse cx="160" cy="510" rx="70" ry="76" fill="#7A3000" opacity="0.28" filter={`url(#${u}b10)`} />
    <g transform="rotate(-14 130 470)">
    <ellipse cx="130" cy="470" rx="72" ry="84" fill={`url(#${u}paw)`} />
    <ellipse cx="108" cy="432" rx="30" ry="18" fill="#FFFFFF" opacity="0.4" filter={`url(#${u}b4)`} />
    <ellipse cx="132" cy="494" rx="32" ry="25" fill={`url(#${u}bean)`} />
    <ellipse cx="96" cy="452" rx="12" ry="14" fill={`url(#${u}bean)`} />
    <ellipse cx="118" cy="436" rx="12" ry="14" fill={`url(#${u}bean)`} />
    <ellipse cx="144" cy="436" rx="12" ry="14" fill={`url(#${u}bean)`} />
    <ellipse cx="166" cy="452" rx="12" ry="14" fill={`url(#${u}bean)`} />
    </g>
    <rect x="0" y="300" width="512" height="212" fill={`url(#${u}shade)`} />
    </g>
    </svg>
  )
}
