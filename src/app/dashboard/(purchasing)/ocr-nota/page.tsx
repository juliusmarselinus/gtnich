'use client'

import { useRef } from 'react'
import Topbar from '@/components/Topbar'
import { useOCRNota } from './hooks/useOCRNota'
import ScanResultView from './components/ScanResultView'
import { Image as ImageIcon, Loader2, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react'

export default function OCRNotaPage() {
  const {
    state,
    ocrProgress,
    ocrStatusText,
    fileName,
    imagePreview,
    items,
    suppliers,
    bahanList,
    supplierName,
    setSupplierName,
    supplierId,
    setSupplierId,
    updateStokDirectly,
    setUpdateStokDirectly,
    isSaving,
    savedPO,
    error,
    handleScanFile,
    handleUpdateItem,
    handleRemoveItem,
    handleAddItem,
    handleReset,
    handleSaveToPO,
  } = useOCRNota()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleScanFile(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleScanFile(file)
    }
  }

  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Pemindai OCR Nota Pembelian"
        subtitle="Ekstraksi otomatis nota fisik supplier via 9Router (Gemini 3.1 Flash Lite)"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-7 max-w-5xl mx-auto">
        {/* Banner 9Router Vision AI */}
        <div className="clay-card p-4 sm:p-5 border-l-4 border-l-[#FF8F2B] bg-[#FFF6EC]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[#FFF6EC] text-[#FF8F2B] border border-[#FFE2C2] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                AI Vision OCR (9Router opencode-code)
              </h4>
              <p className="text-[11px] text-slate-500">
                Didukung oleh multimodal AI <strong>gemini-3.1-flash-lite</strong> untuk membaca berbagai format nota fisik & digital (minimarket, pasar, grosir) dengan akurasi tinggi.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 font-mono self-start sm:self-auto">
            AI Vision Active
          </span>
        </div>

        {/* Error Alert jika ada */}
        {error && (
          <div className="clay-card p-4 border border-rose-200 bg-rose-50 text-rose-700 flex items-start gap-3 text-xs animate-in fade-in">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
            <div>
              <p className="font-bold">Gagal Memproses Nota</p>
              <p className="mt-0.5 text-rose-600">{error}</p>
            </div>
          </div>
        )}

        {/* State 1: Upload Dropzone (Ketika belum ada file diproses) */}
        {state === 'idle' && (
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="clay-card border-2 border-dashed border-slate-300 hover:border-[#FF8F2B] hover:bg-[#FFF6EC]/20 transition-all p-10 sm:p-14 text-center cursor-pointer group rounded-3xl"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileChange}
              accept="image/*,.pdf"
              className="hidden"
            />
            <div className="w-16 h-16 rounded-2xl bg-[#FFF6EC] text-[#FF8F2B] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform clay-pill">
              <ImageIcon className="w-8 h-8" />
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-800">
              Pilih atau Tarik Foto Nota Pembelian ke Sini
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Mendukung file JPG, PNG, atau WebP. Pastikan foto memiliki pencahayaan cukup dan teks terbaca jelas.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl clay-btn-primary text-xs font-bold shadow-sm">
              Unggah Foto Nota
            </div>
          </div>
        )}

        {/* State 2: Progress OCR Processing */}
        {state === 'uploading' && (
          <div className="clay-card p-10 sm:p-14 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF6EC] text-[#FF8F2B] flex items-center justify-center mx-auto clay-pill animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-800">
                Sedang Memindai & Mengekstrak Nota...
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {ocrStatusText || 'Menganalisis teks nota...'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-[#FF8F2B] h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.max(5, ocrProgress)}%` }}
              />
            </div>
            <p className="text-[11px] font-mono text-slate-400 font-bold">
              {ocrProgress}% selesai
            </p>
          </div>
        )}

        {/* State 3: Hasil Scan & Konfirmasi PO */}
        {state === 'done' && (
          <ScanResultView
            fileName={fileName}
            imagePreview={imagePreview}
            items={items}
            suppliers={suppliers}
            bahanList={bahanList}
            supplierName={supplierName}
            onSelectSupplierName={setSupplierName}
            supplierId={supplierId}
            onSelectSupplierId={setSupplierId}
            updateStokDirectly={updateStokDirectly}
            onToggleUpdateStok={setUpdateStokDirectly}
            onUpdateItem={handleUpdateItem}
            onRemoveItem={handleRemoveItem}
            onAddItem={handleAddItem}
            onReset={handleReset}
            onSaveToPO={handleSaveToPO}
            isSaving={isSaving}
            savedPO={savedPO}
          />
        )}
      </main>
    </div>
  )
}
