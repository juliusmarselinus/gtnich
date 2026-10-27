'use client'

import { useState } from 'react'
import Topbar from '@/components/Topbar'
import { purchaseOrders as initialPOs, bahanList, suppliers, PurchaseOrder, POItem, POStatus } from '@/lib/dapur-data'
import { formatRupiah } from '@/lib/mock-data'
import { Plus, ChevronDown, ChevronUp, X, ShoppingBag } from 'lucide-react'
import clsx from 'clsx'

const STATUS_CONFIG: Record<POStatus, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'bg-slate-100 text-slate-600' },
  dikirim: { label: 'Dikirim', cls: 'bg-blue-50 text-blue-600' },
  diterima: { label: 'Diterima', cls: 'bg-emerald-50 text-emerald-700' },
  tagihan: { label: 'Tagihan', cls: 'bg-amber-50 text-amber-700' },
}

export default function PurchaseOrderPage() {
  const [list, setList] = useState<PurchaseOrder[]>(initialPOs)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showWizard, setShowWizard] = useState(false)
  const [step, setStep] = useState(1)

  // Wizard state
  const [supplierId, setSupplierId] = useState('')
  const [catatan, setCatatan] = useState('')
  const [items, setItems] = useState<POItem[]>([])
  const [newItem, setNewItem] = useState({ bahanId: '', qty: 0, hargaEstimasi: 0 })

  function openWizard() { setShowWizard(true); setStep(1); setSupplierId(''); setCatatan(''); setItems([]) }

  function addItem() {
    if (!newItem.bahanId || newItem.qty <= 0) return
    const bahan = bahanList.find(b => b.id === newItem.bahanId)
    if (!bahan) return
    const price = newItem.hargaEstimasi || bahan.hargaPerSatuan
    setItems(prev => [...prev, {
      bahanId: bahan.id, namaBahan: bahan.nama, satuan: bahan.satuan,
      qty: newItem.qty, hargaEstimasi: price, hargaAktual: 0, stokSebelum: bahan.stok, diterima: false,
    }])
    setNewItem({ bahanId: '', qty: 0, hargaEstimasi: 0 })
  }

  function removeItem(idx: number) { setItems(prev => prev.filter((_, i) => i !== idx)) }

  function savePO() {
    const supplier = suppliers.find(s => s.id === supplierId)
    if (!supplier || items.length === 0) return
    const newId = `PO-${String(list.length + 1).padStart(3, '0')}`
    const noPO = `PO/${new Date().toISOString().slice(0, 10).replace(/-/g, '')}/${String(list.length + 1).padStart(3, '0')}`
    const total = items.reduce((s, i) => s + i.qty * i.hargaEstimasi, 0)
    setList(prev => [{
      id: newId, noPO, supplierId, namaSupplier: supplier.nama, status: 'draft',
      items, totalEstimasi: total, totalAktual: 0,
      tanggalBuat: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      catatan: catatan || undefined,
    }, ...prev])
    setShowWizard(false)
  }

  return (
    <div className="flex-1 pb-16">
      <Topbar title="Purchase Order (PO)" subtitle="Buat PO bertahap: buat pesanan, cek harga, terima barang (verifikasi), dan monitor tagihan" />

      <main className="p-8 space-y-7 max-w-6xl mx-auto">
        {/* Status Flow Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(['draft', 'dikirim', 'diterima', 'tagihan'] as POStatus[]).map(st => (
            <div key={st} className="clay-card p-5 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{STATUS_CONFIG[st].label}</p>
              <p className="text-3xl font-black text-slate-800 font-mono">{list.filter(p => p.status === st).length}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button onClick={openWizard} className="clay-btn-primary flex items-center gap-2 px-5 py-2.5 text-xs font-bold">
            <Plus className="w-4 h-4" /> Buat Purchase Order Baru
          </button>
        </div>

        {/* PO List Clay Card */}
        <div className="clay-card overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">No. PO</th>
                <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Supplier Terkait</th>
                <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Tanggal</th>
                <th className="text-center px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Status Proses</th>
                <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Total Estimasi</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map(po => {
                const cfg = STATUS_CONFIG[po.status]
                const exp = expandedId === po.id
                return (
                  <>
                    <tr key={po.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-mono font-bold text-slate-800 text-sm">{po.noPO}</p>
                        {po.catatan && <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[180px]">{po.catatan}</p>}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{po.namaSupplier}</td>
                      <td className="px-6 py-4 text-slate-500 font-mono">{po.tanggalBuat}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={clsx('inline-flex px-3 py-1 rounded-full text-[11px] font-bold clay-pill', cfg.cls)}>{cfg.label}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-black text-slate-800 text-sm">
                        {formatRupiah(po.totalAktual > 0 ? po.totalAktual : po.totalEstimasi)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setExpandedId(exp ? null : po.id)} className="p-2 rounded-xl clay-btn text-slate-500 hover:text-slate-800">
                          {exp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                    {exp && (
                      <tr key={`${po.id}-detail`} className="bg-slate-50/70">
                        <td colSpan={6} className="px-8 py-5">
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Detail Item Bahan</p>
                          <div className="space-y-2">
                            {po.items.map((item, i) => (
                              <div key={i} className="flex items-center justify-between bg-white rounded-2xl px-5 py-3 clay-pill">
                                <div>
                                  <p className="text-xs font-bold text-slate-800">{item.namaBahan}</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">{item.qty} {item.satuan} × {formatRupiah(item.hargaEstimasi)}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-mono font-black text-slate-800">{formatRupiah(item.qty * item.hargaEstimasi)}</p>
                                  <span className={clsx('text-[10px] font-bold', item.diterima ? 'text-emerald-600' : 'text-amber-600')}>
                                    {item.diterima ? '✓ Sudah Diterima' : '○ Menunggu Kedatangan'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="clay-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-5">
            {/* Step Indicator */}
            <div className="flex items-center gap-2">
              {['Pilih Supplier', 'Tambah Item', 'Konfirmasi'].map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={clsx(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold clay-pill',
                    step >= i + 1 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                  )}>
                    {i + 1}
                  </div>
                  <span className={clsx('text-xs font-bold', step === i + 1 ? 'text-slate-800' : 'text-slate-400')}>{s}</span>
                  {i < 2 && <div className="flex-1 h-px bg-slate-200 mx-1" />}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-800">1. Pilih Supplier Tujuan</h3>
                <div className="space-y-2">
                  {suppliers.map(s => (
                    <button key={s.id} onClick={() => setSupplierId(s.id)} className={clsx('w-full text-left px-4 py-3 rounded-2xl transition-all', supplierId === s.id ? 'clay-btn-primary' : 'clay-btn text-slate-700')}>
                      <p className="text-xs font-bold">{s.nama}</p>
                      <p className={clsx('text-[10px] mt-0.5', supplierId === s.id ? 'text-emerald-100' : 'text-slate-400')}>
                        {s.kategori} • Min. Order {formatRupiah(s.minimalOrder)}
                      </p>
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Catatan Tambahan (Opsional)</label>
                  <input value={catatan} onChange={e => setCatatan(e.target.value)} className="w-full px-3.5 py-2.5 clay-inset text-xs text-slate-800" placeholder="e.g. Tolong kirim pagi hari" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-800">2. Tentukan Bahan & Kuantitas</h3>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between clay-inset px-4 py-3">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{item.namaBahan}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{item.qty} {item.satuan} × {formatRupiah(item.hargaEstimasi)}</p>
                      </div>
                      <button onClick={() => removeItem(i)} className="text-rose-400 hover:text-rose-600 p-1"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 p-4 clay-inset rounded-2xl">
                  <p className="text-[11px] font-bold text-slate-600">Pilih Bahan Masuk</p>
                  <select value={newItem.bahanId} onChange={e => { const b = bahanList.find(x => x.id === e.target.value); setNewItem(p => ({ ...p, bahanId: e.target.value, hargaEstimasi: b?.hargaPerSatuan ?? 0 })) }} className="w-full px-3.5 py-2.5 clay-card text-xs text-slate-800 border-none outline-none">
                    <option value="">-- Pilih Bahan --</option>
                    {bahanList.map(b => <option key={b.id} value={b.id}>{b.nama} (Stok Saat Ini: {b.stok} {b.satuan})</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold">Qty Diorder</label>
                      <input type="number" value={newItem.qty || ''} onChange={e => setNewItem(p => ({ ...p, qty: Number(e.target.value) }))} className="w-full px-3 py-2 clay-card text-xs text-slate-800 font-mono" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold">Estimasi Harga Satuan</label>
                      <input type="number" value={newItem.hargaEstimasi || ''} onChange={e => setNewItem(p => ({ ...p, hargaEstimasi: Number(e.target.value) }))} className="w-full px-3 py-2 clay-card text-xs text-slate-800 font-mono" />
                    </div>
                  </div>
                  <button onClick={addItem} className="w-full py-2.5 clay-btn-primary text-xs font-bold flex items-center justify-center gap-1.5">
                    <Plus className="w-4 h-4" /> Masukkan ke Daftar PO
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-800">3. Verifikasi & Finalisasi PO</h3>
                <div className="p-4 clay-inset rounded-2xl space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Supplier</span>
                    <span className="font-bold text-slate-800">{suppliers.find(s => s.id === supplierId)?.nama}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Jumlah Item</span>
                    <span className="font-bold text-slate-800">{items.length} macam bahan</span>
                  </div>
                  <div className="flex justify-between text-xs pt-2 border-t border-slate-200">
                    <span className="text-slate-500 font-bold">Total Estimasi</span>
                    <span className="font-black text-emerald-600 font-mono text-sm">{formatRupiah(items.reduce((s, i) => s + i.qty * i.hargaEstimasi, 0))}</span>
                  </div>
                  {catatan && <div className="flex justify-between text-xs"><span className="text-slate-500">Catatan</span><span className="text-slate-700 text-right max-w-[60%]">{catatan}</span></div>}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-3">
              <button onClick={() => { if (step === 1) setShowWizard(false); else setStep(s => s - 1) }} className="flex-1 py-2.5 clay-btn text-xs font-bold text-slate-600">
                {step === 1 ? 'Batal' : 'Kembali'}
              </button>
              <button
                onClick={() => { if (step < 3) setStep(s => s + 1); else savePO() }}
                disabled={step === 1 && !supplierId || step === 2 && items.length === 0}
                className="flex-1 py-2.5 clay-btn-primary text-xs font-bold disabled:opacity-50"
              >
                {step < 3 ? 'Lanjut' : 'Terbitkan PO'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
