'use client'

import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import DapiFace, { FaceMood } from '@/components/ui/DapiFace'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function friendlyError(msg: string) {
  const m = msg.toLowerCase()
  if (m.includes('failed to fetch') || m.includes('network'))
    return 'Server tidak bisa dihubungi. Cek koneksi internet atau isi file .env.local.'
  if (m.includes('invalid login')) return 'Email atau kata sandi salah. Coba lagi, ya.'
  if (m.includes('email not confirmed')) return 'Email belum dikonfirmasi. Cek kotak masuk email kamu.'
  if (m.includes('already registered')) return 'Email ini sudah terdaftar. Silakan masuk.'
  return msg || 'Terjadi kesalahan. Coba lagi sebentar lagi.'
}

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('budi@orderhub.id')
  const [password, setPassword] = useState('password123')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [focusField, setFocusField] = useState<'email' | 'password' | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // dari landing: /login?daftar=1 langsung buka form daftar
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('daftar') === '1') setIsSignUp(true)
  }, [])

  // Ekspresi Dapi mengikuti apa yang sedang dilakukan user
  const mood: FaceMood = isSuccess
    ? 'success'
    : errorMessage
      ? 'error'
      : isLoading
        ? 'loading'
        : focusField === 'password'
          ? (showPassword ? 'peek' : 'password')
          : focusField === 'email'
            ? 'email'
            : 'idle'

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)
    setMessage(null)

    try {
      if (isSignUp) {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: email.split('@')[0],
            },
          },
        })

        if (error) {
          setErrorMessage(friendlyError(error.message))
        } else if (data.session) {
          router.push('/dashboard')
        } else {
          setMessage('Pendaftaran berhasil! Silakan cek email Anda untuk konfirmasi, atau silakan login jika email confirm dinonaktifkan di dashboard Supabase.')
          setIsSignUp(false)
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          setErrorMessage(friendlyError(error.message))
        } else {
          setIsSuccess(true)
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

          <form onSubmit={handleSubmit} className="space-y-4">
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
            {isSignUp ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setErrorMessage(null)
                setMessage(null)
              }}
              className="font-bold text-[#B5560A] hover:underline"
            >
              {isSignUp ? 'Masuk' : 'Daftar sekarang'}
            </button>
          </p>

          <Link href="/" className="mt-3 text-center text-xs text-[#917A63] hover:underline">← Kembali ke beranda</Link>
        </div>
      </div>
    </div>
  )
}
