'use client'

import { useState } from 'react'
import Topbar from '@/components/Topbar'
import { stokLogs as initialLogs, bahanList, StokLog } from '@/lib/dapur-data'
import { Database, ClipboardCheck, TrendingUp, TrendingDown } from 'lucide-react'
import clsx from 'clsx'

interface OpnameEntry {
  bahanId: string
  stokSystem: number
  stokAktual: number
  selisih: number
  satuan: string
}

export default function StokLogPage() {
  const [tab, setTab] = useState<'log' | 'opname'>('log')
  const [logs] = useState<StokLog[]>(initialLogs)

  // Opname state
  const [opname, setOpname] = useState<OpnameEntry[]>(
    bahanList.map(b => ({ bahanId: b.id, stokSystem: b.stok, stokAktual: b.stok, selisih: 0, satuan: b.satuan }))
  )
  const [opnameSaved, setOpnameSaved] = useState(false)

  function updateOpname(bahanId: string, aktual: number) {
    setOpname(prev => prev.map(o => {
      if (o.bahanId !== bahanId) return o
      return { ...o, stokAktual: aktual, selisih: aktual - o.stokSystem }
    }))
  }

  function saveOpname() { setOpnameSaved(true); setTimeout(() => setOpnameSaved(false), 3000) }

  const sourceColor: Record<string, string> = {
    PO: 'bg-blue-50 text-blue-600',
    Penjualan: 'bg-amber-50 text-amber-700',
    Manual: 'bg-purple-50 text-purple-600',
    Opname: 'bg-emerald-50 text-emerald-700',
  }

  return (
    <div className="flex-1 pb-16">
      <Topbar title="Stok Log & Stock Opname" subtitle="Audit jejak mutasi bahan otomatis dan sinkronisasi perhitungan fisik gudang dapur" />

      <main className="p-8 space-y-7 max-w-5xl mx-auto">
        {/* Clay Tabs */}
        <div className="flex gap-3">
          {[
            { key: 'log', label: 'Buku Log Mutasi Stok', icon: Database },
            { key: 'opname', label: 'Form Stock Opname Fisik', icon: ClipboardCheck },
          ].map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key as 'log' | 'opname')}
                className={clsx(
                  'flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all',
                  tab === t.key ? 'clay-btn-primary' : 'clay-btn text-slate-600 hover:text-slate-900'
                )}
              >
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            )
          })}
        </div>

        {/* Stok Log Table Clay Card */}
        {tab === 'log' && (
          <div className="clay-card overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Waktu Log</th>
                  <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Nama Bahan</th>
                  <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Stok Awal</th>
                  <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Mutasi</th>
                  <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Stok Akhir</th>
                  <th className="text-center px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Sumber Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...logs].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">{log.tanggal}</td>
                    <td className="px-6 py-4 font-bold text-slate-800 text-sm">{log.namaBahan}</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-400 font-semibold">{log.stokSebelum}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={clsx('inline-flex items-center gap-1 font-mono font-black text-xs px-2.5 py-0.5 rounded-full clay-pill', log.perubahan > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600')}>
                        {log.perubahan > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {log.perubahan > 0 ? '+' : ''}{log.perubahan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-black text-slate-800 text-sm">{log.stokSesudah}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={clsx('px-3 py-1 rounded-full text-[11px] font-bold clay-pill', sourceColor[log.sumber])}>{log.sumber}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stock Opname */}
        {tab === 'opname' && (
          <div className="space-y-5">
            <div className="clay-card p-4.5 bg-amber-50/80 border border-amber-200/80 text-xs text-amber-800 font-medium rounded-2xl flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0 animate-ping" />
              <span>Masukkan jumlah stok fisik riil hasil hitungan gudang. Selisih akan otomatis dihitung dan disorot warna jika terdapat diskrepansi.</span>
            </div>

            <div className="clay-card overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Bahan Baku</th>
                    <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Stok Sistem</th>
                    <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Stok Hitungan Fisik</th>
                    <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Disparitas Selisih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {opname.map(o => {
                    const bahan = bahanList.find(b => b.id === o.bahanId)!
                    const hasDisc = o.selisih !== 0
                    return (
                      <tr key={o.bahanId} className={clsx('transition-colors', hasDisc ? 'bg-rose-50/30' : 'hover:bg-slate-50/50')}>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800 text-sm">{bahan.nama}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{bahan.satuan}</p>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-slate-500">{o.stokSystem}</td>
                        <td className="px-6 py-4 text-right">
                          <input
                            type="number"
                            value={o.stokAktual}
                            onChange={e => updateOpname(o.bahanId, Number(e.target.value))}
                            className={clsx('w-28 px-3 py-1.5 clay-inset text-xs text-right font-mono font-bold', hasDisc ? 'border-rose-300 text-rose-700' : 'text-slate-800')}
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={clsx('font-mono font-black text-xs px-2.5 py-1 rounded-full clay-pill', o.selisih === 0 ? 'bg-slate-100 text-slate-400' : o.selisih > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600')}>
                            {o.selisih === 0 ? '0 Sesuai' : `${o.selisih > 0 ? '+' : ''}${o.selisih} ${bahan.satuan}`}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {opnameSaved && (
              <div className="flex items-center gap-2.5 p-4 bg-emerald-50 rounded-2xl text-xs font-bold text-emerald-700 clay-pill">
                <ClipboardCheck className="w-5 h-5 text-emerald-600" /> Hasil Opname berhasil diselaraskan dan stok sistem diperbarui!
              </div>
            )}

            <div className="flex justify-end">
              <button onClick={saveOpname} className="clay-btn-primary px-7 py-3 text-xs font-bold">
                Simpan & Rekonsiliasi Opname
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
