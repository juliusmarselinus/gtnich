'use client'

import { Store, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('budi@orderhub.id')
  const [password, setPassword] = useState('password123')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    router.push('/dashboard')
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
              Masuk ke OrderHub
            </h1>
            <p className="text-xs text-[#6B665F] mt-1">
              Pusat kendali pesanan WhatsApp dan operasional toko
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5">
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
              className="w-full mt-2 py-2 px-4 bg-[#1F1D1A] hover:bg-[#383531] text-white font-medium text-xs rounded-lg transition-colors"
            >
              Masuk ke Dashboard
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-[#9C9589] mt-4">
          OrderHub • Solusi Terpadu Transformasi Digital UMKM
        </p>
      </div>
    </div>
  )
}
