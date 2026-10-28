'use client'

import React, { useState, useRef, useEffect, useId } from 'react'
import { ChevronDown, Check, Search } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  sublabel?: string
  icon?: React.ReactNode
  disabled?: boolean
}

interface CustomSelectProps {
  value: string
  onChange: (val: string) => void
  options: (SelectOption | string)[]
  placeholder?: string
  disabled?: boolean
  className?: string
  searchable?: boolean
  searchPlaceholder?: string
  size?: 'sm' | 'md'
  variant?: 'inset' | 'card'
  label?: string
  error?: string
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = '-- Pilih Opsi --',
  disabled = false,
  className = '',
  searchable = false,
  searchPlaceholder = 'Cari...',
  size = 'md',
  variant = 'inset',
  label,
  error,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const componentId = useId()

  // Normalisasi opsi ke struktur SelectOption
  const normalizedOptions: SelectOption[] = options.map(opt => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt }
    }
    return opt
  })

  // Cari item yang terpilih saat ini
  const selectedOption = normalizedOptions.find(opt => opt.value === value)

  // Filter opsi jika searchable aktif
  const filteredOptions = searchable && searchQuery.trim() !== ''
    ? normalizedOptions.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : normalizedOptions

  // Klik di luar menutup dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Focus input search saat dibuka
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
    } else {
      setSearchQuery('')
    }
  }, [isOpen, searchable])

  // Key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      if (!isOpen) {
        e.preventDefault()
        setIsOpen(true)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const baseStyle =
    variant === 'inset'
      ? 'clay-inset bg-[#f4f7fb]'
      : 'clay-card bg-white'

  const sizeStyle =
    size === 'sm'
      ? 'px-3 py-1.5 text-xs rounded-xl'
      : 'px-3.5 py-2.5 text-xs rounded-2xl'

  return (
    <div className={`relative w-full text-left ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-[11px] font-bold text-slate-500 mb-1">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        id={componentId}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between gap-2 transition-all cursor-pointer select-none outline-none focus:ring-2 focus:ring-emerald-400/40 ${baseStyle} ${sizeStyle} ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-emerald-300'
        } ${isOpen ? 'ring-2 ring-emerald-500/30' : ''}`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && (
            <span className="flex-shrink-0">{selectedOption.icon}</span>
          )}
          <span className={`truncate font-medium ${selectedOption ? 'text-slate-800' : 'text-slate-400'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.sublabel && (
            <span className="text-[10px] text-slate-400 font-normal truncate">
              {selectedOption.sublabel}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu (Claymorphism Floating Card) */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute z-[9999] left-0 right-0 mt-1.5 p-1.5 bg-white rounded-2xl border border-slate-100/80 shadow-[0_12px_30px_rgba(0,0,0,0.15),0_4px_12px_rgba(16,185,129,0.1)] backdrop-blur-sm animate-in fade-in-0 zoom-in-95 duration-150 max-h-60 overflow-hidden flex flex-col"
        >
          {searchable && (
            <div className="p-1 mb-1 border-b border-slate-100 flex items-center gap-2 px-2.5">
              <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full text-xs py-1 text-slate-700 bg-transparent outline-none placeholder:text-slate-400"
              />
            </div>
          )}

          <div className="overflow-y-auto max-h-52 space-y-0.5 pr-0.5 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="py-3 px-3 text-center text-xs text-slate-400 italic">
                Tidak ada pilihan ditemukan
              </div>
            ) : (
              filteredOptions.map(opt => {
                const isSelected = opt.value === value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={opt.disabled}
                    onClick={() => {
                      if (!opt.disabled) {
                        onChange(opt.value)
                        setIsOpen(false)
                      }
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-800 font-bold shadow-[inset_1px_1px_2px_#ffffff]'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    } ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
                      <span className="truncate">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="text-[10px] text-slate-400 font-normal truncate">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 font-bold" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="text-[10px] text-rose-500 mt-1 font-semibold">{error}</p>}
    </div>
  )
}
