'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import DapurTwinLogo from '@/components/ui/DapurTwinLogo'
import DapiHead from '@/components/ui/DapiHead'

const inputCls =
  'w-full px-4 py-3 bg-[#FFFBF5] border-2 border-[#F2E3D0] rounded-2xl text-sm text-[#2B221C] placeholder:text-[#BCA184] focus:outline-none focus:border-[#FF9F3F] focus:bg-white transition'

type Stage = 'checking' | 'ready' | 'invalid' | 'done'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Link dari email membawa ?code=... -> tukar jadi sesi sementara untuk ganti sandi
  useEffect(() => {
    let cancelled = false
    const init = async () => {
      const code = new URLSearchParams(window.location.search).get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          window.history.replaceState(null, '', '/reset-password')
          if (!cancelled) setStage('ready')
          return
        }
      }
      // Bisa jadi sesi sudah ditukar otomatis oleh Supabase
      const { data } = await supabase.auth.getSession()
      if (!cancelled) setStage(data.session ? 'ready' : 'invalid')
    }
    init()
    return () => { cancelled = true }
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    if (password.length < 6) return setErrorMessage('Kata sandi minimal 6 karakter.')
    if (password !== confirm) return setErrorMessage('Konfirmasi kata sandi tidak sama.')

    setIsLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setIsLoading(false)

    if (error) {
      const m = error.message.toLowerCase()
      setErrorMessage(
        m.includes('different from the old')
          ? 'Kata sandi baru harus berbeda dari yang lama.'
          : 'Gagal menyimpan kata sandi. Coba minta link reset baru.'
      )
      return
    }
    setStage('done')
    setTimeout(() => router.push('/dashboard'), 1800)
  }

  return (
    <div className="min-h-screen bg-[#FDF0DC] flex items-center justify-center p-4">
      <div className="relative w-full max-w-md mt-16">
        <div aria-hidden className="absolute left-1/2 -translate-x-1/2 -top-[104px] drop-shadow-[0_14px_18px_rgba(120,50,0,0.25)]">
          <DapiHead size={110} mood={stage === 'invalid' ? 'khawatir' : 'senang'} />
        </div>

        <div className="relative rounded-[32px] bg-white p-7 sm:p-9 shadow-[0_18px_40px_rgba(120,80,30,0.14)]">
          <div className="flex justify-center mb-5">
            <DapurTwinLogo iconSize={28} className="[&_svg]:!h-7 [&_svg]:!w-7" />
          </div>

          {stage === 'checking' && (
            <div className="py-8 flex flex-col items-center gap-3 text-[#6F5C4A]">
              <Loader2 className="w-6 h-6 animate-spin text-[#FF8F28]" />
              <p className="text-sm">Memeriksa link…</p>
            </div>
          )}

          {stage === 'invalid' && (
            <div className="text-center space-y-3">
              <h1 className="text-2xl font-black tracking-tight text-[#2B221C]">Link tidak berlaku</h1>
              <p className="text-sm text-[#6F5C4A]">
                Link reset sudah kedaluwarsa atau sudah dipakai. Minta link baru, lalu buka dari browser yang sama.
              </p>
              <Link
                href="/lupa-password"
                className="inline-flex mt-2 px-6 py-3 bg-[#FF8F28] hover:bg-[#FF9F3F] text-white font-bold text-sm rounded-full shadow-[0_4px_0_#C9620C]"
              >
                Minta link baru
              </Link>
            </div>
          )}

          {stage === 'done' && (
            <div className="text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-full bg-[#E2EBC0] text-[#5E7420] flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-[#2B221C]">Kata sandi diganti</h1>
              <p className="text-sm text-[#6F5C4A]">Mengarahkan ke dashboard…</p>
            </div>
          )}

          {stage === 'ready' && (
            <>
              <h1 className="text-2xl font-black tracking-tight text-[#2B221C] text-center">Buat kata sandi baru</h1>
              <p className="mt-1.5 text-sm text-[#6F5C4A] text-center">Minimal 6 karakter.</p>

              {errorMessage && (
                <div className="mt-5 p-3 rounded-2xl bg-[#FDE7E1] text-[#B8391E] text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-bold mb-1.5 text-[#2B221C]">Kata sandi baru</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrorMessage(null) }}
                      className={`${inputCls} pr-11`}
                      placeholder="Minimal 6 karakter"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#917A63] hover:text-[#2B221C]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirm" className="block text-sm font-bold mb-1.5 text-[#2B221C]">Ulangi kata sandi</label>
                  <input
                    id="confirm"
                    type={showPassword ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setErrorMessage(null) }}
                    className={inputCls}
                    placeholder="Ketik ulang"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#FF8F28] hover:bg-[#FF9F3F] disabled:opacity-60 text-white font-bold text-sm rounded-full shadow-[0_4px_0_#C9620C] active:translate-y-[3px] active:shadow-[0_1px_0_#C9620C] transition flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Simpan kata sandi</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
