'use client'

import { useState } from 'react'
import { OpnameEntry } from '../types'
import { ClipboardCheck, AlertTriangle, Loader2 } from 'lucide-react'
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
        setStatusMsg({ text: 'Tidak ada perbedaan stok. Seluruh data sudah sesuai.', type: 'info' })
      } else {
        setStatusMsg({
          text: `Berhasil menyesuaikan ${count} bahan ke database dan mencatat jejak audit Opname!`,
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
    <div className="space-y-5">
      {/* Informative notification */}
      <div className="clay-card p-4.5 bg-amber-50/80 border border-amber-200/80 text-xs text-amber-800 font-medium rounded-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0 animate-ping" />
          <span>
            Masukkan hasil perhitungan fisik riil di gudang. Ketika Anda menekan tombol simpan, stok di tabel bahan akan otomatis diperbarui dan dicatat di buku mutasi.
          </span>
        </div>
        {selisihCount > 0 && (
          <span className="px-3 py-1 bg-amber-200 text-amber-900 rounded-xl font-bold flex-shrink-0 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> {selisihCount} Perbedaan Fisik
          </span>
        )}
      </div>

      {statusMsg && (
        <div
          className={clsx(
            'flex items-center gap-2.5 p-4 rounded-2xl text-xs font-bold clay-pill',
            statusMsg.type === 'success'
              ? 'bg-[#FFF6EC] text-[#FF8F2B] border border-[#FFE2C2]'
              : 'bg-blue-50 text-blue-700'
          )}
        >
          <ClipboardCheck className="w-5 h-5 flex-shrink-0" />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Table */}
      <div className="clay-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 whitespace-nowrap">
              <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Bahan Baku
              </th>
              <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Stok Database
              </th>
              <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Hitungan Fisik Nyata
              </th>
              <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Disparitas / Selisih
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.map(o => {
              const hasDisc = o.selisih !== 0
              return (
                <tr
                  key={o.bahanId}
                  className={clsx('transition-colors', hasDisc ? 'bg-rose-50/30' : 'hover:bg-slate-50/50')}
                >
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 text-sm">{o.namaBahan}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{o.satuan}</p>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-slate-500">
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
                        'w-28 px-3 py-1.5 clay-inset text-xs text-right font-mono font-bold',
                        hasDisc ? 'border-rose-300 text-rose-700 bg-rose-50/20' : 'text-slate-800'
                      )}
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={clsx(
                        'font-mono font-black text-xs px-2.5 py-1 rounded-full clay-pill',
                        o.selisih === 0
                          ? 'bg-slate-100 text-slate-400'
                          : o.selisih > 0
                          ? 'bg-[#FFF6EC] text-[#FF8F2B]'
                          : 'bg-rose-50 text-rose-600'
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

        {entries.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm font-medium">
            Belum ada bahan baku yang terdaftar di database.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-400">
          *Hanya bahan dengan selisih yang akan dicatat di stok log.
        </p>
        <button
          onClick={handleSave}
          disabled={isSaving || entries.length === 0}
          className="clay-btn-primary px-7 py-3 text-xs font-bold flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Simpan & Rekonsiliasi Opname</span>
        </button>
      </div>
    </div>
  )
}
