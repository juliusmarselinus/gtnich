'use client'

import { Bahan } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import DapiHead from '@/components/ui/DapiHead'
import { Trash2, Loader2, X, AlertTriangle, ShieldAlert, BookOpen, Package } from 'lucide-react'

interface DeleteBahanModalProps {
  isOpen: boolean
  bahan: Bahan | null
  onClose: () => void
  onConfirm: () => Promise<void>
  isDeleting?: boolean
  usedInMenus?: string[]
}

export default function DeleteBahanModal({
  isOpen,
  bahan,
  onClose,
  onConfirm,
  isDeleting = false,
  usedInMenus = [],
}: DeleteBahanModalProps) {
  if (!isOpen || !bahan) return null

  const hasStock = Number(bahan.stok) > 0
  const isUsedInRecipe = usedInMenus.length > 0
  const canDelete = !hasStock && !isUsedInRecipe

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B1D00]/45 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in-0 duration-200">
      <div className="bg-white rounded-[32px] shadow-2xl p-6 sm:p-7 w-full max-w-md mx-auto space-y-5 text-center animate-in zoom-in-95 duration-200 border border-[#FFE49A]/40 relative my-auto">
        {/* Tombol Tutup X di Pojok Kanan */}
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FFF6D6] hover:bg-[#FFEBB0] text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Maskot Dapi Khawatir */}
        <div className="w-20 h-20 rounded-full bg-[#FDE8E4] border border-[#FAD3CB] mx-auto flex items-center justify-center shadow-inner">
          <DapiHead size={52} mood="khawatir" />
        </div>

        {/* Judul & Info */}
        <div className="space-y-1.5">
          <h3 className="text-xl font-black text-[#2B1D00]">Hapus Bahan Baku?</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
            {canDelete
              ? 'Apakah Anda yakin ingin menghapus bahan ini dari inventaris dapur secara permanen?'
              : 'Bahan ini tidak dapat dihapus sekarang karena masih memiliki persediaan aktif atau terhubung ke menu.'}
          </p>
        </div>

        {/* Kartu Highlight Bahan yang Dipilih */}
        <div className="p-3.5 rounded-2xl bg-[#FFFBF2] border border-[#FFE49A] flex items-center justify-between text-left">
          <div className="min-w-0 pr-3">
            <p className="font-black text-sm text-[#2B1D00] truncate">{bahan.nama}</p>
            <p className="text-[11px] text-slate-500 font-medium">
              Harga: {formatRupiah(bahan.hargaPerSatuan)} / {bahan.satuan}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Sisa Stok</span>
            <span className={`text-xs font-black ${hasStock ? 'text-[#D8431F]' : 'text-slate-600'}`}>
              {bahan.stok} {bahan.satuan}
            </span>
          </div>
        </div>

        {/* Peringatan Stok Masih Ada */}
        {hasStock && (
          <div className="p-3.5 rounded-2xl bg-[#FFF4F0] border border-[#FFCCBA] text-left flex items-start gap-3 text-xs text-[#9E2B11]">
            <Package className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#D8431F]" />
            <div className="space-y-0.5">
              <p className="font-bold">Masih Ada Sisa Stok ({bahan.stok} {bahan.satuan})</p>
              <p className="text-[11px] text-slate-600 leading-snug">
                Bahan yang masih memiliki stok fisik tidak boleh dihapus demi menjaga integritas data gudang. Harap sesuaikan stok menjadi 0 terlebih dahulu di menu Opname/Stok Log jika bahan rusak atau terbuang.
              </p>
            </div>
          </div>
        )}

        {/* Peringatan Masih Terdaftar di Resep Menu */}
        {isUsedInRecipe && (
          <div className="p-3.5 rounded-2xl bg-[#FFF9EC] border border-[#FFE2A4] text-left flex items-start gap-3 text-xs text-[#8A5A00]">
            <BookOpen className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#D98B00]" />
            <div className="space-y-1 w-full">
              <p className="font-bold">Masih Dipakai dalam Resep Menu</p>
              <p className="text-[11px] text-slate-600 leading-snug">
                Bahan ini tercatat dalam resep hidangan berikut:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {usedInMenus.map((menuName, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-white border border-[#E8D7C3] text-[10px] font-bold text-[#2B221C]"
                  >
                    🍽️ {menuName}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 pt-1">
                Lepaskan bahan ini dari resep menu masakan di atas sebelum menghapusnya.
              </p>
            </div>
          </div>
        )}

        {/* Tombol Aksi Batal / Hapus */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-[#F7F5F0] hover:bg-[#EFECE6] text-slate-700 text-xs font-black transition cursor-pointer disabled:opacity-50"
          >
            {canDelete ? 'Batal' : 'Tutup'}
          </button>
          {canDelete && (
            <button
              type="button"
              disabled={isDeleting}
              onClick={onConfirm}
              className="flex-1 py-3 rounded-2xl bg-[#D8431F] hover:bg-[#BF3818] active:scale-[0.98] text-white text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menghapus...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Ya, Hapus Bahan</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
