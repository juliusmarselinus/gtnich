'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { bahanService } from '@/services/bahanService'
import { Bahan, BahanFormData, FilterStatus, StockCondition, Supplier } from '@/types/bahan'
import { bahanList as fallbackBahan, suppliers as fallbackSuppliers } from '@/lib/dapur-data'

export function useBahan() {
  const [list, setList] = useState<Bahan[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [bahanData, supplierData] = await Promise.all([
        bahanService.getAll().catch(() => null),
        bahanService.getSuppliers().catch(() => null),
      ])

      // Fallback ke mock data jika DB kosong atau belum dikonfigurasi Supabase
      if (bahanData && bahanData.length > 0) {
        setList(bahanData)
      } else {
        const mappedFallback: Bahan[] = fallbackBahan.map(b => ({
          id: b.id,
          code: b.id,
          nama: b.nama,
          satuan: b.satuan,
          hargaPerSatuan: b.hargaPerSatuan,
          stok: b.stok,
          stokMinimum: b.stokMinimum,
          supplierId: b.supplierId,
        }))
        setList(mappedFallback)
      }

      if (supplierData && supplierData.length > 0) {
        setSuppliers(supplierData)
      } else {
        setSuppliers(fallbackSuppliers)
      }
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
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
        // Cek apakah id adalah UUID Supabase
        const isUUID = id.includes('-') && id.length > 20
        if (isUUID) {
          const updated = await bahanService.update(id, form)
          setList(prev => prev.map(item => (item.id === id ? updated : item)))
        } else {
          // Update lokal/fallback
          setList(prev =>
            prev.map(item =>
              item.id === id
                ? {
                    ...item,
                    ...form,
                  }
                : item
            )
          )
        }
      } else {
        try {
          const created = await bahanService.create(form)
          setList(prev => [created, ...prev])
        } catch {
          // Jika insert gagal ke DB (misal belum auth), masukkan ke state lokal
          const localItem: Bahan = {
            id: `BHN-${String(list.length + 1).padStart(3, '0')}`,
            ...form,
          }
          setList(prev => [localItem, ...prev])
        }
      }
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message)
      throw e
    }
  }

  const deleteBahan = async (id: string) => {
    try {
      const isUUID = id.includes('-') && id.length > 20
      if (isUUID) {
        await bahanService.delete(id)
      }
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
