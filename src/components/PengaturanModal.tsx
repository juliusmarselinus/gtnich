'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  User,
  Store,
  Mail,
  Shield,
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
  KeyRound,
  Eye,
  EyeOff,
  X,
  Sliders,
  Sparkles,
} from 'lucide-react'
import clsx from 'clsx'
import DapiHead from '@/components/ui/DapiHead'
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

type SettingsTab = 'account' | 'preference' | 'notification' | 'security'

interface PengaturanModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: SettingsTab
}

export default function PengaturanModal({
  isOpen,
  onClose,
  defaultTab = 'account',
}: PengaturanModalProps) {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<SettingsTab>(defaultTab)

  // State Read-only
  const [userId, setUserId] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [role, setRole] = useState<string>('owner')
  const [createdAt, setCreatedAt] = useState<string>('')

  // State Editable Box 1: Identitas Pemilik & Dapur
  const [fullName, setFullName] = useState<string>('')
  const [storeName, setStoreName] = useState<string>('')
  const [phone, setPhone] = useState<string>('')

  // State Editable Box 2: Jenis Usaha & Kanal
  const [businessType, setBusinessType] = useState<string>('')
  const [salesChannels, setSalesChannels] = useState<string[]>([])
  const [stockoutFrequency, setStockoutFrequency] = useState<number>(2)

  // State Editable Box 3: Pengaturan Notifikasi
  const [notifyTagihanOverdue, setNotifyTagihanOverdue] = useState<boolean>(true)
  const [notifyDailySales, setNotifyDailySales] = useState<boolean>(true)

  // State Box 4: Ganti Password
  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<boolean>(false)

  // Status Loading & Indikator Simpan per Box
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [savingBox, setSavingBox] = useState<'identitas' | 'preferensi' | 'notifikasi' | null>(null)
  const [successBox, setSuccessBox] = useState<'identitas' | 'preferensi' | 'notifikasi' | null>(null)
  const [errorBox, setErrorBox] = useState<{ box: 'identitas' | 'preferensi' | 'notifikasi'; msg: string } | null>(null)

  // Keyboard Escape & Body Scroll Lock
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Muat data profil saat modal terbuka
  useEffect(() => {
    if (!isOpen) return

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

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

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
  }, [isOpen, supabase])

  const toggleChannel = (channel: string) => {
    setSalesChannels(prev =>
      prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]
    )
  }

  const triggerSuccess = (boxName: 'identitas' | 'preferensi' | 'notifikasi') => {
    setSuccessBox(boxName)
    setTimeout(() => {
      setSuccessBox(prev => (prev === boxName ? null : prev))
    }, 3500)
  }

  // 1. Simpan Identitas Akun & Dapur
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

      triggerSuccess('identitas')
    } catch (err: unknown) {
      const e = err as Error
      setErrorBox({ box: 'identitas', msg: e.message || 'Gagal menyimpan identitas dapur.' })
    } finally {
      setSavingBox(null)
    }
  }

  // 2. Simpan Preferensi Usaha
  const handleSavePreferensi = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingBox('preferensi')
    setErrorBox(null)

    if (!businessType) {
      setErrorBox({ box: 'preferensi', msg: 'Pilih jenis usaha kuliner terlebih dahulu.' })
      setSavingBox(null)
      return
    }

    if (salesChannels.length === 0) {
      setErrorBox({ box: 'preferensi', msg: 'Pilih minimal satu kanal penjualan.' })
      setSavingBox(null)
      return
    }

    try {
      const { error: upsertErr } = await supabase.from('profiles').upsert(
        {
          id: userId,
          business_type: businessType,
          sales_channels: salesChannels,
          stockout_frequency: stockoutFrequency,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )

      if (upsertErr) {
        console.warn('Fallback upsert:', upsertErr.message)
      }

      try {
        await supabase.auth.updateUser({
          data: {
            business_type: businessType,
            sales_channels: salesChannels,
            stockout_frequency: stockoutFrequency,
          },
        })
      } catch {
        // non-blocking
      }

      triggerSuccess('preferensi')
    } catch (err: unknown) {
      const e = err as Error
      setErrorBox({ box: 'preferensi', msg: e.message || 'Gagal menyimpan preferensi usaha.' })
    } finally {
      setSavingBox(null)
    }
  }

  // 3. Simpan Notifikasi
  const handleSaveNotifikasi = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingBox('notifikasi')
    setErrorBox(null)

    try {
      const newPrefs: UserNotificationPreferences = {
        notifyTagihanOverdue,
        notifyDailySales,
      }
      saveNotificationPreferences(newPrefs)

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

      triggerSuccess('notifikasi')
    } catch (err: unknown) {
      const e = err as Error
      setErrorBox({ box: 'notifikasi', msg: e.message || 'Gagal menyimpan pengaturan notifikasi.' })
    } finally {
      setSavingBox(null)
    }
  }

  // 4. Update Password (Ganti Kata Sandi)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)

    if (!newPassword) {
      setPasswordError('Password baru tidak boleh kosong.')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('Password baru harus minimal 6 karakter.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password tidak cocok dengan password baru.')
      return
    }

    try {
      setIsUpdatingPassword(true)
      const { error: authErr } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (authErr) throw authErr

      setPasswordSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 4000)
    } catch (err: unknown) {
      const e = err as Error
      setPasswordError(e.message || 'Gagal memperbarui kata sandi. Silakan coba lagi.')
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  if (!isOpen) return null

  const sidebarTabs = [
    {
      id: 'account' as SettingsTab,
      label: 'Akun & Profil',
      sub: 'Identitas dapur & pemilik',
      icon: User,
    },
    {
      id: 'preference' as SettingsTab,
      label: 'Preferensi Usaha',
      sub: 'Kanal & jenis operasional',
      icon: Store,
    },
    {
      id: 'notification' as SettingsTab,
      label: 'Notifikasi',
      sub: 'Peringatan & laporan harian',
      icon: Bell,
    },
    {
      id: 'security' as SettingsTab,
      label: 'Keamanan Akun',
      sub: 'Ganti kata sandi login',
      icon: Lock,
    },
  ]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-kopi/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-[32px] bg-[#FFFBF2] border border-[#E8DCC8] shadow-[0_24px_60px_rgba(43,29,0,0.28)] overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DCC8] bg-[#FFF6E0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFB800] text-kopi flex items-center justify-center shadow-xs">
              <DapiHead size={32} mood="senang" />
            </div>
            <div>
              <h2 id="modal-settings-title" className="text-base sm:text-lg font-black text-[#2B1D00] tracking-tight">
                Pengaturan Sistem
              </h2>
              <p className="text-xs text-[#8A6A40] font-medium">
                Kelola akun, profil dapur, preferensi &amp; keamanan
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pengaturan"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#8A6A40] hover:text-[#2B1D00] hover:bg-white/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Modal: Sidebar Kiri + Konten Kanan */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Internal Sidebar Menu */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#E8DCC8] bg-[#FFF7E3]/60 p-3 sm:p-4 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible flex-shrink-0">
            {sidebarTabs.map(tab => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-all cursor-pointer whitespace-nowrap md:whitespace-normal',
                    active
                      ? 'bg-white font-bold text-[#2B1D00] shadow-[0_4px_12px_rgba(140,100,30,0.08)] border border-[#FFE49A]'
                      : 'text-[#6D543B] hover:bg-white/50 font-semibold'
                  )}
                >
                  <span
                    className={clsx(
                      'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
                      active ? 'bg-[#FFB800] text-[#2B1D00]' : 'bg-[#FFF0CC] text-[#8A5A00]'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] leading-tight truncate">{tab.label}</span>
                    <span className="hidden md:inline text-[11px] text-[#9A7A55] font-normal leading-tight truncate">
                      {tab.sub}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Konten Tab Kanan */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#8A6A40]">
                <Loader2 className="w-7 h-7 animate-spin text-[#FFB800]" />
                <p className="text-xs font-semibold">Memuat pengaturan akun...</p>
              </div>
            ) : (
              <>
                {/* TAB 1: AKUN & PROFIL */}
                {activeTab === 'account' && (
                  <div className="space-y-6 animate-in fade-in duration-150">
                    {/* Ringkasan Akun Utama (Read-only) */}
                    <div className="rounded-[24px] bg-[#FFF8E8] border border-[#EDD9B0] p-5 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-[#EDD9B0]">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-[#8A5A00]" />
                          <h3 className="text-xs font-black uppercase tracking-wider text-[#2B1D00]">
                            Identitas Akun Sistem
                          </h3>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFE49A] text-[#5A3A00]">
                          Terkunci
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="block text-[11px] font-bold text-[#8A6A40]">Email Login</span>
                          <span className="font-semibold text-[#2B1D00] truncate block mt-0.5">{email}</span>
                        </div>
                        <div>
                          <span className="block text-[11px] font-bold text-[#8A6A40]">Terdaftar Sejak</span>
                          <span className="font-semibold text-[#2B1D00] block mt-0.5">{createdAt}</span>
                        </div>
                        <div>
                          <span className="block text-[11px] font-bold text-[#8A6A40]">User ID (UID)</span>
                          <span className="font-mono text-[11px] text-[#5A3A00] truncate block mt-0.5">{userId}</span>
                        </div>
                        <div>
                          <span className="block text-[11px] font-bold text-[#8A6A40]">Peran Akses</span>
                          <span className="font-semibold text-[#2B1D00] block mt-0.5 capitalize">{role}</span>
                        </div>
                      </div>
                    </div>

                    {/* Form Identitas Pemilik & Dapur */}
                    <form onSubmit={handleSaveIdentitas} className="rounded-[24px] bg-white border border-[#EDE0C4] p-5 sm:p-6 space-y-4 shadow-xs">
                      <div>
                        <h3 className="text-sm font-black text-[#2B1D00]">Identitas Pemilik &amp; Dapur</h3>
                        <p className="text-xs text-[#8A6A40] mt-0.5">
                          Nama dapur akan ditampilkan di nota struk kasir dan judul dashboard
                        </p>
                      </div>

                      {errorBox?.box === 'identitas' && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{errorBox.msg}</span>
                        </div>
                      )}

                      {successBox === 'identitas' && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                          <span>Identitas dapur berhasil disimpan!</span>
                        </div>
                      )}

                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-xs font-bold text-[#5A3A00] mb-1">Nama Pemilik / Pengelola</label>
                          <div className="relative">
                            <User className="w-4 h-4 text-[#9A7A55] absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={fullName}
                              onChange={e => setFullName(e.target.value)}
                              placeholder="cth. Julius Marselinus"
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFFBF2] border border-[#EDD9B0] text-xs font-semibold text-[#2B1D00] outline-none focus:ring-2 focus:ring-[#FFB800]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#5A3A00] mb-1">Nama Usaha / Dapur Kuliner</label>
                          <div className="relative">
                            <Store className="w-4 h-4 text-[#9A7A55] absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={storeName}
                              onChange={e => setStoreName(e.target.value)}
                              placeholder="cth. Dapur Twin Rasa"
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFFBF2] border border-[#EDD9B0] text-xs font-semibold text-[#2B1D00] outline-none focus:ring-2 focus:ring-[#FFB800]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#5A3A00] mb-1">Nomor WhatsApp Operasional</label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-[#9A7A55] absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={phone}
                              onChange={e => setPhone(e.target.value)}
                              placeholder="cth. 081234567890"
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFFBF2] border border-[#EDD9B0] text-xs font-semibold text-[#2B1D00] outline-none focus:ring-2 focus:ring-[#FFB800]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={savingBox === 'identitas'}
                          className="h-10 px-5 rounded-xl bg-[#2B1D00] hover:bg-[#422C00] text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                        >
                          {savingBox === 'identitas' ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Menyimpan...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5" />
                              <span>Simpan Profil</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* TAB 2: PREFERENSI USAHA */}
                {activeTab === 'preference' && (
                  <form onSubmit={handleSavePreferensi} className="space-y-6 animate-in fade-in duration-150">
                    <div className="rounded-[24px] bg-white border border-[#EDE0C4] p-5 sm:p-6 space-y-4 shadow-xs">
                      <div>
                        <h3 className="text-sm font-black text-[#2B1D00]">Jenis Usaha Kuliner</h3>
                        <p className="text-xs text-[#8A6A40] mt-0.5">
                          Membantu AI merekomendasikan bahan baku &amp; takaran resep yang sesuai
                        </p>
                      </div>

                      {errorBox?.box === 'preferensi' && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{errorBox.msg}</span>
                        </div>
                      )}

                      {successBox === 'preferensi' && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                          <span>Preferensi usaha berhasil diperbarui!</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {USAHA_OPTIONS.map(opt => {
                          const selected = businessType === opt.id
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setBusinessType(opt.id)}
                              className={clsx(
                                'flex items-center gap-3 p-3 rounded-2xl text-left border transition-all cursor-pointer',
                                selected
                                  ? 'bg-[#FFF3CC] border-[#FFB800] text-[#2B1D00] font-bold shadow-2xs'
                                  : 'bg-[#FFFBF2] border-[#EDD9B0] text-[#5A3A00] hover:bg-[#FFF6E0]'
                              )}
                            >
                              <span className="text-xl">{opt.icon}</span>
                              <span className="text-xs font-semibold">{opt.label}</span>
                            </button>
                          )
                        })}
                      </div>

                      <div className="pt-3 border-t border-[#EDD9B0] space-y-2">
                        <label className="block text-xs font-bold text-[#5A3A00]">
                          Kanal Penjualan Aktif
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {KANAL_OPTIONS.map(ch => {
                            const active = salesChannels.includes(ch)
                            return (
                              <button
                                key={ch}
                                type="button"
                                onClick={() => toggleChannel(ch)}
                                className={clsx(
                                  'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border',
                                  active
                                    ? 'bg-[#2B1D00] border-[#2B1D00] text-white'
                                    : 'bg-[#FFFBF2] border-[#EDD9B0] text-[#5A3A00] hover:bg-[#FFF6E0]'
                                )}
                              >
                                {active ? `✓ ${ch}` : `+ ${ch}`}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#EDD9B0] space-y-2">
                        <label className="block text-xs font-bold text-[#5A3A00]">
                          Frekuensi Mengalami Stok Habis
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {HABIS_OPTIONS.map(h => (
                            <button
                              key={h.value}
                              type="button"
                              onClick={() => setStockoutFrequency(h.value)}
                              className={clsx(
                                'p-2.5 rounded-xl text-left border transition-all cursor-pointer',
                                stockoutFrequency === h.value
                                  ? 'bg-[#FFF3CC] border-[#FFB800] text-[#2B1D00] font-bold'
                                  : 'bg-[#FFFBF2] border-[#EDD9B0] text-[#5A3A00] hover:bg-[#FFF6E0]'
                              )}
                            >
                              <p className="text-xs font-bold">{h.label}</p>
                              <p className="text-[10px] text-[#8A6A40] mt-0.5">{h.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={savingBox === 'preferensi'}
                          className="h-10 px-5 rounded-xl bg-[#2B1D00] hover:bg-[#422C00] text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                        >
                          {savingBox === 'preferensi' ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Menyimpan...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5" />
                              <span>Simpan Preferensi</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* TAB 3: NOTIFIKASI */}
                {activeTab === 'notification' && (
                  <form onSubmit={handleSaveNotifikasi} className="space-y-6 animate-in fade-in duration-150">
                    <div className="rounded-[24px] bg-white border border-[#EDE0C4] p-5 sm:p-6 space-y-4 shadow-xs">
                      <div>
                        <h3 className="text-sm font-black text-[#2B1D00]">Pengaturan Notifikasi Otomatis</h3>
                        <p className="text-xs text-[#8A6A40] mt-0.5">
                          Aktifkan pengingat sistem untuk tagihan supplier dan ringkasan omzet harian
                        </p>
                      </div>

                      {errorBox?.box === 'notifikasi' && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{errorBox.msg}</span>
                        </div>
                      )}

                      {successBox === 'notifikasi' && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                          <span>Preferensi notifikasi berhasil disimpan!</span>
                        </div>
                      )}

                      <div className="space-y-3">
                        <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FFFBF2] border border-[#EDD9B0] cursor-pointer hover:bg-[#FFF6E0] transition-colors">
                          <input
                            type="checkbox"
                            checked={notifyTagihanOverdue}
                            onChange={e => setNotifyTagihanOverdue(e.target.checked)}
                            className="mt-0.5 rounded border-[#EDD9B0] text-[#FFB800] focus:ring-[#FFB800]"
                          />
                          <div>
                            <span className="text-xs font-bold text-[#2B1D00] block">
                              Peringatan Tagihan Jatuh Tempo
                            </span>
                            <span className="text-[11px] text-[#8A6A40] block mt-0.5">
                              Tampilkan notifikasi penting saat ada invoice pembelian supplier melewati batas tempo pembayaran
                            </span>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FFFBF2] border border-[#EDD9B0] cursor-pointer hover:bg-[#FFF6E0] transition-colors">
                          <input
                            type="checkbox"
                            checked={notifyDailySales}
                            onChange={e => setNotifyDailySales(e.target.checked)}
                            className="mt-0.5 rounded border-[#EDD9B0] text-[#FFB800] focus:ring-[#FFB800]"
                          />
                          <div>
                            <span className="text-xs font-bold text-[#2B1D00] block">
                              Laporan Rekapitulasi Kasir Harian
                            </span>
                            <span className="text-[11px] text-[#8A6A40] block mt-0.5">
                              Rekapitulasi otomatis omzet, margin kotor, dan porsi menu terjual setiap penutupan operasional dapur
                            </span>
                          </div>
                        </label>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={savingBox === 'notifikasi'}
                          className="h-10 px-5 rounded-xl bg-[#2B1D00] hover:bg-[#422C00] text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                        >
                          {savingBox === 'notifikasi' ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Menyimpan...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5" />
                              <span>Simpan Notifikasi</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* TAB 4: KEAMANAN & GANTI PASSWORD */}
                {activeTab === 'security' && (
                  <form onSubmit={handleUpdatePassword} className="space-y-6 animate-in fade-in duration-150">
                    <div className="rounded-[24px] bg-white border border-[#EDE0C4] p-5 sm:p-6 space-y-4 shadow-xs">
                      <div>
                        <h3 className="text-sm font-black text-[#2B1D00] flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-[#FF8F28]" />
                          <span>Ganti Kata Sandi Login</span>
                        </h3>
                        <p className="text-xs text-[#8A6A40] mt-0.5">
                          Perbarui kata sandi akun Supabase Anda secara aman. Minimal 6 karakter.
                        </p>
                      </div>

                      {passwordError && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{passwordError}</span>
                        </div>
                      )}

                      {passwordSuccess && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                          <span>Kata sandi Anda berhasil diperbarui! Gunakan sandi baru pada login berikutnya.</span>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-[#5A3A00] mb-1">
                            Kata Sandi Baru
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-[#9A7A55] absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                              placeholder="Minimal 6 karakter"
                              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FFFBF2] border border-[#EDD9B0] text-xs font-semibold text-[#2B1D00] outline-none focus:ring-2 focus:ring-[#FFB800]"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9A7A55] hover:text-[#2B1D00] cursor-pointer"
                            >
                              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#5A3A00] mb-1">
                            Konfirmasi Kata Sandi Baru
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-[#9A7A55] absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={e => setConfirmPassword(e.target.value)}
                              placeholder="Ulangi kata sandi baru"
                              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FFFBF2] border border-[#EDD9B0] text-xs font-semibold text-[#2B1D00] outline-none focus:ring-2 focus:ring-[#FFB800]"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9A7A55] hover:text-[#2B1D00] cursor-pointer"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[#FFF8E8] border border-[#EDD9B0] text-[11px] text-[#8A6A40] space-y-1">
                          <p className="font-bold text-[#5A3A00]">Tips Keamanan Sandi:</p>
                          <ul className="list-disc list-inside space-y-0.5">
                            <li>Gunakan kombinasi huruf, angka, dan simbol untuk keamanan ekstra</li>
                            <li>Jangan gunakan kata sandi yang sama dengan email pribadi Anda</li>
                            <li>Sandi otomatis tersinkronisasi langsung ke Supabase Auth</li>
                          </ul>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={isUpdatingPassword}
                          className="h-10 px-5 rounded-xl bg-[#D8431F] hover:bg-[#BA3817] text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50 shadow-sm"
                        >
                          {isUpdatingPassword ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Memperbarui Sandi...</span>
                            </>
                          ) : (
                            <>
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>Perbarui Kata Sandi</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
