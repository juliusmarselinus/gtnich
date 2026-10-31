'use client'

import { useId } from 'react'
import type { DapiMood } from './DapiHead'

interface DapiMascotProps {
  width?: number
  mood?: DapiMood
  className?: string
}

/** Dapi setengah badan (statis) untuk kartu "Tugas dari Dapi". Latar diatur oleh pemanggil. */
export default function DapiMascot({ width = 168, mood = 'senang', className }: DapiMascotProps) {
  const uid = useId().replace(/:/g, '')
  const worried = mood === 'khawatir'
  const fur = `url(#${uid}-fur)`
  const cream = `url(#${uid}-cream)`
  const white = `url(#${uid}-white)`

  return (
    <svg viewBox="0 0 240 260" width={width} height={Math.round((width * 260) / 240)} aria-hidden="true" className={className}>
      <defs>
        <radialGradient id={`${uid}-fur`} cx="40%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFB565" />
          <stop offset="55%" stopColor="#FF8F28" />
          <stop offset="100%" stopColor="#E2700F" />
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

      {/* ekor */}
      <g transform="translate(166 240)">
        <path d="M0 0 C42 4 72 -28 62 -82 C52 -50 32 -32 4 -24 Z" fill={fur} stroke="#C9620C" strokeWidth="2" />
        <path d="M62 -82 C72 -60 68 -40 54 -26 C48 -42 54 -64 62 -82 Z" fill={cream} />
      </g>
      {/* baju koki */}
      <path d="M62 216 Q120 194 178 216 L192 260 L48 260 Z" fill={white} stroke="#E6D6C2" strokeWidth="2" />

      <g transform="rotate(6 120 206)">
        <path d="M58 132 L56 56 Q90 68 112 104 Z" fill={fur} stroke="#C9620C" strokeWidth="2" />
        <path d="M68 116 L66 74 Q86 84 100 104 Z" fill="#FFD9C2" />
        <path d="M56 74 L56 56 L72 62 Z" fill="#2B221C" />
        <path d="M182 132 L184 56 Q150 68 128 104 Z" fill={fur} stroke="#C9620C" strokeWidth="2" />
        <path d="M172 116 L174 74 Q154 84 140 104 Z" fill="#FFD9C2" />
        <path d="M184 74 L184 56 L168 62 Z" fill="#2B221C" />
        <path
          d="M120 86 C164 86 192 114 194 148 C195 166 187 180 174 188 L186 198 L160 198 C148 204 134 206 120 206 C106 206 92 204 80 198 L54 198 L66 188 C53 180 45 166 46 148 C48 114 76 86 120 86 Z"
          fill={fur}
          stroke="#C9620C"
          strokeWidth="2"
        />
        <path d="M120 144 C138 144 158 158 164 176 C156 196 138 204 120 204 C102 204 84 196 76 176 C82 158 102 144 120 144 Z" fill={cream} />
        <ellipse cx="76" cy="170" rx="10" ry="6" fill="#FF775D" opacity=".45" />
        <ellipse cx="164" cy="170" rx="10" ry="6" fill="#FF775D" opacity=".45" />
        {worried && (
          <g stroke="#2B221C" strokeWidth="4" strokeLinecap="round">
            <path d="M84 126 L102 122" />
            <path d="M156 126 L138 122" />
          </g>
        )}
        <ellipse cx="96" cy="150" rx="10" ry="13" fill="#2B221C" />
        <ellipse cx="144" cy="150" rx="10" ry="13" fill="#2B221C" />
        <circle cx="99" cy="145" r="3.5" fill="#FFFFFF" />
        <circle cx="147" cy="145" r="3.5" fill="#FFFFFF" />
        <path d="M110 166 Q120 161 130 166 Q126 176 120 177 Q114 176 110 166 Z" fill="#2B221C" />
        {worried ? (
          <ellipse cx="120" cy="189" rx="5" ry="6" fill="#2B221C" />
        ) : (
          <path d="M108 183 Q114 191 120 183 Q126 191 132 183" stroke="#2B221C" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        )}
        {/* topi koki */}
        <g transform="translate(0 6)">
          <circle cx="98" cy="58" r="19" fill={white} />
          <circle cx="142" cy="58" r="19" fill={white} />
          <circle cx="120" cy="46" r="24" fill={white} />
          <rect x="88" y="58" width="64" height="30" rx="8" fill={white} />
          <rect x="88" y="76" width="64" height="12" rx="6" fill="#EADFD1" />
        </g>
      </g>
    </svg>
  )
}
