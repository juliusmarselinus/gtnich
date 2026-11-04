'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { prosesPesananService } from '../services/prosesPesananService'
import { PesananWithKebutuhan, PesananTab } from '../types'
import { OrderStatus } from '@/app/dashboard/(pos)/penjualan/types'
import { useToast } from '@/context/ToastContext'

export function useProsesPesanan() {
  const [pesananList, setPesananList] = useState<PesananWithKebutuhan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<PesananTab>('preorder')
  const [searchQuery, setSearchQuery] = useState('')
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null)
  const toast = useToast()

  const fetchPesanan = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData?.session
      if (!session || !session.user) {
        setUserEmail(null)
        setPesananList([])
        setLoading(false)
        return
      }

      setUserEmail(session.user.email || null)
      const data = await prosesPesananService.getPesananList()
      setPesananList(data || [])
    } catch (err: unknown) {
      const e = err as Error
      console.error('Error fetching pesanan:', e)
      setError(e.message || 'Gagal mengambil data pesanan.')
      setPesananList([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPesanan()

    const supabase = createClient()
    const { data: authListener } = supabase.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        fetchPesanan()
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [fetchPesanan])

  // Hitung jumlah per status tab
  const counts = useMemo(() => {
    const preorder = pesananList.filter(o => o.status === 'preorder').length
    const menunggu = pesananList.filter(o => o.status === 'menunggu').length
    const diproses = pesananList.filter(o => o.status === 'diproses').length
    const selesai = pesananList.filter(o => o.status === 'selesai').length
    const batal = pesananList.filter(o => o.status === 'batal').length
    const butuhTindakan = preorder + menunggu + diproses

    return {
      total: pesananList.length,
      preorder,
      menunggu,
      diproses,
      selesai,
      batal,
      butuhTindakan,
    }
  }, [pesananList])

  // Filter berdasarkan tab aktif dan pencarian kata kunci
  const filteredPesanan = useMemo(() => {
    return pesananList.filter(order => {
      // Filter status
      const matchTab =
        activeTab === 'semua'
          ? true
          : order.status === activeTab

      // Filter search
      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        order.invoiceNumber.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        (order.customerPhone && order.customerPhone.toLowerCase().includes(q)) ||
        (order.notes && order.notes.toLowerCase().includes(q)) ||
        (order.items && order.items.some(i => i.namaMenu.toLowerCase().includes(q)))

      return matchTab && matchSearch
    })
  }, [pesananList, activeTab, searchQuery])

  // Handler aksi ubah status pesanan
  const handleUpdateStatus = async (order: PesananWithKebutuhan, statusBaru: OrderStatus) => {
    setBusyOrderId(order.id)
    try {
      await prosesPesananService.updateStatus(order, statusBaru)

      const labelStatus =
        statusBaru === 'diproses'
          ? 'Sedang Diproses Dapur'
          : statusBaru === 'selesai'
          ? 'Pesanan Selesai'
          : 'Dibatalkan'

      toast.success(
        `Pesanan ${order.invoiceNumber} Diperbarui`,
        `Status pesanan berhasil diubah menjadi "${labelStatus}".`
      )

      await fetchPesanan()
    } catch (err: unknown) {
      const e = err as Error
      toast.error('Gagal Mengubah Status', e.message || 'Terjadi kesalahan sistem saat memperbarui status.')
      throw e
    } finally {
      setBusyOrderId(null)
    }
  }

  return {
    pesananList: filteredPesanan,
    allPesanan: pesananList,
    counts,
    loading,
    error,
    userEmail,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    busyOrderId,
    handleUpdateStatus,
    refresh: fetchPesanan,
  }
}
