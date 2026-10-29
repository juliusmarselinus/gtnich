'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { bahanService } from '../services/bahanService'
import { Bahan, BahanFormData, FilterStatus, StockCondition, Supplier } from '../types'

export function useBahan() {
  const router = useRouter()
  const [list, setList] = useState<Bahan[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      // 1. Cek sesi auth user
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData?.session

      if (!session || !session.user) {
        setError('Sesi belum terdeteksi. Silakan login ke akun Anda untuk melihat dan mengelola data bahan.')
        setUserEmail(null)
        setList([])
        setSuppliers([])
        setLoading(false)
        return
      }

      setUserEmail(session.user.email || null)

      // 2. Fetch data dari database
      const [bahanData, supplierData] = await Promise.all([
        bahanService.getAll(),
        bahanService.getSuppliers(),
      ])

      setList(bahanData || [])
      setSuppliers(supplierData || [])
    } catch (err: unknown) {
      const e = err as Error
      console.error('Fetch bahan error:', e)
      setError(e.message || 'Terjadi kesalahan saat mengambil data dari database.')
      setList([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()

    // Listen perubahan auth state
    const supabase = createClient()
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        fetchAll()
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [fetchAll])

  const getStockCondition = useCallback((b: Bahan): StockCondition => {
    if (b.stok === 0) return 'habis'
    if (b.stok <= b.stokMinimum) return 'rendah'
    return 'ok'
  }, [])

  const filteredList = useMemo(() => {
    return list.filter(b => {
      const matchSearch =
        b.nama.toLowerCase().includes(search.toLowerCase()) ||
        b.satuan.toLowerCase().includes(search.toLowerCase())
      const cond = getStockCondition(b)
      const matchStatus = filterStatus === 'all' || cond === filterStatus
      return matchSearch && matchStatus
    })
  }, [list, search, filterStatus, getStockCondition])

  const counts = useMemo(() => {
    return {
      all: list.length,
      ok: list.filter(b => getStockCondition(b) === 'ok').length,
      rendah: list.filter(b => getStockCondition(b) === 'rendah').length,
      habis: list.filter(b => getStockCondition(b) === 'habis').length,
    }
  }, [list, getStockCondition])

  const saveBahan = async (id: string | null, form: BahanFormData) => {
    setError(null)
    try {
      if (id) {
        const updated = await bahanService.update(id, form)
        setList(prev => prev.map(item => (item.id === id ? updated : item)))
      } else {
        const created = await bahanService.create(form)
        setList(prev => [created, ...prev])
      }
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message)
      throw e
    }
  }

  const deleteBahan = async (id: string) => {
    setError(null)
    try {
      await bahanService.delete(id)
      setList(prev => prev.filter(item => item.id !== id))
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message)
      throw e
    }
  }

  return {
    list: filteredList,
    allCount: counts,
    suppliers,
    loading,
    error,
    userEmail,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    getStockCondition,
    saveBahan,
    deleteBahan,
    refresh: fetchAll,
  }
}
