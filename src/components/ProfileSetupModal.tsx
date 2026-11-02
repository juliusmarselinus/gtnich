'use client'

import { useState } from 'react'
import { Store, User, ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import DapiHead from '@/components/ui/DapiHead'

interface ProfileSetupModalProps {
  userId: string
  initialName?: string
  initialStore?: string
  initialBusinessType?: string
  initialSalesChannels?: string[]
  initialStockoutFrequency?: number | null
  onCompleted: (fullName: string, storeName: string) => void
}

const USAHA_OPTIONS = [
  { id: 'kafe', label: 'Kafe / kedai minuman', icon: '☕' },
  { id: 'katering', label: 'Dapur katering', icon: '🍱' },
  { id: 'kue', label: 'Toko kue & roti', icon: '🥐' },
  { id: 'warung', label: 'Warung / rumah makan', icon: '🍛' },
]

const KANAL_OPTIONS = [
  'Jualan di tempat',
  'GoFood',
  'GrabFood',
  'ShopeeFood',
  'Pesanan WhatsApp',
]

const HABIS_OPTIONS = [
  { value: 0, label: 'Hampir tidak pernah', desc: 'Dapur sangat teratur' },
  { value: 1, label: 'Sebulan sekali', desc: 'Sesekali terjadi' },
  { value: 2, label: 'Dua minggu sekali', desc: 'Mulai mengganggu operasional' },
  { value: 3, label: 'Tiap minggu', desc: 'Sering panik kehabisan bahan' },
  { value: 4, label: 'Hampir tiap hari', desc: 'Butuh bantuan manajemen stok intensif' },
]

export default function ProfileSetupModal({
  userId,
  initialName = '',
  initialStore = '',
  initialBusinessType = '',
  initialSalesChannels = [],
  initialStockoutFrequency = null,
  onCompleted,
}: ProfileSetupModalProps) {
  // Buka langsung ke langkah pertama yang datanya masih kosong
  const determineInitialStep = (): 1 | 2 | 3 => {
    if (!initialName.trim() || !initialStore.trim()) return 1
    if (!initialBusinessType || !initialSalesChannels || initialSalesChannels.length === 0) return 2
    return 3
  }

  const [step, setStep] = useState<1 | 2 | 3>(determineInitialStep)

  const [fullName, setFullName] = useState(initialName)
  const [storeName, setStoreName] = useState(initialStore)
  const [businessType, setBusinessType] = useState(initialBusinessType)
  const [salesChannels, setSalesChannels] = useState<string[]>(initialSalesChannels)
  const [stockoutFrequency, setStockoutFrequency] = useState<number>(
    initialStockoutFrequency !== null && initialStockoutFrequency !== undefined
      ? initialStockoutFrequency
      : 2
  )

  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const toggleChannel = (channel: string) => {
    setSalesChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    )
  }

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanName = fullName.trim()
    const cleanStore = storeName.trim()

    if (!cleanName) {
      setErrorMsg('Mohon isi nama lengkap / nama panggilan Anda.')
      return
    }
    if (!cleanStore) {
      setErrorMsg('Mohon isi nama dapur / usaha kuliner Anda.')
      return
    }

    setErrorMsg(null)
    setStep(2)
  }

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessType) {
      setErrorMsg('Pilih jenis usaha kuliner Anda terlebih dahulu.')
      return
    }
    if (!salesChannels || salesChannels.length === 0) {
      setErrorMsg('Pilih minimal satu kanal penjualan yang Anda gunakan.')
      return
    }
    setErrorMsg(null)
    setStep(3)
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanName = fullName.trim()
    const cleanStore = storeName.trim()

    setIsSaving(true)
    setErrorMsg(null)

    try {
      const supabase = createClient()

      // 1. Coba panggil function RPC Supabase complete_user_profile jika sudah dipasang
      const { data: rpcData, error: rpcError } = await supabase.rpc('complete_user_profile', {
        p_full_name: cleanName,
        p_store_name: cleanStore,
        p_business_type: businessType || '',
        p_sales_channels: salesChannels,
        p_stockout_frequency: stockoutFrequency,
      })

      // Jika RPC tidak ada / gagal, simpan langsung ke tabel public.profiles di Supabase
      if (rpcError) {
        console.warn('RPC complete_user_profile not available, falling back to direct profiles upsert:', rpcError.message)

        // Coba simpan dengan kolom lengkap ke Supabase
        const payloadWithAll: Record<string, any> = {
          id: userId,
          full_name: cleanName,
          store_name: cleanStore,
          business_type: businessType || null,
          sales_channels: salesChannels.length > 0 ? salesChannels : null,
          stockout_frequency: stockoutFrequency,
          is_completed: true,
          updated_at: new Date().toISOString(),
        }

        const { error: profileError } = await supabase.from('profiles').upsert(payloadWithAll, { onConflict: 'id' })

        if (profileError) {
          // Jika kolom stockout_frequency atau is_completed belum dibuat di Supabase, simpan kolom dasar
          console.warn('Fallback basic columns upsert:', profileError.message)
          const payloadBasic: Record<string, any> = {
            id: userId,
            full_name: cleanName,
            store_name: cleanStore,
            business_type: businessType || null,
            sales_channels: salesChannels.length > 0 ? salesChannels : null,
            updated_at: new Date().toISOString(),
          }
          const { error: fallbackError } = await supabase.from('profiles').upsert(payloadBasic, { onConflict: 'id' })
          if (fallbackError) {
            throw fallbackError
          }
        }
      }

      // Non-blocking metadata sync
      try {
        await supabase.auth.updateUser({
          data: {
            full_name: cleanName,
            store_name: cleanStore,
            business_type: businessType || null,
            sales_channels: salesChannels,
            stockout_frequency: stockoutFrequency,
            is_completed: true,
          },
        })
      } catch {
        // non-blocking
      }

      onCompleted(cleanName, cleanStore)
    } catch (err: unknown) {
      const e = err as Error
      setErrorMsg(e.message || 'Gagal menyimpan data dapur ke Supabase. Silakan coba lagi.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-[28px] bg-white p-6 sm:p-8 shadow-2xl border border-[#F2E3D0] max-h-[92vh] overflow-y-auto">
        {/* Header Dialog */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF2E0] text-[#B5560A]">
            <DapiHead size={42} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#2B221C]">
            {step === 1 && 'Lengkapi Profil Dapurmu'}
            {step === 2 && 'Personalisasi Usahamu'}
            {step === 3 && 'Kondisi Stok Dapur'}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#6F5C4A]">
            {step === 1 && 'Masukkan nama pengelola dan nama dapur agar Dapi dapat menyesuaikan sapaan dan laporan dapurmu.'}
            {step === 2 && 'Pilih kategori usaha dan kanal penjualan yang aktif di dapurmu.'}
            {step === 3 && 'Bantu Dapi memahami seberapa sering bahan baku di dapurmu habis.'}
          </p>

          {/* Step Indicator */}
          <div className="mt-3 flex items-center gap-1.5">
            <span className={`h-1.5 rounded-full transition-all ${step === 1 ? 'w-6 bg-[#FF8F28]' : 'w-2 bg-[#E8D7C3]'}`} />
            <span className={`h-1.5 rounded-full transition-all ${step === 2 ? 'w-6 bg-[#FF8F28]' : 'w-2 bg-[#E8D7C3]'}`} />
            <span className={`h-1.5 rounded-full transition-all ${step === 3 ? 'w-6 bg-[#FF8F28]' : 'w-2 bg-[#E8D7C3]'}`} />
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl bg-koral-muda p-3 text-xs font-semibold text-[#8F2A14]">
            {errorMsg}
          </div>
        )}

        {/* STEP 1: NAMA & NAMA DAPUR */}
        {step === 1 && (
          <form onSubmit={handleNextStep1} className="mt-5 space-y-4">
            <div>
              <label htmlFor="setup-fullname" className="block text-xs font-bold uppercase tracking-wider text-[#6F5C4A] mb-1.5">
                Nama Pemilik / Pengelola
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7560]" />
                <input
                  id="setup-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Chef Budi"
                  className="w-full pl-10 pr-4 py-3 bg-[#FFFBF5] border-2 border-[#F2E3D0] rounded-2xl text-sm text-[#2B221C] placeholder:text-[#BCA184] focus:outline-none focus:border-[#FF9F3F] focus:bg-white transition"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label htmlFor="setup-storename" className="block text-xs font-bold uppercase tracking-wider text-[#6F5C4A] mb-1.5">
                Nama Usaha / Dapur Kuliner
              </label>
              <div className="relative">
                <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7560]" />
                <input
                  id="setup-storename"
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Contoh: Dapur Rasa Nusantara"
                  className="w-full pl-10 pr-4 py-3 bg-[#FFFBF5] border-2 border-[#F2E3D0] rounded-2xl text-sm text-[#2B221C] placeholder:text-[#BCA184] focus:outline-none focus:border-[#FF9F3F] focus:bg-white transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full !mt-6 py-3.5 bg-[#FF8F28] hover:bg-[#FF9F3F] text-white font-bold text-sm rounded-full shadow-[0_4px_0_#C9620C] active:translate-y-[3px] active:shadow-[0_1px_0_#C9620C] transition flex items-center justify-center gap-2"
            >
              <span>Lanjut ke Kategori Usaha</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: JENIS USAHA & KANAL JUALAN */}
        {step === 2 && (
          <form onSubmit={handleNextStep2} className="mt-5 space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5C4A] mb-2">
                Jenis Usaha Kuliner
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {USAHA_OPTIONS.map((item) => {
                  const isSelected = businessType === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setBusinessType(item.id)}
                      className={`flex items-center gap-3 p-3 text-left rounded-2xl border-2 transition ${
                        isSelected
                          ? 'border-[#FF8F28] bg-[#FFF5EA] text-[#2B221C] font-bold shadow-sm'
                          : 'border-[#F2E3D0] bg-[#FFFBF5] text-[#6F5C4A] hover:border-[#FFBD80]'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-xs sm:text-sm">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5C4A] mb-1.5">
                Kanal Penjualan (Bisa pilih lebih dari satu)
              </label>
              <div className="flex flex-wrap gap-2">
                {KANAL_OPTIONS.map((channel) => {
                  const isChecked = salesChannels.includes(channel)
                  return (
                    <button
                      key={channel}
                      type="button"
                      onClick={() => toggleChannel(channel)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition border-2 ${
                        isChecked
                          ? 'bg-[#FF8F28] border-[#FF8F28] text-white shadow-sm'
                          : 'bg-[#FFFBF5] border-[#F2E3D0] text-[#6F5C4A] hover:border-[#FFBD80]'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      <span>{channel}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 border-2 border-[#F2E3D0] text-[#6F5C4A] font-bold text-xs rounded-full hover:bg-[#FFFBF5] transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>

              <button
                type="submit"
                className="flex-1 py-3.5 bg-[#FF8F28] hover:bg-[#FF9F3F] text-white font-bold text-sm rounded-full shadow-[0_4px_0_#C9620C] active:translate-y-[3px] active:shadow-[0_1px_0_#C9620C] transition flex items-center justify-center gap-2"
              >
                <span>Lanjut ke Kondisi Stok</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: KONDISI FREKUENSI KEHABISAN STOK */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5C4A] mb-2">
                Seberapa sering bahan baku tiba-tiba habis?
              </label>
              <div className="space-y-2">
                {HABIS_OPTIONS.map((opt) => {
                  const isSelected = stockoutFrequency === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStockoutFrequency(opt.value)}
                      className={`w-full flex items-center justify-between p-3.5 text-left rounded-2xl border-2 transition ${
                        isSelected
                          ? 'border-[#FF8F28] bg-[#FFF5EA] text-[#2B221C] shadow-sm'
                          : 'border-[#F2E3D0] bg-[#FFFBF5] text-[#6F5C4A] hover:border-[#FFBD80]'
                      }`}
                    >
                      <div>
                        <p className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-[#B5560A]' : 'text-[#2B221C]'}`}>
                          {opt.label}
                        </p>
                        <p className="text-[11px] text-[#8C7560] mt-0.5">{opt.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#FF8F28] bg-[#FF8F28] text-white' : 'border-[#D1BAA3]'}`}>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isSaving}
                className="px-4 py-3 border-2 border-[#F2E3D0] text-[#6F5C4A] font-bold text-xs rounded-full hover:bg-[#FFFBF5] transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-3.5 bg-[#FF8F28] hover:bg-[#FF9F3F] disabled:opacity-60 text-white font-bold text-sm rounded-full shadow-[0_4px_0_#C9620C] active:translate-y-[3px] active:shadow-[0_1px_0_#C9620C] transition flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Selesai & Masuk ke Dapur</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
