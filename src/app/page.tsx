'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, TrendingUp, ClipboardCheck, Sparkles, PieChart, Camera } from 'lucide-react'
import DapiFace, { FaceMood } from '@/components/ui/DapiFace'
import SplashScreen from '@/components/SplashScreen'

/**
 * Landing DapurTwin: perkenalan singkat bersama Dapi.
 * 0 = sapaan, 1 = jenis usaha, 2 = kanal jualan, 3 = seberapa sering bahan habis,
 * 4 = rekomendasi fitur sesuai jawaban → daftar.
 */

const USAHA = [
  { id: 'kafe', label: 'Kafe / kedai minuman', icon: '☕' },
  { id: 'katering', label: 'Dapur katering', icon: '🍱' },
  { id: 'kue', label: 'Toko kue & roti', icon: '🥐' },
  { id: 'warung', label: 'Warung / rumah makan', icon: '🍛' },
]

const KANAL = ['Jualan di tempat', 'GoFood', 'GrabFood', 'ShopeeFood', 'Pesanan WhatsApp']

const HABIS = [
  { say: 'Wah, dapurmu rapi sekali!', mood: 'success' as FaceMood, label: 'Hampir tidak pernah' },
  { say: 'Sesekali masih wajar, kok.', mood: 'idle' as FaceMood, label: 'Sebulan sekali' },
  { say: 'Hmm, itu mulai merepotkan.', mood: 'email' as FaceMood, label: 'Dua minggu sekali' },
  { say: 'Aduh, pasti bikin panik ya...', mood: 'error' as FaceMood, label: 'Tiap minggu' },
  { say: 'Tenang, ini keahlianku!', mood: 'error' as FaceMood, label: 'Hampir tiap hari' },
]

type Fitur = { icon: React.ElementType; title: string; desc: string; tint: string }

export default function LandingPage() {
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState<1 | -1>(1)
  const [usaha, setUsaha] = useState<string | null>(null)
  const [kanal, setKanal] = useState<string[]>([])
  const [habis, setHabis] = useState(2)

  const go = (n: number) => { setDir(n > step ? 1 : -1); setStep(n) }

  const bubble: { say: string; mood: FaceMood } = useMemo(() => {
    if (step === 0) return { say: 'Halo! Aku Dapi, penjaga dapurmu.', mood: 'idle' }
    if (step === 1) return { say: usaha ? 'Oke, aku catat!' : 'Usahamu jualan apa?', mood: usaha ? 'success' : 'email' }
    if (step === 2) return {
      say: kanal.length >= 3 ? `${kanal.length} kanal? Sibuk sekali!` : kanal.length ? 'Ada lagi?' : 'Jualan lewat mana saja?',
      mood: kanal.length >= 3 ? 'loading' : 'email',
    }
    if (step === 3) return { say: HABIS[habis].say, mood: HABIS[habis].mood }
    return { say: 'Ini yang bisa aku bantu!', mood: 'success' }
  }, [step, usaha, kanal, habis])

  // rekomendasi disusun dari jawaban
  const fitur: Fitur[] = useMemo(() => {
    const list: (Fitur & { score: number })[] = [
      { icon: TrendingUp, title: 'Stock timeline', desc: 'Lihat kapan tiap bahan habis atau basi, bukan cuma sisa stoknya.', tint: '#FFF0D6', score: 2 + habis },
      { icon: ClipboardCheck, title: 'Auto purchase order', desc: 'Pesanan ke supplier disiapkan sebelum stok menipis.', tint: '#FFE4DE', score: 1 + habis },
      { icon: Sparkles, title: 'Simulasi pesanan besar', desc: 'Cek dulu sanggup atau tidak sebelum terima pesanan acara.', tint: '#E3F0FE', score: usaha === 'katering' ? 9 : usaha === 'kue' ? 5 : 2 },
      { icon: PieChart, title: 'Untung per kanal', desc: 'Bandingkan untung bersih di tempat dan di aplikasi setelah komisi.', tint: '#E8F6E3', score: kanal.length * 2 },
      { icon: Camera, title: 'Foto nota', desc: 'Belanja dari pasar cukup difoto, stok dan harga terisi sendiri.', tint: '#F3EAFE', score: usaha === 'warung' ? 8 : 3 },
    ]
    return list.sort((a, b) => b.score - a.score).slice(0, 3)
  }, [usaha, kanal, habis])

  const canNext = step === 1 ? !!usaha : step === 2 ? kanal.length > 0 : true
  const progress = step === 0 ? 0 : Math.min(step, 3) / 3

  return (
    <main className="min-h-screen bg-[#FFF8EE] text-[#2B221C] flex items-center justify-center sm:p-6">
      <SplashScreen />
      <style>{`
        @keyframes lp-in-r { from { transform: translateX(40px); opacity: 0 } to { transform: none; opacity: 1 } }
        @keyframes lp-in-l { from { transform: translateX(-40px); opacity: 0 } to { transform: none; opacity: 1 } }
        @keyframes lp-rise { from { transform: translateY(16px); opacity: 0 } to { transform: none; opacity: 1 } }
        @keyframes lp-bubble { 0% { transform: scale(.8); opacity: 0 } 70% { transform: scale(1.04); opacity: 1 } 100% { transform: scale(1); opacity: 1 } }
        .lp-in-r { animation: lp-in-r 380ms cubic-bezier(.2,.8,.2,1) both }
        .lp-in-l { animation: lp-in-l 380ms cubic-bezier(.2,.8,.2,1) both }
        .lp-rise { animation: lp-rise 420ms cubic-bezier(.2,.8,.2,1) both }
        .lp-bubble { transform-origin: left center; animation: lp-bubble 320ms cubic-bezier(.34,1.56,.64,1) both }
        .lp-range { -webkit-appearance: none; appearance: none; background: transparent; }
        .lp-range::-webkit-slider-runnable-track { height: 8px; border-radius: 999px; background: #F6E9D8; }
        .lp-range::-webkit-slider-thumb { -webkit-appearance: none; margin-top: -11px; width: 30px; height: 30px; border-radius: 999px; background: #FF8F28; border: 5px solid #fff; box-shadow: 0 3px 0 #C9620C, 0 4px 12px rgba(178,98,20,.35); cursor: grab; }
        .lp-range::-moz-range-track { height: 8px; border-radius: 999px; background: #F6E9D8; }
        .lp-range::-moz-range-thumb { width: 22px; height: 22px; border-radius: 999px; background: #FF8F28; border: 5px solid #fff; box-shadow: 0 3px 0 #C9620C; cursor: grab; }
        @media (prefers-reduced-motion: reduce) { .lp-in-r, .lp-in-l, .lp-rise, .lp-bubble { animation: none } }
      `}</style>

      <div className="relative w-full sm:max-w-md lg:max-w-6xl min-h-screen sm:min-h-[760px] lg:min-h-[680px] bg-white sm:rounded-[2.5rem] sm:shadow-[0_30px_70px_-30px_rgba(178,98,20,0.45)] overflow-hidden flex flex-col lg:grid lg:grid-cols-[1.1fr_1fr]">

        {/* ===== Panel kiri khusus desktop: Dapi besar yang bereaksi ===== */}
        <div className="hidden lg:block relative m-3 rounded-[2rem] overflow-hidden [&_svg]:w-[380px] [&_svg]:h-auto">
          <DapiFace mood={bubble.mood} hideBubble typingProgress={0.5} />
          <div className="absolute top-8 left-8 flex items-center gap-2">
            <span className="text-lg font-black tracking-tight">DapurTwin</span>
          </div>
          <div className="absolute top-20 inset-x-0 flex justify-center">
            <div key={bubble.say} className="lp-bubble whitespace-nowrap rounded-2xl bg-white px-5 py-3 text-base font-bold shadow-[0_4px_0_rgba(43,34,28,0.1)]" style={{ transformOrigin: 'center bottom' }}>
              {bubble.say}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:min-h-[680px]">

        {/* ===== Langkah 0: sapaan ===== */}
        {step === 0 ? (
          <div key="s0" className="flex-1 flex flex-col">
            <div className="relative lg:hidden h-[380px] rounded-b-[2.5rem] overflow-hidden [&_svg]:w-[250px] [&_svg]:h-auto">
              <DapiFace mood="idle" hideBubble />
              <div className="absolute top-6 inset-x-0 flex justify-center">
                <div className="lp-bubble whitespace-nowrap rounded-2xl bg-white px-4 py-2 text-sm font-bold shadow-[0_4px_0_rgba(43,34,28,0.1)]" style={{ transformOrigin: 'center' }}>
                  Halo! Aku Dapi, penjaga dapurmu.
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-col px-7 pt-7 pb-8 lg:px-14 lg:py-14 lg:justify-center">
              <p className="lp-rise text-xs font-bold uppercase tracking-[0.18em] text-[#B5560A]" style={{ animationDelay: '80ms' }}>DapurTwin</p>
              <h1 className="lp-rise mt-2 text-[2rem] lg:text-5xl font-black leading-[1.1] tracking-tight" style={{ animationDelay: '160ms' }}>
                Dapurmu, satu langkah di depan.
              </h1>
              <p className="lp-rise mt-3 text-sm text-[#6F5C4A]" style={{ animationDelay: '240ms' }}>
                Jawab 3 pertanyaan singkat, nanti Dapi tunjukkan cara DapurTwin membantu usahamu.
              </p>
              <div className="mt-auto lg:mt-10 pt-6 flex flex-col gap-3 lp-rise" style={{ animationDelay: '320ms' }}>
                <button onClick={() => go(1)} className="w-full rounded-full bg-[#FF8F28] py-3.5 text-sm font-bold text-white shadow-[0_4px_0_#C9620C] transition hover:bg-[#FF9F3F] active:translate-y-[3px] active:shadow-[0_1px_0_#C9620C]">
                  Kenalan dulu, yuk
                </button>
                <Link href="/login" className="w-full rounded-full border-2 border-[#F2DDC1] py-3 text-center text-sm font-bold transition hover:bg-[#FFF6EC]">
                  Sudah punya akun? Masuk
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col px-6 pt-6 pb-7 lg:px-12 lg:py-12">
            {/* header + progress */}
            <div className="flex items-center gap-3">
              <button onClick={() => go(step - 1)} aria-label="Kembali" className="w-9 h-9 grid place-items-center rounded-full hover:bg-[#FFF6EC]">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1 h-2.5 rounded-full bg-[#F6E9D8] overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={3} aria-valuenow={Math.min(step, 3)}>
                <div className="h-full rounded-full bg-[#FF8F28] transition-[width] duration-500 ease-out" style={{ width: `${progress * 100}%` }} />
              </div>
              <span className="text-xs font-bold text-[#917A63] w-9 text-right">{Math.min(step, 3)}/3</span>
            </div>

            {/* Dapi + balon kata */}
            <div className="mt-6 flex items-end gap-3 lg:hidden">
              <div className="w-[92px] h-[104px] shrink-0 rounded-3xl overflow-hidden [&_svg]:w-[96px] [&_svg]:h-auto">
                <DapiFace mood={bubble.mood} hideBubble typingProgress={0.5} />
              </div>
              <div key={bubble.say} className="lp-bubble relative mb-6 rounded-2xl rounded-bl-md border-2 border-[#F2E3D0] bg-white px-4 py-3 text-sm font-bold">
                {bubble.say}
              </div>
            </div>

            {/* konten langkah */}
            <div key={step} className={`flex-1 flex flex-col mt-6 ${dir === 1 ? 'lp-in-r' : 'lp-in-l'}`}>
              {step === 1 && (
                <>
                  <h2 className="text-2xl font-black tracking-tight">Usahamu jualan apa?</h2>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {USAHA.map((u, i) => {
                      const on = usaha === u.id
                      return (
                        <button
                          key={u.id}
                          onClick={() => setUsaha(u.id)}
                          aria-pressed={on}
                          className={`lp-rise relative rounded-3xl border-2 p-4 text-left transition ${on ? 'border-[#FF8F28] bg-[#FFF6EC] shadow-[0_4px_0_#FFB76A]' : 'border-[#F2E3D0] hover:border-[#FFD3A1]'}`}
                          style={{ animationDelay: `${i * 60}ms` }}
                        >
                          <span className="text-3xl" aria-hidden>{u.icon}</span>
                          <p className="mt-3 text-sm font-bold leading-snug">{u.label}</p>
                          {on && <Check className="absolute top-3 right-3 w-5 h-5 text-[#E2700F]" />}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="text-2xl font-black tracking-tight">Jualan lewat mana saja?</h2>
                  <p className="mt-1 text-sm text-[#6F5C4A]">Boleh pilih lebih dari satu.</p>
                  <div className="mt-5 flex flex-wrap gap-2.5">
                    {KANAL.map((k, i) => {
                      const on = kanal.includes(k)
                      return (
                        <button
                          key={k}
                          onClick={() => setKanal(on ? kanal.filter((x) => x !== k) : [...kanal, k])}
                          aria-pressed={on}
                          className={`lp-rise flex items-center gap-1.5 rounded-full border-2 px-4 py-2.5 text-sm font-bold transition ${on ? 'border-[#FF8F28] bg-[#FF8F28] text-white' : 'border-[#F2E3D0] hover:border-[#FFD3A1]'}`}
                          style={{ animationDelay: `${i * 50}ms` }}
                        >
                          {on && <Check className="w-4 h-4" />}
                          {k}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h2 className="text-2xl font-black tracking-tight">Seberapa sering bahan habis mendadak?</h2>
                  <div className="mt-10">
                    <div className="flex items-end justify-between h-24 px-[11px]" aria-hidden>
                      {HABIS.map((_, i) => (
                        <div
                          key={i}
                          className="w-2.5 rounded-full transition-all duration-300"
                          style={{
                            height: `${30 + i * 17}%`,
                            backgroundColor: i <= habis ? (habis >= 3 ? '#FF775D' : '#FF8F28') : '#F2E3D0',
                          }}
                        />
                      ))}
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={4}
                      step={1}
                      value={habis}
                      onChange={(e) => setHabis(Number(e.target.value))}
                      className="lp-range mt-3 w-full h-8"
                      aria-label="Seberapa sering bahan habis mendadak"
                      aria-valuetext={HABIS[habis].label}
                    />
                    <p className="mt-3 text-center text-lg font-black">{HABIS[habis].label}</p>
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <h2 className="text-2xl font-black tracking-tight">3 hal yang paling membantu dapurmu</h2>
                  <ul className="mt-5 space-y-3">
                    {fitur.map((f, i) => (
                      <li key={f.title} className="lp-rise flex gap-4 rounded-3xl p-4" style={{ backgroundColor: f.tint, animationDelay: `${120 + i * 110}ms` }}>
                        <span className="w-11 h-11 shrink-0 grid place-items-center rounded-2xl bg-white">
                          <f.icon className="w-5 h-5 text-[#E2700F]" />
                        </span>
                        <div>
                          <p className="text-sm font-black">{f.title}</p>
                          <p className="mt-0.5 text-[13px] leading-snug text-[#6F5C4A]">{f.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* aksi bawah */}
            {step < 4 ? (
              <button
                onClick={() => go(step + 1)}
                disabled={!canNext}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-full bg-[#FF8F28] py-3.5 text-sm font-bold text-white shadow-[0_4px_0_#C9620C] transition hover:bg-[#FF9F3F] active:translate-y-[3px] active:shadow-[0_1px_0_#C9620C] disabled:bg-[#F2E3D0] disabled:text-[#BCA184] disabled:shadow-none"
              >
                {step === 3 ? 'Lihat hasilnya' : 'Lanjut'}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href={`/login?daftar=1&usaha=${encodeURIComponent(usaha || '')}&kanal=${encodeURIComponent(kanal.join(','))}&habis=${habis}`}
                  className="w-full rounded-full bg-[#FF8F28] py-3.5 text-center text-sm font-bold text-white shadow-[0_4px_0_#C9620C] transition hover:bg-[#FF9F3F] active:translate-y-[3px] active:shadow-[0_1px_0_#C9620C]"
                >
                  Buat akun & mulai
                </Link>
                <Link href="/login" className="text-center text-sm font-bold text-[#B5560A] hover:underline">
                  Sudah punya akun? Masuk
                </Link>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </main>
  )
}
