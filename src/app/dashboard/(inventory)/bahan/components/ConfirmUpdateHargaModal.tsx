'use client'

import { Bahan } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import DapiHead from '@/components/ui/DapiHead'
import { Check, X, Loader2, ArrowRight } from 'lucide-react'

interface ConfirmUpdateHargaModalProps {
  isOpen: boolean
  bahan: Bahan | null
  hargaBaru: number
  rentang?: string
  catatan?: string
  onClose: () => void
  onConfirm: () => Promise<void>
  isUpdating?: boolean
}

export default function ConfirmUpdateHargaModal({
  isOpen,
  bahan,
  hargaBaru,
  rentang,
  catatan,
  onClose,
  onConfirm,
  isUpdating = false,
}: ConfirmUpdateHargaModalProps) {
  if (!isOpen || !bahan) return null

  const selisih = hargaBaru - bahan.hargaPerSatuan
  const selisihPersen = bahan.hargaPerSatuan > 0 ? Math.round((selisih / bahan.hargaPerSatuan) * 100) : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B1D00]/45 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in-0 duration-200">
      <div className="bg-white rounded-[32px] shadow-2xl p-6 sm:p-7 w-full max-w-md mx-auto space-y-5 text-center animate-in zoom-in-95 duration-200 border border-[#FFE49A]/40 relative my-auto">
        {/* Tombol Tutup X */}
        <button
          type="button"
          onClick={onClose}
          disabled={isUpdating}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FFF6D6] hover:bg-[#FFEBB0] text-slate-600 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Maskot Dapi Senang */}
        <div className="w-20 h-20 rounded-full bg-[#E8F5E4] border border-[#C3E6BD] mx-auto flex items-center justify-center shadow-inner">
          <DapiHead size={52} mood="senang" />
        </div>

        {/* Judul & Penjelasan */}
        <div className="space-y-1.5">
          <h3 className="text-xl font-black text-[#2B1D00]">Perbarui Harga Pasaran?</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
            Estimasi harga wajar pasaran ditemukan untuk bahan baku ini. Terapkan harga baru sebagai harga beli/HPP?
          </p>
        </div>

        {/* Perbandingan Harga Lama vs Baru */}
        <div className="p-4 rounded-2xl bg-[#FFFBF2] border border-[#FFE49A] space-y-3 text-left">
          <div className="flex items-center justify-between pb-2 border-b border-[#F5E6BA]">
            <div>
              <p className="font-extrabold text-[#2B1D00] text-sm">{bahan.nama}</p>
              <p className="text-[11px] text-slate-400">Satuan: {bahan.satuan}</p>
            </div>
            {rentang && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF6D6] text-[#8A5A00] border border-[#FFE49A]">
                {rentang}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Harga Saat Ini</span>
              <span className="font-mono text-xs font-bold text-slate-600 line-through">
                {formatRupiah(bahan.hargaPerSatuan)}
              </span>
            </div>

            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-2xs">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>

            <div className="text-right">
              <span className="text-[10px] text-[#228B5B] block font-bold">Estimasi Baru</span>
              <span className="font-mono text-sm font-black text-[#228B5B]">
                {formatRupiah(hargaBaru)}
              </span>
            </div>
          </div>

          {selisih !== 0 && (
            <p className="text-[10px] text-slate-500 font-medium pt-1 text-center">
              Perubahan:{' '}
              <strong className={selisih > 0 ? 'text-[#D8431F]' : 'text-[#228B5B]'}>
                {selisih > 0 ? `+${formatRupiah(selisih)}` : formatRupiah(selisih)} ({selisih > 0 ? `+${selisihPersen}%` : `${selisihPersen}%`})
              </strong>
            </p>
          )}

          {catatan && (
            <div className="mt-1 text-[10px] text-slate-500 bg-white/70 rounded-lg p-2 border border-[#EBE3D7]">
              {catatan}
            </div>
          )}
        </div>

        {/* Tombol Aksi Batal / Konfirmasi */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="w-full py-3 px-4 rounded-full border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isUpdating}
            className="w-full py-3 px-4 rounded-full bg-[#228B5B] hover:bg-[#1B6F48] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Ya, Terapkan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
