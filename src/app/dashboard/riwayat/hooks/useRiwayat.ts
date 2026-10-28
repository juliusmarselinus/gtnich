'use client'

import { useState, useEffect, useCallback } from 'react'
import { RiwayatTab, RiwayatPenjualan, RiwayatPO } from '../types'
import { riwayatService } from '../services/riwayatService'

export function useRiwayat() {
  const [tab, setTab] = useState<RiwayatTab>('penjualan')
  const [penjualanList, setPenjualanList] = useState<RiwayatPenjualan[]>([])
  const [poList, setPoList] = useState<RiwayatPO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [penjualanRes, poRes] = await Promise.all([
        riwayatService.getPenjualanList(),
        riwayatService.getPOList(),
      ])
      setPenjualanList(penjualanRes)
      setPoList(poRes)
    } catch (err: any) {
      console.error('Error in useRiwayat:', err)
      setError(err?.message || 'Gagal memuat data riwayat aktivitas')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredPenjualan = penjualanList.filter(p => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      p.invoiceNumber.toLowerCase().includes(q) ||
      p.customerName.toLowerCase().includes(q) ||
      p.channel.toLowerCase().includes(q) ||
      p.paymentMethod.toLowerCase().includes(q) ||
      p.items.some(i => i.namaMenu.toLowerCase().includes(q))
    )
  })

  const filteredPO = poList.filter(po => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      po.noPO.toLowerCase().includes(q) ||
      po.namaSupplier.toLowerCase().includes(q) ||
      po.status.toLowerCase().includes(q) ||
      po.items.some(i => i.namaBahan.toLowerCase().includes(q))
    )
  })

  return {
    tab,
    setTab,
    penjualanList: filteredPenjualan,
    poList: filteredPO,
    totalPenjualanCount: penjualanList.length,
    totalPOCount: poList.length,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
    refresh: fetchData,
  }
}
