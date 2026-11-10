'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { kondisiBahanService } from '../services/kondisiBahanService'
import { BahanKondisi, FreshnessStatus } from '../types'

export function useKondisiBahan() {
  const [list, setList] = useState<BahanKondisi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string>('')
  const [search, setSearch] = useState('')
  const [filterFreshness, setFilterFreshness] = useState<string>('all')

  // Load API Key dari localStorage jika pernah disimpan
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('orderhub_gemini_api_key') || ''
      setApiKey(savedKey)
    }
  }, [])

  const fetchAll = useCallback(async (customKey?: string) => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData?.session

      if (!session || !session.user) {
        setError('Sesi belum terdeteksi. Silakan login terlebih dahulu.')
        setUserEmail(null)
        setList([])
        setLoading(false)
        return
      }

      setUserEmail(session.user.email || null)

      const keyToUse = customKey !== undefined ? customKey : apiKey
      const data = await kondisiBahanService.getBahanKondisi(keyToUse)
      setList(data || [])
    } catch (err: unknown) {
      const e = err as Error
      console.error('Fetch kondisi bahan error:', e)
      setError(e.message || 'Gagal memuat kondisi bahan.')
      setList([])
    } finally {
      setLoading(false)
    }
  }, [apiKey])

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

  // Simpan API Key
  const saveApiKey = (newKey: string) => {
    const trimmed = newKey.trim()
    setApiKey(trimmed)
    if (typeof window !== 'undefined') {
      localStorage.setItem('orderhub_gemini_api_key', trimmed)
    }
    fetchAll(trimmed)
  }

  // Filter List
  const filteredList = useMemo(() => {
    return list.filter(item => {
      const matchSearch =
        item.nama.toLowerCase().includes(search.toLowerCase()) ||
        (item.namaSupplier && item.namaSupplier.toLowerCase().includes(search.toLowerCase()))
      
      let matchFresh = true
      if (filterFreshness === 'all') {
        matchFresh = true
      } else if (filterFreshness === 'low_stock') {
        matchFresh = item.totalStok <= item.stokMinimum || item.penjualan?.statusHabis === 'kritis' || item.penjualan?.statusHabis === 'habis'
      } else if (filterFreshness === 'akan_habis') {
        matchFresh = item.penjualan?.statusHabis === 'kritis' || item.penjualan?.statusHabis === 'waspada'
      } else if (filterFreshness === 'sudah_dimusnahkan') {
        matchFresh = item.totalStok <= 0 || item.aiStatusFreshness === 'sudah_dimusnahkan' || (item.expiredBatchesCount === 0 && item.batches.some(bt => bt.isDibuang))
      } else if (filterFreshness === 'kadaluarsa') {
        matchFresh = item.totalStok > 0 && (item.aiStatusFreshness === 'kadaluarsa' || item.expiredBatchesCount > 0)
      } else {
        matchFresh = item.totalStok > 0 && item.aiStatusFreshness === filterFreshness
      }

      return matchSearch && matchFresh
    })
  }, [list, search, filterFreshness])

  // Summary counts
  const counts = useMemo(() => {
    // Bahan yang stoknya 0 otomatis masuk kategori sudah_dimusnahkan dan BUKAN kadaluarsa aktif
    const segar = list.filter(b => b.totalStok > 0 && b.aiStatusFreshness === 'segar').length
    const mendekati = list.filter(b => b.totalStok > 0 && b.aiStatusFreshness === 'mendekati_expire').length
    const expired = list.filter(b => b.totalStok > 0 && (b.aiStatusFreshness === 'kadaluarsa' || b.expiredBatchesCount > 0)).length
    const dimusnahkan = list.filter(b => b.totalStok <= 0 || b.aiStatusFreshness === 'sudah_dimusnahkan' || (b.expiredBatchesCount === 0 && b.batches.some(bt => bt.isDibuang))).length
    const lowStock = list.filter(b => b.totalStok <= b.stokMinimum).length
    const akanHabis = list.filter(b => b.penjualan?.statusHabis === 'kritis' || b.penjualan?.statusHabis === 'waspada' || b.penjualan?.statusHabis === 'habis').length

    return {
      total: list.length,
      segar,
      mendekati,
      expired,
      dimusnahkan,
      lowStock,
      akanHabis,
    }
  }, [list])

  // Aksi pengurangan stok bahan kadaluarsa
  const handleKurangiStok = async (params: {
    bahanId: string
    jumlah: number
    alasan: string
    nomorBatch?: number
  }) => {
    await kondisiBahanService.kurangiStokKadaluarsa(params)
    await fetchAll()
  }

  return {
    list: filteredList,
    rawCount: list.length,
    counts,
    loading,
    error,
    userEmail,
    apiKey,
    saveApiKey,
    search,
    setSearch,
    filterFreshness,
    setFilterFreshness,
    refresh: () => fetchAll(),
    handleKurangiStok,
  }
}
