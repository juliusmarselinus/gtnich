'use client'

import { Store, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('budi@orderhub.id')
  const [password, setPassword] = useState('password123')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

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
          setErrorMessage(error.message)
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
          setErrorMessage(error.message)
        } else {
          router.push('/dashboard')
          router.refresh()
        }
      }
    } catch (err: unknown) {
      const error = err as Error
      setErrorMessage(error?.message || 'Terjadi kesalahan saat otentikasi')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6 text-[#1F1D1A]">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-[#FFFFFF] rounded-2xl p-8 border border-[#EAE5DF] shadow-sm">
          {/* Header */}
          <div className="mb-6">
            <div className="w-9 h-9 rounded-lg bg-[#3E6B48] flex items-center justify-center text-white mb-3">
              <Store className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-[#1F1D1A]">
              {isSignUp ? 'Daftar Akun OrderHub' : 'Masuk ke OrderHub'}
            </h1>
            <p className="text-xs text-[#6B665F] mt-1">
              Pusat kendali pesanan WhatsApp dan operasional toko
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#6B665F] mb-1">
                Alamat Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#EAE5DF] rounded-lg text-xs text-[#1F1D1A] placeholder:text-[#9C9589] focus:outline-none focus:border-[#3E6B48]"
                placeholder="nama@toko.id"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B665F] mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#EAE5DF] rounded-lg text-xs text-[#1F1D1A] placeholder:text-[#9C9589] focus:outline-none focus:border-[#3E6B48] pr-9"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9C9589] hover:text-[#1F1D1A]"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2 px-4 bg-[#1F1D1A] hover:bg-[#383531] disabled:opacity-60 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSignUp ? 'Buat Akun' : 'Masuk ke Dashboard'}</span>
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-[#EAE5DF] text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setErrorMessage(null)
                setMessage(null)
              }}
              className="text-xs text-[#3E6B48] hover:underline font-medium"
            >
              {isSignUp ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar sekarang'}
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-[#9C9589] mt-4">
          OrderHub • Solusi Terpadu Transformasi Digital UMKM
        </p>
      </div>
    </div>
  )
}
