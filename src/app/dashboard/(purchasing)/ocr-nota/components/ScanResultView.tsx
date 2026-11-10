'use client'

import { ParsedItem, SupplierOption, BahanOption } from '../types'
import { formatRupiah } from '@/lib/mock-data'
import CustomSelect from '@/components/ui/CustomSelect'
import {
  FileText,
  Trash2,
  Plus,
  Truck,
  CheckCircle2,
  Layers,
  Loader2,
  ArrowRight,
  ImageIcon,
  RotateCw,
} from 'lucide-react'
import Link from 'next/link'

interface ScanResultViewProps {
  fileName: string
  imagePreview: string | null
  items: ParsedItem[]
  suppliers: SupplierOption[]
  bahanList: BahanOption[]
  supplierName: string
  onSelectSupplierName: (name: string) => void
  supplierId: string
  onSelectSupplierId: (id: string) => void
  updateStokDirectly: boolean
  onToggleUpdateStok: (val: boolean) => void
  onUpdateItem: (index: number, field: keyof ParsedItem, value: any) => void
  onRemoveItem: (index: number) => void
  onAddItem: () => void
  onReset: () => void
  onRescan?: () => void
  onSaveToPO: () => Promise<void>
  isSaving: boolean
  savedPO: { poId: string; noPO: string } | null
}

const COMMON_UNITS = ['kg', 'gram', 'liter', 'ml', 'pcs', 'butir', 'pack', 'botol', 'kaleng', 'ikat', 'sachet', 'dus']

export default function ScanResultView({
  fileName,
  imagePreview,
  items,
  suppliers,
  bahanList,
  supplierName,
  onSelectSupplierName,
  supplierId,
  onSelectSupplierId,
  updateStokDirectly,
  onToggleUpdateStok,
  onUpdateItem,
  onRemoveItem,
  onAddItem,
  onReset,
  onRescan,
  onSaveToPO,
  isSaving,
  savedPO,
}: ScanResultViewProps) {
  const totalAkumulasi = items.reduce((sum, i) => sum + i.qty * i.harga, 0)

  return (
    <div className="space-y-6">
      {/* Header Info Nota */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#EBE6DC] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF6D6] text-[#8A5A00] flex items-center justify-center font-bold flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-[#2B261F]">{fileName}</p>
            <p className="text-xs text-[#2D7A1F] font-bold">
              {items.length} rincian bahan berhasil dikenali
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {onRescan && (
            <button
              type="button"
              onClick={onRescan}
              title="Scan ulang gambar ini jika hasil sebelumnya kurang akurat"
              className="px-3.5 py-1.5 rounded-full bg-[#FFF6D6] hover:bg-[#FFEBB0] text-[#7A5A10] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#D98B00]" />
              <span>Scan Ulang Nota Ini</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReset}
            className="text-xs text-[#8C8275] hover:text-[#D8431F] font-bold transition-colors cursor-pointer px-2 py-1.5"
          >
            ✕ Ganti File
          </button>
        </div>
      </div>

      {/* Grid: Preview & Konfigurasi Supplier */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Preview Thumbnail */}
        {imagePreview && (
          <div className="rounded-[28px] bg-white border border-[#EBE6DC] shadow-xs p-4 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#7A7062]">
              Foto Nota Asli
            </p>
            <div className="relative rounded-2xl overflow-hidden border border-[#EBE6DC] bg-[#FCFAF6] max-h-56 flex items-center justify-center">
              <img
                src={imagePreview}
                alt="Nota Scan"
                className="w-full h-full object-contain max-h-52 rounded-xl"
              />
            </div>
          </div>
        )}

        {/* Form Meta PO Supplier */}
        <div className={`rounded-[28px] bg-white border border-[#EBE6DC] shadow-xs p-5 space-y-4 ${imagePreview ? 'md:col-span-2' : 'md:col-span-3'}`}>
          <div className="flex items-center gap-2 pb-2 border-b border-[#F0EBE1]">
            <Truck className="w-4 h-4 text-[#FF8F2B]" />
            <h4 className="text-xs font-extrabold text-[#2B261F] uppercase tracking-wider">
              Tujuan Supplier & Mode Pencatatan
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A7062] mb-1.5">
                Pilih Kontak Supplier Toko
              </label>
              <CustomSelect
                value={
                  suppliers.find(s => s.id === supplierId)?.nama ||
                  supplierName ||
                  'Pilih Supplier...'
                }
                onChange={selectedNama => {
                  const match = suppliers.find(s => s.nama === selectedNama)
                  if (match) {
                    onSelectSupplierId(match.id)
                    onSelectSupplierName(match.nama)
                  } else {
                    onSelectSupplierName(selectedNama)
                  }
                }}
                options={[...suppliers.map(s => s.nama), 'Supplier Non-Terdaftar']}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A7062] mb-1.5">
                Nama Toko / Sumber di Nota
              </label>
              <input
                type="text"
                value={supplierName}
                onChange={e => onSelectSupplierName(e.target.value)}
                placeholder="Contoh: Toko Bahan Kue Maju"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FFF9EC] border border-[#FFE49A]/60 text-xs text-[#2B261F] font-bold focus:outline-none focus:ring-2 focus:ring-[#FFB800] transition-all"
              />
            </div>
          </div>

          {/* Opsi Update Stok Langsung */}
          <div className="p-4 rounded-2xl bg-[#FFF9EC] border border-[#FFE49A]/80 flex items-start gap-3 shadow-xs">
            <input
              type="checkbox"
              id="updateStok"
              checked={updateStokDirectly}
              onChange={e => onToggleUpdateStok(e.target.checked)}
              className="mt-0.5 rounded text-[#FF6B00] focus:ring-[#FFB800] w-4 h-4 cursor-pointer"
            />
            <label htmlFor="updateStok" className="text-xs text-[#2B261F] cursor-pointer">
              <strong className="block font-bold text-[#2B1D00]">
                Langsung Tambahkan ke Stok Gudang & Catat Stok Log (Status: Diterima)
              </strong>
              <span className="text-[11px] text-[#5C3D00] mt-0.5 block leading-relaxed">
                Jika dicentang, kuantitas bahan akan langsung masuk ke inventori dapur dan mutasi dicatat otomatis. Bila tidak dicentang, PO akan disimpan sebagai draf untuk dicek manual nanti.
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Tabel Rincian Item Nota */}
      <div className="rounded-[32px] bg-white border border-[#EBE6DC] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#F0EBE1] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#FF8F2B]" />
            <div>
              <h4 className="text-xs font-extrabold text-[#2B261F] uppercase tracking-wider">
                Rincian Item Bahan Hasil Scan
              </h4>
              <p className="text-[11px] text-[#8C8275]">
                Sesuaikan nama, jumlah, satuan, dan harga bila ada hasil bacaan nota yang kurang pas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onAddItem}
            className="px-4 py-2 rounded-full text-xs font-bold text-[#2B1D00] bg-[#FFF6D6] border border-[#FFE49A] hover:bg-[#FFEFC7] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#8A5A00]" />
            <span>Tambah Baris Bahan</span>
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-xs min-w-[960px]">
            <thead>
              <tr className="border-b border-[#F0EBE1] bg-[#FCFAF6] text-[#8C8275] text-[11px] font-bold uppercase tracking-wider">
                <th className="text-left px-5 py-3.5 w-[28%]">Nama Bahan Baku</th>
                <th className="text-left px-4 py-3.5 w-[24%]">Cocokkan Bahan Dapur</th>
                <th className="text-right px-4 py-3.5 w-[14%]">Kuantitas</th>
                <th className="text-left px-4 py-3.5 w-[14%]">Satuan</th>
                <th className="text-right px-4 py-3.5 w-[18%]">Harga Satuan (Rp)</th>
                <th className="text-right px-5 py-3.5 w-[16%]">Subtotal</th>
                <th className="px-3 py-3.5 text-center w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F2EB]">
              {items.map((item, i) => {
                const subtotal = item.qty * item.harga
                const matchedBahan = bahanList.find(b => b.id === item.matchedBahanId)

                return (
                  <tr key={i} className="hover:bg-[#FFFDF9] transition-colors">
                    {/* Nama Bahan */}
                    <td className="px-5 py-3">
                      <input
                        type="text"
                        value={item.nama}
                        onChange={e => onUpdateItem(i, 'nama', e.target.value)}
                        placeholder="Nama bahan"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FFF9EC] border border-[#FFE49A]/60 text-xs text-[#2B261F] font-bold focus:outline-none focus:ring-2 focus:ring-[#FFB800]"
                      />
                    </td>

                    {/* Cocokkan Bahan DB */}
                    <td className="px-4 py-3">
                      <CustomSelect
                        value={matchedBahan?.nama || '(Buat Baru / Belum Ada)'}
                        onChange={val => {
                          const match = bahanList.find(b => b.nama === val)
                          onUpdateItem(i, 'matchedBahanId', match?.id || undefined)
                          if (match) {
                            onUpdateItem(i, 'satuan', match.satuan)
                          }
                        }}
                        options={['(Buat Baru / Belum Ada)', ...bahanList.map(b => b.nama)]}
                      />
                    </td>

                    {/* Kuantitas */}
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0.001"
                        step="any"
                        value={item.qty === 0 ? '' : item.qty}
                        onChange={e => onUpdateItem(i, 'qty', Number(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full text-right px-3 py-2 rounded-xl bg-[#FFF9EC] border border-[#FFE49A]/60 text-sm font-mono font-black text-[#2B261F] focus:outline-none focus:ring-2 focus:ring-[#FFB800]"
                      />
                    </td>

                    {/* Satuan */}
                    <td className="px-4 py-3">
                      <CustomSelect
                        value={item.satuan}
                        onChange={val => onUpdateItem(i, 'satuan', val)}
                        options={
                          COMMON_UNITS.includes(item.satuan)
                            ? COMMON_UNITS
                            : [item.satuan, ...COMMON_UNITS]
                        }
                      />
                    </td>

                    {/* Harga Satuan */}
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        value={item.harga === 0 ? '' : item.harga}
                        onChange={e => onUpdateItem(i, 'harga', Number(e.target.value) || 0)}
                        placeholder="Rp 0"
                        className="w-full text-right px-3 py-2 rounded-xl bg-[#FFF9EC] border border-[#FFE49A]/60 text-xs font-mono font-bold text-[#2B261F] focus:outline-none focus:ring-2 focus:ring-[#FFB800]"
                      />
                    </td>

                    {/* Subtotal */}
                    <td className="px-5 py-3 text-right font-mono font-black text-[#2B261F] text-sm whitespace-nowrap">
                      {formatRupiah(subtotal)}
                    </td>

                    {/* Hapus */}
                    <td className="px-3 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => onRemoveItem(i)}
                        title="Hapus baris"
                        className="p-1.5 rounded-xl text-[#8C8275] hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}

              <tr className="border-t-2 border-[#EBE6DC] bg-[#FCFAF6]">
                <td colSpan={5} className="px-6 py-4 text-right font-extrabold text-[#2B261F] text-sm">
                  Total Nilai Akumulasi Nota
                </td>
                <td className="px-5 py-4 text-right font-mono font-black text-[#FF6B00] text-base">
                  {formatRupiah(totalAkumulasi)}
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="block lg:hidden p-4 space-y-4 divide-y divide-[#F5F2EB]">
          {items.map((item, i) => {
            const subtotal = item.qty * item.harga
            const matchedBahan = bahanList.find(b => b.id === item.matchedBahanId)

            return (
              <div key={i} className="pt-4 first:pt-0 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold text-[#8A5A00] bg-[#FFF6D6] border border-[#FFE49A] px-2.5 py-0.5 rounded-full">
                    Item #{i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(i)}
                    className="text-xs text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A7062] mb-1">
                    Nama Bahan Baku
                  </label>
                  <input
                    type="text"
                    value={item.nama}
                    onChange={e => onUpdateItem(i, 'nama', e.target.value)}
                    placeholder="Nama bahan"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FFF9EC] border border-[#FFE49A]/60 text-xs text-[#2B261F] font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A7062] mb-1">
                    Cocokkan ke Bahan Dapur
                  </label>
                  <CustomSelect
                    value={matchedBahan?.nama || '(Buat Baru / Belum Ada)'}
                    onChange={val => {
                      const match = bahanList.find(b => b.nama === val)
                      onUpdateItem(i, 'matchedBahanId', match?.id || undefined)
                      if (match) onUpdateItem(i, 'satuan', match.satuan)
                    }}
                    options={['(Buat Baru / Belum Ada)', ...bahanList.map(b => b.nama)]}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A7062] mb-1">
                      Kuantitas (Qty)
                    </label>
                    <input
                      type="number"
                      min="0.001"
                      step="any"
                      value={item.qty === 0 ? '' : item.qty}
                      onChange={e => onUpdateItem(i, 'qty', Number(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FFF9EC] border border-[#FFE49A]/60 text-base font-mono font-black text-[#2B261F] text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A7062] mb-1">
                      Satuan
                    </label>
                    <CustomSelect
                      value={item.satuan}
                      onChange={val => onUpdateItem(i, 'satuan', val)}
                      options={
                        COMMON_UNITS.includes(item.satuan)
                          ? COMMON_UNITS
                          : [item.satuan, ...COMMON_UNITS]
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 items-center pt-1">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A7062] mb-1">
                      Harga Satuan (Rp)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={item.harga === 0 ? '' : item.harga}
                      onChange={e => onUpdateItem(i, 'harga', Number(e.target.value) || 0)}
                      placeholder="Rp 0"
                      className="w-full px-3 py-2 rounded-xl bg-[#FFF9EC] border border-[#FFE49A]/60 text-xs font-mono font-bold text-[#2B261F]"
                    />
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-bold text-[#8C8275] uppercase">
                      Subtotal
                    </span>
                    <span className="text-sm font-mono font-black text-[#2B261F]">
                      {formatRupiah(subtotal)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}

          <div className="pt-4 border-t border-[#EBE6DC] flex justify-between items-center bg-[#FCFAF6] p-3 rounded-2xl">
            <span className="font-extrabold text-[#2B261F] text-xs">Total Nota</span>
            <span className="font-mono font-black text-[#FF6B00] text-base">
              {formatRupiah(totalAkumulasi)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons & Success Feedback */}
      {savedPO ? (
        <div className="p-6 bg-[#E8F5E4] border border-[#C5E8BD] rounded-[28px] space-y-3 shadow-xs">
          <div className="flex items-center gap-3 text-[#2D7A1F] font-bold text-sm">
            <CheckCircle2 className="w-6 h-6 text-[#2D7A1F] flex-shrink-0" />
            <div>
              <span>Transaksi Nota Berhasil Disimpan ke Purchase Order!</span>
              <p className="text-xs font-mono text-[#2D7A1F]/90 font-normal mt-0.5">
                Nomor PO: <strong>{savedPO.noPO}</strong> • {updateStokDirectly ? 'Stok bahan telah otomatis diperbarui di gudang' : 'Status Draf'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/dashboard/purchase-order"
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FF8F2B] to-[#FF6B00] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs hover:shadow-md transition-all"
            >
              <span>Lihat di Purchase Order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/dashboard/stok-log"
              className="px-5 py-2.5 rounded-full bg-white border border-[#C5E8BD] text-[#2D7A1F] font-bold text-xs hover:bg-[#F4FAF2] transition-colors"
            >
              Cek Stok Log & Opname
            </Link>

            <button
              type="button"
              onClick={onReset}
              className="px-5 py-2.5 rounded-full bg-white border border-[#EBE6DC] text-xs font-bold text-[#7A7062] hover:bg-[#FCFAF6] ml-auto cursor-pointer transition-colors"
            >
              Scan Nota Baru
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3">
          {onRescan && (
            <button
              type="button"
              onClick={onRescan}
              disabled={isSaving}
              className="py-3 px-5 rounded-full bg-[#FFF6D6] hover:bg-[#FFEBB0] text-[#7A5A10] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-98"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#D98B00]" />
              <span>Scan Ulang Gambar Sama</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReset}
            disabled={isSaving}
            className="flex-1 py-3 rounded-full border border-[#EBE6DC] text-xs font-bold text-[#7A7062] hover:bg-[#F5F2EB] transition-colors cursor-pointer disabled:opacity-50"
          >
            Abaikan & Ganti File
          </button>

          <button
            type="button"
            onClick={onSaveToPO}
            disabled={isSaving || items.length === 0}
            className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#FF8F2B] to-[#FF6B00] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs hover:shadow-md hover:brightness-105 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{isSaving ? 'Menyimpan Belanjaan...' : 'Konfirmasi & Masukkan ke Daftar Belanja'}</span>
          </button>
        </div>
      )}
    </div>
  )
}
