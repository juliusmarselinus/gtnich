'use client'

import { useState, useRef } from 'react'
import Topbar from '@/components/Topbar'
import { formatRupiah } from '@/lib/mock-data'
import { Upload, Image as ImageIcon, CheckCircle, Loader2, FileText } from 'lucide-react'
import clsx from 'clsx'

interface ParsedItem {
  nama: string
  qty: number
  satuan: string
  harga: number
}

const MOCK_PARSED: ParsedItem[] = [
  { nama: 'Tepung Terigu Segitiga', qty: 5, satuan: 'kg', harga: 12500 },
  { nama: 'Gula Pasir Gulaku', qty: 3, satuan: 'kg', harga: 14000 },
  { nama: 'Minyak Goreng Bimoli', qty: 2, satuan: 'liter', harga: 17000 },
  { nama: 'Telur Ayam Kampung', qty: 30, satuan: 'butir', harga: 2800 },
  { nama: 'Cokelat Bubuk Van Houten', qty: 2, satuan: 'sachet 100gr', harga: 28000 },
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
    }, 2200)
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
      <Topbar title="OCR Nota" subtitle="Upload foto nota pembelian untuk ekstraksi data otomatis" />

      <main className="p-8 space-y-6 max-w-4xl mx-auto">
        {/* Upload Area */}
        {state === 'idle' && (
          <div
            onDrop={onDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="bg-white rounded-2xl border-2 border-dashed border-[#EAE5DF] shadow-2xs p-16 text-center cursor-pointer hover:border-[#3E6B48] hover:bg-[#FAF8F5] transition-all group"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#EAF0EC] flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
              <ImageIcon className="w-8 h-8 text-[#3E6B48]" />
            </div>
            <p className="text-sm font-semibold text-[#1F1D1A] mb-1">Upload Foto Nota</p>
            <p className="text-xs text-[#9C9589]">Drag & drop atau klik untuk memilih file</p>
            <p className="text-[10px] text-[#9C9589] mt-1">PNG, JPG, PDF — Max 10MB</p>
            <input ref={inputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={onFileChange} />
          </div>
        )}

        {/* Processing */}
        {state === 'uploading' && (
          <div className="bg-white rounded-2xl border border-[#EAE5DF] shadow-2xs p-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#EAF0EC] flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-[#3E6B48] animate-spin" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1F1D1A]">Memproses Nota…</p>
              <p className="text-xs text-[#9C9589] mt-1">Mengekstrak data dari <span className="font-medium text-[#1F1D1A]">{fileName}</span></p>
            </div>
            <div className="max-w-xs mx-auto h-1.5 bg-[#EAE5DF] rounded-full overflow-hidden">
              <div className="h-full bg-[#3E6B48] rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}

        {/* Results */}
        {state === 'done' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EAF0EC] flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#3E6B48]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1F1D1A]">{fileName}</p>
                  <p className="text-[11px] text-[#3E6B48] font-medium">{items.length} item berhasil diekstrak</p>
                </div>
              </div>
              <button onClick={reset} className="text-xs text-[#9C9589] hover:text-red-500 transition-colors">Upload ulang</button>
            </div>

            <div className="bg-white rounded-xl border border-[#EAE5DF] shadow-2xs overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#EAE5DF] bg-[#FAF8F5]">
                    <th className="text-left px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Nama Item</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Qty</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Satuan</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Harga/Unit</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F0EB]">
                  {items.map((item, i) => (
                    <tr key={i} className="hover:bg-[#FAF8F5]">
                      <td className="px-5 py-3.5 font-medium text-[#1F1D1A]">{item.nama}</td>
                      <td className="px-5 py-3.5 text-right font-mono text-[#1F1D1A]">{item.qty}</td>
                      <td className="px-5 py-3.5 text-[#9C9589]">{item.satuan}</td>
                      <td className="px-5 py-3.5 text-right font-mono text-[#9C9589]">{formatRupiah(item.harga)}</td>
                      <td className="px-5 py-3.5 text-right font-mono font-semibold text-[#1F1D1A]">{formatRupiah(item.qty * item.harga)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-[#EAE5DF] bg-[#FAF8F5]">
                    <td colSpan={4} className="px-5 py-3.5 text-right font-bold text-[#1F1D1A]">Total</td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-[#3E6B48] text-sm">{formatRupiah(total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {saved ? (
              <div className="flex items-center gap-2 p-4 bg-[#EAF0EC] rounded-xl text-sm font-semibold text-[#3E6B48]">
                <CheckCircle className="w-5 h-5 flex-shrink-0" /> Data berhasil disimpan ke riwayat Purchase Order!
              </div>
            ) : (
              <div className="flex gap-3">
                <button onClick={reset} className="flex-1 py-2.5 border border-[#EAE5DF] rounded-xl text-xs font-semibold text-[#9C9589] hover:bg-[#FAF8F5] transition-colors">
                  Abaikan
                </button>
                <button onClick={() => setSaved(true)} className="flex-1 py-2.5 bg-[#3E6B48] text-white rounded-xl text-xs font-semibold hover:bg-[#345a3d] transition-colors">
                  Simpan ke Purchase Order
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
