'use client'

import { Bahan, StockCondition } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import { Edit2, Trash2, AlertTriangle, CheckCircle2, XCircle, ImageOff, Plus, Loader2, Search } from 'lucide-react'
import DapiHead from '@/components/ui/DapiHead'
import clsx from 'clsx'
import { useState, useMemo } from 'react'
import { useToast } from '@/context/ToastContext'
import Pagination from '@/components/ui/Pagination'

// Peta kata kunci -> foto Unsplash berkualitas tinggi
const FOTO_MAP: { keywords: string[]; url: string }[] = [
  { keywords: ['tepung', 'terigu', 'tapioka', 'maizena', 'sagu'], url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&q=80' },
  { keywords: ['gula', 'gula pasir', 'gula merah', 'palm sugar'], url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&q=80' },
  { keywords: ['minyak', 'margarin', 'shortening', 'kelapa'], url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80' },
  { keywords: ['mentega', 'butter'], url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&q=80' },
  { keywords: ['telur', 'egg'], url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&q=80' },
  { keywords: ['susu', 'krim', 'cream', 'whipping', 'evaporasi'], url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&q=80' },
  { keywords: ['coklat', 'chocolate', 'kakao', 'cocoa'], url: 'https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?w=500&q=80' },
  { keywords: ['keju', 'cheese', 'cheddar', 'mozzarella'], url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&q=80' },
  { keywords: ['garam', 'salt'], url: 'https://images.unsplash.com/photo-1550159930-40066082a4fc?w=500&q=80' },
  { keywords: ['bawang putih', 'garlic'], url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=500&q=80' },
  { keywords: ['bawang merah', 'bawang', 'onion'], url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&q=80' },
  { keywords: ['tomat', 'tomato'], url: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=500&q=80' },
  { keywords: ['cabai', 'cabe', 'chili', 'lombok'], url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&q=80' },
  { keywords: ['wortel', 'carrot'], url: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=500&q=80' },
  { keywords: ['beras', 'nasi', 'rice'], url: 'https://images.unsplash.com/photo-1536304993881-ff86d42818f7?w=500&q=80' },
  { keywords: ['ayam', 'chicken', 'fillet'], url: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500&q=80' },
  { keywords: ['daging', 'sapi', 'beef', 'kambing', 'babi', 'meat'], url: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500&q=80' },
  { keywords: ['ikan', 'fish', 'udang', 'cumi', 'seafood', 'laut'], url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&q=80' },
  { keywords: ['vanili', 'vanilla', 'ekstrak'], url: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=500&q=80' },
  { keywords: ['kopi', 'coffee', 'espresso', 'bean'], url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=500&q=80' },
  { keywords: ['teh', 'tea', 'matcha', 'daun'], url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80' },
  { keywords: ['lemon', 'jeruk', 'citrus', 'lime'], url: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=500&q=80' },
  { keywords: ['stroberi', 'strawberry', 'buah', 'blueberry', 'berry'], url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&q=80' },
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
  {
    label: string
    icon: typeof CheckCircle2
    badgeBg: string
    badgeText: string
    badgeBorder: string
    barColor: string
    cardRing: string
  }
> = {
  ok: {
    label: 'Aman',
    icon: CheckCircle2,
    badgeBg: 'bg-[#E8F5E4]',
    badgeText: 'text-[#2D7A1F]',
    badgeBorder: 'border-[#C3E6BD]',
    barColor: 'bg-[#228B5B]',
    cardRing: 'hover:border-[#228B5B]/30',
  },
  rendah: {
    label: 'Rendah',
    icon: AlertTriangle,
    badgeBg: 'bg-[#FFF6D6]',
    badgeText: 'text-[#8A5A00]',
    badgeBorder: 'border-[#FFE49A]',
    barColor: 'bg-[#FF9A1F]',
    cardRing: 'hover:border-[#FF9A1F]/50 ring-1 ring-[#FF9A1F]/20',
  },
  habis: {
    label: 'Habis',
    icon: XCircle,
    badgeBg: 'bg-[#FDE8E4]',
    badgeText: 'text-[#D8431F]',
    badgeBorder: 'border-[#FAD3CB]',
    barColor: 'bg-[#D8431F]',
    cardRing: 'hover:border-[#D8431F]/50 ring-2 ring-[#D8431F]/30',
  },
}

import ConfirmUpdateHargaModal from './ConfirmUpdateHargaModal'

interface BahanCardProps {
  list: Bahan[]
  getStockCondition: (b: Bahan) => StockCondition
  onEdit: (b: Bahan) => void
  onDelete: (b: Bahan) => void
  onOpenAdd?: () => void
  onUpdateHarga?: (b: Bahan, hargaBaru: number) => Promise<void>
  checkingId?: string | null
}

export default function BahanCard({
  list,
  getStockCondition,
  onEdit,
  onDelete,
  onOpenAdd,
  onUpdateHarga,
  checkingId = null,
}: BahanCardProps) {
  const [checkingPriceId, setCheckingPriceId] = useState<string | null>(null)
  const [priceNotes, setPriceNotes] = useState<Record<string, string>>({})
  const [pendingConfirm, setPendingConfirm] = useState<{
    bahan: Bahan
    hargaBaru: number
    rentang?: string
    catatan?: string
  } | null>(null)
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 12

  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return list.slice(start, start + PAGE_SIZE)
  }, [list, currentPage])
  const toast = useToast()

  const handleCariHargaPasarBox = async (b: Bahan) => {
    setCheckingPriceId(b.id)
    try {
      const res = await fetch('/api/harga-pasar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: b.nama,
          satuan: b.satuan,
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal memperoleh estimasi harga pasar.')
      }

      const { harga, rentang, catatan } = json.data
      const note = rentang ? `${rentang}` : catatan || 'Harga pasaran wajar'
      setPriceNotes(prev => ({ ...prev, [b.id]: note }))

      // Buka modal konfirmasi terlebih dahulu sebelum mengupdate
      setPendingConfirm({
        bahan: b,
        hargaBaru: harga,
        rentang,
        catatan,
      })
    } catch (err: any) {
      toast.error('Gagal Cek Harga Pasar', err.message || 'Terjadi kesalahan sistem')
    } finally {
      setCheckingPriceId(null)
    }
  }

  const handleConfirmUpdateHarga = async () => {
    if (!pendingConfirm || !onUpdateHarga) return
    setIsUpdatingPrice(true)
    try {
      await onUpdateHarga(pendingConfirm.bahan, pendingConfirm.hargaBaru)
      toast.success(
        'Harga Bahan Diperbarui',
        `${pendingConfirm.bahan.nama}: Rp ${pendingConfirm.hargaBaru.toLocaleString('id-ID')} / ${pendingConfirm.bahan.satuan} berhasil disimpan ke database.`
      )
      setPendingConfirm(null)
    } catch (err: any) {
      toast.error('Gagal Menyimpan Harga', err.message || 'Terjadi kesalahan sistem')
    } finally {
      setIsUpdatingPrice(false)
    }
  }
  if (list.length === 0) {
    return (
      <div className="bg-white rounded-[28px] shadow-[0_2px_16px_rgba(140,100,30,0.06)] border border-[#EBE3D7]/70 py-16 px-6 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-[#FFF6D6] border border-[#FFE49A] flex items-center justify-center shadow-xs">
          <DapiHead size={52} mood="khawatir" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h4 className="text-base font-extrabold text-slate-900">Belum Ada Bahan Baku</h4>
          <p className="text-xs text-slate-500 font-medium">
            Tidak ada data bahan yang sesuai dengan filter pencarian Anda. Tambah bahan baru untuk mulai mengelola stok.
          </p>
        </div>
        {onOpenAdd && (
          <button
            type="button"
            onClick={onOpenAdd}
            className="px-5 py-2.5 rounded-full bg-[#D8431F] hover:bg-[#BF3818] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Bahan Pertama</span>
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {paginatedList.map(b => {
          const st = getStockCondition(b)
        const cfg = statusConfig[st]
        const Icon = cfg.icon
        const fotoUrl = b.foto || getDefaultFoto(b.nama)

        // Nilai total persediaan bahan ini di gudang
        const totalNilaiStok = b.stok * b.hargaPerSatuan

        // Hitung persentase kapasitas stok terhadap batas aman
        const maxStok = Math.max(b.stokMinimum * 2.5, b.stok, 1)
        const pct = Math.min(100, Math.round((b.stok / maxStok) * 100))

        return (
          <div
            key={b.id}
            className={clsx(
              'bg-white rounded-[26px] shadow-[0_2px_16px_rgba(140,100,30,0.06)] border border-[#EBE3D7]/80 overflow-hidden flex flex-col group hover:-translate-y-1 hover:shadow-[0_10px_26px_rgba(140,100,30,0.12)] transition-all duration-200',
              cfg.cardRing
            )}
          >
            {/* Foto Bahan */}
            <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-[#FFF9EC] to-[#F7F5F0] overflow-hidden flex items-center justify-center">
              {fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fotoUrl}
                  alt={b.nama}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-300">
                  <ImageOff className="w-9 h-9" />
                  <span className="text-[10px] font-semibold text-slate-400">Belum ada foto</span>
                </div>
              )}

              {/* Status Badge Overlay */}
              <div className="absolute top-2.5 right-2.5">
                <span
                  className={clsx(
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border shadow-xs backdrop-blur-xs',
                    cfg.badgeBg,
                    cfg.badgeText,
                    cfg.badgeBorder
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {cfg.label}
                </span>
              </div>

              {/* Kode / ID Badge Overlay */}
              <div className="absolute bottom-2 left-2.5">
                <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[10px] font-mono font-bold text-slate-600 shadow-xs border border-white">
                  {b.code || b.id.slice(0, 6).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Isi Konten Card */}
            <div className="p-4 flex flex-col gap-2 flex-1">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2">
                  {b.nama}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                  {b.supplier?.nama ? `Supplier: ${b.supplier.nama}` : 'Tanpa supplier'}
                </p>
              </div>

              {/* Harga & Nilai Gudang */}
              <div className="pt-1 border-t border-[#F7F2E9] space-y-1.5">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-medium">Harga Beli</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-[#D98B00]">
                      {formatRupiah(b.hargaPerSatuan)}
                      <span className="text-slate-400 font-normal text-[10px]"> /{b.satuan}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCariHargaPasarBox(b)}
                      disabled={checkingPriceId === b.id}
                      title="Cari harga pasaran untuk bahan ini"
                      aria-label="Cari harga pasaran"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFF6D6] hover:bg-[#FFEBB0] text-[#8A5A00] text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {checkingPriceId === b.id ? (
                        <>
                          <Loader2 className="w-2.5 h-2.5 animate-spin text-[#8A5A00]" />
                          <span>Mencari...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-2.5 h-2.5" />
                          <span>Cari Pasaran</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                {priceNotes[b.id] && (
                  <div className="text-[10px] text-slate-600 bg-[#F7F5F0] border border-[#EBE3D7] rounded-lg px-2 py-1 font-medium">
                    <span className="text-[#8A5A00] font-bold">Pasaran:</span> {priceNotes[b.id]}
                  </div>
                )}
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-[10px] text-slate-400">Nilai Total Stok</span>
                  <span className="font-bold text-slate-700 text-[11px]">
                    {formatRupiah(totalNilaiStok)}
                  </span>
                </div>
              </div>

              {/* Visual Stok & Progress Bar */}
              <div className="mt-auto pt-2 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-slate-500">Stok Tersedia</span>
                  <span className="font-extrabold text-slate-900 text-xs">
                    {b.stok} <span className="text-slate-500 font-medium text-[11px]">{b.satuan}</span>
                  </span>
                </div>

                <div className="h-2 w-full rounded-full bg-[#F5EFE6] overflow-hidden p-0.5">
                  <div
                    className={clsx('h-full rounded-full transition-all duration-300', cfg.barColor)}
                    style={{ width: `${Math.max(pct, b.stok > 0 ? 5 : 0)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                  <span>Min: {b.stokMinimum} {b.satuan}</span>
                  <span>{st === 'habis' ? 'Segera Restock' : st === 'rendah' ? 'Perlu Restock' : 'Stok Cukup'}</span>
                </div>
              </div>
            </div>

            {/* Footer Aksi */}
            <div className="border-t border-[#F2ECE1] bg-[#FFFBF4] grid grid-cols-2 divide-x divide-[#F2ECE1]">
              <button
                type="button"
                onClick={() => onEdit(b)}
                title="Edit data bahan"
                className="py-3 px-3 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#D8431F] hover:bg-white transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(b)}
                disabled={checkingId === b.id}
                title="Hapus bahan"
                className="py-3 px-3 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 hover:text-[#D8431F] hover:bg-[#FDE8E4]/50 transition-colors cursor-pointer disabled:opacity-60"
              >
                {checkingId === b.id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D8431F]" />
                    <span className="text-[#D8431F]">Memeriksa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )
      })}

        {/* Modal Konfirmasi Penerapan Harga Baru */}
        <ConfirmUpdateHargaModal
          isOpen={Boolean(pendingConfirm)}
          bahan={pendingConfirm?.bahan || null}
          hargaBaru={pendingConfirm?.hargaBaru || 0}
          rentang={pendingConfirm?.rentang}
          catatan={pendingConfirm?.catatan}
          onClose={() => setPendingConfirm(null)}
          onConfirm={handleConfirmUpdateHarga}
          isUpdating={isUpdatingPrice}
        />
      </div>

      <div className="rounded-[28px] bg-white border border-[#EBE6DC] p-2 sm:p-3 shadow-xs">
        <Pagination
          currentPage={currentPage}
          totalItems={list.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          itemLabel="bahan baku"
        />
      </div>
    </div>
  )
}
