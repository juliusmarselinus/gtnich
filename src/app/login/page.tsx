'use client'

import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import DapiFace, { FaceMood } from '@/components/ui/DapiFace'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function friendlyError(msg: string) {
  const m = msg.toLowerCase()
  if (m.includes('rate limit'))
    return 'Batas pengiriman email Supabase tercapai (Rate limit exceeded). Di Supabase Dashboard, Anda dapat menonaktifkan "Confirm email" di Authentication > Providers > Email agar pendaftaran langsung aktif tanpa verifikasi email.'
  if (m.includes('failed to fetch') || m.includes('network'))
    return 'Server tidak bisa dihubungi. Cek koneksi internet atau isi file .env.local.'
  if (m.includes('invalid login') || m.includes('invalid credentials')) return 'Email atau kata sandi salah. Coba lagi, ya.'
  if (m.includes('email not confirmed')) return 'Email belum dikonfirmasi. Cek kotak masuk email kamu, atau matikan "Confirm email" di dashboard Supabase.'
  if (m.includes('already registered')) return 'Email ini sudah terdaftar. Silakan masuk.'
  if (m.includes('invalid email') || m.includes('not valid')) return 'Format email tidak valid. Pastikan penulisan email sudah benar tanpa spasi.'
  if (m.includes('password should be at least')) return 'Kata sandi minimal 6 karakter.'
  if (m.includes('database error saving new user'))
    return 'Terjadi kendala saat menyimpan profil pendaftaran. Silakan coba lagi.'
  if (m.includes('provider is not enabled') || m.includes('unsupported provider'))
    return 'Provider Google belum diaktifkan di Supabase Dashboard. Aktifkan di menu Authentication > Providers > Google.'
  if (m.includes('popup closed') || m.includes('cancelled'))
    return 'Proses login Google dibatalkan.'
  return msg || 'Terjadi kesalahan. Coba lagi sebentar lagi.'
}

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [storeName, setStoreName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [focusField, setFocusField] = useState<'email' | 'password' | 'name' | 'store' | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const [surveyData, setSurveyData] = useState<{ usaha?: string; kanal?: string; habis?: number }>({})

  // dari landing: /login?daftar=1 langsung buka form daftar beserta data survey
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('error') === 'oauth_error') {
      setErrorMessage('Gagal login pakai akun Google. Silakan coba lagi.')
    }
    if (params.get('daftar') === '1') {
      setIsSignUp(true)
      const u = params.get('usaha') || undefined
      const k = params.get('kanal') || undefined
      const h = params.get('habis') ? Number(params.get('habis')) : undefined
      const data = { usaha: u, kanal: k, habis: h }
      setSurveyData(data)

      // Simpan juga ke cookie dan localStorage sebagai cadangan untuk alur OAuth Google
      try {
        if (u || k || h !== undefined) {
          document.cookie = `dapur_survey=${encodeURIComponent(JSON.stringify(data))}; path=/; max-age=3600; SameSite=Lax`
          localStorage.setItem('dapur_survey', JSON.stringify(data))
        }
      } catch {
        // ignore
      }
    } else {
      // Cek apakah ada survey yang tersimpan di localStorage sebelumnya
      try {
        const saved = localStorage.getItem('dapur_survey')
        if (saved) {
          const parsed = JSON.parse(saved)
          setSurveyData(parsed)
        }
      } catch {
        // ignore
      }
    }
  }, [])

  // Ekspresi Dapi mengikuti apa yang sedang dilakukan user
  const mood: FaceMood = isSuccess
    ? 'success'
    : errorMessage
      ? 'error'
      : isLoading || isGoogleLoading
        ? 'loading'
        : focusField === 'password'
          ? (showPassword ? 'peek' : 'password')
          : focusField === 'email'
            ? 'email'
            : 'idle'

  const supabase = createClient()

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setErrorMessage(null)
    setMessage(null)

    try {
      const origin = window.location.origin
      const callbackUrl = new URL(`${origin}/auth/callback`)
      if (surveyData.usaha) callbackUrl.searchParams.set('usaha', surveyData.usaha)
      if (surveyData.kanal) callbackUrl.searchParams.set('kanal', surveyData.kanal)
      if (surveyData.habis !== undefined) callbackUrl.searchParams.set('habis', String(surveyData.habis))

      // Simpan cookie cadangan sebelum redirect OAuth
      try {
        if (surveyData.usaha || surveyData.kanal || surveyData.habis !== undefined) {
          document.cookie = `dapur_survey=${encodeURIComponent(JSON.stringify(surveyData))}; path=/; max-age=3600; SameSite=Lax`
        }
      } catch {
        // ignore
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl.toString(),
        },
      })

      if (error) {
        setErrorMessage('Gagal login pakai akun Google. Silakan coba lagi.')
        setIsGoogleLoading(false)
      }
    } catch {
      setErrorMessage('Gagal login pakai akun Google. Silakan coba lagi.')
      setIsGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)
    setMessage(null)

    const cleanEmail = email.trim().toLowerCase()
    const cleanPassword = password.trim()

    // Validasi format email di sisi client
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      setIsLoading(false)
      setErrorMessage('Format email tidak valid. Pastikan contoh: nama@gmail.com tanpa spasi.')
      return
    }

    if (cleanPassword.length < 6) {
      setIsLoading(false)
      setErrorMessage('Kata sandi minimal 6 karakter.')
      return
    }

    try {
      if (isSignUp) {
        const resolvedName = fullName.trim() || cleanEmail.split('@')[0]
        const resolvedStore = storeName.trim() || `Dapur ${resolvedName}`

        const { error, data } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              full_name: resolvedName,
              store_name: resolvedStore,
              business_type: surveyData.usaha || null,
              sales_channels: surveyData.kanal ? surveyData.kanal.split(',') : null,
              stockout_frequency: surveyData.habis ?? null,
            },
          },
        })

        if (error) {
          setErrorMessage(friendlyError(error.message))
        } else if (data.session) {
          // Buat record profil langsung dari client jika trigger belum terpasang
          try {
            await supabase.from('profiles').upsert(
              {
                id: data.session.user.id,
                full_name: resolvedName,
                store_name: resolvedStore,
                business_type: surveyData.usaha || null,
                sales_channels: surveyData.kanal ? surveyData.kanal.split(',') : null,
              },
              { onConflict: 'id' }
            )
          } catch {
            // non-blocking
          }

          setIsSuccess(true)

          // Picu notifikasi email login via Resend (non-blocking)
          fetch('/api/notify-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: cleanEmail,
              userName: resolvedName,
              loginMethod: 'Pendaftaran Akun Baru',
            }),
          }).catch(() => {})

          await new Promise((r) => setTimeout(r, 600))
          router.push('/dashboard')
        } else {
          setMessage('Pendaftaran berhasil! Akun Anda telah siap. Silakan masuk untuk memulai.')
          setIsSignUp(false)
        }
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        })

        if (error) {
          setErrorMessage(friendlyError(error.message))
        } else {
          setIsSuccess(true)

          // Picu notifikasi email login via Resend (non-blocking)
          fetch('/api/notify-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: cleanEmail,
              userName: data.user?.user_metadata?.full_name || cleanEmail.split('@')[0],
              loginMethod: 'Email & Kata Sandi',
            }),
          }).catch(() => {})

          await new Promise((r) => setTimeout(r, 700)) // biar senyum Dapi kelihatan dulu
          router.push('/dashboard')
          router.refresh()
        }
      }
    } catch (err: unknown) {
      const error = err as Error
      setErrorMessage(friendlyError(error?.message || ''))
    } finally {
      setIsLoading(false)
    }
  }

  const inputCls =
    'w-full px-4 py-3 bg-[#FFFBF5] border-2 border-[#F2E3D0] rounded-2xl text-sm text-[#2B221C] placeholder:text-[#BCA184] focus:outline-none focus:border-[#FF9F3F] focus:bg-white transition'

  return (
    <div className="min-h-screen bg-[#FFF8EE] flex items-center justify-center sm:p-6 text-[#2B221C]">
      <div
        key={errorMessage ?? 'ok'}
        className={`w-full sm:max-w-sm lg:max-w-5xl min-h-screen sm:min-h-0 bg-white sm:rounded-[2.5rem] overflow-hidden shadow-[0_30px_70px_-30px_rgba(178,98,20,0.45)] flex flex-col lg:grid lg:grid-cols-[1.1fr_1fr] lg:min-h-[620px] ${errorMessage ? 'dapi-shake' : ''}`}
      >
        {/* Dapi: di atas form (mobile), panel kiri besar (desktop) */}
        <div className="relative h-60 lg:h-auto lg:m-3 lg:rounded-[2rem] overflow-hidden lg:[&_svg]:w-[340px] lg:[&_svg]:h-auto">
          <DapiFace mood={mood} typingProgress={Math.min(email.length / 28, 1)} />
          <span className="hidden lg:block absolute bottom-6 left-8 text-lg font-black tracking-tight">DapurTwin</span>
        </div>

        {/* Form */}
        <div className="flex flex-col justify-center p-7 sm:p-8 lg:px-14 lg:py-12">
          <div className="mb-6">
            <h1 className="text-2xl lg:text-4xl font-black tracking-tight">
              {isSignUp ? 'Buat akun DapurTwin' : 'Selamat datang kembali!'}
            </h1>
            <p className="text-sm text-[#6F5C4A] mt-1.5">
              {isSignUp ? 'Daftarkan usaha kulinermu dalam satu menit.' : 'Masuk untuk melihat kondisi dapurmu hari ini.'}
            </p>
          </div>

          {errorMessage && (
            <div role="alert" className="mb-4 p-3 rounded-2xl bg-[#FFF0EC] border-2 border-[#FFC2B5] flex items-start gap-2 text-[#9A3412] text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {message && (
            <div role="status" className="mb-4 p-3 rounded-2xl bg-[#F1F8FF] border-2 border-[#C5DEFB] text-[#1E4E8C] text-sm">
              {message}
            </div>
          )}

          {/* Opsi Login dengan Google via Supabase OAuth */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
            className="w-full py-3.5 px-4 bg-white hover:bg-[#FFFBF5] active:scale-[0.99] border-2 border-[#E8D7C3] hover:border-[#D9C4AE] rounded-2xl text-sm font-bold text-[#2B221C] shadow-sm transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#6F5C4A]" />
            ) : (
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{isSignUp ? 'Daftar dengan Google' : 'Lanjutkan dengan Google'}</span>
          </button>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E8D7C3]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 font-medium text-[#8C7560]">
                atau {isSignUp ? 'daftar' : 'masuk'} dengan email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-bold mb-1.5">
                    Nama Pemilik / Pengelola
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onFocus={() => { setFocusField('name'); setErrorMessage(null) }}
                    onBlur={() => setFocusField(null)}
                    className={inputCls}
                    placeholder="Contoh: Budi Santoso"
                    autoComplete="name"
                    required={isSignUp}
                  />
                </div>

                <div>
                  <label htmlFor="storeName" className="block text-sm font-bold mb-1.5">
                    Nama Usaha / Dapur Kuliner
                  </label>
                  <input
                    id="storeName"
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    onFocus={() => { setFocusField('store'); setErrorMessage(null) }}
                    onBlur={() => setFocusField(null)}
                    className={inputCls}
                    placeholder="Contoh: Dapur Twin Rasa"
                    autoComplete="organization"
                    required={isSignUp}
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-bold mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => { setFocusField('email'); setErrorMessage(null) }}
                onBlur={() => setFocusField(null)}
                className={inputCls}
                placeholder="nama@usaha.id"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold mb-1.5">Kata sandi</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => { setFocusField('password'); setErrorMessage(null) }}
                  onBlur={() => setFocusField(null)}
                  className={`${inputCls} pr-11`}
                  placeholder="Minimal 6 karakter"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#917A63] hover:text-[#2B221C]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full !mt-6 py-3.5 bg-[#FF8F28] hover:bg-[#FF9F3F] disabled:opacity-60 text-white font-bold text-sm rounded-full shadow-[0_4px_0_#C9620C] active:translate-y-[3px] active:shadow-[0_1px_0_#C9620C] transition flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isSignUp ? 'Buat akun' : 'Masuk ke dapur'}</span>
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6F5C4A]">
            {isSignUp ? (
              <>
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false)
                    setErrorMessage(null)
                    setMessage(null)
                  }}
                  className="font-bold text-[#B5560A] hover:underline"
                >
                  Masuk
                </button>
              </>
            ) : (
              <>
                Belum punya akun?{' '}
                <Link
                  href="/"
                  className="font-bold text-[#B5560A] hover:underline"
                >
                  Daftar sekarang
                </Link>
              </>
            )}
          </p>

          <Link href="/" className="mt-3 text-center text-xs text-[#917A63] hover:underline">← Kembali ke beranda</Link>
        </div>
      </div>
    </div>
  )
}
