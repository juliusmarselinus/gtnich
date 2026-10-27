'use client'

import { useState, useRef } from 'react'
import Topbar from '@/components/Topbar'
import { formatRupiah } from '@/lib/mock-data'
import { Image as ImageIcon, CheckCircle, Loader2, FileText } from 'lucide-react'

interface ParsedItem {
  nama: string
  qty: number
  satuan: string
  harga: number
}

const MOCK_PARSED: ParsedItem[] = [
  { nama: 'Tepung Terigu Segitiga Biru', qty: 5, satuan: 'kg', harga: 12500 },
  { nama: 'Gula Pasir Kristal Putih', qty: 3, satuan: 'kg', harga: 14000 },
  { nama: 'Minyak Goreng Sawit', qty: 2, satuan: 'liter', harga: 17000 },
  { nama: 'Telur Ayam Segar', qty: 30, satuan: 'butir', harga: 2800 },
  { nama: 'Cokelat Bubuk Premium', qty: 2, satuan: 'sachet', harga: 28000 },
]

type State = 'idle' | 'uploading' | 'done'

export default function OCRNotaPage() {
  const [state, setState] = useState<State>('idle')
  const [fileName, setFileName] = useState('')
  const [items, setItems] = useState<ParsedItem[]>([])
  const [saved, setSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    setFileName(file.name)
    setState('uploading')
    setSaved(false)
    setTimeout(() => {
      setItems(MOCK_PARSED)
      setState('done')
    }, 2000)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function reset() { setState('idle'); setFileName(''); setItems([]); setSaved(false) }

  const total = items.reduce((s, i) => s + i.qty * i.harga, 0)

  return (
    <div className="flex-1 pb-16">
      <Topbar title="Pemindai OCR Nota Pembelian" subtitle="Scan foto nota fisik dari supplier dan ubah menjadi data barang digital secara otomatis" />

      <main className="p-8 space-y-7 max-w-4xl mx-auto">
        {/* Upload Area Clay Container */}
        {state === 'idle' && (
          <div
            onDrop={onDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="clay-card p-16 text-center cursor-pointer hover:border-emerald-200 transition-all group"
          >
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5 clay-pill group-hover:scale-105 transition-transform">
              <ImageIcon className="w-10 h-10" />
            </div>
            <p className="text-base font-extrabold text-slate-800 mb-1">Ambil Foto atau Upload Nota</p>
            <p className="text-xs text-slate-400 font-medium">Seret foto nota ke sini atau klik untuk memilih file kamera</p>
            <p className="text-[10px] text-emerald-600 font-mono font-bold mt-2">Mendukung format JPG, PNG, PDF</p>
            <input ref={inputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={onFileChange} />
          </div>
        )}

        {/* Processing State */}
        {state === 'uploading' && (
          <div className="clay-card p-16 text-center space-y-5">
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto clay-pill">
              <Loader2 className="w-10 h-10 animate-spin" />
            </div>
            <div>
              <p className="text-base font-extrabold text-slate-800">Menganalisis Teks Nota…</p>
              <p className="text-xs text-slate-400 mt-1 font-mono">Memindai baris item dari <span className="font-bold text-slate-700">{fileName}</span></p>
            </div>
            <div className="max-w-xs mx-auto h-2 clay-inset rounded-full overflow-hidden p-0.5">
              <div className="h-full bg-emerald-500 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}

        {/* OCR Result Table */}
        {state === 'done' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center clay-pill">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-800">{fileName}</p>
                  <p className="text-[11px] text-emerald-600 font-bold">{items.length} rincian bahan berhasil dikenali</p>
                </div>
              </div>
              <button onClick={reset} className="text-xs text-slate-400 hover:text-rose-600 font-bold transition-colors">
                Ganti Nota
              </button>
            </div>

            <div className="clay-card overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Nama Item Bahan</th>
                    <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Kuantitas</th>
                    <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Satuan</th>
                    <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Harga Satuan</th>
                    <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-800 text-sm">{item.nama}</td>
                      <td className="px-6 py-4 text-right font-mono font-black text-slate-800 text-sm">{item.qty}</td>
                      <td className="px-6 py-4 text-slate-500 font-semibold">{item.satuan}</td>
                      <td className="px-6 py-4 text-right font-mono text-slate-500 font-medium">{formatRupiah(item.harga)}</td>
                      <td className="px-6 py-4 text-right font-mono font-black text-slate-800 text-sm">{formatRupiah(item.qty * item.harga)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-slate-200 bg-slate-50/80">
                    <td colSpan={4} className="px-6 py-4 text-right font-extrabold text-slate-800 text-sm">Total Akumulasi Nota</td>
                    <td className="px-6 py-4 text-right font-mono font-black text-emerald-600 text-base">{formatRupiah(total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {saved ? (
              <div className="flex items-center gap-2.5 p-4 bg-emerald-50 rounded-2xl text-xs font-bold text-emerald-700 clay-pill">
                <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" /> Data nota berhasil diimpor ke sistem Purchase Order & update stok!
              </div>
            ) : (
              <div className="flex gap-4">
                <button onClick={reset} className="flex-1 py-3 clay-btn text-xs font-bold text-slate-600">
                  Abaikan & Scan Lagi
                </button>
                <button onClick={() => setSaved(true)} className="flex-1 py-3 clay-btn-primary text-xs font-bold">
                  Konfirmasi & Masukkan ke PO
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
