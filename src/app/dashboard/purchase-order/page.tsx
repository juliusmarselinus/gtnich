'use client'

import { useState } from 'react'
import Topbar from '@/components/Topbar'
import { purchaseOrders as initialPOs, bahanList, suppliers, PurchaseOrder, POItem, POStatus } from '@/lib/dapur-data'
import { formatRupiah } from '@/lib/mock-data'
import { Plus, ChevronDown, ChevronUp, X } from 'lucide-react'
import clsx from 'clsx'

const STATUS_CONFIG: Record<POStatus, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  dikirim: { label: 'Dikirim', cls: 'bg-blue-50 text-blue-600 border-blue-200' },
  diterima: { label: 'Diterima', cls: 'bg-[#EAF0EC] text-[#3E6B48] border-[#C5DBC9]' },
  tagihan: { label: 'Tagihan', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
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
      <Topbar title="Purchase Order" subtitle="Buat dan kelola PO pembelian bahan baku dari supplier" />

      <main className="p-8 space-y-6 max-w-6xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(['draft', 'dikirim', 'diterima', 'tagihan'] as POStatus[]).map(st => (
            <div key={st} className="bg-white rounded-xl border border-[#EAE5DF] shadow-2xs p-4 text-center">
              <p className="text-[10px] font-bold text-[#9C9589] uppercase tracking-wider mb-1">{STATUS_CONFIG[st].label}</p>
              <p className="text-2xl font-bold text-[#1F1D1A]">{list.filter(p => p.status === st).length}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button onClick={openWizard} className="flex items-center gap-2 px-4 py-2 bg-[#3E6B48] text-white text-xs font-semibold rounded-xl hover:bg-[#345a3d] transition-colors">
            <Plus className="w-4 h-4" /> Buat PO Baru
          </button>
        </div>

        {/* PO List */}
        <div className="bg-white rounded-xl border border-[#EAE5DF] shadow-2xs overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#EAE5DF] bg-[#FAF8F5]">
                <th className="text-left px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">No. PO</th>
                <th className="text-left px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Supplier</th>
                <th className="text-left px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Tanggal</th>
                <th className="text-center px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3.5 font-semibold text-[#9C9589] uppercase tracking-wider">Total</th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F0EB]">
              {list.map(po => {
                const cfg = STATUS_CONFIG[po.status]
                const exp = expandedId === po.id
                return (
                  <>
                    <tr key={po.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-mono font-semibold text-[#1F1D1A]">{po.noPO}</p>
                        {po.catatan && <p className="text-[10px] text-[#9C9589] mt-0.5 truncate max-w-[180px]">{po.catatan}</p>}
                      </td>
                      <td className="px-5 py-4 font-medium text-[#1F1D1A]">{po.namaSupplier}</td>
                      <td className="px-5 py-4 text-[#9C9589]">{po.tanggalBuat}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={clsx('inline-flex px-2 py-1 rounded-lg border text-[11px] font-semibold', cfg.cls)}>{cfg.label}</span>
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-semibold text-[#1F1D1A]">
                        {formatRupiah(po.totalAktual > 0 ? po.totalAktual : po.totalEstimasi)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => setExpandedId(exp ? null : po.id)} className="p-1.5 rounded-lg hover:bg-[#EAE5DF] text-[#9C9589]">
                          {exp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                    {exp && (
                      <tr key={`${po.id}-detail`} className="bg-[#FAF8F5]">
                        <td colSpan={6} className="px-8 py-4">
                          <p className="text-[10px] font-bold text-[#9C9589] uppercase tracking-wider mb-3">Detail Item</p>
                          <div className="space-y-2">
                            {po.items.map((item, i) => (
                              <div key={i} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-[#EAE5DF]">
                                <div>
                                  <p className="text-xs font-medium text-[#1F1D1A]">{item.namaBahan}</p>
                                  <p className="text-[10px] text-[#9C9589]">{item.qty} {item.satuan} × {formatRupiah(item.hargaEstimasi)}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-mono font-semibold text-[#1F1D1A]">{formatRupiah(item.qty * item.hargaEstimasi)}</p>
                                  <span className={clsx('text-[10px] font-medium', item.diterima ? 'text-[#3E6B48]' : 'text-amber-600')}>{item.diterima ? '✓ Diterima' : '○ Menunggu'}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-5">
            {/* Step Indicator */}
            <div className="flex items-center gap-2">
              {['Pilih Supplier', 'Tambah Item', 'Konfirmasi'].map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={clsx('w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold', step > i + 1 ? 'bg-[#3E6B48] text-white' : step === i + 1 ? 'bg-[#3E6B48] text-white' : 'bg-[#EAE5DF] text-[#9C9589]')}>{i + 1}</div>
                  <span className={clsx('text-[11px] font-medium', step === i + 1 ? 'text-[#1F1D1A]' : 'text-[#9C9589]')}>{s}</span>
                  {i < 2 && <div className="flex-1 h-px bg-[#EAE5DF] mx-1" />}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#1F1D1A]">Pilih Supplier</h3>
                <div className="space-y-2">
                  {suppliers.map(s => (
                    <button key={s.id} onClick={() => setSupplierId(s.id)} className={clsx('w-full text-left px-4 py-3 rounded-xl border transition-all', supplierId === s.id ? 'border-[#3E6B48] bg-[#EAF0EC]' : 'border-[#EAE5DF] hover:bg-[#FAF8F5]')}>
                      <p className="text-xs font-semibold text-[#1F1D1A]">{s.nama}</p>
                      <p className="text-[10px] text-[#9C9589]">{s.kategori} • Min. {formatRupiah(s.minimalOrder)}</p>
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#9C9589] mb-1">Catatan (opsional)</label>
                  <input value={catatan} onChange={e => setCatatan(e.target.value)} className="w-full px-3 py-2 border border-[#EAE5DF] rounded-lg text-xs focus:outline-none focus:border-[#3E6B48]" placeholder="e.g. Urgent, kirim secepatnya" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#1F1D1A]">Tambah Item</h3>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#FAF8F5] rounded-lg px-3 py-2.5">
                      <div>
                        <p className="text-xs font-medium text-[#1F1D1A]">{item.namaBahan}</p>
                        <p className="text-[10px] text-[#9C9589]">{item.qty} {item.satuan} × {formatRupiah(item.hargaEstimasi)}</p>
                      </div>
                      <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 p-3 bg-[#FAF8F5] rounded-xl">
                  <p className="text-[11px] font-bold text-[#9C9589]">Tambah Bahan</p>
                  <select value={newItem.bahanId} onChange={e => { const b = bahanList.find(x => x.id === e.target.value); setNewItem(p => ({ ...p, bahanId: e.target.value, hargaEstimasi: b?.hargaPerSatuan ?? 0 })) }} className="w-full px-3 py-2 border border-[#EAE5DF] rounded-lg text-xs focus:outline-none focus:border-[#3E6B48]">
                    <option value="">-- Pilih Bahan --</option>
                    {bahanList.map(b => <option key={b.id} value={b.id}>{b.nama} (Stok: {b.stok} {b.satuan})</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-[#9C9589] font-medium">Qty</label>
                      <input type="number" value={newItem.qty || ''} onChange={e => setNewItem(p => ({ ...p, qty: Number(e.target.value) }))} className="w-full px-3 py-2 border border-[#EAE5DF] rounded-lg text-xs focus:outline-none focus:border-[#3E6B48]" />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#9C9589] font-medium">Harga Estimasi</label>
                      <input type="number" value={newItem.hargaEstimasi || ''} onChange={e => setNewItem(p => ({ ...p, hargaEstimasi: Number(e.target.value) }))} className="w-full px-3 py-2 border border-[#EAE5DF] rounded-lg text-xs focus:outline-none focus:border-[#3E6B48]" />
                    </div>
                  </div>
                  <button onClick={addItem} className="w-full py-2 bg-[#3E6B48] text-white rounded-lg text-xs font-semibold hover:bg-[#345a3d] flex items-center justify-center gap-1">
                    <Plus className="w-4 h-4" /> Tambah
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#1F1D1A]">Konfirmasi PO</h3>
                <div className="p-4 bg-[#FAF8F5] rounded-xl space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#9C9589]">Supplier</span>
                    <span className="font-semibold text-[#1F1D1A]">{suppliers.find(s => s.id === supplierId)?.nama}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#9C9589]">Jumlah Item</span>
                    <span className="font-semibold text-[#1F1D1A]">{items.length} bahan</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#9C9589]">Total Estimasi</span>
                    <span className="font-semibold text-[#3E6B48] font-mono">{formatRupiah(items.reduce((s, i) => s + i.qty * i.hargaEstimasi, 0))}</span>
                  </div>
                  {catatan && <div className="flex justify-between text-xs"><span className="text-[#9C9589]">Catatan</span><span className="text-[#1F1D1A] text-right max-w-[60%]">{catatan}</span></div>}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => { if (step === 1) setShowWizard(false); else setStep(s => s - 1) }} className="flex-1 py-2 border border-[#EAE5DF] rounded-xl text-xs font-semibold text-[#9C9589] hover:bg-[#FAF8F5]">
                {step === 1 ? 'Batal' : 'Kembali'}
              </button>
              <button
                onClick={() => { if (step < 3) setStep(s => s + 1); else savePO() }}
                disabled={step === 1 && !supplierId || step === 2 && items.length === 0}
                className="flex-1 py-2 bg-[#3E6B48] text-white rounded-xl text-xs font-semibold hover:bg-[#345a3d] disabled:opacity-50"
              >
                {step < 3 ? 'Lanjut' : 'Buat PO'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
