'use client'

import { useRef } from 'react'
import Topbar from '@/components/Topbar'
import DapiMascot from '@/components/ui/DapiMascot'
import { useOCRNota } from './hooks/useOCRNota'
import ScanResultView from './components/ScanResultView'
import {
  Image as ImageIcon,
  Loader2,
  ShieldAlert,
  ScanLine,
  UploadCloud,
  FileCheck2,
  Layers,
} from 'lucide-react'
import { useToast } from '@/context/ToastContext'

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
  const toast = useToast()

  const handleSaveToPOWithToast = async () => {
    try {
      await handleSaveToPO()
      toast.success(
        'Nota Berhasil Disimpan ke PO',
        updateStokDirectly
          ? 'Purchase Order dibuat dan stok bahan telah otomatis masuk ke dapur.'
          : 'Purchase Order berhasil dibuat dari pemindaian nota.'
      )
    } catch (err: any) {
      toast.error('Gagal Menyimpan Nota ke PO', err.message || 'Terjadi kesalahan sistem')
      throw err
    }
  }

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

  const heroStatus = {
    mood: (error ? 'khawatir' : 'senang') as 'khawatir' | 'senang',
    title:
      state === 'done'
        ? `${items.length} Bahan Terbaca dari Nota`
        : state === 'uploading'
        ? 'Sedang Membaca Dokumen Nota...'
        : 'Pemindai Struk & Nota Pembelian',
    subtitle:
      state === 'done'
        ? 'Periksa kembali hasil pembacaan sebelum disimpan ke Purchase Order atau dimasukkan langsung ke stok.'
        : state === 'uploading'
        ? 'Menganalisis baris teks, angka kuantitas, dan harga belanja secara otomatis.'
        : 'Unggah struk minimarket, pasar tradisional, atau faktur distributor untuk otomatisasi pencatatan PO dapur.',
  }

  return (
    <div className="flex-1 pb-24 lg:pb-16">
      <Topbar
        title="Foto Struk / Nota Belanja"
        subtitle="Foto nota belanjaan dari pasar atau toko grosir untuk dicatat otomatis ke stok bahan"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Error Alert jika ada */}
        {error && (
          <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 flex items-start gap-3 text-xs animate-in fade-in">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
            <div>
              <p className="font-bold">Gagal Memproses Nota</p>
              <p className="mt-0.5 text-rose-600">{error}</p>
            </div>
          </div>
        )}

        {/* Hero Section dengan Maskot Dapi */}
        <section data-tour="ocr-hero-info" className="relative overflow-hidden rounded-[28px] bg-[#FFB800] px-6 py-6 sm:px-8 sm:py-7 min-h-[180px] shadow-xs">
          <div className="absolute right-48 top-5 w-16 h-16 rounded-full bg-[#FF7A59] hidden md:block opacity-80" />
          <div className="absolute right-36 top-16 w-28 h-8 rounded-full bg-white/90 hidden md:block" />

          {/* Maskot Dapi */}
          <div className="absolute right-4 sm:right-8 bottom-0 pointer-events-none">
            <DapiMascot
              width={150}
              mood={heroStatus.mood}
              className="translate-y-6 drop-shadow-xs"
            />
          </div>

          <div className="relative space-y-3 pr-28 sm:pr-48">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#2B1D00]/10 flex items-center justify-center text-[#2B1D00]">
                <ScanLine className="w-3.5 h-3.5" />
              </span>
              <p className="text-xs font-bold uppercase tracking-wider text-[#5C3D00]">
                Ekstraksi Pembelian Dapur
              </p>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2B1D00] tracking-tight leading-tight">
              {heroStatus.title}
            </h2>

            <p className="text-xs sm:text-sm text-[#4D3300] font-medium max-w-xl">
              {heroStatus.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-[#2B1D00] shadow-xs">
                Format: JPG, PNG, WebP
              </span>

              <span className="inline-flex items-center rounded-full bg-white/80 backdrop-blur-xs px-3.5 py-1.5 text-xs font-bold text-[#2B1D00]">
                Otomatis Cocokkan Satuan & DB
              </span>
            </div>
          </div>
        </section>

        {/* State 1: Upload Dropzone (Ketika belum ada file diproses) */}
        {state === 'idle' && (
          <div
            data-tour="ocr-dropzone"
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-[32px] bg-white border-2 border-dashed border-[#EBE6DC] hover:border-[#FF8F2B] hover:bg-[#FFFDF9] transition-all p-10 sm:p-14 text-center cursor-pointer group shadow-xs"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileChange}
              accept="image/*,.pdf"
              className="hidden"
            />
            <div className="w-16 h-16 rounded-2xl bg-[#FFF6D6] text-[#8A5A00] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-xs">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-[#2B261F]">
              Pilih atau Tarik Foto Nota Pembelian ke Sini
            </h3>
            <p className="text-xs text-[#8C8275] mt-1 max-w-sm mx-auto">
              Mendukung foto nota fisik, struk belanja pasar, atau tangkapan layar e-receipt.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FF8F2B] to-[#FF6B00] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all">
              <ImageIcon className="w-4 h-4" />
              <span>Unggah Foto Nota</span>
            </div>
          </div>
        )}

        {/* State 2: Progress OCR Processing */}
        {state === 'uploading' && (
          <div className="rounded-[32px] bg-white border border-[#EBE6DC] p-10 sm:p-14 text-center space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF6D6] text-[#FF6B00] flex items-center justify-center mx-auto shadow-xs">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#2B261F]">
                Sedang Memindai & Mengekstrak Nota...
              </h3>
              <p className="text-xs text-[#8C8275] mt-1">
                {ocrStatusText || 'Menganalisis teks nota...'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#F5F2EB] rounded-full h-2.5 overflow-hidden border border-[#EBE6DC]">
              <div
                className="bg-gradient-to-r from-[#FF8F2B] to-[#FF6B00] h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.max(5, ocrProgress)}%` }}
              />
            </div>
            <p className="text-[11px] font-mono text-[#8C8275] font-bold">
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
            onSaveToPO={handleSaveToPOWithToast}
            isSaving={isSaving}
            savedPO={savedPO}
          />
        )}
      </main>
    </div>
  )
}
