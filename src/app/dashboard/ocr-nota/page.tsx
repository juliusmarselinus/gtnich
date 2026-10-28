'use client'

import { useRef } from 'react'
import Topbar from '@/components/Topbar'
import { useOCRNota } from './hooks/useOCRNota'
import OCRConfigBar from './components/OCRConfigBar'
import ScanResultView from './components/ScanResultView'
import { Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react'

export default function OCRNotaPage() {
  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Pemindai OCR Nota Pembelian"
        subtitle="Fitur scan otomatis foto nota fisik supplier"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-7 max-w-4xl mx-auto">
        <div className="clay-card p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto clay-pill">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800">
              Fitur OCR Nota Sedang Dinonaktifkan Sementara
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Modul pemindai OCR sedang dalam proses pemeliharaan & penyesuaian integrasi. Anda dapat tetap membuat pesanan pembelian secara langsung melalui menu Purchase Order.
            </p>
          </div>
          <div className="pt-2">
            <a
              href="/dashboard/purchase-order"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl clay-btn-primary text-xs font-bold"
            >
              Buka Purchase Order Manual →
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
