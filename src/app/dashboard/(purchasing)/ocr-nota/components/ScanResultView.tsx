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
  Calendar,
  Layers,
  Loader2,
  ArrowRight,
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
  onSaveToPO,
  isSaving,
  savedPO,
}: ScanResultViewProps) {
  const totalAkumulasi = items.reduce((sum, i) => sum + i.qty * i.harga, 0)

  return (
    <div className="space-y-6">
      {/* Header Info Nota */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#FFF6EC] text-[#FF8F2B] flex items-center justify-center clay-pill flex-shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-slate-800">{fileName}</p>
            <p className="text-[11px] text-[#FF8F2B] font-bold">
              {items.length} rincian bahan berhasil dikenali oleh sistem
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-rose-600 font-bold transition-colors cursor-pointer self-end sm:self-auto"
        >
          ✕ Ganti / Upload Nota Lain
        </button>
      </div>

      {/* Grid: Preview & Konfigurasi Supplier */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Preview Thumbnail */}
        {imagePreview && (
          <div className="clay-card p-4 space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Foto Nota Asli
            </p>
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-h-56 flex items-center justify-center">
              <img
                src={imagePreview}
                alt="Nota Scan"
                className="w-full h-full object-contain max-h-52 rounded-xl"
              />
            </div>
          </div>
        )}

        {/* Form Meta PO Supplier */}
        <div className={`clay-card p-5 space-y-4 ${imagePreview ? 'md:col-span-2' : 'md:col-span-3'}`}>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#FF8F2B]" />
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Tujuan Supplier & Mode Pencatatan
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                Pilih / Hubungkan Supplier di Database
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
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                Nama Toko / Sumber di Nota
              </label>
              <input
                type="text"
                value={supplierName}
                onChange={e => onSelectSupplierName(e.target.value)}
                placeholder="Contoh: Toko Bahan Kue Maju"
                className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800 font-bold"
              />
            </div>
          </div>

          {/* Opsi Update Stok Langsung */}
          <div className="p-3.5 rounded-2xl bg-[#FFF6EC]/70 border border-[#FFE2C2] flex items-start gap-3">
            <input
              type="checkbox"
              id="updateStok"
              checked={updateStokDirectly}
              onChange={e => onToggleUpdateStok(e.target.checked)}
              className="mt-0.5 rounded text-[#FF8F2B] focus:ring-[#FF8F2B] w-4 h-4 cursor-pointer"
            />
            <label htmlFor="updateStok" className="text-xs text-slate-700 cursor-pointer">
              <strong className="text-slate-900 block">
                Langsung Tambahkan ke Stok Gudang & Catat Stok Log (Status: Diterima)
              </strong>
              <span className="text-[11px] text-slate-500">
                Jika dicentang, kuantitas bahan akan langsung masuk ke inventori dapur dan mutasi dicatat otomatis. Bila tidak dicentang, PO akan disimpan sebagai draf untuk dicek manual nanti.
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Tabel Rincian Item Nota */}
      <div className="clay-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#FF8F2B]" />
            <div>
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Rincian Item Bahan Hasil Scan
              </h4>
              <p className="text-[11px] text-slate-400">
                Sesuaikan nama, kuantitas, satuan, dan harga bila ada hasil OCR yang kurang tepat
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onAddItem}
            className="px-3.5 py-2 rounded-xl clay-btn text-xs font-bold text-[#FF8F2B] bg-[#FFF6EC] border border-[#FFE2C2] hover:bg-[#FFE2C2]/50 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Baris Bahan</span>
          </button>
        </div>

        {/* Tampilan Desktop Table: Lebar leluasa & input lega */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-xs min-w-[960px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="text-left px-5 py-3.5 font-bold text-slate-400 uppercase tracking-wider text-[11px] w-[28%]">
                  Nama Bahan Baku
                </th>
                <th className="text-left px-4 py-3.5 font-bold text-slate-400 uppercase tracking-wider text-[11px] w-[24%]">
                  Cocokkan Ke Bahan DB
                </th>
                <th className="text-right px-4 py-3.5 font-bold text-slate-400 uppercase tracking-wider text-[11px] w-[14%]">
                  Kuantitas
                </th>
                <th className="text-left px-4 py-3.5 font-bold text-slate-400 uppercase tracking-wider text-[11px] w-[14%]">
                  Satuan
                </th>
                <th className="text-right px-4 py-3.5 font-bold text-slate-400 uppercase tracking-wider text-[11px] w-[18%]">
                  Harga Satuan (Rp)
                </th>
                <th className="text-right px-5 py-3.5 font-bold text-slate-400 uppercase tracking-wider text-[11px] w-[16%]">
                  Subtotal
                </th>
                <th className="px-3 py-3.5 text-center w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, i) => {
                const subtotal = item.qty * item.harga
                const matchedBahan = bahanList.find(b => b.id === item.matchedBahanId)

                return (
                  <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                    {/* Nama Bahan */}
                    <td className="px-5 py-3">
                      <input
                        type="text"
                        value={item.nama}
                        onChange={e => onUpdateItem(i, 'nama', e.target.value)}
                        placeholder="Nama bahan"
                        className="w-full px-3 py-2 clay-inset text-xs text-slate-800 font-bold"
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

                    {/* Kuantitas (Box lebih besar, jelas & font mono tebal) */}
                    <td className="px-4 py-3">
                      <div className="relative">
                        <input
                          type="number"
                          min="0.001"
                          step="any"
                          value={item.qty === 0 ? '' : item.qty}
                          onChange={e => onUpdateItem(i, 'qty', Number(e.target.value) || 0)}
                          placeholder="0"
                          className="w-full text-right px-3 py-2 clay-inset text-sm font-mono font-black text-slate-800 bg-white"
                        />
                      </div>
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
                        className="w-full text-right px-3 py-2 clay-inset text-xs font-mono font-bold text-slate-700 bg-white"
                      />
                    </td>

                    {/* Subtotal */}
                    <td className="px-5 py-3 text-right font-mono font-black text-slate-800 text-sm whitespace-nowrap">
                      {formatRupiah(subtotal)}
                    </td>

                    {/* Hapus */}
                    <td className="px-3 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => onRemoveItem(i)}
                        title="Hapus baris"
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}

              <tr className="border-t-2 border-slate-200 bg-slate-50/90">
                <td colSpan={5} className="px-6 py-4 text-right font-extrabold text-slate-800 text-sm">
                  Total Nilai Akumulasi Nota
                </td>
                <td className="px-5 py-4 text-right font-mono font-black text-[#FF8F2B] text-base">
                  {formatRupiah(totalAkumulasi)}
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tampilan Responsif Mobile & Tablet (Card-based Layout) */}
        <div className="block lg:hidden p-4 space-y-4 divide-y divide-slate-100">
          {items.map((item, i) => {
            const subtotal = item.qty * item.harga
            const matchedBahan = bahanList.find(b => b.id === item.matchedBahanId)

            return (
              <div key={i} className="pt-4 first:pt-0 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold text-[#FF8F2B] bg-[#FFF6EC] border border-[#FFE2C2] px-2 py-0.5 rounded-full">
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
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Nama Bahan Baku
                  </label>
                  <input
                    type="text"
                    value={item.nama}
                    onChange={e => onUpdateItem(i, 'nama', e.target.value)}
                    placeholder="Nama bahan"
                    className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Cocokkan Ke Bahan Database
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
                  {/* Kuantitas */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Kuantitas (Qty)
                    </label>
                    <input
                      type="number"
                      min="0.001"
                      step="any"
                      value={item.qty === 0 ? '' : item.qty}
                      onChange={e => onUpdateItem(i, 'qty', Number(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-3.5 py-2.5 clay-inset text-base font-mono font-black text-slate-800 text-center"
                    />
                  </div>

                  {/* Satuan */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
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
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Harga Satuan (Rp)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={item.harga === 0 ? '' : item.harga}
                      onChange={e => onUpdateItem(i, 'harga', Number(e.target.value) || 0)}
                      placeholder="Rp 0"
                      className="w-full px-3 py-2 clay-inset text-xs font-mono font-bold text-slate-700"
                    />
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">
                      Subtotal
                    </span>
                    <span className="text-sm font-mono font-black text-slate-800">
                      {formatRupiah(subtotal)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}

          <div className="pt-4 border-t border-slate-200 flex justify-between items-center bg-slate-50/70 p-3 rounded-2xl">
            <span className="font-extrabold text-slate-800 text-xs">Total Nota</span>
            <span className="font-mono font-black text-[#FF8F2B] text-base">
              {formatRupiah(totalAkumulasi)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons & Success Feedback */}
      {savedPO ? (
        <div className="p-5 bg-[#FFF6EC] border border-[#FFE2C2] rounded-3xl space-y-3">
          <div className="flex items-center gap-3 text-slate-900 font-bold text-sm">
            <CheckCircle2 className="w-6 h-6 text-[#FF8F2B] flex-shrink-0" />
            <div>
              <span>Transaksi Nota Berhasil Disimpan ke Purchase Order!</span>
              <p className="text-xs font-mono text-[#C86400] font-normal mt-0.5">
                Nomor PO: <strong>{savedPO.noPO}</strong> • {updateStokDirectly ? 'Stok bahan telah otomatis diperbarui di gudang' : 'Status Draf'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/dashboard/purchase-order"
              className="px-4 py-2 rounded-xl clay-btn-primary text-white font-bold text-xs flex items-center gap-1.5"
            >
              <span>Lihat di Purchase Order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/dashboard/stok-log"
              className="px-4 py-2 rounded-xl bg-white border border-[#FFE2C2] text-[#FF8F2B] font-bold text-xs hover:bg-[#FFF6EC]"
            >
              Cek Stok Log & Opname
            </Link>

            <button
              type="button"
              onClick={onReset}
              className="px-4 py-2 rounded-xl clay-btn text-xs font-bold text-slate-600 ml-auto cursor-pointer"
            >
              Scan Nota Baru
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={onReset}
            disabled={isSaving}
            className="flex-1 py-3.5 clay-btn text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer disabled:opacity-50"
          >
            Abaikan & Scan Lagi
          </button>

          <button
            type="button"
            onClick={onSaveToPO}
            disabled={isSaving || items.length === 0}
            className="flex-1 py-3.5 clay-btn-primary text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{isSaving ? 'Menyimpan ke Database...' : 'Konfirmasi & Masukkan ke Database PO'}</span>
          </button>
        </div>
      )}
    </div>
  )
}
