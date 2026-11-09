'use client'

import DapiHead from '@/components/ui/DapiHead'
import { Loader2, X } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  loading?: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  isDestructive = true,
  loading = false,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B1D00]/45 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in-0 duration-200">
      <div className="bg-white rounded-[32px] shadow-2xl p-6 sm:p-7 w-full max-w-md mx-auto space-y-5 text-center animate-in zoom-in-95 duration-200 border border-[#FFE49A]/40 relative my-auto">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FFF6D6] hover:bg-[#FFEBB0] text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className={`w-20 h-20 rounded-full ${isDestructive ? 'bg-[#FDE8E4] border-[#FAD3CB]' : 'bg-[#FFF6D6] border-[#FFE49A]'} border mx-auto flex items-center justify-center shadow-inner`}>
          <DapiHead size={52} mood={isDestructive ? 'khawatir' : 'senang'} />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xl font-black text-[#2B1D00]">{title}</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
            {message}
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-3 px-4 rounded-full ${
              isDestructive
                ? 'bg-[#D8431F] hover:bg-[#BF3818] text-white shadow-[0_4px_14px_rgba(216,67,31,0.3)]'
                : 'bg-[#FFB800] hover:bg-[#F0AB00] text-[#2B1D00] shadow-[0_4px_14px_rgba(255,184,0,0.3)]'
            } text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
