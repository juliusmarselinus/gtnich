'use client'

import Badge from '@/components/ui/Badge'
import { Order, formatRupiah } from '@/lib/mock-data'
import { Receipt } from 'lucide-react'

interface OrderTableProps {
  orders: Order[]
  selectedOrderId?: string
  onSelectOrder: (order: Order) => void
}

export default function OrderTable({
  orders,
  selectedOrderId,
  onSelectOrder,
}: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-20 text-neutral-400 text-xs">
        Tidak ada transaksi yang cocok dengan filter pencarian.
      </div>
    )
  }

  return (
    <div className="px-5 py-4 w-full">
      {/* Table fixed-layout agar pas 100% dengan lebar layar dan TIDAK scroll kanan-kiri */}
      <table className="w-full table-fixed text-left text-xs border-collapse">
        <thead>
          <tr className="border-b-[1.5px] border-[#383838] text-neutral-800 uppercase tracking-wider text-[11px] font-extrabold">
            <th className="py-3 px-2 w-[10%]">ID</th>
            <th className="py-3 px-3 w-[22%]">PELANGGAN</th>
            <th className="py-3 px-3 w-[25%]">PRODUK</th>
            <th className="py-3 px-2 w-[12%] text-center">CHANNEL</th>
            <th className="py-3 px-2 w-[11%] text-right pr-2">TOTAL</th>
            <th className="py-3 px-2 w-[11%] text-center">STATUS</th>
            <th className="py-3 px-2 w-[9%] text-center">STRUK</th>
          </tr>
        </thead>
        <tbody className="divide-y-[1.5px] divide-[#383838]">
          {orders.map((order) => {
            const isSelected = selectedOrderId === order.id
            return (
              <tr
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className={`transition-colors cursor-pointer group ${
                  isSelected ? 'bg-neutral-100/80' : 'hover:bg-neutral-50/70'
                }`}
              >
                {/* ID PESANAN */}
                <td className="py-4 px-2 font-mono text-neutral-900 font-bold text-xs">
                  <span className="bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-300">
                    {order.id}
                  </span>
                </td>

                {/* PELANGGAN */}
                <td className="py-4 px-3 truncate">
                  <p className="font-extrabold text-neutral-900 text-sm leading-tight truncate">
                    {order.customerName}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5 font-medium truncate">
                    {order.createdAt}
                  </p>
                </td>

                {/* PRODUK YANG DIPESAN */}
                <td className="py-4 px-3 truncate">
                  <p className="text-neutral-900 font-bold text-xs truncate">
                    {order.items[0]?.name}
                  </p>
                  <p className="text-[11px] text-neutral-500 font-medium mt-0.5 truncate">
                    {order.qtyTotal} pcs • {formatRupiah(order.items[0]?.price)}
                    {order.items.length > 1 && ` (+${order.items.length - 1})`}
                  </p>
                </td>

                {/* CHANNEL */}
                <td className="py-4 px-2 text-center">
                  <Badge status={order.channel} />
                </td>

                {/* TOTAL */}
                <td className="py-4 px-2 text-right pr-2 font-extrabold text-neutral-900 font-mono text-xs">
                  {formatRupiah(order.totalPrice)}
                </td>

                {/* STATUS */}
                <td className="py-4 px-2 text-center">
                  <Badge status={order.status} />
                </td>

                {/* STRUK BUTTON (Ringkas dan tidak menabrak status) */}
                <td className="py-4 px-2 text-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectOrder(order)
                    }}
                    className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 text-[11px] font-bold shadow-2xs transition-all active:scale-95"
                  >
                    <Receipt className="w-3.5 h-3.5 text-neutral-700" />
                    <span>Struk</span>
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
