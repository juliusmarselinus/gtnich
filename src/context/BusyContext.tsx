'use client'

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import DapiHead from '@/components/ui/DapiHead'
import { Loader2 } from 'lucide-react'

interface BusyContextValue {
  isBusy: boolean
  busyMessage: string | null
  setBusy: (busy: boolean, message?: string | null) => void
  withLock: <T>(fn: () => Promise<T>, message?: string) => Promise<T>
}

const BusyContext = createContext<BusyContextValue>({
  isBusy: false,
  busyMessage: null,
  setBusy: () => {},
  withLock: async fn => fn(),
})

export function BusyProvider({ children }: { children: React.ReactNode }) {
  const [isBusy, setIsBusy] = useState(false)
  const [busyMessage, setBusyMessage] = useState<string | null>(null)

  const setBusyState = useCallback((busy: boolean, message?: string | null) => {
    setIsBusy(busy)
    setBusyMessage(message || null)
  }, [])

  const withLock = useCallback(
    async <T,>(fn: () => Promise<T>, message?: string): Promise<T> => {
      if (isBusy) {
        throw new Error('Sedang memproses tindakan lain. Harap tunggu sebentar.')
      }
      setIsBusy(true)
      if (message) setBusyMessage(message)
      try {
        return await fn()
      } finally {
        setIsBusy(false)
        setBusyMessage(null)
      }
    },
    [isBusy]
  )

  const contextValue = useMemo(
    () => ({
      isBusy,
      busyMessage,
      setBusy: setBusyState,
      withLock,
    }),
    [isBusy, busyMessage, setBusyState, withLock]
  )

  return (
    <BusyContext.Provider value={contextValue}>
      {children}

      {/* Global Interactive Blocker Overlay saat proses async kritis berlangsung */}
      {isBusy && (
        <div
          aria-live="assertive"
          aria-busy="true"
          className="fixed inset-0 z-[9999] bg-[#2B1D00]/35 backdrop-blur-[2px] flex items-center justify-center p-4 transition-all duration-200 cursor-wait animate-in fade-in-0"
        >
          <div className="bg-white rounded-[28px] border-2 border-[#FFE49A] shadow-[0_20px_50px_rgba(43,29,0,0.3)] p-5 sm:p-6 max-w-xs w-full text-center flex flex-col items-center space-y-3 animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-full bg-[#FFF6D6] border border-[#FFEBB0] flex items-center justify-center shadow-inner relative">
              <DapiHead size={42} mood="senang" />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#D8431F] text-white flex items-center justify-center shadow-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </span>
            </div>
            <div>
              <p className="text-sm font-black text-[#2B1D00]">Sedang Diproses...</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5 leading-snug">
                {busyMessage || 'Dapi lagi memproses data Anda. Mohon tunggu sebentar ya.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </BusyContext.Provider>
  )
}

export function useBusy() {
  return useContext(BusyContext)
}
