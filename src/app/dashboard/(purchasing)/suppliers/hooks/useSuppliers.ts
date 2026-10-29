'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { supplierService } from '../services/supplierService'
import { Supplier, SupplierFormData, SupplierCategory } from '../types'

export function useSuppliers() {
  const [list, setList] = useState<Supplier[]>([])
  const [categories, setCategories] = useState<SupplierCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData?.session

      if (!session || !session.user) {
        setError('Sesi belum terdeteksi. Silakan login ke akun Anda untuk melihat dan mengelola data supplier.')
        setUserEmail(null)
        setList([])
        setCategories([])
        setLoading(false)
        return
      }

      setUserEmail(session.user.email || null)

      const [suppliersData, categoriesData] = await Promise.all([
        supplierService.getAll(),
        supplierService.getCategories(),
      ])

      setList(suppliersData || [])
      setCategories(categoriesData || [])
    } catch (err: unknown) {
      const e = err as Error
      console.error('Fetch suppliers error:', e)
      setError(e.message || 'Terjadi kesalahan saat mengambil data supplier.')
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

  const filteredList = useMemo(() => {
    return list.filter(
      s =>
        s.nama.toLowerCase().includes(search.toLowerCase()) ||
        s.kategoriNama.toLowerCase().includes(search.toLowerCase())
    )
  }, [list, search])

  const saveSupplier = async (id: string | null, form: SupplierFormData) => {
    setError(null)
    try {
      if (id) {
        const updated = await supplierService.update(id, form)
        setList(prev => prev.map(item => (item.id === id ? updated : item)))
      } else {
        const created = await supplierService.create(form)
        setList(prev => [created, ...prev])
      }
      // Re-fetch kategori jika ada kategori baru
      const refreshedCats = await supplierService.getCategories()
      setCategories(refreshedCats)
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message)
      throw e
    }
  }

  const deleteSupplier = async (id: string) => {
    setError(null)
    try {
      await supplierService.delete(id)
      setList(prev => prev.filter(item => item.id !== id))
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message)
      throw e
    }
  }

  return {
    list: filteredList,
    categories,
    totalCount: list.length,
    loading,
    error,
    userEmail,
    search,
    setSearch,
    saveSupplier,
    deleteSupplier,
    refresh: fetchAll,
  }
}
