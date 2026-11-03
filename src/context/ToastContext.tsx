'use client'

import React, { createContext, useContext, useState, useCallback, useId } from 'react'
import DapiHead from '@/components/ui/DapiHead'
import { X, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  title: string
  message?: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toast: (options: { title: string; message?: string; type?: ToastType; duration?: number }) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback(
    ({
      title,
      message,
      type = 'info',
      duration = 4000,
    }: {
      title: string
      message?: string
      type?: ToastType
      duration?: number
    }) => {
      const id = 'toast-' + Math.random().toString(36).substring(2, 9)
      const newToast: ToastItem = { id, title, message, type, duration }
      setToasts(prev => [...prev.slice(-3), newToast]) // maksimal simpan 4 toast bertumpuk

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast]
  )

  const success = useCallback((title: string, message?: string) => addToast({ title, message, type: 'success' }), [addToast])
  const error = useCallback((title: string, message?: string) => addToast({ title, message, type: 'error' }), [addToast])
  const warning = useCallback((title: string, message?: string) => addToast({ title, message, type: 'warning' }), [addToast])
  const info = useCallback((title: string, message?: string) => addToast({ title, message, type: 'info' }), [addToast])

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, warning, info }}>
      {children}
      {/* Toast Container di Pojok Kanan Atas */}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2 sm:p-0">
        {toasts.map(t => {
          const isSuccess = t.type === 'success'
          const isError = t.type === 'error'
          const isWarning = t.type === 'warning'

          const dapiMood = isError || isWarning ? 'khawatir' : 'senang'

          // Filosofi warna status operasional dapur:
          // Hijau (#228B5B / #1B6E47): Sukses / Berhasil / Stok Aman (mood senang)
          // Merah (#D8431F / #B3361B): Gagal / Error / Stok Habis (mood khawatir)
          // Kuning/Amber (#D98B00 / #8A5A00): Peringatan / Warning / Stok Rendah
          // Biru/Netral: Info
          const containerStyle = isSuccess
            ? 'bg-[#F2FAF4] border-[#B8E6C8] text-[#1B6E47] shadow-[0_10px_30px_-10px_rgba(34,139,91,0.2)]'
            : isError
              ? 'bg-[#FEF3F1] border-[#FAC7BD] text-[#B3361B] shadow-[0_10px_30px_-10px_rgba(216,67,31,0.25)]'
              : isWarning
                ? 'bg-[#FFF9EC] border-[#FFE2A4] text-[#8A5A00] shadow-[0_10px_30px_-10px_rgba(217,139,0,0.18)]'
                : 'bg-[#FFFBF2] border-[#FFE49A] text-[#5C3D00] shadow-[0_10px_30px_-10px_rgba(140,100,30,0.12)]'

          const badgeBg = isSuccess
            ? 'bg-[#E3F6EB] text-[#228B5B] border-[#A3E0BA]'
            : isError
              ? 'bg-[#FDE8E4] text-[#D8431F] border-[#F8BDB3]'
              : isWarning
                ? 'bg-[#FFF4D4] text-[#D98B00] border-[#FFE08A]'
                : 'bg-[#FFF6D6] text-[#8A5A00] border-[#FFE49A]'

          const titleColor = isSuccess
            ? 'text-[#1B6E47]'
            : isError
              ? 'text-[#B3361B]'
              : isWarning
                ? 'text-[#8A5A00]'
                : 'text-[#5C3D00]'

          const messageColor = isSuccess
            ? 'text-[#2D7A4D]'
            : isError
              ? 'text-[#96301A]'
              : isWarning
                ? 'text-[#6E4800]'
                : 'text-[#4A3200]'

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-[24px] border-2 shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-3 fade-in-0 ${containerStyle}`}
            >
              {/* Maskot Avatar Dapi dengan kontainer warna filosofi */}
              <div
                className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center border-2 shadow-xs ${badgeBg}`}
              >
                <DapiHead size={34} mood={dapiMood} />
              </div>

              {/* Teks Toast */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-1.5">
                  <h4 className={`text-xs font-black tracking-tight leading-snug ${titleColor}`}>
                    {t.title}
                  </h4>
                </div>
                {t.message && (
                  <p className={`text-[11px] font-medium leading-snug mt-0.5 line-clamp-3 ${messageColor}`}>
                    {t.message}
                  </p>
                )}
              </div>

              {/* Tombol Tutup */}
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className={`w-6 h-6 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-black/5 transition-opacity cursor-pointer -mr-1 -mt-1 ${titleColor}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
