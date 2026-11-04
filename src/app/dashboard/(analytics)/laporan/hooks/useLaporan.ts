'use client'

import { useState, useEffect, useCallback } from 'react'
import { LaporanData, TimeRangeFilter } from '../types'
import { laporanService } from '../services/laporanService'

export function useLaporan() {
  const [data, setData] = useState<LaporanData | null>(null)
  const [range, setRange] = useState<TimeRangeFilter>('7d')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (r: TimeRangeFilter) => {
    try {
      setError(null)
      const res = await laporanService.getLaporan(r)
      setData(res)
    } catch (err: unknown) {
      const e = err as Error
      console.error('Error fetching laporan data:', e)
      setError(e?.message || 'Gagal memuat data laporan statistik')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    laporanService.getLaporan(range)
      .then(res => {
        if (!ignore) {
          setData(res)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const e = err as Error
          console.error('Error fetching laporan data:', e)
          setError(e?.message || 'Gagal memuat data laporan statistik')
          setIsLoading(false)
        }
      })
    return () => {
      ignore = true
    }
  }, [range])

  const handleRangeChange = (newRange: TimeRangeFilter) => {
    setRange(newRange)
  }

  const handleRefresh = () => {
    fetchData(range)
  }

  return {
    data,
    range,
    isLoading,
    error,
    handleRangeChange,
    handleRefresh,
  }
}
