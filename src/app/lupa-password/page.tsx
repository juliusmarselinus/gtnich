'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, AlertCircle, MailCheck, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import DapurTwinLogo from '@/components/ui/DapurTwinLogo'
import DapiHead from '@/components/ui/DapiHead'

const inputCls =
  'w-full px-4 py-3 bg-[#FFFBF5] border-2 border-[#F2E3D0] rounded-2xl text-sm text-[#2B221C] placeholder:text-[#BCA184] focus:outline-none focus:border-[#FF9F3F] focus:bg-white transition'

export default function LupaPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) return

    setIsLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setIsLoading(false)

    if (error) {
      const m = error.message.toLowerCase()
      setErrorMessage(
        m.includes('rate limit')
          ? 'Terlalu banyak permintaan. Tunggu beberapa menit lalu coba lagi.'
          : 'Gagal mengirim email. Coba lagi sebentar lagi.'
      )
      return
    }
    // Selalu tampilkan sukses meski email tidak terdaftar, agar daftar akun tidak bisa ditebak
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-[#FDF0DC] flex items-center justify-center p-4">
      <div className="relative w-full max-w-md mt-16">
        <div aria-hidden className="absolute left-1/2 -translate-x-1/2 -top-[104px] drop-shadow-[0_14px_18px_rgba(120,50,0,0.25)]">
          <DapiHead size={110} mood={sent ? 'senang' : 'khawatir'} />
        </div>

        <div className="relative rounded-[32px] bg-white p-7 sm:p-9 shadow-[0_18px_40px_rgba(120,80,30,0.14)]">
          <div className="flex justify-center mb-5">
            <DapurTwinLogo iconSize={28} className="[&_svg]:!h-7 [&_svg]:!w-7" />
          </div>

          {sent ? (
            <div className="text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-full bg-[#E2EBC0] text-[#5E7420] flex items-center justify-center">
                <MailCheck className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-[#2B221C]">Cek email kamu</h1>
              <p className="text-sm text-[#6F5C4A] leading-relaxed">
                Kalau <b className="text-[#2B221C]">{email.trim()}</b> terdaftar, link untuk membuat kata sandi baru sudah dikirim.
                Cek juga folder spam.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="text-sm font-bold text-[#C9620C] hover:underline"
              >
                Kirim ulang
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-black tracking-tight text-[#2B221C] text-center">Lupa kata sandi?</h1>
              <p className="mt-1.5 text-sm text-[#6F5C4A] text-center">
                Masukkan email akunmu. Dapi kirimkan link untuk membuat kata sandi baru.
              </p>

              {errorMessage && (
                <div className="mt-5 p-3 rounded-2xl bg-[#FDE7E1] text-[#B8391E] text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-bold mb-1.5 text-[#2B221C]">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrorMessage(null) }}
                    className={inputCls}
                    placeholder="nama@usaha.id"
                    autoComplete="email"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#FF8F28] hover:bg-[#FF9F3F] disabled:opacity-60 text-white font-bold text-sm rounded-full shadow-[0_4px_0_#C9620C] active:translate-y-[3px] active:shadow-[0_1px_0_#C9620C] transition flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Kirim link reset</span>
                </button>
              </form>
            </>
          )}

          <Link
            href="/login"
            className="mt-6 flex items-center justify-center gap-1.5 text-sm font-bold text-[#6F5C4A] hover:text-[#2B221C]"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke halaman masuk
          </Link>
        </div>
      </div>
    </div>
  )
}
