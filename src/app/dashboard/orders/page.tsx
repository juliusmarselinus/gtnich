'use client'

import { useState } from 'react'
import Topbar from '@/components/Topbar'
import OrderTable from '@/components/OrderTable'
import ReceiptDrawer from '@/components/ReceiptDrawer'
import { orders as initialOrders, Order, OrderStatus } from '@/lib/mock-data'
import { Plus, Search } from 'lucide-react'
import clsx from 'clsx'

const tabs: { label: string; value: 'all' | OrderStatus }[] = [
  { label: 'Semua Pesanan', value: 'all' },
  { label: 'Menunggu', value: 'menunggu' },
  { label: 'Diproses', value: 'diproses' },
  { label: 'Dikirim', value: 'dikirim' },
  { label: 'Selesai', value: 'selesai' },
]

export default function OrdersPage() {
  const [ordersList, setOrdersList] = useState<Order[]>(initialOrders)
  const [activeTab, setActiveTab] = useState<'all' | OrderStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const handleUpdateStatus = (id: string, newStatus: OrderStatus) => {
    setOrdersList((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    )
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null))
    }
  }

  const filteredOrders = ordersList.filter((ord) => {
    const matchesTab = activeTab === 'all' ? true : ord.status === activeTab
    const matchesSearch =
      ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesTab && matchesSearch
  })

  return (
    <div className="flex-1 pb-20 bg-white min-h-screen">
      <Topbar
        title="Manajemen Pesanan"
        subtitle="Kelola dan verifikasi order dari WhatsApp, Web, dan Toko Fisik"
        onSearch={(t) => setSearchQuery(t)}
      />

      <main className="p-8 space-y-6 max-w-7xl mx-auto">
        {/* Top Controls: Search Bar & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-[480px]">
            <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama, produk, atau ID pesanan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-300 rounded-2xl text-xs font-semibold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300 shadow-2xs transition-all"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-800 font-bold text-xs rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4 text-neutral-700" />
            <span>Tambah Pesanan Manual</span>
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const count =
              tab.value === 'all'
                ? ordersList.length
                : ordersList.filter((o) => o.status === tab.value).length
            const isActive = activeTab === tab.value

            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={clsx(
                  'px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border',
                  isActive
                    ? 'bg-white text-neutral-900 border-neutral-800 shadow-sm'
                    : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-500 hover:text-neutral-900'
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={clsx(
                    'font-mono text-[11px]',
                    isActive ? 'text-neutral-900 font-black' : 'text-neutral-400'
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Garis Horizontal Panjang di bawah Tab dengan ketebalan 1.5px */}
        <div className="border-b-[1.5px] border-[#383838] -mx-8 sm:mx-0" />

        {/* Outer Card Box dengan garis 1.5px warna tegas #383838 dan rounded-[24px] */}
        <div className="bg-white rounded-[24px] border-[1.5px] border-[#383838] shadow-2xs overflow-hidden">
          <OrderTable
            orders={filteredOrders}
            selectedOrderId={selectedOrder?.id}
            onSelectOrder={(ord) => setSelectedOrder(ord)}
          />
        </div>
      </main>

      {/* Slide-over Drawer for Receipt */}
      <ReceiptDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      {/* Manual Order Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-neutral-300 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-black text-sm text-neutral-900">Tambah Pesanan Manual</h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-neutral-600 text-xs font-mono font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-700 block mb-1 font-bold">Nama Pembeli</label>
                <input
                  type="text"
                  placeholder="Contoh: Bu Anita (Catering)"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none"
                />
              </div>
              <div>
                <label className="text-neutral-700 block mb-1 font-bold">Saluran Pesanan</label>
                <select className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none">
                  <option>WhatsApp</option>
                  <option>Toko Offline</option>
                  <option>Web Store</option>
                </select>
              </div>
              <div>
                <label className="text-neutral-700 block mb-1 font-bold">Metode Pembayaran</label>
                <select className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none">
                  <option>Transfer BCA</option>
                  <option>QRIS</option>
                  <option>Tunai / Cash</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  alert('Pesanan berhasil dicatat!')
                  setShowAddModal(false)
                }}
                className="flex-1 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl"
              >
                Simpan Transaksi
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 text-xs font-bold rounded-xl border border-neutral-300"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
