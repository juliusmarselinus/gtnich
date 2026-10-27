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
      const matchFresh = filterFreshness === 'all' || item.aiStatusFreshness === filterFreshness
      return matchSearch && matchFresh
    })
  }, [list, search, filterFreshness])

  // Summary counts
  const counts = useMemo(() => {
    const segar = list.filter(b => b.aiStatusFreshness === 'segar').length
    const mendekati = list.filter(b => b.aiStatusFreshness === 'mendekati_expire').length
    const expired = list.filter(b => b.aiStatusFreshness === 'kadaluarsa').length
    const lowStock = list.filter(b => b.stok <= b.stokMinimum).length

    return {
      total: list.length,
      segar,
      mendekati,
      expired,
      lowStock,
    }
  }, [list])

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
  }
}
