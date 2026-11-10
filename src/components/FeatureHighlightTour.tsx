'use client'

import { useEffect, useState, useRef } from 'react'
import { useTour } from '@/context/TourContext'
import DapiHead from '@/components/ui/DapiHead'
import { ArrowRight, ArrowLeft, X, Check } from 'lucide-react'
import clsx from 'clsx'

interface RectPos {
  top: number
  left: number
  width: number
  height: number
}

export default function FeatureHighlightTour() {
  const {
    isTourOpen,
    currentStepIndex,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    closeTour,
    goToStep,
  } = useTour()

  const [targetRect, setTargetRect] = useState<RectPos | null>(null)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const popoverRef = useRef<HTMLDivElement>(null)

  // Track ukuran jendela browser
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout
    function updateSize() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    updateSize()
    function onResizeThrottled() {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(updateSize, 100)
    }
    window.addEventListener('resize', onResizeThrottled, { passive: true })
    return () => {
      clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResizeThrottled)
    }
  }, [])

  // Cari posisi elemen target saat step berganti
  useEffect(() => {
    if (!isTourOpen || !currentStep) {
      setTargetRect(null)
      return
    }

    function locateTarget() {
      if (!currentStep) return
      const el = document.querySelector(currentStep.targetSelector)
      if (el) {
        // Gulirkan elemen ke dalam pandangan jika tertutup
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
        const rect = el.getBoundingClientRect()
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        })
      } else {
        // Fallback jika elemen tidak ditemukan di halaman aktif
        setTargetRect(null)
      }
    }

    // Beri sedikit jeda agar accordion sidebar atau drawer mobile sempat terbuka
    const timer = setTimeout(locateTarget, 220)
    let scrollAnimId: number | null = null
    const onScrollThrottled = () => {
      if (scrollAnimId) return
      scrollAnimId = window.requestAnimationFrame(() => {
        scrollAnimId = null
        locateTarget()
      })
    }
    window.addEventListener('scroll', onScrollThrottled, { capture: true, passive: true })

    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', onScrollThrottled, true)
      if (scrollAnimId) window.cancelAnimationFrame(scrollAnimId)
    }
  }, [isTourOpen, currentStepIndex, currentStep])

  if (!isTourOpen || !currentStep) return null

  const isFirst = currentStepIndex === 0
  const isLast = currentStepIndex === totalSteps - 1

  // Hitung posisi popover floating
  let popoverStyle: React.CSSProperties = {}
  let isMobile = windowSize.width < 1024

  if (targetRect && !isMobile) {
    const popoverWidth = 360
    const popoverHeight = 220
    const padding = 16

    // Cek apakah muat di sebelah kanan target (misal saat menyorot item sidebar desktop)
    if (targetRect.left + targetRect.width + popoverWidth + padding < windowSize.width) {
      popoverStyle = {
        top: Math.max(padding, Math.min(windowSize.height - popoverHeight - padding, targetRect.top - 10)),
        left: targetRect.left + targetRect.width + padding,
      }
    }
    // Jika tidak muat di kanan, cek di bawah target
    else if (targetRect.top + targetRect.height + popoverHeight + padding < windowSize.height) {
      popoverStyle = {
        top: targetRect.top + targetRect.height + padding,
        left: Math.max(padding, Math.min(windowSize.width - popoverWidth - padding, targetRect.left)),
      }
    }
    // Jika tidak, letakkan di atas target
    else {
      popoverStyle = {
        top: Math.max(padding, targetRect.top - popoverHeight - padding),
        left: Math.max(padding, Math.min(windowSize.width - popoverWidth - padding, targetRect.left)),
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[100] pointer-events-auto">
      {/* 1. Backdrop Gelap dengan Lubang Spotlight Cut-Out */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-auto transition-all duration-300 ease-out"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="tour-spotlight-mask">
            {/* Background putih = menutup seluruh layar */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Lubang hitam = transparan tembus pandang ke elemen fitur */}
            {targetRect && (
              <rect
                x={targetRect.left - 6}
                y={targetRect.top - 6}
                width={targetRect.width + 12}
                height={targetRect.height + 12}
                rx="16"
                ry="16"
                fill="black"
                className="transition-all duration-300 ease-out"
              />
            )}
          </mask>
        </defs>

        {/* Layer warna overlay gelap dengan lubang mask */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(20, 14, 10, 0.75)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>

      {/* Ring Animasi Berdenyut di sekeliling elemen yang di-highlight */}
      {targetRect && (
        <div
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
          className="absolute rounded-[16px] border-2 border-[#FFB800] shadow-[0_0_24px_rgba(255,184,0,0.85)] pointer-events-none transition-all duration-300 ease-out"
        />
      )}

      {/* 2. Floating Popover Card Petunjuk Dapi (Dukungan Mobile & Desktop yang Ringkas) */}
      <div
        ref={popoverRef}
        style={!isMobile && targetRect ? popoverStyle : undefined}
        className={clsx(
          'absolute z-[110] w-full bg-white rounded-[24px] shadow-[0_16px_40px_rgba(0,0,0,0.32)] border border-[#EBE3D7] p-4 sm:p-5 transition-all duration-300 ease-out animate-in fade-in zoom-in-95',
          isMobile || !targetRect
            ? 'bottom-3 left-1/2 -translate-x-1/2 max-w-[94vw]'
            : 'max-w-[360px]'
        )}
      >
        {/* Header Popover: Dapi Head + Judul Ringkas */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-[#FFF6D6] border border-[#FFE49A] flex items-center justify-center shadow-xs">
              <DapiHead size={32} mood={currentStep.mood} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-[#8A5A00] block">
                Langkah {currentStepIndex + 1} dari {totalSteps}
              </span>
              <h3 className="text-sm sm:text-base font-extrabold text-[#2B1D00] leading-snug truncate">
                {currentStep.title}
              </h3>
            </div>
          </div>

          {/* Tombol Tutup */}
          <button
            type="button"
            onClick={closeTour}
            title="Tutup panduan"
            className="w-7 h-7 rounded-full bg-[#F5EDDE] hover:bg-[#EBDDC8] text-[#5A3A00] flex items-center justify-center cursor-pointer transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Deskripsi Dari Dapi */}
        <div className="mt-2.5 space-y-2">
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {currentStep.description}
          </p>
          <p className="text-[11px] text-[#6B4E00] bg-[#FFF8E7] border border-[#F0DCAB] rounded-xl px-2.5 py-1.5 leading-snug font-medium">
            {currentStep.tip}
          </p>
        </div>

        {/* Footer Popover: Dots Navigasi & Tombol Aksi */}
        <div className="mt-4 pt-3 border-t border-[#F2ECE1] flex items-center justify-between gap-2">
          {/* Dots Indicator */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goToStep(idx)}
                className={clsx(
                  'h-1.5 rounded-full transition-all duration-200 cursor-pointer',
                  idx === currentStepIndex
                    ? 'w-5 bg-[#FF8F28]'
                    : 'w-1.5 bg-[#EAE2D5] hover:bg-[#D5C5B1]'
                )}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            {!isFirst && (
              <button
                type="button"
                onClick={prevStep}
                className="h-9 px-3 rounded-full bg-[#FFF9EC] hover:bg-[#FFEBB0] text-xs font-bold text-[#7A5A10] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span className="hidden xs:inline">Balik</span>
              </button>
            )}

            <button
              type="button"
              onClick={nextStep}
              className={clsx(
                'h-9 px-4 rounded-full text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer',
                isLast
                  ? 'bg-[#2D7A1F] hover:bg-[#236318]'
                  : 'bg-[#FF8F28] hover:bg-[#E57A18]'
              )}
            >
              <span>{isLast ? 'Selesai' : 'Lanjut'}</span>
              {isLast ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
