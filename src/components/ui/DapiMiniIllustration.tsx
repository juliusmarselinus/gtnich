'use client'

import React, { useId } from 'react'

export type DapiMiniRole = 'money' | 'orders' | 'recipe' | 'inventory'

interface DapiMiniIllustrationProps {
  role: DapiMiniRole
  className?: string
  size?: number
}

const C = {
  fur: '#FF8F28',
  furDark: '#E2700F',
  furLight: '#FFB565',
  cream: '#FFF3DC',
  ink: '#2B221C',
  blush: '#FF775D',
  white: '#FFFFFF',
  gold: '#FFBF25',
  goldDark: '#D9980D',
  amber: '#FFE5B4',
  green: '#10B981',
  red: '#EF4444',
  wood: '#C4976A',
  woodDark: '#936C45',
}

/**
 * Ilustrasi Dapi Kecil Bertema Dapur
 * Membawa bahasa visual identik dengan DapiFace (palet warna fur #FF8F28, outline halus, mata hidup, telinga rubah koki).
 * Dirancang khusus untuk card dashboard agar setiap kartu terasa hidup, hangat, dan fungsional.
 */
export default function DapiMiniIllustration({
  role,
  className = '',
  size = 80,
}: DapiMiniIllustrationProps) {
  const uid = useId().replace(/:/g, '')

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="w-full h-full drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      >
        <defs>
          <radialGradient id={`${uid}-fur`} cx="40%" cy="30%" r="75%">
            <stop offset="0%" stopColor={C.furLight} />
            <stop offset="60%" stopColor={C.fur} />
            <stop offset="100%" stopColor={C.furDark} />
          </radialGradient>
          <radialGradient id={`${uid}-cream`} cx="50%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor={C.cream} />
          </radialGradient>
          <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFD868" />
            <stop offset="100%" stopColor={C.goldDark} />
          </linearGradient>
          <linearGradient id={`${uid}-bill`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FFF2DE" />
          </linearGradient>
        </defs>

        {/* ============================================================== */}
        {/* ROLE: MONEY - Dapi Bahagia Membawa Koin Emas Kasir             */}
        {/* ============================================================== */}
        {role === 'money' && (
          <g>
            {/* Bayangan halus */}
            <ellipse cx="50" cy="88" rx="34" ry="6" fill={C.ink} opacity="0.08" />

            {/* Badan Dapi Baju Putih Koki */}
            <path
              d="M32 72 Q50 64 68 72 L72 86 L28 86 Z"
              fill="#FFFFFF"
              stroke="#E8DAC7"
              strokeWidth="1.5"
            />
            {/* Kancing */}
            <circle cx="50" cy="76" r="1.5" fill={C.fur} />
            <circle cx="50" cy="81" r="1.5" fill={C.fur} />

            {/* Kepala Dapi */}
            {/* Telinga Kiri & Kanan */}
            <path d="M28 42 L26 18 Q38 22 46 34 Z" fill={`url(#${uid}-fur)`} />
            <path d="M30 36 L29 24 Q36 26 42 34 Z" fill="#FFD9C2" />
            <path d="M26 24 L26 18 L32 20 Z" fill={C.ink} />

            <path d="M72 42 L74 18 Q62 22 54 34 Z" fill={`url(#${uid}-fur)`} />
            <path d="M70 36 L71 24 Q64 26 58 34 Z" fill="#FFD9C2" />
            <path d="M74 24 L74 18 L68 20 Z" fill={C.ink} />

            {/* Bentuk Kepala */}
            <path
              d="M50 28 C68 28 80 40 80 54 C80 62 76 68 70 70 C60 74 40 74 30 70 C24 68 20 62 20 54 C20 40 32 28 50 28 Z"
              fill={`url(#${uid}-fur)`}
            />
            {/* Moncong Krim */}
            <path
              d="M50 50 C58 50 66 56 68 64 C64 71 58 73 50 73 C42 73 36 71 32 64 C34 56 42 50 50 50 Z"
              fill={`url(#${uid}-cream)`}
            />

            {/* Pipi Merona */}
            <ellipse cx="32" cy="61" rx="4" ry="2.5" fill={C.blush} opacity="0.6" />
            <ellipse cx="68" cy="61" rx="4" ry="2.5" fill={C.blush} opacity="0.6" />

            {/* Mata Senang Lengkung ^ ^ */}
            <path
              d="M37 53 Q42 46 47 53"
              stroke={C.ink}
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M53 53 Q58 46 63 53"
              stroke={C.ink}
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* Hidung */}
            <path d="M47 58 Q50 56 53 58 Q51 62 50 62 Q49 62 47 58 Z" fill={C.ink} />
            {/* Mulut Senang Terbuka */}
            <path d="M44 64 Q50 72 56 64 Z" fill={C.ink} />
            <path d="M47 67 Q50 71 53 67 Z" fill={C.blush} />

            {/* Koin Emas Mengkilap di Depan Dapi */}
            <g transform="translate(62, 58)">
              <circle cx="12" cy="12" r="13" fill={`url(#${uid}-gold)`} stroke="#C4840A" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="9" fill="none" stroke="#FFDF85" strokeWidth="1.2" />
              <text
                x="12"
                y="16"
                textAnchor="middle"
                fontSize="11"
                fontWeight="900"
                fontFamily="monospace"
                fill="#7E4F02"
              >
                Rp
              </text>
            </g>
          </g>
        )}

        {/* ============================================================== */}
        {/* ROLE: ORDERS - Dapi Memegang Kertas Nota Tiket Pesanan          */}
        {/* ============================================================== */}
        {role === 'orders' && (
          <g>
            <ellipse cx="50" cy="88" rx="34" ry="6" fill={C.ink} opacity="0.08" />

            {/* Badan Dapi */}
            <path
              d="M32 72 Q50 64 68 72 L72 86 L28 86 Z"
              fill="#FFFFFF"
              stroke="#E8DAC7"
              strokeWidth="1.5"
            />

            {/* Telinga */}
            <path d="M28 42 L26 18 Q38 22 46 34 Z" fill={`url(#${uid}-fur)`} />
            <path d="M30 36 L29 24 Q36 26 42 34 Z" fill="#FFD9C2" />
            <path d="M26 24 L26 18 L32 20 Z" fill={C.ink} />

            <path d="M72 42 L74 18 Q62 22 54 34 Z" fill={`url(#${uid}-fur)`} />
            <path d="M70 36 L71 24 Q64 26 58 34 Z" fill="#FFD9C2" />
            <path d="M74 24 L74 18 L68 20 Z" fill={C.ink} />

            {/* Topi Koki Dapi */}
            <ellipse cx="50" cy="28" rx="16" ry="3" fill={C.ink} opacity="0.12" />
            <circle cx="42" cy="18" r="8" fill="#FFFFFF" />
            <circle cx="58" cy="18" r="8" fill="#FFFFFF" />
            <circle cx="50" cy="14" r="9" fill="#FFFFFF" />
            <rect x="38" y="18" width="24" height="10" rx="3" fill="#FFFFFF" />
            <rect x="38" y="24" width="24" height="4" rx="2" fill="#E8DAC7" />

            {/* Kepala */}
            <path
              d="M50 28 C68 28 80 40 80 54 C80 62 76 68 70 70 C60 74 40 74 30 70 C24 68 20 62 20 54 C20 40 32 28 50 28 Z"
              fill={`url(#${uid}-fur)`}
            />
            {/* Moncong */}
            <path
              d="M50 50 C58 50 66 56 68 64 C64 71 58 73 50 73 C42 73 36 71 32 64 C34 56 42 50 50 50 Z"
              fill={`url(#${uid}-cream)`}
            />

            {/* Mata Melirik Siap Catat */}
            <ellipse cx="40" cy="51" rx="4" ry="5.5" fill={C.ink} />
            <ellipse cx="60" cy="51" rx="4" ry="5.5" fill={C.ink} />
            <circle cx="41.5" cy="49" r="1.5" fill="#FFFFFF" />
            <circle cx="61.5" cy="49" r="1.5" fill="#FFFFFF" />

            {/* Hidung & Senyum */}
            <path d="M47 58 Q50 56 53 58 Q51 62 50 62 Q49 62 47 58 Z" fill={C.ink} />
            <path d="M46 64 Q50 67 54 64" stroke={C.ink} strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Kertas Nota Tiket Pesanan di Samping Kanan */}
            <g transform="translate(60, 52) rotate(-6)">
              <rect
                x="0"
                y="0"
                width="24"
                height="32"
                rx="3"
                fill={`url(#${uid}-bill)`}
                stroke="#DEC5A5"
                strokeWidth="1.2"
              />
              {/* Garis-garis isi nota */}
              <line x1="4" y1="6" x2="16" y2="6" stroke="#C4976A" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="4" y1="11" x2="20" y2="11" stroke="#E2CCA8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="4" y1="15" x2="18" y2="15" stroke="#E2CCA8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="4" y1="19" x2="14" y2="19" stroke="#E2CCA8" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="18" cy="25" r="2.5" fill="#10B981" />
            </g>
          </g>
        )}

        {/* ============================================================== */}
        {/* ROLE: RECIPE - Dapi Memegang Sendok Masak & Piring Saji         */}
        {/* ============================================================== */}
        {role === 'recipe' && (
          <g>
            <ellipse cx="50" cy="88" rx="34" ry="6" fill={C.ink} opacity="0.08" />

            {/* Badan */}
            <path
              d="M32 72 Q50 64 68 72 L72 86 L28 86 Z"
              fill="#FFFFFF"
              stroke="#E8DAC7"
              strokeWidth="1.5"
            />

            {/* Telinga */}
            <path d="M28 42 L26 18 Q38 22 46 34 Z" fill={`url(#${uid}-fur)`} />
            <path d="M30 36 L29 24 Q36 26 42 34 Z" fill="#FFD9C2" />
            <path d="M26 24 L26 18 L32 20 Z" fill={C.ink} />

            <path d="M72 42 L74 18 Q62 22 54 34 Z" fill={`url(#${uid}-fur)`} />
            <path d="M70 36 L71 24 Q64 26 58 34 Z" fill="#FFD9C2" />
            <path d="M74 24 L74 18 L68 20 Z" fill={C.ink} />

            {/* Kepala */}
            <path
              d="M50 28 C68 28 80 40 80 54 C80 62 76 68 70 70 C60 74 40 74 30 70 C24 68 20 62 20 54 C20 40 32 28 50 28 Z"
              fill={`url(#${uid}-fur)`}
            />
            {/* Moncong */}
            <path
              d="M50 50 C58 50 66 56 68 64 C64 71 58 73 50 73 C42 73 36 71 32 64 C34 56 42 50 50 50 Z"
              fill={`url(#${uid}-cream)`}
            />

            {/* Pipi */}
            <ellipse cx="32" cy="61" rx="4" ry="2.5" fill={C.blush} opacity="0.6" />
            <ellipse cx="68" cy="61" rx="4" ry="2.5" fill={C.blush} opacity="0.6" />

            {/* Mata Ceria */}
            <path
              d="M37 52 Q42 47 47 52"
              stroke={C.ink}
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M53 52 Q58 47 63 52"
              stroke={C.ink}
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* Hidung & Senyum */}
            <path d="M47 58 Q50 56 53 58 Q51 62 50 62 Q49 62 47 58 Z" fill={C.ink} />
            <path d="M46 64 Q50 69 54 64" stroke={C.ink} strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Sendok Kayu Koki di Kiri */}
            <g transform="translate(18, 48) rotate(-24)">
              <ellipse cx="8" cy="5" rx="5" ry="7" fill={C.wood} stroke={C.woodDark} strokeWidth="1.2" />
              <rect x="6.5" y="11" width="3" height="24" rx="1.5" fill={C.wood} stroke={C.woodDark} strokeWidth="1" />
            </g>

            {/* Piring Makanan Lezat di Depan Kanan */}
            <g transform="translate(56, 68)">
              <ellipse cx="16" cy="14" rx="16" ry="6" fill="#FFFFFF" stroke="#E6D6C2" strokeWidth="1.5" />
              <ellipse cx="16" cy="12" rx="12" ry="4" fill="#FFB84C" />
              <circle cx="16" cy="11" r="2.5" fill="#EF4444" />
            </g>
          </g>
        )}

        {/* ============================================================== */}
        {/* ROLE: INVENTORY - Dapi Cek Karung / Dus Bahan Baku              */}
        {/* ============================================================== */}
        {role === 'inventory' && (
          <g>
            <ellipse cx="50" cy="88" rx="34" ry="6" fill={C.ink} opacity="0.08" />

            {/* Badan */}
            <path
              d="M32 72 Q50 64 68 72 L72 86 L28 86 Z"
              fill="#FFFFFF"
              stroke="#E8DAC7"
              strokeWidth="1.5"
            />

            {/* Telinga Waspada */}
            <path d="M28 42 L24 20 Q36 24 46 34 Z" fill={`url(#${uid}-fur)`} />
            <path d="M30 36 L27 26 Q35 28 42 34 Z" fill="#FFD9C2" />
            <path d="M24 26 L24 20 L30 22 Z" fill={C.ink} />

            <path d="M72 42 L76 20 Q64 24 54 34 Z" fill={`url(#${uid}-fur)`} />
            <path d="M70 36 L73 26 Q65 28 58 34 Z" fill="#FFD9C2" />
            <path d="M76 26 L76 20 L70 22 Z" fill={C.ink} />

            {/* Kepala */}
            <path
              d="M50 28 C68 28 80 40 80 54 C80 62 76 68 70 70 C60 74 40 74 30 70 C24 68 20 62 20 54 C20 40 32 28 50 28 Z"
              fill={`url(#${uid}-fur)`}
            />
            {/* Moncong */}
            <path
              d="M50 50 C58 50 66 56 68 64 C64 71 58 73 50 73 C42 73 36 71 32 64 C34 56 42 50 50 50 Z"
              fill={`url(#${uid}-cream)`}
            />

            {/* Alis Teliti */}
            <path d="M36 43 L45 45" stroke={C.ink} strokeWidth="1.8" strokeLinecap="round" />
            <path d="M64 43 L55 45" stroke={C.ink} strokeWidth="1.8" strokeLinecap="round" />

            {/* Mata Teliti Melihat Dus */}
            <ellipse cx="40" cy="51" rx="4" ry="5" fill={C.ink} />
            <ellipse cx="60" cy="51" rx="4" ry="5" fill={C.ink} />
            <circle cx="39" cy="52" r="1.5" fill="#FFFFFF" />
            <circle cx="59" cy="52" r="1.5" fill="#FFFFFF" />

            {/* Hidung & Mulut Fokus */}
            <path d="M47 58 Q50 56 53 58 Q51 62 50 62 Q49 62 47 58 Z" fill={C.ink} />
            <path d="M47 65 L53 65" stroke={C.ink} strokeWidth="2" strokeLinecap="round" />

            {/* Kardus Persediaan / Karung Bahan di Depan */}
            <g transform="translate(60, 56) rotate(4)">
              {/* Dus Karton Cokelat */}
              <rect
                x="0"
                y="0"
                width="28"
                height="24"
                rx="3"
                fill="#DEB887"
                stroke="#A26D38"
                strokeWidth="1.5"
              />
              {/* Tutup Lipatan Dus */}
              <path d="M0 8 L14 11 L28 8" fill="none" stroke="#A26D38" strokeWidth="1.2" />
              <line x1="14" y1="11" x2="14" y2="24" stroke="#A26D38" strokeWidth="1.2" />
              {/* Label Stok */}
              <rect x="5" y="14" width="7" height="6" rx="1" fill="#FFFFFF" opacity="0.8" />
            </g>
          </g>
        )}
      </svg>
    </div>
  )
}
