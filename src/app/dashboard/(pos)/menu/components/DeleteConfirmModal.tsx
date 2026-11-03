'use client'

import { MenuItem } from '../types'
import DapiHead from '@/components/ui/DapiHead'
import { Trash2, Loader2, X } from 'lucide-react'

interface DeleteConfirmModalProps {
  isOpen: boolean
  menu: MenuItem | null
  onClose: () => void
  onConfirm: () => Promise<void>
  isDeleting?: boolean
}

export default function DeleteConfirmModal({
  isOpen,
  menu,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  if (!isOpen || !menu) return null

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
          <h3 className="text-xl font-black text-[#2B1D00]">Hapus Menu Masakan?</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
            Apakah Anda yakin ingin menghapus hidangan ini beserta seluruh komposisi resep dan takaran HPP-nya?
          </p>
        </div>

        {/* Kartu Highlight Menu yang Akan Dihapus */}
        <div className="p-3.5 rounded-2xl bg-[#FFFBF2] border border-[#FFE49A] flex items-center justify-center gap-3">
          <span className="text-2xl">{menu.emoji || '🍽️'}</span>
          <div className="text-left min-w-0">
            <p className="font-black text-sm text-[#2B1D00] truncate">{menu.nama}</p>
            <p className="text-[11px] text-slate-400 font-medium">
              Kategori: {menu.kategori} {menu.resep?.length ? `• ${menu.resep.length} bahan resep` : ''}
            </p>
          </div>
        </div>

        {/* Tombol Aksi Batal / Hapus */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-[#F7F5F0] hover:bg-[#EFECE6] text-slate-700 text-xs font-black transition cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl bg-[#D8431F] hover:bg-[#c03917] text-white text-xs font-black shadow-sm transition-all hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Menu</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
