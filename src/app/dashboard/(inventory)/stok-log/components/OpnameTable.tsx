'use client'

import { useState } from 'react'
import { OpnameEntry } from '../types'
import { ClipboardCheck, AlertTriangle, Loader2, Sparkles, CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'

interface OpnameTableProps {
  entries: OpnameEntry[]
  onUpdateAktual: (bahanId: string, val: number) => void
  onSave: () => Promise<number>
}

export default function OpnameTable({
  entries,
  onUpdateAktual,
  onSave,
}: OpnameTableProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'info' } | null>(null)

  const selisihCount = entries.filter(e => e.selisih !== 0).length

  const handleSave = async () => {
    setIsSaving(true)
    setStatusMsg(null)
    try {
      const count = await onSave()
      if (count === 0) {
        setStatusMsg({ text: 'Tidak ada perbedaan stok. Seluruh data fisik sudah sesuai.', type: 'info' })
      } else {
        setStatusMsg({
          text: `Berhasil menyesuaikan ${count} bahan dan mencatat jejak opname stok!`,
          type: 'success',
        })
      }
      setTimeout(() => setStatusMsg(null), 4000)
    } catch {
      setStatusMsg(null)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Informative Callout Banner */}
      <div className="p-4 sm:p-5 rounded-[24px] bg-[#FFF9EC] border border-[#FFE49A]/80 text-xs text-[#5C3D00] font-medium flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl bg-[#FFF0CE] text-[#8A5A00] flex items-center justify-center font-bold flex-shrink-0">
            <ClipboardCheck className="w-4 h-4" />
          </span>
          <p className="leading-relaxed">
            Masukkan hasil perhitungan fisik riil di gudang. Ketika Anda menekan tombol simpan, stok di tabel bahan akan otomatis diperbarui dan dicatat di buku mutasi stok.
          </p>
        </div>
        {selisihCount > 0 && (
          <span className="px-3.5 py-1.5 bg-[#FDE8E4] text-[#D8431F] border border-[#F9C2B8] rounded-full font-bold flex-shrink-0 flex items-center gap-1.5 shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5" /> {selisihCount} Perbedaan Fisik
          </span>
        )}
      </div>

      {statusMsg && (
        <div
          className={clsx(
            'flex items-center gap-2.5 p-4 rounded-2xl text-xs font-bold border shadow-xs animate-in fade-in-50 duration-200',
            statusMsg.type === 'success'
              ? 'bg-[#E8F5E4] text-[#2D7A1F] border-[#C5E8BD]'
              : 'bg-[#FFF6D6] text-[#8A5A00] border-[#FFE49A]'
          )}
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-[32px] bg-white border border-[#EBE6DC] shadow-xs overflow-hidden">
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-xs min-w-[650px]">
            <thead>
              <tr className="border-b border-[#F0EBE1] bg-[#FCFAF6] text-[#8C8275] text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">
                <th className="text-left px-6 py-4">Bahan Baku</th>
                <th className="text-right px-6 py-4">Stok di Sistem</th>
                <th className="text-right px-6 py-4">Hitungan Fisik Nyata</th>
                <th className="text-right px-6 py-4">Disparitas / Selisih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F2EB]">
              {entries.map(o => {
                const hasDisc = o.selisih !== 0
                return (
                  <tr
                    key={o.bahanId}
                    className={clsx(
                      'transition-colors',
                      hasDisc ? 'bg-[#FEF9F8] hover:bg-[#FDF4F2]' : 'hover:bg-[#FFFDF9]'
                    )}
                  >
                    <td className="px-6 py-4">
                      <p className="font-extrabold text-[#2B261F] text-sm">{o.namaBahan}</p>
                      <p className="text-[10px] text-[#8C8275] font-semibold mt-0.5">{o.satuan}</p>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-[#8C8275]">
                      {o.stokSystem} {o.satuan}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={o.stokAktual}
                        onChange={e => onUpdateAktual(o.bahanId, parseFloat(e.target.value))}
                        className={clsx(
                          'w-28 px-3.5 py-1.5 rounded-xl text-xs text-right font-mono font-bold border transition-all focus:outline-none focus:ring-2 focus:ring-[#FFB800]',
                          hasDisc
                            ? 'border-[#F9C2B8] text-[#D8431F] bg-[#FEF4F2]'
                            : 'border-[#FFE49A]/60 text-[#2B261F] bg-[#FFF9EC]'
                        )}
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={clsx(
                          'font-mono font-bold text-xs px-2.5 py-1 rounded-full border shadow-xs inline-block',
                          o.selisih === 0
                            ? 'bg-[#F5F2EB] text-[#7A7062] border-[#EBE6DC]'
                            : o.selisih > 0
                            ? 'bg-[#E8F5E4] text-[#2D7A1F] border-[#C5E8BD]'
                            : 'bg-[#FDE8E4] text-[#D8431F] border-[#F9C2B8]'
                        )}
                      >
                        {o.selisih === 0
                          ? '0 Sesuai'
                          : `${o.selisih > 0 ? '+' : ''}${o.selisih} ${o.satuan}`}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {/* Tampilan Mobile Card Opname */}
        <div className="sm:hidden space-y-3 p-3 bg-[#FCFAF6]">
          {entries.map(o => {
            const hasDisc = o.selisih !== 0
            return (
              <div
                key={o.bahanId}
                className={clsx(
                  "p-4 rounded-2xl border transition-colors space-y-3",
                  hasDisc ? "bg-[#FEF9F8] border-[#F9C2B8]/80" : "bg-white border-[#EBE6DC]"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-[#2B261F] text-sm leading-snug">{o.namaBahan}</h4>
                    <span className="text-[10px] text-[#8C8275] font-semibold">Satuan: {o.satuan}</span>
                  </div>
                  <span
                    className={clsx(
                      "font-mono font-bold text-[11px] px-2.5 py-0.5 rounded-full border shadow-2xs",
                      o.selisih === 0
                        ? "bg-[#F5F2EB] text-[#7A7062] border-[#EBE6DC]"
                        : o.selisih > 0
                        ? "bg-[#E8F5E4] text-[#2D7A1F] border-[#C5E8BD]"
                        : "bg-[#FDE8E4] text-[#D8431F] border-[#F9C2B8]"
                    )}
                  >
                    {o.selisih === 0 ? "0 Sesuai" : (o.selisih > 0 ? "+" : "") + o.selisih + " " + o.satuan}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#F0EBE1] items-center">
                  <div>
                    <span className="text-[10px] text-[#8C8275] block font-semibold">Stok Sistem</span>
                    <span className="font-mono font-bold text-xs text-[#2B261F]">{o.stokSystem} {o.satuan}</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8C8275] block font-semibold mb-1">Fisik Nyata</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={o.stokAktual}
                      onChange={e => onUpdateAktual(o.bahanId, parseFloat(e.target.value))}
                      className={clsx(
                        "w-full px-3 py-2 rounded-xl text-xs text-right font-mono font-bold border transition-all focus:outline-none focus:ring-2 focus:ring-[#FFB800]",
                        hasDisc
                          ? "border-[#F9C2B8] text-[#D8431F] bg-[#FEF4F2]"
                          : "border-[#FFE49A]/80 text-[#2B261F] bg-[#FFF9EC]"
                      )}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {entries.length === 0 && (
          <div className="text-center py-16 text-[#8C8275] text-sm font-medium">
            Belum ada bahan baku yang terdaftar di dapur.
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <p className="text-xs text-[#8C8275]">
          *Hanya bahan dengan selisih yang akan dicatat di buku stok log.
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || entries.length === 0}
          className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-[#FF8F2B] to-[#FF6B00] text-white text-xs font-bold shadow-xs hover:shadow-md hover:brightness-105 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Simpan & Sesuaikan Stok Fisik</span>
        </button>
      </div>
    </div>
  )
}
