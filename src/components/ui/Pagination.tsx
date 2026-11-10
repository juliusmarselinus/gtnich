'use client'

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import clsx from 'clsx'

interface PaginationProps {
  currentPage: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  itemLabel?: string
  className?: string
}

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  itemLabel = 'data',
  className = '',
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  if (totalItems <= pageSize) {
    return null
  }

  const startIdx = (currentPage - 1) * pageSize + 1
  const endIdx = Math.min(totalItems, currentPage * pageSize)

  // Buat daftar nomor halaman yang rapi (max 5 pills ditampilkan dengan ellipsis)
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pages
  }

  return (
    <div
      className={clsx(
        'flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 pb-2 px-2 text-xs select-none',
        className
      )}
    >
      {/* Keterangan rentang data */}
      <p className="text-kopi-muted font-medium text-[11px] sm:text-xs">
        Menampilkan <span className="font-bold text-kopi font-mono">{startIdx}</span> -{' '}
        <span className="font-bold text-kopi font-mono">{endIdx}</span> dari{' '}
        <span className="font-bold text-kopi font-mono">{totalItems}</span> {itemLabel}
      </p>

      {/* Kontrol tombol halaman */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          aria-label="Halaman sebelumnya"
          className="h-8.5 w-8.5 rounded-full bg-white border border-[#EBE6DC] text-kopi flex items-center justify-center hover:bg-krim hover:border-[#FFB800] hover:shadow-xs disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-all duration-150 active:scale-90 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="h-8.5 w-7 flex items-center justify-center text-kopi-muted font-bold text-xs"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </span>
              )
            }

            const pageNum = Number(p)
            const isActive = pageNum === currentPage

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={clsx(
                  'h-8.5 min-w-[34px] px-2 rounded-full font-bold font-mono text-xs transition-all duration-150 cursor-pointer shadow-2xs flex items-center justify-center',
                  isActive
                    ? 'bg-kuning text-kopi shadow-[0_4px_10px_rgba(255,184,0,0.35)] scale-105 ring-1.5 ring-kuning-teks/30'
                    : 'bg-white border border-[#EBE6DC] text-kopi hover:bg-krim hover:border-[#FFB800] hover:-translate-y-0.5 active:scale-95'
                )}
              >
                {pageNum}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          aria-label="Halaman berikutnya"
          className="h-8.5 w-8.5 rounded-full bg-white border border-[#EBE6DC] text-kopi flex items-center justify-center hover:bg-krim hover:border-[#FFB800] hover:shadow-xs disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-all duration-150 active:scale-90 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
