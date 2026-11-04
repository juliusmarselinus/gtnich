'use client'

import Topbar from '@/components/Topbar'
import DapiMascot from '@/components/ui/DapiMascot'
import { useSimulasi } from './hooks/useSimulasi'
import { SimTab } from './types'
import TabPenjualan from './components/TabPenjualan'
import TabSupplier from './components/TabSupplier'
import TabSupply from './components/TabSupply'
import { TrendingUp, Truck, Package, RefreshCw, AlertCircle, Calculator } from 'lucide-react'
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

  const tabsConfig = [
    { key: 'penjualan' as const, label: 'Simulasi Penjualan', icon: TrendingUp },
    { key: 'supplier' as const, label: 'Simulasi Harga Supplier', icon: Truck },
    { key: 'supply' as const, label: 'Simulasi Kecukupan Supply', icon: Package },
  ]

  const activeTabMeta = {
    penjualan: {
      title: 'Kalkulasi Potensi Laba Penjualan',
      subtitle: `Hitung estimasi omzet kotor, beban HPP resep, dan margin bersih dari ${menus.length} menu aktif.`,
    },
    supplier: {
      title: 'Uji Skenario Fluktuasi Harga Pasar',
      subtitle: `Uji dampak kenaikan atau penurunan harga dari ${bahanList.length} bahan distributor ke HPP menu.`,
    },
    supply: {
      title: 'Cek Kesiapan Stok Batch Produksi',
      subtitle: 'Pastikan persediaan bahan baku di gudang mencukupi sebelum memulai proses memasak skala besar.',
    },
  }[tab]

  return (
    <div className="flex-1 pb-24 lg:pb-16">
      <Topbar
        title="Simulasi Dapur & Bisnis"
        subtitle="Eksplorasi proyeksi keuntungan penjualan, perubahan harga bahan baku distributor, dan kecukupan supply berbasis database"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
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

        {/* Hero Section dengan Maskot Dapi */}
        <section className="relative overflow-hidden rounded-[28px] bg-[#FFB800] px-6 py-6 sm:px-8 sm:py-7 min-h-[180px] shadow-xs">
          <div className="absolute right-48 top-5 w-16 h-16 rounded-full bg-[#FF7A59] hidden md:block opacity-80" />
          <div className="absolute right-36 top-16 w-28 h-8 rounded-full bg-white/90 hidden md:block" />

          {/* Maskot Dapi */}
          <div className="absolute right-4 sm:right-8 bottom-0 pointer-events-none">
            <DapiMascot
              width={150}
              mood="senang"
              className="translate-y-6 drop-shadow-xs"
            />
          </div>

          <div className="relative space-y-3 pr-28 sm:pr-48">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#2B1D00]/10 flex items-center justify-center text-[#2B1D00]">
                <Calculator className="w-3.5 h-3.5" />
              </span>
              <p className="text-xs font-bold uppercase tracking-wider text-[#5C3D00]">
                Simulator Keuangan & Produksi
              </p>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2B1D00] tracking-tight leading-tight">
              {activeTabMeta.title}
            </h2>

            <p className="text-xs sm:text-sm text-[#4D3300] font-medium max-w-xl">
              {activeTabMeta.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-[#2B1D00] shadow-xs">
                {menus.length} menu siap jual
              </span>

              <span className="inline-flex items-center rounded-full bg-white/80 backdrop-blur-xs px-3.5 py-1.5 text-xs font-bold text-[#2B1D00]">
                {bahanList.length} bahan baku terhubung
              </span>
            </div>
          </div>
        </section>

        {/* Navigation Tabs and Refresh Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {tabsConfig.map(t => {
              const Icon = t.icon
              const active = tab === t.key
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
                    active
                      ? 'bg-[#2B261F] text-white shadow-xs'
                      : 'bg-white text-[#7A7062] border border-[#EBE6DC] hover:bg-[#FFF9EC]'
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
            className="px-4 py-2.5 rounded-full bg-white border border-[#EBE6DC] text-xs font-bold text-[#7A7062] hover:text-[#2B261F] hover:bg-[#FFF9EC] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#FF6B00]' : ''}`} />
            <span>Perbarui Data</span>
          </button>
        </div>

        {/* Loading State or Tab Content */}
        {isLoading && !menus.length && !bahanList.length ? (
          <div className="rounded-[32px] bg-white border border-[#EBE6DC] p-16 flex flex-col items-center justify-center gap-3 text-slate-500 shadow-xs">
            <RefreshCw className="w-7 h-7 animate-spin text-[#FF6B00]" />
            <p className="text-xs font-semibold text-[#7A7062]">
              Memuat data kalkulasi menu & bahan...
            </p>
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
