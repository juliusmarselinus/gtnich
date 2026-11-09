'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { menuService } from '../services/menuService'
import { MenuItem, BahanOption, MenuFormData, MenuFilterStatus } from '../types'

export function useMenu() {
  const [list, setList] = useState<MenuItem[]>([])
  const [bahanList, setBahanList] = useState<BahanOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<MenuFilterStatus>('all')

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

  // Hitung metrik ringkasan dari seluruh menu yang ada
  const stats = useMemo(() => {
    const total = list.length
    const healthy = list.filter(m => m.resep && m.resep.length > 0 && m.profitPercent >= 40).length
    const hasRecipe = list.filter(m => m.resep && m.resep.length > 0).length
    const needRecipe = list.filter(m => !m.resep || m.resep.length === 0 || m.estimasiHPP <= 0).length

    const totalMargin = list.reduce((acc, m) => acc + (m.profitPercent || 0), 0)
    const avgMargin = total > 0 ? totalMargin / total : 0

    return {
      total,
      healthy,
      hasRecipe,
      needRecipe,
      avgMargin,
    }
  }, [list])

  // Filter List berdasarkan pencarian, kategori, dan status tab
  const filteredList = useMemo(() => {
    return list.filter(m => {
      const query = search.toLowerCase()
      const matchSearch =
        m.nama.toLowerCase().includes(query) ||
        m.kategori.toLowerCase().includes(query) ||
        (m.sku && m.sku.toLowerCase().includes(query))

      const matchCategory = categoryFilter === 'all' || m.kategori === categoryFilter

      let matchStatus = true
      if (statusFilter === 'healthy') {
        matchStatus = m.resep && m.resep.length > 0 && m.profitPercent >= 40
      } else if (statusFilter === 'has_recipe') {
        matchStatus = Boolean(m.resep && m.resep.length > 0)
      } else if (statusFilter === 'need_recipe') {
        matchStatus = !m.resep || m.resep.length === 0 || m.estimasiHPP <= 0
      }

      return matchSearch && matchCategory && matchStatus
    })
  }, [list, search, categoryFilter, statusFilter])

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

  // Toggle Active
  const toggleMenuStatus = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus
    setError(null)
    try {
      await menuService.toggleActive(id, nextStatus)
      setList(prev => prev.map(m => (m.id === id ? { ...m, isActive: nextStatus } : m)))
      return nextStatus
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message)
      throw e
    }
  }

  return {
    list: filteredList,
    rawList: list,
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
    statusFilter,
    setStatusFilter,
    stats,
    saveMenu,
    deleteMenu,
    toggleMenuStatus,
    refresh: fetchAll,
  }
}
