'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardData, dashboardService } from '../services/dashboardService'

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await dashboardService.getDashboardData()
      setData(res)
    } catch (err: any) {
      console.error('Error fetching dashboard overview data:', err)
      setError(err?.message || 'Gagal memuat ringkasan dashboard')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    refresh: fetchData,
  }
}
