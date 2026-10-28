'use client'

import { useRef } from 'react'
import Topbar from '@/components/Topbar'
import { useOCRNota } from './hooks/useOCRNota'
import OCRConfigBar from './components/OCRConfigBar'
import ScanResultView from './components/ScanResultView'
import { Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react'

export default function OCRNotaPage() {
  const {
    apiKey,
    saveApiKey,
    routerUrl,
    routerKey,
    routerModel,
    saveRouterConfig,
    suppliers,
    bahanList,
    state,
    fileName,
    imagePreview,
    items,
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

  const inputRef = useRef<HTMLInputElement>(null)

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleScanFile(file)
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleScanFile(file)
  }

  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Pemindai OCR Nota Pembelian"
        subtitle="Scan foto nota fisik supplier menggunakan AI Multimodal dan konversi otomatis menjadi Purchase Order & Stok Dapur"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-7 max-w-7xl mx-auto">
        {/* Bar Konfigurasi API Key & Router */}
        <OCRConfigBar
          apiKey={apiKey}
          onSaveApiKey={saveApiKey}
          routerUrl={routerUrl}
          routerKey={routerKey}
          routerModel={routerModel}
          onSaveRouterConfig={saveRouterConfig}
        />

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold">Terjadi Kesalahan</p>
              <p className="text-[11px] text-rose-600 mt-0.5">{error}</p>
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* 1. Upload Area State: Idle */}
        {state === 'idle' && (
          <div
            onDrop={onDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="clay-card p-12 sm:p-16 text-center cursor-pointer hover:border-emerald-200 transition-all group"
          >
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5 clay-pill group-hover:scale-105 transition-transform">
              <ImageIcon className="w-10 h-10" />
            </div>
            <p className="text-base font-extrabold text-slate-800 mb-1">
              Ambil Foto atau Upload Nota Belanja
            </p>
            <p className="text-xs text-slate-400 font-medium">
              Seret foto kuitansi/struk belanja ke sini atau klik untuk membuka kamera / galeri
            </p>
            <p className="text-[10px] text-emerald-600 font-mono font-bold mt-2">
              Mendukung format JPG, PNG, WEBP, PDF
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={onFileChange}
            />
          </div>
        )}

        {/* 2. Processing State: Uploading / AI Scanning */}
        {state === 'uploading' && (
          <div className="clay-card p-16 text-center space-y-5">
            <div className="w-20 h-20 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto clay-pill">
              <Loader2 className="w-10 h-10 animate-spin" />
            </div>
            <div>
              <p className="text-base font-extrabold text-slate-800">
                {apiKey ? 'AI Gemini Multimodal Sedang Membaca Nota…' : 'Menganalisis Format Nota…'}
              </p>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Mengekstrak baris item, kuantitas, satuan, dan harga dari{' '}
                <span className="font-bold text-slate-700">{fileName}</span>
              </p>
            </div>
            <div className="max-w-xs mx-auto h-2 clay-inset rounded-full overflow-hidden p-0.5">
              <div className="h-full bg-emerald-500 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}

        {/* 3. Result State: Done */}
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
