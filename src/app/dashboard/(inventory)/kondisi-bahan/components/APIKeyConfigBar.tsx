'use client'

import { useState } from 'react'
import { Sparkles, Key, Check, X, ShieldAlert } from 'lucide-react'

interface APIKeyConfigBarProps {
  apiKey: string
  onSaveKey: (key: string) => void
  onRefreshAnalysis: () => void
}

export default function APIKeyConfigBar({
  apiKey,
  onSaveKey,
  onRefreshAnalysis,
}: APIKeyConfigBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputVal, setInputVal] = useState(apiKey)
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveKey(inputVal)
    setIsSaved(true)
    setTimeout(() => {
      setIsSaved(false)
      setIsOpen(false)
    }, 1500)
  }

  return (
    <div className="clay-card p-4.5 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-white rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-emerald-100">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-slate-800">
              Analisis AI Prediksi Kedaluwarsa Dapur
            </p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {apiKey ? 'API Terhubung' : 'Smart Food Engine Aktif'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Menganalisis sifat bahan & tanggal masuk untuk memperkirakan sisa hari sebelum basi / kadaluarsa.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => {
            setInputVal(apiKey)
            setIsOpen(!isOpen)
          }}
          className="clay-btn px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
        >
          <Key className="w-3.5 h-3.5 text-emerald-600" />
          <span>{apiKey ? 'Ubah API Key' : 'Pasang API Key'}</span>
        </button>
      </div>

      {/* Dropdown Form Input API Key */}
      {isOpen && (
        <form onSubmit={handleSave} className="w-full pt-3 border-t border-slate-200/70 flex flex-wrap items-center gap-2.5">
          <div className="flex-1 min-w-[260px]">
            <input
              type="password"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="Tempel Google Gemini API Key di sini (AIzaSy...)"
              className="w-full px-3.5 py-2 clay-inset text-xs text-slate-800 font-mono"
            />
          </div>
          <button
            type="submit"
            className="clay-btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            {isSaved ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{isSaved ? 'Tersimpan!' : 'Simpan & Analisis Ulang'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  )
}
