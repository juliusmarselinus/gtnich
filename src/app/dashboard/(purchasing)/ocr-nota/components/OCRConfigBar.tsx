'use client'

import { useState } from 'react'
import { Key, Sparkles, Check, ChevronDown, ChevronUp, Server, ShieldCheck } from 'lucide-react'

interface OCRConfigBarProps {
  apiKey: string
  onSaveApiKey: (key: string) => void
  routerUrl: string
  routerKey: string
  routerModel: string
  onSaveRouterConfig: (cfg: { routerUrl: string; routerKey: string; routerModel: string }) => void
}

export default function OCRConfigBar({
  apiKey,
  onSaveApiKey,
  routerUrl,
  routerKey,
  routerModel,
  onSaveRouterConfig,
}: OCRConfigBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputUrl, setInputUrl] = useState(routerUrl)
  const [inputKey, setInputKey] = useState(routerKey || apiKey)
  const [inputModel, setInputModel] = useState(routerModel || 'google/gemini-2.0-flash')
  const [savedSuccess, setSavedSuccess] = useState(false)

  const isConfigured = Boolean(routerUrl || routerKey || apiKey)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveApiKey(inputKey.trim())
    onSaveRouterConfig({
      routerUrl: inputUrl.trim(),
      routerKey: inputKey.trim(),
      routerModel: inputModel.trim() || 'google/gemini-2.0-flash',
    })
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2000)
    setIsOpen(false)
  }

  return (
    <div className="clay-card p-4 space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-800">
                Mesin Pemindai Cerdas Nota (Kamera / AI Vision)
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isConfigured
                    ? 'bg-[#FFF6EC] text-[#FF8F2B] border border-[#FFE2C2]'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {isConfigured ? '✓ Pemindai Aktif' : '! Belum Diaktifkan'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Membaca otomatis nota fisik belanja dari toko/supplier menggunakan kecerdasan buatan (AI) tanpa perlu ketik manual.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setInputUrl(routerUrl)
            setInputKey(routerKey || apiKey)
            setInputModel(routerModel || 'google/gemini-2.0-flash')
            setIsOpen(!isOpen)
          }}
          className="px-3.5 py-1.5 rounded-xl clay-btn text-xs font-bold text-slate-600 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer self-end sm:self-auto"
        >
          <Server className="w-3.5 h-3.5 text-purple-500" />
          <span>{isConfigured ? 'Pengaturan Mesin AI' : 'Pasang Kunci Mesin AI'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSave} className="pt-3 border-t border-slate-100 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Alamat Layanan AI (Opsional)
              </label>
              <input
                type="text"
                value={inputUrl}
                onChange={e => setInputUrl(e.target.value)}
                placeholder="Contoh: https://api.openai.com/v1"
                className="w-full px-3.5 py-2 clay-inset text-xs text-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Tipe Model AI (Opsional)
              </label>
              <input
                type="text"
                value={inputModel}
                onChange={e => setInputModel(e.target.value)}
                placeholder="Contoh: gemini-2.0-flash"
                className="w-full px-3.5 py-2 clay-inset text-xs text-slate-800 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Kunci Rahasia Mesin AI (API Key)
            </label>
            <input
              type="password"
              value={inputKey}
              onChange={e => setInputKey(e.target.value)}
              placeholder="Tempel Kunci Akses / API Key di sini..."
              className="w-full px-3.5 py-2 clay-inset text-xs text-slate-800 font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF8F2B]" />
              Tersimpan aman di browser lokal Anda (Local Storage) & Runtime.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl clay-btn-primary text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {savedSuccess ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{savedSuccess ? 'Tersimpan!' : 'Simpan Konfigurasi'}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
