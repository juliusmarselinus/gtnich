'use client'

import { useState, useEffect } from 'react'
import Topbar from '@/components/Topbar'
import { createClient } from '@/lib/supabase/client'
import {
  User,
  Store,
  Mail,
  Shield,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Phone,
  Layers,
  ShoppingBag,
  TrendingDown,
  Lock,
  Bell,
  Clock,
  FileText,
  AlertTriangle,
} from 'lucide-react'
import {
  getNotificationPreferences,
  saveNotificationPreferences,
  UserNotificationPreferences,
} from '@/lib/notificationSettings'

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

export default function PengaturanPage() {
  const supabase = createClient()

  // State Read-only (Info Utama yang Terkunci)
  const [userId, setUserId] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [role, setRole] = useState<string>('owner')
  const [createdAt, setCreatedAt] = useState<string>('')

  // State Editable Box 1: Identitas Pemilik & Dapur
  const [fullName, setFullName] = useState<string>('')
  const [storeName, setStoreName] = useState<string>('')
  const [phone, setPhone] = useState<string>('')

  // State Editable Box 2: Jenis Usaha
  const [businessType, setBusinessType] = useState<string>('')

  // State Editable Box 3: Kanal Penjualan
  const [salesChannels, setSalesChannels] = useState<string[]>([])

  // State Editable Box 4: Frekuensi Stok Habis
  const [stockoutFrequency, setStockoutFrequency] = useState<number>(2)

  // State Editable Box 5: Pengaturan Notifikasi & Laporan Otomatis
  const [notifyTagihanOverdue, setNotifyTagihanOverdue] = useState<boolean>(true)
  const [notifyDailySales, setNotifyDailySales] = useState<boolean>(true)

  // Status Loading & Indikator Simpan per Box
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [savingBox, setSavingBox] = useState<'identitas' | 'usaha' | 'kanal' | 'stok' | 'notifikasi' | null>(null)
  const [successBox, setSuccessBox] = useState<'identitas' | 'usaha' | 'kanal' | 'stok' | 'notifikasi' | null>(null)
  const [errorBox, setErrorBox] = useState<{ box: 'identitas' | 'usaha' | 'kanal' | 'stok' | 'notifikasi'; msg: string } | null>(null)

  // Ambil data profil dari database Supabase
  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true)

        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser()

        if (userErr || !user) {
          throw new Error('Gagal memuat sesi pengguna.')
        }

        setUserId(user.id)
        setEmail(user.email || '-')
        setCreatedAt(
          user.created_at
            ? new Date(user.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : '-'
        )

        // Query tabel profiles
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        if (profileErr) {
          console.warn('Gagal query profiles:', profileErr.message)
        }

        setRole(profile?.role || 'owner')
        setFullName(profile?.full_name || '')
        setStoreName(profile?.store_name || '')
        setPhone(profile?.phone || '')
        setBusinessType(profile?.business_type || user.user_metadata?.business_type || '')
        setSalesChannels(
          Array.isArray(profile?.sales_channels)
            ? profile.sales_channels
            : user.user_metadata?.sales_channels || []
        )
        const stockFreq =
          (profile as any)?.stockout_frequency ??
          user.user_metadata?.stockout_frequency ??
          2
        setStockoutFrequency(Number(stockFreq))

        // Muat preferensi notifikasi dari storage / user metadata
        const prefs = getNotificationPreferences()
        setNotifyTagihanOverdue(
          user.user_metadata?.notify_tagihan_overdue ?? prefs.notifyTagihanOverdue
        )
        setNotifyDailySales(
          user.user_metadata?.notify_daily_sales ?? prefs.notifyDailySales
        )
      } catch (err: unknown) {
        console.error('Error load profile:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [supabase])

  const toggleChannel = (channel: string) => {
    setSalesChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    )
  }

  const triggerSuccessIndicator = (boxName: 'identitas' | 'usaha' | 'kanal' | 'stok' | 'notifikasi') => {
    setSuccessBox(boxName)
    setTimeout(() => {
      setSuccessBox((prev) => (prev === boxName ? null : prev))
    }, 3500)
  }

  // 1. Simpan Box Identitas Pemilik & Dapur
  const handleSaveIdentitas = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingBox('identitas')
    setErrorBox(null)

    const cleanName = fullName.trim()
    const cleanStore = storeName.trim()
    const cleanPhone = phone.trim()

    if (!cleanName) {
      setErrorBox({ box: 'identitas', msg: 'Nama pemilik / pengelola tidak boleh kosong.' })
      setSavingBox(null)
      return
    }

    if (!cleanStore) {
      setErrorBox({ box: 'identitas', msg: 'Nama usaha / dapur kuliner tidak boleh kosong.' })
      setSavingBox(null)
      return
    }

    try {
      const { error: upsertErr } = await supabase.from('profiles').upsert(
        {
          id: userId,
          full_name: cleanName,
          store_name: cleanStore,
          phone: cleanPhone || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )

      if (upsertErr) throw upsertErr

      // Sinkronkan ke auth user_metadata
      try {
        await supabase.auth.updateUser({
          data: {
            full_name: cleanName,
            store_name: cleanStore,
          },
        })
      } catch {
        // non-blocking
      }

      triggerSuccessIndicator('identitas')
    } catch (err: unknown) {
      const e = err as Error
      setErrorBox({ box: 'identitas', msg: e.message || 'Gagal menyimpan identitas dapur.' })
    } finally {
      setSavingBox(null)
    }
  }

  // 2. Simpan Box Jenis Usaha
  const handleSaveUsaha = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingBox('usaha')
    setErrorBox(null)

    if (!businessType) {
      setErrorBox({ box: 'usaha', msg: 'Pilih jenis usaha kuliner Anda terlebih dahulu.' })
      setSavingBox(null)
      return
    }

    try {
      const { error: upsertErr } = await supabase.from('profiles').upsert(
        {
          id: userId,
          business_type: businessType,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )

      if (upsertErr) throw upsertErr

      try {
        await supabase.auth.updateUser({
          data: {
            business_type: businessType,
          },
        })
      } catch {
        // non-blocking
      }

      triggerSuccessIndicator('usaha')
    } catch (err: unknown) {
      const e = err as Error
      setErrorBox({ box: 'usaha', msg: e.message || 'Gagal menyimpan jenis usaha.' })
    } finally {
      setSavingBox(null)
    }
  }

  // 3. Simpan Box Kanal Penjualan
  const handleSaveKanal = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingBox('kanal')
    setErrorBox(null)

    if (salesChannels.length === 0) {
      setErrorBox({ box: 'kanal', msg: 'Pilih minimal satu kanal penjualan yang Anda gunakan.' })
      setSavingBox(null)
      return
    }

    try {
      const { error: upsertErr } = await supabase.from('profiles').upsert(
        {
          id: userId,
          sales_channels: salesChannels,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )

      if (upsertErr) throw upsertErr

      try {
        await supabase.auth.updateUser({
          data: {
            sales_channels: salesChannels,
          },
        })
      } catch {
        // non-blocking
      }

      triggerSuccessIndicator('kanal')
    } catch (err: unknown) {
      const e = err as Error
      setErrorBox({ box: 'kanal', msg: e.message || 'Gagal menyimpan kanal penjualan.' })
    } finally {
      setSavingBox(null)
    }
  }

  // 4. Simpan Box Frekuensi Stok Habis
  const handleSaveStok = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingBox('stok')
    setErrorBox(null)

    try {
      // Coba simpan ke kolom stockout_frequency di tabel profiles jika kolom tersedia
      const payload: Record<string, any> = {
        id: userId,
        stockout_frequency: stockoutFrequency,
        updated_at: new Date().toISOString(),
      }

      const { error: upsertErr } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })

      if (upsertErr) {
        console.warn('Fallback stockout_frequency column upsert:', upsertErr.message)
      }

      // Sinkronkan ke auth user_metadata
      try {
        await supabase.auth.updateUser({
          data: {
            stockout_frequency: stockoutFrequency,
          },
        })
      } catch {
        // non-blocking
      }

      triggerSuccessIndicator('stok')
    } catch (err: unknown) {
      const e = err as Error
      setErrorBox({ box: 'stok', msg: e.message || 'Gagal menyimpan preferensi stok.' })
    } finally {
      setSavingBox(null)
    }
  }

  // 5. Simpan Box Pengaturan Notifikasi & Laporan Otomatis
  const handleSaveNotifikasi = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingBox('notifikasi')
    setErrorBox(null)

    try {
      const newPrefs: UserNotificationPreferences = {
        notifyTagihanOverdue,
        notifyDailySales,
      }

      // Simpan preferensi notifikasi ke local storage
      saveNotificationPreferences(newPrefs)

      // Simpan ke auth user_metadata agar konsisten lintas device
      try {
        await supabase.auth.updateUser({
          data: {
            notify_tagihan_overdue: notifyTagihanOverdue,
            notify_daily_sales: notifyDailySales,
          },
        })
      } catch {
        // non-blocking
      }

      triggerSuccessIndicator('notifikasi')
    } catch (err: unknown) {
      const e = err as Error
      setErrorBox({ box: 'notifikasi', msg: e.message || 'Gagal menyimpan pengaturan notifikasi.' })
    } finally {
      setSavingBox(null)
    }
  }

  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Pengaturan Dapur"
        subtitle="Kelola profil akun, identitas usaha, dan preferensi operasional dapur"
      />

      <main className="mx-auto flex max-w-[1000px] flex-col gap-6 px-4 pt-4 sm:px-6 md:px-8">
        {isLoading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-[28px] bg-white p-8 shadow-kartu">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF8F28]" />
            <p className="text-sm font-semibold text-[#8C7560]">Memuat pengaturan akun...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* BOX 0: Informasi Utama Akun (Read-only / Terkunci) */}
            <div className="rounded-[28px] bg-white p-6 sm:p-8 shadow-kartu border border-[#F2E3D0]">
              <div className="flex items-center justify-between pb-4 border-b border-[#F2E3D0]">
                <div>
                  <h2 className="text-lg font-black text-[#2B221C] flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#8C7560]" />
                    <span>Informasi Akun Utama</span>
                  </h2>
                  <p className="text-xs text-[#8C7560] mt-0.5">
                    Data sistem ini dibuat saat registrasi dan terikat langsung dengan otentikasi login
                  </p>
                </div>
                <span className="rounded-full bg-[#FFF5EA] px-3 py-1 text-[11px] font-bold text-[#B5560A] border border-[#FFD9B3]">
                  Terkunci
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8C7560] mb-1.5">
                    ID Pengguna (UID)
                  </label>
                  <input
                    type="text"
                    value={userId}
                    disabled
                    className="w-full px-3.5 py-2.5 bg-[#F8F4EE] border border-[#E8D7C3] rounded-xl text-xs font-mono text-[#6F5C4A] cursor-not-allowed select-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8C7560] mb-1.5">
                    Alamat Email Terdaftar
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 w-4 h-4 text-[#8C7560]" />
                    <input
                      type="text"
                      value={email}
                      disabled
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8F4EE] border border-[#E8D7C3] rounded-xl text-sm font-semibold text-[#6F5C4A] cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8C7560] mb-1.5">
                    Peran Akun
                  </label>
                  <div className="relative flex items-center">
                    <Shield className="absolute left-3.5 w-4 h-4 text-[#8C7560]" />
                    <input
                      type="text"
                      value={role === 'owner' ? 'Pemilik Usaha (Owner)' : role}
                      disabled
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8F4EE] border border-[#E8D7C3] rounded-xl text-sm font-semibold text-[#6F5C4A] cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8C7560] mb-1.5">
                    Terdaftar Sejak
                  </label>
                  <div className="relative flex items-center">
                    <Calendar className="absolute left-3.5 w-4 h-4 text-[#8C7560]" />
                    <input
                      type="text"
                      value={createdAt}
                      disabled
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8F4EE] border border-[#E8D7C3] rounded-xl text-sm font-semibold text-[#6F5C4A] cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* BOX 1: Identitas Pemilik & Dapur Kuliner */}
            <form onSubmit={handleSaveIdentitas} className="rounded-[28px] bg-white p-6 sm:p-8 shadow-kartu border border-[#F2E3D0]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F2E3D0] gap-2">
                <div>
                  <h2 className="text-lg font-black text-[#2B221C] flex items-center gap-2">
                    <User className="w-4 h-4 text-[#FF8F28]" />
                    <span>Identitas Pemilik & Dapur Kuliner</span>
                  </h2>
                  <p className="text-xs text-[#8C7560] mt-0.5">
                    Nama dan nomor kontak untuk kop nota kasir dan laporan operasional
                  </p>
                </div>

                {/* Indikator Status Simpan */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {successBox === 'identitas' && (
                    <span className="flex items-center gap-1.5 rounded-full bg-[#E8F6E3] px-3 py-1 text-xs font-bold text-[#1E6B24] border border-[#BDE8B5] animate-in fade-in duration-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2E8B36]" />
                      <span>Tersimpan!</span>
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={savingBox === 'identitas'}
                    className="px-5 py-2 bg-[#FF8F28] hover:bg-[#FF9F3F] disabled:opacity-60 text-white font-bold text-xs rounded-full shadow-[0_3px_0_#C9620C] active:translate-y-[2px] active:shadow-[0_1px_0_#C9620C] transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {savingBox === 'identitas' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{savingBox === 'identitas' ? 'Menyimpan...' : 'Simpan Identitas'}</span>
                  </button>
                </div>
              </div>

              {errorBox?.box === 'identitas' && (
                <div className="mt-4 rounded-xl bg-koral-muda p-3 text-xs font-semibold text-[#8F2A14] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorBox.msg}</span>
                </div>
              )}

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-[#6F5C4A] mb-1.5">
                    Nama Pemilik / Pengelola <span className="text-koral">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 w-4 h-4 text-[#8C7560]" />
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Contoh: Chef Budi Santoso"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FFFBF5] border-2 border-[#F2E3D0] rounded-2xl text-sm text-[#2B221C] placeholder:text-[#BCA184] focus:outline-none focus:border-[#FF9F3F] focus:bg-white transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="storeName" className="block text-xs font-bold uppercase tracking-wider text-[#6F5C4A] mb-1.5">
                    Nama Usaha / Dapur Kuliner <span className="text-koral">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Store className="absolute left-3.5 w-4 h-4 text-[#8C7560]" />
                    <input
                      id="storeName"
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="Contoh: Dapur Twin Rasa"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FFFBF5] border-2 border-[#F2E3D0] rounded-2xl text-sm text-[#2B221C] placeholder:text-[#BCA184] focus:outline-none focus:border-[#FF9F3F] focus:bg-white transition"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-[#6F5C4A] mb-1.5">
                    Nomor WhatsApp / Kontak Dapur
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-3.5 w-4 h-4 text-[#8C7560]" />
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FFFBF5] border-2 border-[#F2E3D0] rounded-2xl text-sm text-[#2B221C] placeholder:text-[#BCA184] focus:outline-none focus:border-[#FF9F3F] focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>
            </form>

            {/* BOX 2: Jenis Usaha Kuliner */}
            <form onSubmit={handleSaveUsaha} className="rounded-[28px] bg-white p-6 sm:p-8 shadow-kartu border border-[#F2E3D0]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F2E3D0] gap-2">
                <div>
                  <h2 className="text-lg font-black text-[#2B221C] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#FF8F28]" />
                    <span>Jenis Usaha Kuliner</span>
                  </h2>
                  <p className="text-xs text-[#8C7560] mt-0.5">
                    Kategori usaha untuk penyesuaian template resep dan simulasi bisnis
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {successBox === 'usaha' && (
                    <span className="flex items-center gap-1.5 rounded-full bg-[#E8F6E3] px-3 py-1 text-xs font-bold text-[#1E6B24] border border-[#BDE8B5] animate-in fade-in duration-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2E8B36]" />
                      <span>Tersimpan!</span>
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={savingBox === 'usaha'}
                    className="px-5 py-2 bg-[#FF8F28] hover:bg-[#FF9F3F] disabled:opacity-60 text-white font-bold text-xs rounded-full shadow-[0_3px_0_#C9620C] active:translate-y-[2px] active:shadow-[0_1px_0_#C9620C] transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {savingBox === 'usaha' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{savingBox === 'usaha' ? 'Menyimpan...' : 'Simpan Jenis Usaha'}</span>
                  </button>
                </div>
              </div>

              {errorBox?.box === 'usaha' && (
                <div className="mt-4 rounded-xl bg-koral-muda p-3 text-xs font-semibold text-[#8F2A14] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorBox.msg}</span>
                </div>
              )}

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {USAHA_OPTIONS.map((item) => {
                  const isSelected = businessType === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setBusinessType(item.id)}
                      className={`flex items-center gap-3 p-3.5 text-left rounded-2xl border-2 transition ${
                        isSelected
                          ? 'border-[#FF8F28] bg-[#FFF5EA] text-[#2B221C] font-bold shadow-sm'
                          : 'border-[#F2E3D0] bg-[#FFFBF5] text-[#6F5C4A] hover:border-[#FFBD80]'
                      }`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-xs sm:text-sm">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </form>

            {/* BOX 3: Kanal Penjualan Aktif */}
            <form onSubmit={handleSaveKanal} className="rounded-[28px] bg-white p-6 sm:p-8 shadow-kartu border border-[#F2E3D0]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F2E3D0] gap-2">
                <div>
                  <h2 className="text-lg font-black text-[#2B221C] flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#FF8F28]" />
                    <span>Kanal Penjualan Aktif</span>
                  </h2>
                  <p className="text-xs text-[#8C7560] mt-0.5">
                    Pilihan kanal jualan untuk filter pesanan kasir dan analisis omzet
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {successBox === 'kanal' && (
                    <span className="flex items-center gap-1.5 rounded-full bg-[#E8F6E3] px-3 py-1 text-xs font-bold text-[#1E6B24] border border-[#BDE8B5] animate-in fade-in duration-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2E8B36]" />
                      <span>Tersimpan!</span>
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={savingBox === 'kanal'}
                    className="px-5 py-2 bg-[#FF8F28] hover:bg-[#FF9F3F] disabled:opacity-60 text-white font-bold text-xs rounded-full shadow-[0_3px_0_#C9620C] active:translate-y-[2px] active:shadow-[0_1px_0_#C9620C] transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {savingBox === 'kanal' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{savingBox === 'kanal' ? 'Menyimpan...' : 'Simpan Kanal'}</span>
                  </button>
                </div>
              </div>

              {errorBox?.box === 'kanal' && (
                <div className="mt-4 rounded-xl bg-koral-muda p-3 text-xs font-semibold text-[#8F2A14] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorBox.msg}</span>
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-2.5">
                {KANAL_OPTIONS.map((channel) => {
                  const isChecked = salesChannels.includes(channel)
                  return (
                    <button
                      key={channel}
                      type="button"
                      onClick={() => toggleChannel(channel)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition border-2 ${
                        isChecked
                          ? 'bg-[#FF8F28] border-[#FF8F28] text-white shadow-sm'
                          : 'bg-[#FFFBF5] border-[#F2E3D0] text-[#6F5C4A] hover:border-[#FFBD80]'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{channel}</span>
                    </button>
                  )
                })}
              </div>
            </form>

            {/* BOX 4: Frekuensi Stok Habis */}
            <form onSubmit={handleSaveStok} className="rounded-[28px] bg-white p-6 sm:p-8 shadow-kartu border border-[#F2E3D0]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F2E3D0] gap-2">
                <div>
                  <h2 className="text-lg font-black text-[#2B221C] flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-[#FF8F28]" />
                    <span>Preferensi Pemantauan Stok Bahan</span>
                  </h2>
                  <p className="text-xs text-[#8C7560] mt-0.5">
                    Tentukan seberapa sering bahan habis untuk mengatur sensitivitas peringatan Dapi
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {successBox === 'stok' && (
                    <span className="flex items-center gap-1.5 rounded-full bg-[#E8F6E3] px-3 py-1 text-xs font-bold text-[#1E6B24] border border-[#BDE8B5] animate-in fade-in duration-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2E8B36]" />
                      <span>Tersimpan!</span>
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={savingBox === 'stok'}
                    className="px-5 py-2 bg-[#FF8F28] hover:bg-[#FF9F3F] disabled:opacity-60 text-white font-bold text-xs rounded-full shadow-[0_3px_0_#C9620C] active:translate-y-[2px] active:shadow-[0_1px_0_#C9620C] transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {savingBox === 'stok' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{savingBox === 'stok' ? 'Menyimpan...' : 'Simpan Preferensi Stok'}</span>
                  </button>
                </div>
              </div>

              {errorBox?.box === 'stok' && (
                <div className="mt-4 rounded-xl bg-koral-muda p-3 text-xs font-semibold text-[#8F2A14] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorBox.msg}</span>
                </div>
              )}

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {HABIS_OPTIONS.map((opt) => {
                  const isSelected = stockoutFrequency === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStockoutFrequency(opt.value)}
                      className={`flex items-center justify-between p-3.5 text-left rounded-2xl border-2 transition ${
                        isSelected
                          ? 'border-[#FF8F28] bg-[#FFF5EA] text-[#2B221C] shadow-sm font-semibold'
                          : 'border-[#F2E3D0] bg-[#FFFBF5] text-[#6F5C4A] hover:border-[#FFBD80]'
                      }`}
                    >
                      <div>
                        <p className={`text-xs font-bold ${isSelected ? 'text-[#B5560A]' : 'text-[#2B221C]'}`}>
                          {opt.label}
                        </p>
                        <p className="text-[10px] text-[#8C7560] mt-0.5">{opt.desc}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-[#FF8F28] bg-[#FF8F28] text-white'
                            : 'border-[#D1BAA3]'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </form>

            {/* BOX 5: Pengaturan Notifikasi & Laporan Otomatis */}
            <form
              onSubmit={handleSaveNotifikasi}
              className="rounded-[28px] bg-white p-6 sm:p-7 border border-[#F2E3D0] shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#F2E3D0] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FFF5EA] text-[#FF8F28] flex items-center justify-center border border-[#FFE2C2]">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-[#2B221C]">
                      Notifikasi Email & In-App Otomatis
                    </h2>
                    <p className="text-xs text-[#8C7560]">
                      Atur pengingat tagihan supplier jatuh tempo dan laporan harian pukul 22:00
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {successBox === 'notifikasi' && (
                    <span className="flex items-center gap-1.5 rounded-full bg-[#E8F6E3] px-3 py-1 text-xs font-bold text-[#1E6B24] border border-[#BDE8B5] animate-in fade-in duration-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2E8B36]" />
                      <span>Tersimpan!</span>
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={savingBox === 'notifikasi'}
                    className="px-5 py-2 bg-[#FF8F28] hover:bg-[#FF9F3F] disabled:opacity-60 text-white font-bold text-xs rounded-full shadow-[0_3px_0_#C9620C] active:translate-y-[2px] active:shadow-[0_1px_0_#C9620C] transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {savingBox === 'notifikasi' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{savingBox === 'notifikasi' ? 'Menyimpan...' : 'Simpan Notifikasi'}</span>
                  </button>
                </div>
              </div>

              {errorBox?.box === 'notifikasi' && (
                <div className="mt-4 rounded-xl bg-koral-muda p-3 text-xs font-semibold text-[#8F2A14] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorBox.msg}</span>
                </div>
              )}

              <div className="mt-5 space-y-4">
                {/* Switch 1: Tagihan Supplier Melewati 1 Hari */}
                <div className="p-4 rounded-2xl bg-[#FFFBF5] border border-[#F2E3D0] flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60 mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#2B221C]">
                        Peringatan Tagihan Supplier Lewat 1 Hari
                      </p>
                      <p className="text-[11px] text-[#6F5C4A] mt-1 leading-relaxed">
                        Kirim notifikasi in-app dan peringatan via email owner secara otomatis saat ada tagihan supplier yang belum diselesaikan lebih dari 1 hari sejak barang diterima.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={notifyTagihanOverdue}
                      onChange={(e) => setNotifyTagihanOverdue(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF8F28]" />
                  </label>
                </div>

                {/* Switch 2: Laporan Harian Jam 22:00 */}
                <div className="p-4 rounded-2xl bg-[#FFFBF5] border border-[#F2E3D0] flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/60 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#2B221C]">
                        Laporan Harian Penjualan Otomatis (Pukul 22:00 WIB)
                      </p>
                      <p className="text-[11px] text-[#6F5C4A] mt-1 leading-relaxed">
                        Kirimkan rekapitulasi penjualan, laba kotor, dan menu terlaris harian secara otomatis ke email owner setiap malam pukul 22:00 saat penutupan operasional dapur.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={notifyDailySales}
                      onChange={(e) => setNotifyDailySales(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF8F28]" />
                  </label>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
