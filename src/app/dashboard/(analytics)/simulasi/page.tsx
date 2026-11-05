'use client'

import Topbar from '@/components/Topbar'
import DapiHead from '@/components/ui/DapiHead'
import { useSimulasi } from './hooks/useSimulasi'
import { SimTab } from './types'
import TabPenjualan from './components/TabPenjualan'
import TabSupplier from './components/TabSupplier'
import TabSupply from './components/TabSupply'
import { TrendingUp, Truck, Package, RefreshCw, AlertCircle, Calculator } from 'lucide-react'
import clsx from 'clsx'
import { RekomendasiSkeleton } from '@/components/ui/Skeleton'

const STATUS_CARDS = [
  {
    key: 'penjualan' as const,
    label: 'Simulasi Penjualan',
    hint: 'Proyeksi omzet & laba menu',
    Icon: TrendingUp,
    tint: 'bg-[#FFEDB3]',
    on: 'bg-kuning text-kopi',
  },
  {
    key: 'supplier' as const,
    label: 'Harga Supplier',
    hint: 'Simulasi fluktuasi harga bahan',
    Icon: Truck,
    tint: 'bg-[#F2D9CC]',
    on: 'bg-[#C2502F] text-white',
  },
  {
    key: 'supply' as const,
    label: 'Kecukupan Stok',
    hint: 'Cek kesiapan batch porsi masak',
    Icon: Package,
    tint: 'bg-[#E2EBC0]',
    on: 'bg-[#7F9A2E] text-white',
  },
] as const

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
    <div className="flex-1 pb-16">
      <Topbar
        title="Simulasi Dapur & Untung"
        subtitle="Uji perkiraan untung jika target porsi dinaikkan atau jika harga bahan di pasar berubah"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-7 max-w-6xl mx-auto">
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

        {/* Banner utama: Dapi keluar dari kotak */}
        <section className="relative mt-10 sm:mt-12 rounded-[36px] bg-gradient-to-br from-[#FFC93C] via-kuning to-[#FF9A1F] shadow-[0_22px_40px_rgba(220,130,0,0.28),inset_0_-10px_0_rgba(170,90,0,0.12)]">
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[36px]">
            <span className="absolute right-[18%] -top-24 h-80 w-80 rounded-full bg-white/20" />
            <span className="absolute -right-14 -bottom-28 h-72 w-72 rounded-full bg-koral/25" />
            <span className="absolute left-[46%] bottom-6 h-4 w-4 rounded-full bg-white/70" />
            <span className="absolute left-[52%] top-8 h-2.5 w-2.5 rounded-full bg-koral/60" />
          </div>

          <div className="relative flex flex-col gap-3 p-6 sm:p-10 md:max-w-[58%]">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-none text-kopi">
              {activeTabMeta.title}
            </h2>
            <p className="text-sm sm:text-base text-[#5A3A00] leading-snug">
              {activeTabMeta.subtitle}
            </p>
            <div className="mt-2 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={refresh}
                disabled={isLoading}
                className="h-11 px-5 rounded-full bg-kopi text-white text-sm font-bold flex items-center gap-2 shadow-[0_8px_18px_rgba(43,34,28,0.3)] hover:-translate-y-0.5 transition-transform cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                <RefreshCw className={clsx('w-4 h-4 flex-shrink-0', isLoading && 'animate-spin')} />
                Perbarui Kalkulasi
              </button>
              <div className="h-11 px-5 rounded-full bg-white/60 text-kopi text-sm font-bold flex items-center gap-2 backdrop-blur-xs whitespace-nowrap">
                <span>Menu Aktif:</span>
                <span className="font-mono font-black text-kopi">{menus.length}</span>
              </div>
              <div className="h-11 px-5 rounded-full bg-white/60 text-kopi text-sm font-bold flex items-center gap-2 backdrop-blur-xs whitespace-nowrap">
                <span>Bahan Terhubung:</span>
                <span className="font-mono font-black text-[#7F9A2E]">{bahanList.length}</span>
              </div>
            </div>
          </div>

          {/* Kartu simulasi miring (dekorasi) */}
          <div aria-hidden className="hidden lg:flex absolute right-[300px] -top-8 w-36 -rotate-[8deg] flex-col gap-2 rounded-2xl bg-white p-4 shadow-[0_18px_30px_rgba(120,60,0,0.25)]">
            <span className="text-[11px] font-black text-koral-gelap tracking-wider">SIMULASI</span>
            <span className="h-2 rounded bg-krim-garis" />
            <span className="h-2 w-[70%] rounded bg-krim-garis" />
            <span className="h-2 w-[85%] rounded bg-krim-garis" />
          </div>

          {/* Dapi menyembul keluar dari atas kotak */}
          <div aria-hidden className="hidden md:block absolute right-8 lg:right-14 bottom-0 leading-[0] drop-shadow-[0_18px_22px_rgba(120,50,0,0.35)]">
            <DapiHead size={220} />
          </div>
        </section>

        {/* Status Flow Stats Card Identik PO: 2 card per row di mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {STATUS_CARDS.map(st => {
            const active = tab === st.key
            return (
              <button
                key={st.key}
                type="button"
                onClick={() => setTab(st.key)}
                className={clsx(
                  'relative overflow-hidden rounded-[24px] sm:rounded-[28px] p-3.5 sm:p-5 text-left flex flex-col justify-between min-h-[125px] sm:min-h-[140px] transition-all cursor-pointer hover:-translate-y-0.5',
                  active
                    ? clsx(st.on, 'shadow-[0_18px_30px_rgba(43,34,28,0.22)]')
                    : clsx(st.tint, 'text-kopi shadow-[0_6px_14px_rgba(120,80,30,0.08)]')
                )}
              >
                <span
                  aria-hidden
                  className={clsx(
                    'absolute -right-10 -bottom-12 h-36 w-36 rounded-full',
                    active ? 'bg-white/20' : 'bg-white/55'
                  )}
                />
                <div className="relative flex items-center justify-between">
                  <span className="text-xs sm:text-base font-extrabold line-clamp-1">{st.label}</span>
                  <span
                    className={clsx(
                      'h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center flex-shrink-0',
                      active ? 'bg-white/30' : 'bg-white/60'
                    )}
                  >
                    <st.Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </span>
                </div>
                <div className="relative mt-2">
                  <p className="text-xl sm:text-3xl font-black tracking-tight leading-none font-mono">
                    {st.key === 'penjualan'
                      ? `${menus.length} Menu`
                      : st.key === 'supplier'
                      ? `${bahanList.length} Bahan`
                      : 'Kesiapan Stok'}
                  </p>
                  <p className={clsx('text-[11px] sm:text-xs mt-1 truncate', active ? 'opacity-85' : 'text-kopi-muted')}>
                    {st.hint}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Loading State or Tab Content */}
        {isLoading && !menus.length && !bahanList.length ? (
          <RekomendasiSkeleton count={3} />
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
