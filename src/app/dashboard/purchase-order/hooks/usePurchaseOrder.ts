'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { purchaseOrderService } from '../services/purchaseOrderService'
import { PurchaseOrder, POStatus, CreatePOInput, SupplierOption, BahanOption } from '../types'

export function usePurchaseOrder() {
  const [list, setList] = useState<PurchaseOrder[]>([])
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([])
  const [bahanList, setBahanList] = useState<BahanOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData?.session

      if (!session || !session.user) {
        setError('Sesi belum terdeteksi. Silakan login ke akun Anda untuk mengelola Purchase Order.')
        setUserEmail(null)
        setList([])
        setSuppliers([])
        setBahanList([])
        setLoading(false)
        return
      }

      setUserEmail(session.user.email || null)

      const [poData, sData, bData] = await Promise.all([
        purchaseOrderService.getAll(),
        purchaseOrderService.getSuppliers(),
        purchaseOrderService.getBahanList(),
      ])

      setList(poData || [])
      setSuppliers(sData || [])
      setBahanList(bData || [])
    } catch (err: unknown) {
      const e = err as Error
      console.error('Fetch PO error:', e)
      setError(e.message || 'Gagal memuat purchase order.')
      setList([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()

    const supabase = createClient()
    const { data: authListener } = supabase.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        fetchAll()
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [fetchAll])

  // Filter list
  const filteredList = useMemo(() => {
    return list.filter(po => {
      const matchSearch =
        po.noPO.toLowerCase().includes(search.toLowerCase()) ||
        po.namaSupplier.toLowerCase().includes(search.toLowerCase()) ||
        (po.catatan && po.catatan.toLowerCase().includes(search.toLowerCase()))
      const matchStatus = statusFilter === 'all' || po.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [list, search, statusFilter])

  // Count per status
  const counts = useMemo(() => {
    return {
      all: list.length,
      draft: list.filter(p => p.status === 'draft').length,
      dikirim: list.filter(p => p.status === 'dikirim').length,
      diterima: list.filter(p => p.status === 'diterima').length,
      tagihan: list.filter(p => p.status === 'tagihan').length,
    }
  }, [list])

  // Buat PO Baru
  const createPO = async (input: CreatePOInput) => {
    setError(null)
    try {
      const created = await purchaseOrderService.createPO(input)
      setList(prev => [created, ...prev])
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message)
      throw e
    }
  }

  // Update Status
  const updateStatus = async (poId: string, newStatus: POStatus) => {
    setError(null)
    try {
      await purchaseOrderService.updateStatus(poId, newStatus)
      await fetchAll()
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message)
      throw e
    }
  }

  return {
    list: filteredList,
    rawListCount: list.length,
    suppliers,
    bahanList,
    counts,
    loading,
    error,
    userEmail,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    createPO,
    updateStatus,
    refresh: fetchAll,
  }
}
