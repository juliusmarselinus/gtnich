'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { tagihanService } from '../services/tagihanService'
import { PurchaseOrder, PelunasanInput } from '../types'
import { purchaseOrderService } from '../../purchase-order/services/purchaseOrderService'
import { SupplierOption } from '../../purchase-order/types'

export function useTagihan() {
  const [list, setList] = useState<PurchaseOrder[]>([])
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('all')
  const [statusBayarFilter, setStatusBayarFilter] = useState<'all' | 'belum_lunas' | 'lunas'>('all')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData?.session

      if (!session || !session.user) {
        setError('Sesi belum terdeteksi. Silakan login ke akun Anda.')
        setUserEmail(null)
        setList([])
        setLoading(false)
        return
      }

      setUserEmail(session.user.email || null)

      const [tagihanData, sData] = await Promise.all([
        tagihanService.getTagihanList(),
        purchaseOrderService.getSuppliers(),
      ])

      setList(tagihanData || [])
      setSuppliers(sData || [])
    } catch (err: unknown) {
      const e = err as Error
      console.error('Fetch tagihan error:', e)
      setError(e.message || 'Gagal memuat data tagihan PO.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Filtered List
  const filteredList = useMemo(() => {
    return list.filter(po => {
      const matchSearch =
        po.noPO.toLowerCase().includes(search.toLowerCase()) ||
        po.namaSupplier.toLowerCase().includes(search.toLowerCase()) ||
        (po.catatan && po.catatan.toLowerCase().includes(search.toLowerCase()))

      const matchSupplier =
        supplierFilter === 'all' || po.supplierId === supplierFilter

      const isLunas = po.catatan?.includes('[LUNAS') || false
      const matchStatusBayar =
        statusBayarFilter === 'all' ||
        (statusBayarFilter === 'lunas' && isLunas) ||
        (statusBayarFilter === 'belum_lunas' && !isLunas)

      return matchSearch && matchSupplier && matchStatusBayar
    })
  }, [list, search, supplierFilter, statusBayarFilter])

  // Summary Counts & Amounts
  const summary = useMemo(() => {
    let totalNominal = 0
    let totalLunas = 0
    let totalBelumLunas = 0
    let countBelumLunas = 0
    let countLunas = 0

    list.forEach(po => {
      const amount = po.totalAktual > 0 ? po.totalAktual : po.totalEstimasi
      totalNominal += amount
      const isLunas = po.catatan?.includes('[LUNAS') || false
      if (isLunas) {
        totalLunas += amount
        countLunas++
      } else {
        totalBelumLunas += amount
        countBelumLunas++
      }
    })

    return {
      totalCount: list.length,
      totalNominal,
      totalLunas,
      totalBelumLunas,
      countLunas,
      countBelumLunas,
    }
  }, [list])

  // Catat Pelunasan
  const payTagihan = async (input: PelunasanInput) => {
    setError(null)
    try {
      await tagihanService.payTagihan(input)
      await fetchAll()
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message)
      throw e
    }
  }

  return {
    list: filteredList,
    rawList: list,
    suppliers,
    summary,
    loading,
    error,
    userEmail,
    search,
    setSearch,
    supplierFilter,
    setSupplierFilter,
    statusBayarFilter,
    setStatusBayarFilter,
    payTagihan,
    refresh: fetchAll,
  }
}
