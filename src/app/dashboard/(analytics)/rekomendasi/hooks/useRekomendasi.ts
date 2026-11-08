'use client'

import { useState, useEffect, useCallback } from 'react'
import { RekomendasiItem, RekomendasiSummary, RekomendasiTipe } from '../types'
import { rekomendasiService } from '../services/rekomendasiService'

export function useRekomendasi() {
  const [items, setItems] = useState<RekomendasiItem[]>([])
  const [summary, setSummary] = useState<RekomendasiSummary>({
    total: 0,
    kritisCount: 0,
    stokCount: 0,
    keuanganCount: 0,
    penjualanCount: 0,
  })
  const [filter, setFilter] = useState<RekomendasiTipe | 'all'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await rekomendasiService.getRekomendasi()
      setItems(res.items)
      setSummary(res.summary)
    } catch (err: any) {
      console.error('Error fetching rekomendasi:', err)
      setError(err?.message || 'Gagal memuat rekomendasi dapur')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Muat ulang saran (tanpa loading) saat kembali ke tab/halaman ini
  useEffect(() => {
    const onVisible = async () => {
      if (document.visibilityState !== 'visible') return
      try {
        const res = await rekomendasiService.getRekomendasi()
        setItems(res.items)
        setSummary(res.summary)
      } catch {
        // diam saja, data lama tetap tampil
      }
    }
    window.addEventListener('focus', onVisible)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('focus', onVisible)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  const filteredItems = items.filter(r => filter === 'all' || r.tipe === filter)

  return {
    items: filteredItems,
    summary,
    filter,
    setFilter,
    isLoading,
    error,
    refresh: fetchData,
  }
}
