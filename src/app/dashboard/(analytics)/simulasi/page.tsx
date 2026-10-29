'use client'

import Topbar from '@/components/Topbar'
import { useSimulasi } from './hooks/useSimulasi'
import { SimTab } from './types'
import TabPenjualan from './components/TabPenjualan'
import TabSupplier from './components/TabSupplier'
import TabSupply from './components/TabSupply'
import { TrendingUp, Truck, Package, RefreshCw, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

export default function SimulasiPage() {
  const {
    tab,
    setTab,
    menus,
    bahanList,
    isLoading,
    error,
    refresh,

    selMenu,
    setSelMenu,
    qty,
    setQty,

    selBahan,
    setSelBahan,
    pctChange,
    setPctChange,

    selMenuSupply,
    setSelMenuSupply,
    servings,
    setServings,
  } = useSimulasi()

  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Simulasi Dapur & Bisnis"
        subtitle="Eksplorasi proyeksi keuntungan penjualan, perubahan harga bahan baku distributor, dan kecukupan supply berbasis database"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-7 max-w-5xl mx-auto">
        {/* Navigation Tabs and Refresh Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2.5">
            {[
              { key: 'penjualan', label: 'Simulasi Penjualan', icon: TrendingUp },
              { key: 'supplier', label: 'Simulasi Harga Supplier', icon: Truck },
              { key: 'supply', label: 'Simulasi Kecukupan Supply', icon: Package },
            ].map(t => {
              const Icon = t.icon
              const active = tab === t.key
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key as SimTab)}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer',
                    active
                      ? 'clay-btn-primary'
                      : 'clay-btn text-slate-600 hover:text-slate-900'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={isLoading}
            className="px-3.5 py-2 clay-btn rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 flex items-center gap-2 cursor-pointer disabled:opacity-50 self-end sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Perbarui Data</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold">Gagal Mengambil Data Menu & Bahan</p>
              <p className="text-[11px] text-rose-600 mt-0.5">{error}</p>
            </div>
            <button
              onClick={refresh}
              className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && !menus.length && !bahanList.length ? (
          <div className="clay-card p-8 space-y-4">
            <div className="h-6 w-56 bg-slate-200 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
              <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
            </div>
          </div>
        ) : (
          <>
            {/* Simulasi Penjualan */}
            {tab === 'penjualan' && (
              <TabPenjualan
                menus={menus}
                selMenu={selMenu}
                onSelectMenu={setSelMenu}
                qty={qty}
                onChangeQty={setQty}
              />
            )}

            {/* Simulasi Supplier */}
            {tab === 'supplier' && (
              <TabSupplier
                bahanList={bahanList}
                menus={menus}
                selBahan={selBahan}
                onSelectBahan={setSelBahan}
                pctChange={pctChange}
                onChangePct={setPctChange}
              />
            )}

            {/* Simulasi Supply */}
            {tab === 'supply' && (
              <TabSupply
                menus={menus}
                selMenuSupply={selMenuSupply}
                onSelectMenuSupply={setSelMenuSupply}
                servings={servings}
                onChangeServings={setServings}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}
