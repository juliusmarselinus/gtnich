'use client'

import { useState } from 'react'
import Topbar from '@/components/Topbar'
import ProductTable from '@/components/ProductTable'
import { products as initialProducts, Product } from '@/lib/mock-data'
import { Plus, Search } from 'lucide-react'

export default function ProductsPage() {
  const [productList, setProductList] = useState<Product[]>(initialProducts)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  const handleAddStock = (id: string) => {
    setProductList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: p.stock + 10 } : p))
    )
  }

  const filteredProducts = productList.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const lowStockCount = productList.filter((p) => p.stock < 5).length

  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Katalog & Stok"
        subtitle="Manajemen persediaan barang gudang dan rak toko"
        onSearch={(t) => setSearchQuery(t)}
      />

      <main className="p-8 space-y-6 max-w-7xl mx-auto">
        {/* Subtle low-stock hint */}
        {lowStockCount > 0 && (
          <div className="p-4 bg-[#FAEDE8] border border-[#F0D4C9] rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#C85A32]">
                {lowStockCount} Produk Berada di Bawah Batas Aman
              </p>
              <p className="text-[11px] text-[#6B665F] mt-0.5">
                Segera pasok ulang stok agar operasional pemenuhan pesanan tidak terganggu.
              </p>
            </div>
            <button
              onClick={() => {
                setProductList((prev) =>
                  prev.map((p) => (p.stock < 5 ? { ...p, stock: p.stock + 20 } : p))
                )
              }}
              className="px-3 py-1.5 bg-[#C85A32] hover:bg-[#b04f2c] text-white text-xs font-medium rounded-lg transition-colors"
            >
              Restock Semua (+20)
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#9C9589] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari SKU, camilan, minuman..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#FFFFFF] border border-[#EAE5DF] rounded-lg text-xs text-[#1F1D1A] placeholder:text-[#9C9589] focus:outline-none focus:border-[#3E6B48]"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 bg-[#3E6B48] hover:bg-[#34593c] text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Item Baru</span>
          </button>
        </div>

        {/* Product Cards */}
        <ProductTable products={filteredProducts} onAddStock={handleAddStock} />
      </main>

      {/* Minimal Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F1D1A]/25 backdrop-blur-[2px]">
          <div className="bg-[#FFFFFF] rounded-xl p-6 max-w-sm w-full border border-[#EAE5DF] shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-sm text-[#1F1D1A]">Tambah Item Produk</h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#9C9589] hover:text-[#1F1D1A] text-xs font-mono"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#6B665F] block mb-1">Nama Produk</label>
                <input
                  type="text"
                  placeholder="Contoh: Kopi Robusta Gayo 200g"
                  className="w-full px-3 py-1.5 border border-[#EAE5DF] rounded-lg focus:outline-none focus:border-[#3E6B48]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#6B665F] block mb-1">Kategori</label>
                  <input
                    type="text"
                    placeholder="Minuman"
                    className="w-full px-3 py-1.5 border border-[#EAE5DF] rounded-lg focus:outline-none focus:border-[#3E6B48]"
                  />
                </div>
                <div>
                  <label className="text-[#6B665F] block mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    placeholder="55000"
                    className="w-full px-3 py-1.5 border border-[#EAE5DF] rounded-lg focus:outline-none focus:border-[#3E6B48]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  alert('Item baru berhasil masuk katalog!')
                  setShowAddModal(false)
                }}
                className="flex-1 py-1.5 bg-[#3E6B48] hover:bg-[#34593c] text-white text-xs font-medium rounded-lg"
              >
                Simpan Item
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 bg-[#FAF8F5] text-[#6B665F] hover:bg-[#F4F0EB] text-xs rounded-lg border border-[#EAE5DF]"
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
