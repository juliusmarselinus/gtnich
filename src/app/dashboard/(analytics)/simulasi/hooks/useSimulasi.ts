'use client'

import { useState, useEffect, useCallback } from 'react'
import { SimTab, SimulasiMenuItem, SimulasiBahanItem } from '../types'
import { simulasiService } from '../services/simulasiService'

export function useSimulasi() {
  const [tab, setTab] = useState<SimTab>('penjualan')
  const [menus, setMenus] = useState<SimulasiMenuItem[]>([])
  const [bahanList, setBahanList] = useState<SimulasiBahanItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Parameter Simulasi Penjualan
  const [selMenu, setSelMenu] = useState('')
  const [qty, setQty] = useState(10)

  // Parameter Simulasi Supplier
  const [selBahan, setSelBahan] = useState('')
  const [pctChange, setPctChange] = useState(10)

  // Parameter Simulasi Supply
  const [selMenuSupply, setSelMenuSupply] = useState('')
  const [servings, setServings] = useState(20)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await simulasiService.getSimulasiData()
      setMenus(data.menus)
      setBahanList(data.bahanList)

      if (data.menus.length > 0) {
        setSelMenu(prev => (prev && data.menus.some(m => m.id === prev) ? prev : data.menus[0].id))
        setSelMenuSupply(prev =>
          prev && data.menus.some(m => m.id === prev) ? prev : data.menus[0].id
        )
      }
      if (data.bahanList.length > 0) {
        setSelBahan(prev =>
          prev && data.bahanList.some(b => b.id === prev) ? prev : data.bahanList[0].id
        )
      }
    } catch (err: any) {
      console.error('Error fetching simulasi data:', err)
      setError(err?.message || 'Gagal memuat data menu dan bahan untuk simulasi')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    tab,
    setTab,
    menus,
    bahanList,
    isLoading,
    error,
    refresh: fetchData,

    // State penjualan
    selMenu,
    setSelMenu,
    qty,
    setQty,

    // State supplier
    selBahan,
    setSelBahan,
    pctChange,
    setPctChange,

    // State supply
    selMenuSupply,
    setSelMenuSupply,
    servings,
    setServings,
  }
}
