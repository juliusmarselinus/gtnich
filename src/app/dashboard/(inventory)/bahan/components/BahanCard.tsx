'use client'

import { Bahan, StockCondition } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import { Edit2, Trash2, AlertTriangle, CheckCircle, XCircle, ImageOff } from 'lucide-react'
import clsx from 'clsx'

// ── Peta kata kunci → foto Unsplash (stabil, bukan random) ──────────────────
const FOTO_MAP: { keywords: string[]; url: string }[] = [
  { keywords: ['tepung', 'terigu', 'tapioka', 'maizena', 'sagu'], url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80' },
  { keywords: ['gula', 'gula pasir', 'gula merah', 'palm sugar'], url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80' },
  { keywords: ['minyak', 'margarin', 'shortening'], url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80' },
  { keywords: ['mentega', 'butter'], url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80' },
  { keywords: ['telur', 'egg'], url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80' },
  { keywords: ['susu', 'krim', 'cream', 'whipping', 'evaporasi'], url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80' },
  { keywords: ['coklat', 'chocolate', 'kakao', 'cocoa'], url: 'https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?w=400&q=80' },
  { keywords: ['keju', 'cheese'], url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80' },
  { keywords: ['garam', 'salt'], url: 'https://images.unsplash.com/photo-1550159930-40066082a4fc?w=400&q=80' },
  { keywords: ['bawang putih', 'garlic'], url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&q=80' },
  { keywords: ['bawang merah', 'bawang', 'onion'], url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&q=80' },
  { keywords: ['tomat', 'tomato'], url: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80' },
  { keywords: ['cabai', 'cabe', 'chili', 'lombok'], url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80' },
  { keywords: ['wortel', 'carrot'], url: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=400&q=80' },
  { keywords: ['beras', 'nasi', 'rice'], url: 'https://images.unsplash.com/photo-1536304993881-ff86d42818f7?w=400&q=80' },
  { keywords: ['ayam', 'chicken', 'fillet'], url: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&q=80' },
  { keywords: ['daging', 'sapi', 'beef', 'kambing', 'babi', 'meat'], url: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80' },
  { keywords: ['ikan', 'fish', 'udang', 'cumi', 'seafood', 'laut'], url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80' },
  { keywords: ['vanili', 'vanilla', 'ekstrak'], url: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400&q=80' },
  { keywords: ['kopi', 'coffee', 'espresso'], url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&q=80' },
  { keywords: ['teh', 'tea', 'matcha'], url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80' },
  { keywords: ['lemon', 'jeruk', 'citrus', 'lime'], url: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=400&q=80' },
  { keywords: ['stroberi', 'strawberry', 'buah', 'blueberry', 'raspberry'], url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&q=80' },
]

function getDefaultFoto(nama: string): string | null {
  const lowerNama = nama.toLowerCase()
  for (const { keywords, url } of FOTO_MAP) {
    if (keywords.some(k => lowerNama.includes(k))) return url
  }
  return null
}


const statusConfig: Record<
  StockCondition,
  { label: string; icon: typeof CheckCircle; bgCls: string; textCls: string; barCls: string }
> = {
  ok: {
    label: 'Aman',
    icon: CheckCircle,
    bgCls: 'bg-[#FFF6EC]',
    textCls: 'text-[#C86400]',
    barCls: 'bg-[#FF8F2B]',
  },
  rendah: {
    label: 'Rendah',
    icon: AlertTriangle,
    bgCls: 'bg-amber-50',
    textCls: 'text-amber-700',
    barCls: 'bg-amber-400',
  },
  habis: {
    label: 'Habis',
    icon: XCircle,
    bgCls: 'bg-rose-50',
    textCls: 'text-rose-600',
    barCls: 'bg-rose-400',
  },
}

interface BahanCardProps {
  list: Bahan[]
  getStockCondition: (b: Bahan) => StockCondition
  onEdit: (b: Bahan) => void
  onDelete: (id: string) => void
}

export default function BahanCard({
  list,
  getStockCondition,
  onEdit,
  onDelete,
}: BahanCardProps) {
  if (list.length === 0) {
    return (
      <div className="clay-card py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
        <ImageOff className="w-10 h-10 opacity-40" />
        <p className="text-sm font-semibold">Tidak ada bahan ditemukan.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {list.map(b => {
        const st = getStockCondition(b)
        const cfg = statusConfig[st]
        const Icon = cfg.icon
        const fotoUrl = b.foto || getDefaultFoto(b.nama)

        // Hitung persentase stok untuk mini progress bar
        const maxStok = Math.max(b.stokMinimum * 3, b.stok, 1)
        const pct = Math.min(100, Math.round((b.stok / maxStok) * 100))

        return (
          <div
            key={b.id}
            className="clay-card p-0 overflow-hidden flex flex-col group hover:-translate-y-0.5 transition-transform duration-200"
          >
            {/* Foto */}
            <div className="relative w-full aspect-square bg-[#F7F5F0] flex items-center justify-center overflow-hidden">
              {fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fotoUrl}
                  alt={b.nama}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-[#FFF6EC] to-[#F7F5F0] text-slate-300">
                  <ImageOff className="w-8 h-8" />
                  <span className="text-[9px] font-semibold">Belum ada foto</span>
                </div>
              )}

              {/* Status badge overlay */}
              <span
                className={clsx(
                  'absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm',
                  cfg.bgCls,
                  cfg.textCls
                )}
              >
                <Icon className="w-2.5 h-2.5" />
                {cfg.label}
              </span>
            </div>

            {/* Body */}
            <div className="p-3 flex flex-col gap-1.5 flex-1">
              <p className="font-extrabold text-slate-800 text-[13px] leading-tight line-clamp-2">
                {b.nama}
              </p>
              {b.supplier?.nama && (
                <p className="text-[10px] text-slate-400 truncate">{b.supplier.nama}</p>
              )}

              <div className="mt-auto space-y-1.5">
                {/* Harga */}
                <p className="text-[11px] font-bold text-[#FF8F2B]">
                  {formatRupiah(b.hargaPerSatuan)}
                  <span className="text-slate-400 font-normal"> /{b.satuan}</span>
                </p>

                {/* Stok + progress */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-slate-400">Stok</span>
                    <span className="text-[11px] font-black text-slate-700">
                      {b.stok} {b.satuan}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={clsx('h-full rounded-full transition-all', cfg.barCls)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 mt-0.5 text-right">
                    Min {b.stokMinimum} {b.satuan}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="border-t border-[#EBE3D7] flex">
              <button
                onClick={() => onEdit(b)}
                title="Edit"
                className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-[#FF8F2B] hover:bg-[#FFF6EC] transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
              <div className="w-px bg-[#EBE3D7]" />
              <button
                onClick={() => onDelete(b.id)}
                title="Hapus"
                className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Hapus
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
