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
      setIsLoading(true)
      setError(null)
      const res = await laporanService.getLaporan(r)
      setData(res)
    } catch (err: any) {
      console.error('Error fetching laporan data:', err)
      setError(err?.message || 'Gagal memuat data laporan statistik')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(range)
  }, [fetchData, range])

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
