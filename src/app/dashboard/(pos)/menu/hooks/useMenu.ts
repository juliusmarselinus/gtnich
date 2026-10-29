'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { menuService } from '../services/menuService'
import { MenuItem, BahanOption, MenuFormData } from '../types'

export function useMenu() {
  const [list, setList] = useState<MenuItem[]>([])
  const [bahanList, setBahanList] = useState<BahanOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData?.session

      if (!session || !session.user) {
        setError('Sesi belum terdeteksi. Silakan login terlebih dahulu untuk mengelola menu masakan.')
        setUserEmail(null)
        setList([])
        setBahanList([])
        setLoading(false)
        return
      }

      setUserEmail(session.user.email || null)

      const [menuData, bData] = await Promise.all([
        menuService.getAll(),
        menuService.getBahanList(),
      ])

      setList(menuData || [])
      setBahanList(bData || [])
    } catch (err: unknown) {
      const e = err as Error
      console.error('Fetch menu error:', e)
      setError(e.message || 'Gagal memuat menu masakan.')
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

  // Filter List
  const filteredList = useMemo(() => {
    return list.filter(m => {
      const matchSearch =
        m.nama.toLowerCase().includes(search.toLowerCase()) ||
        m.kategori.toLowerCase().includes(search.toLowerCase()) ||
        (m.sku && m.sku.toLowerCase().includes(search.toLowerCase()))
      const matchCategory = categoryFilter === 'all' || m.kategori === categoryFilter
      return matchSearch && matchCategory
    })
  }, [list, search, categoryFilter])

  // Unique categories
  const categories = useMemo(() => {
    const set = new Set<string>()
    list.forEach(m => {
      if (m.kategori) set.add(m.kategori)
    })
    return Array.from(set)
  }, [list])

  // Save (Create or Update)
  const saveMenu = async (id: string | null, form: MenuFormData) => {
    setError(null)
    try {
      if (id) {
        const updated = await menuService.update(id, form)
        setList(prev => prev.map(m => (m.id === id ? updated : m)))
      } else {
        const created = await menuService.create(form)
        setList(prev => [created, ...prev])
      }
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message)
      throw e
    }
  }

  // Delete
  const deleteMenu = async (id: string) => {
    setError(null)
    try {
      await menuService.delete(id)
      setList(prev => prev.filter(m => m.id !== id))
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message)
      throw e
    }
  }

  return {
    list: filteredList,
    rawCount: list.length,
    bahanList,
    categories,
    loading,
    error,
    userEmail,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    saveMenu,
    deleteMenu,
    refresh: fetchAll,
  }
}
