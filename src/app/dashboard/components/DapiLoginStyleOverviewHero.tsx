'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import DapiFace, { FaceMood } from '@/components/ui/DapiFace'
import {
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Receipt,
  Package,
  TrendingUp,
  ChevronRight,
  Check,
} from 'lucide-react'
import { formatRupiah } from '@/lib/mock-data'

interface DapiLoginStyleOverviewHeroProps {
  metrics?: {
    omzetHariIni: number
    omzetChange: string
    totalOrders: number
    lowStockCount: number
    totalMenus: number
  }
  lowStockItems?: Array<{
    id: string
    name: string
    satuan: string
    stock: number
    stockMinimum: number
  }>
  isLoading?: boolean
  onRefresh?: () => void
}

export default function DapiLoginStyleOverviewHero({
  metrics,
  lowStockItems = [],
  isLoading = false,
  onRefresh,
}: DapiLoginStyleOverviewHeroProps) {
  const [greeting, setGreeting] = useState('Selamat Datang')
  const [poked, setPoked] = useState(false)
  const [checklist, setChecklist] = useState({
    bumbu: true,
    kasir: true,
    po: false,
  })

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 4 && hour < 11) setGreeting('Selamat Pagi')
    else if (hour >= 11 && hour < 15) setGreeting('Selamat Siang')
    else if (hour >= 15 && hour < 18) setGreeting('Selamat Sore')
    else setGreeting('Selamat Malam')
  }, [])

  const lowCount = metrics?.lowStockCount ?? lowStockItems.length
  const ordersCount = metrics?.totalOrders ?? 0
  const omzetVal = metrics?.omzetHariIni ?? 0
  const totalMenus = metrics?.totalMenus ?? 0

  // Mood Dapi mengikuti login design system:
  // idle: kuning hangat, error: peach merah, success: biru langit gembira, loading: kuning cerah
  let mood: FaceMood = 'idle'
  let customSpeech = 'Dapur siap melayani pelanggan hari ini!'

  if (poked) {
    mood = 'peek'
    customSpeech = 'Siap bantu pantau pesanan & stok, Chef!'
  } else if (isLoading) {
    mood = 'loading'
    customSpeech = 'Sebentar, cek data dapur dulu...'
  } else if (lowCount > 0) {
    mood = 'error'
    const itemName = lowStockItems[0]?.name || 'bahan baku'
    customSpeech = `Yah, stok ${itemName} menipis! Perlu PO segera.`
  } else if (ordersCount > 0) {
    mood = 'success'
    customSpeech = `Yeay! Ada ${ordersCount} order (${formatRupiah(omzetVal)}).`
  }

  const toggleTask = (key: 'bumbu' | 'kasir' | 'po') => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="w-full bg-white rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_-25px_rgba(178,98,20,0.25)] border border-[#F2E3D0] flex flex-col lg:grid lg:grid-cols-[1.1fr_1fr] text-[#2B221C]">
      {/* Sisi Kiri: Panel Karakter Dapi Besar Berwarna Hangat (Persis Panel Login Kiri) */}
      <div
        onClick={() => {
          setPoked(true)
          setTimeout(() => setPoked(false), 1500)
        }}
        className="relative h-64 sm:h-72 lg:h-auto lg:min-h-[380px] lg:m-3 lg:rounded-[2rem] overflow-hidden cursor-pointer select-none transition-transform active:scale-[0.99] group lg:[&_svg]:w-[320px] lg:[&_svg]:h-auto flex items-end justify-center"
      >
        <DapiFace
          mood={mood}
          customSay={customSpeech}
          size="card"
        />

        {/* Branding DapurTwin di sudut panel kiri (sama seperti di /login) */}
        <div className="hidden lg:flex items-center gap-2 absolute bottom-6 left-8 text-[#2B221C]">
          <span className="text-xl font-black tracking-tight">DapurTwin</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/60 backdrop-blur-xs text-[#8C5E2D]">
            Asisten Dapur
          </span>
        </div>

        {/* Hint klik interaktif */}
        <span className="absolute top-4 right-4 text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/70 backdrop-blur-xs text-[#2B221C] opacity-0 group-hover:opacity-100 transition-opacity">
          Sapa Dapi ✨
        </span>
      </div>

      {/* Sisi Kanan: Panel Konten & Aksi Operasional (Styling input/button persis /login) */}
      <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
        <div>
          {/* Header & Subtitle */}
          <div className="mb-5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#2B221C]">
              {greeting}, Tim Dapur!
            </h1>
            <p className="text-sm text-[#6F5C4A] mt-1.5 leading-relaxed">
              {lowCount > 0 ? (
                <>
                  Perhatian chef, terdapat <strong className="text-rose-600 font-bold">{lowCount} bahan</strong> di bawah batas minimum. Segera proses pembelian stok.
                </>
              ) : (
                `Semua persediaan aman terkendali. ${totalMenus} menu siap dijual di kasir toko dan WhatsApp.`
              )}
            </p>
          </div>

          {/* Alert Khusus Jika Bahan Kritis (Mirip alert /login) */}
          {lowCount > 0 && (
            <div className="mb-4 p-3 rounded-2xl bg-[#FFF0EC] border-2 border-[#FFC2B5] flex items-center justify-between text-[#9A3412] text-xs font-bold">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>
                  {lowStockItems[0]?.name || 'Bahan baku'} tersisa {lowStockItems[0]?.stock || 0} {lowStockItems[0]?.satuan || ''}
                </span>
              </div>
              <Link
                href="/dashboard/purchase-order"
                className="underline hover:text-black flex items-center gap-1"
              >
                Buat PO
              </Link>
            </div>
          )}

          {/* Mini Checklist Dapur Bergaya Input Form Login */}
          <div className="space-y-2 mb-6">
            <label className="block text-xs font-bold text-[#6F5C4A] uppercase tracking-wider">
              Ceklis Kesiapan Operasional
            </label>

            {/* Checklist 1 */}
            <div
              onClick={() => toggleTask('bumbu')}
              className={`p-3 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all select-none ${
                checklist.bumbu
                  ? 'bg-[#FFFBF5] border-[#F2E3D0] text-[#2B221C]'
                  : 'bg-white border-stone-200 text-stone-400'
              }`}
            >
              <span className={`text-xs font-bold ${checklist.bumbu ? '' : 'line-through'}`}>
                1. Persiapan bumbu dasar & wadah saji
              </span>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  checklist.bumbu ? 'bg-[#FF8F28] text-white' : 'border border-stone-300'
                }`}
              >
                {checklist.bumbu && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>

            {/* Checklist 2 */}
            <div
              onClick={() => toggleTask('kasir')}
              className={`p-3 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all select-none ${
                checklist.kasir
                  ? 'bg-[#FFFBF5] border-[#F2E3D0] text-[#2B221C]'
                  : 'bg-white border-stone-200 text-stone-400'
              }`}
            >
              <span className={`text-xs font-bold ${checklist.kasir ? '' : 'line-through'}`}>
                2. Buka mesin kasir POS & catat pesanan masuk
              </span>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  checklist.kasir ? 'bg-[#FF8F28] text-white' : 'border border-stone-300'
                }`}
              >
                {checklist.kasir && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>
          </div>
        </div>

        {/* Tombol Utama Bergaya /login: Rounded-Full dengan Efek Shadow 3D Tekan */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/dashboard/penjualan"
            className="w-full sm:flex-1 py-3.5 px-6 bg-[#FF8F28] hover:bg-[#FF9F3F] text-white font-bold text-sm rounded-full shadow-[0_4px_0_#C9620C] active:translate-y-[3px] active:shadow-[0_1px_0_#C9620C] transition flex items-center justify-center gap-2 cursor-pointer text-center"
          >
            <Receipt className="w-4 h-4" />
            <span>Buka Kasir POS Sekarang</span>
          </Link>

          {onRefresh && (
            <button
              onClick={onRefresh}
              type="button"
              disabled={isLoading}
              title="Perbarui data metrik"
              className="p-3.5 rounded-full bg-[#FFFBF5] hover:bg-white border-2 border-[#F2E3D0] text-[#6F5C4A] hover:text-[#2B221C] transition cursor-pointer flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#FF8F28]' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
