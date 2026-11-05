'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import Topbar from '@/components/Topbar'
import ReceiptDrawer from '@/components/ReceiptDrawer'
import type { Order } from '@/lib/mock-data'
import { useDashboard } from './hooks/useDashboard'
import type { DashboardRecentOrder } from './services/dashboardService'
import DapiTasksCard from './components/DapiTasksCard'
import OmzetCard from './components/OmzetCard'
import KembaranCard from './components/KembaranCard'
import ActiveOrderStrip from './components/ActiveOrderStrip'
import LowStockCard from './components/LowStockCard'
import WeeklyRevenueCard from './components/WeeklyRevenueCard'
import RecentOrdersCard from './components/RecentOrdersCard'
import BestSellerCard from './components/BestSellerCard'
import ModuleCatalog from './components/ModuleCatalog'

function sapaan(hour: number) {
  if (hour >= 4 && hour < 11) return 'Selamat pagi'
  if (hour >= 11 && hour < 15) return 'Selamat siang'
  if (hour >= 15 && hour < 18) return 'Selamat sore'
  return 'Selamat malam'
}

function toReceiptOrder(ord: DashboardRecentOrder): Order {
  return {
    id: ord.id,
    invoiceNumber: ord.invoiceNumber,
    customerName: ord.customerName,
    customerPhone: ord.customerPhone || '-',
    channel: ord.channel as any,
    status: ord.status as any,
    paymentMethod: ord.paymentMethod as any,
    paymentStatus: ord.paymentStatus as any,
    subtotal: ord.totalPrice,
    discount: 0,
    shippingFee: 0,
    totalPrice: ord.totalPrice,
    qtyTotal: ord.items.reduce((sum, item) => sum + item.qty, 0),
    cashierName: 'Kasir Dapur',
    createdAt: ord.createdAt,
    items: ord.items.map(item => ({
      id: item.id,
      productId: item.id,
      name: item.namaMenu,
      price: item.hargaJual,
      qty: item.qty,
      subtotal: item.subtotal,
    })),
  }
}

export default function DashboardPage() {
  const { data, isLoading, error, refresh } = useDashboard()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)

  useEffect(() => {
    if (data && !isLoading) setUpdatedAt(new Date())
  }, [data, isLoading])

  const now = useMemo(() => new Date(), [])
  const firstName = (data?.profile.ownerName || '').split(' ')[0]
  const title = `${sapaan(now.getHours())}${firstName ? `, ${firstName}` : ''}`
  const subtitle = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })

  const openOrder = (o: DashboardRecentOrder) => setSelectedOrder(toReceiptOrder(o))

  return (
    <div className="flex-1 pb-16">
      <Topbar
        title={title}
        subtitle={data?.profile.storeName ? `${subtitle} · ${data.profile.storeName}` : subtitle}
        actions={
          <button
            type="button"
            onClick={refresh}
            disabled={isLoading}
            aria-label={updatedAt ? `Segarkan data, terakhir ${updatedAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` : 'Segarkan data'}
            className="flex h-11 items-center gap-2 rounded-full bg-white px-3.5 text-[13px] font-semibold text-kopi hover:bg-kuning-muda disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {updatedAt ? updatedAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Segarkan'}
            </span>
          </button>
        }
      />

      <main className="mx-auto flex max-w-[1240px] flex-col gap-4 px-4 pt-2 sm:px-6 md:px-8">
        {error && (
          <div role="alert" className="flex items-center justify-between gap-3 rounded-2xl bg-koral-muda p-4 text-sm text-[#8F2A14]">
            <span className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </span>
            <button
              type="button"
              onClick={refresh}
              className="rounded-full bg-koral px-4 py-1.5 text-xs font-bold text-white hover:bg-koral-gelap"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* Baris 1: tugas Dapi + omzet & kembaran */}
        <div className="flex flex-wrap items-stretch gap-4">
          <div data-tour="overview-tasks" className="flex min-w-0 flex-[3_1_400px]">
            <DapiTasksCard
              tasks={data?.tasks || []}
              lowStockItems={data?.lowStockItems || []}
              isLoading={isLoading && !data}
            />
          </div>
          <div data-tour="overview-omzet" className="flex min-w-0 flex-[2_1_300px] flex-col gap-4">
            <OmzetCard metrics={data?.metrics} hourlyToday={data?.hourlyToday || new Array(8).fill(0)} isLoading={isLoading && !data} />
            <KembaranCard forecast={data?.forecast} />
          </div>
        </div>

        {/* Baris 2: pesanan berjalan */}
        <div data-tour="overview-active-orders">
          <ActiveOrderStrip activeOrders={data?.activeOrders || []} onOpen={openOrder} />
        </div>

        {/* Baris 3: ringkasan */}
        <div data-tour="overview-summary-cards" className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <LowStockCard items={data?.lowStockItems || []} />
          <WeeklyRevenueCard days={data?.revenueChart || []} />
          <RecentOrdersCard orders={data?.recentOrders || []} onSelect={openOrder} />
          <BestSellerCard items={data?.bestSellers || []} />
        </div>

        {/* Baris 4: semua fitur */}
        <ModuleCatalog />
      </main>

      <ReceiptDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  )
}
