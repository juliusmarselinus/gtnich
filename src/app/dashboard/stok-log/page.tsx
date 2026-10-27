'use client'

import { useState } from 'react'
import Topbar from '@/components/Topbar'
import { stokLogs as initialLogs, bahanList, StokLog } from '@/lib/dapur-data'
import { formatRupiah } from '@/lib/mock-data'
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
    Opname: 'bg-[#EAF0EC] text-[#3E6B48]',
  }

  return (
    <div className="flex-1 pb-16">
      <Topbar title="Stok Log & Opname" subtitle="Riwayat pergerakan stok otomatis dan pencatatan stok manual" />

      <main className="p-8 space-y-6 max-w-5xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-[#EAE5DF]">
          {[
            { key: 'log', label: 'Stok Log', icon: Database },
            { key: 'opname', label: 'Opname Stok', icon: ClipboardCheck },
          ].map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key as 'log' | 'opname')}
                className={clsx('flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all -mb-px', tab === t.key ? 'border-[#3E6B48] text-[#3E6B48]' : 'border-transparent text-[#9C9589] hover:text-[#1F1D1A]')}
              >
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            )
          })}
        </div>

        {/* Stok Log Table */}
        {tab === 'log' && (
          <div className="bg-white rounded-xl border border-[#EAE5DF] shadow-2xs overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#EAE5DF] bg-[#FAF8F5]">
                  <th className="text-left px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Tanggal</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Bahan</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Sebelum</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Perubahan</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Sesudah</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Sumber</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F0EB]">
                {[...logs].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).map(log => (
                  <tr key={log.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="px-5 py-3.5 text-[#9C9589] font-mono">{log.tanggal}</td>
                    <td className="px-5 py-3.5 font-medium text-[#1F1D1A]">{log.namaBahan}</td>
                    <td className="px-5 py-3.5 text-right font-mono text-[#9C9589]">{log.stokSebelum}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={clsx('inline-flex items-center gap-1 font-mono font-semibold', log.perubahan > 0 ? 'text-[#3E6B48]' : 'text-red-500')}>
                        {log.perubahan > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {log.perubahan > 0 ? '+' : ''}{log.perubahan}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-semibold text-[#1F1D1A]">{log.stokSesudah}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={clsx('px-2 py-1 rounded-lg text-[11px] font-semibold', sourceColor[log.sumber])}>{log.sumber}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Opname */}
        {tab === 'opname' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 text-xs text-amber-700 font-medium">
              Masukkan jumlah stok aktual hasil hitungan fisik. Selisih akan disorot merah jika ada perbedaan.
            </div>
            <div className="bg-white rounded-xl border border-[#EAE5DF] shadow-2xs overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#EAE5DF] bg-[#FAF8F5]">
                    <th className="text-left px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Bahan</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Stok Sistem</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Stok Aktual</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Selisih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F0EB]">
                  {opname.map(o => {
                    const bahan = bahanList.find(b => b.id === o.bahanId)!
                    const hasDisc = o.selisih !== 0
                    return (
                      <tr key={o.bahanId} className={clsx('transition-colors', hasDisc ? 'bg-red-50/40' : 'hover:bg-[#FAF8F5]')}>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-[#1F1D1A]">{bahan.nama}</p>
                          <p className="text-[10px] text-[#9C9589]">{bahan.satuan}</p>
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono font-semibold text-[#9C9589]">{o.stokSystem}</td>
                        <td className="px-5 py-3.5 text-right">
                          <input
                            type="number"
                            value={o.stokAktual}
                            onChange={e => updateOpname(o.bahanId, Number(e.target.value))}
                            className={clsx('w-24 px-2 py-1.5 border rounded-lg text-xs text-right font-mono focus:outline-none', hasDisc ? 'border-red-300 bg-red-50 focus:border-red-400' : 'border-[#EAE5DF] focus:border-[#3E6B48]')}
                          />
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className={clsx('font-mono font-semibold text-xs', o.selisih === 0 ? 'text-[#9C9589]' : o.selisih > 0 ? 'text-[#3E6B48]' : 'text-red-600')}>
                            {o.selisih === 0 ? '-' : `${o.selisih > 0 ? '+' : ''}${o.selisih}`}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {opnameSaved && (
              <div className="flex items-center gap-2 p-4 bg-[#EAF0EC] rounded-xl text-sm font-semibold text-[#3E6B48]">
                <ClipboardCheck className="w-5 h-5" /> Opname berhasil disimpan!
              </div>
            )}
            <div className="flex justify-end">
              <button onClick={saveOpname} className="px-6 py-2.5 bg-[#3E6B48] text-white rounded-xl text-xs font-semibold hover:bg-[#345a3d] transition-colors">
                Simpan Opname
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
