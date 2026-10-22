'use client'

import { useState } from 'react'
import Topbar from '@/components/Topbar'
import { customers as initialCustomers, formatRupiah, Customer } from '@/lib/mock-data'
import { Search, MessageSquare } from 'lucide-react'

export default function CustomersPage() {
  const [customerList, setCustomerList] = useState<Customer[]>(initialCustomers)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCustomers = customerList.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  )

  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Daftar Pelanggan"
        subtitle="Riwayat loyalitas dan kanal komunikasi WhatsApp"
        onSearch={(t) => setSearchQuery(t)}
      />

      <main className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#9C9589] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari pelanggan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#FFFFFF] border border-[#EAE5DF] rounded-lg text-xs text-[#1F1D1A] placeholder:text-[#9C9589] focus:outline-none focus:border-[#3E6B48]"
            />
          </div>
          <span className="text-xs font-mono text-[#6B665F]">
            {customerList.length} kontak tersimpan
          </span>
        </div>

        <div className="bg-[#FFFFFF] rounded-xl border border-[#EAE5DF] shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#EAE5DF] text-[#6B665F] uppercase tracking-wider text-[10px] font-semibold">
                <th className="py-3 px-4">Nama Pelanggan</th>
                <th className="py-3 px-4">Kontak</th>
                <th className="py-3 px-4 text-center">Total Belanja</th>
                <th className="py-3 px-4 text-right">Akumulasi Nilai</th>
                <th className="py-3 px-4 text-center">Terakhir</th>
                <th className="py-3 px-4 text-center">Kanal WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F0EB]">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="py-3.5 px-4 font-medium text-[#1F1D1A]">
                    {cust.name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#6B665F]">
                    {cust.phone}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-[#1F1D1A]">
                    {cust.totalOrders} order
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-[#1F1D1A]">
                    {formatRupiah(cust.totalSpent)}
                  </td>
                  <td className="py-3.5 px-4 text-center text-[#9C9589] text-[11px]">
                    {cust.lastOrder}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <a
                      href={`https://wa.me/?text=Halo%20kak%20${encodeURIComponent(cust.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#3E6B48] hover:underline"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Kirim Pesan</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
