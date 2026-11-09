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

  // Handler aksi terima pembayaran kasir untuk pesanan meja self-order
  const handleTandaiLunas = async (order: PesananWithKebutuhan) => {
    setBusyOrderId(order.id)
    try {
      await prosesPesananService.tandaiLunasDiKasir(order.id)

      // Cek apakah ada email pelanggan di customerEmail, customerPhone, atau notes
      let targetEmail = order.customerEmail?.trim() || ''
      if (!targetEmail && order.customerPhone && order.customerPhone.includes('@')) {
        targetEmail = order.customerPhone.trim()
      }
      if (!targetEmail && order.notes) {
        const match = order.notes.match(/\[Email:\s*([^\]]+)\]/i)
        if (match && match[1]) {
          targetEmail = match[1].trim()
        }
      }

      // Jika pelanggan menyertakan email, kirimkan struk lunas kasir resmi via Resend
      if (targetEmail) {
        try {
          await fetch('/api/notify-sale', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerEmail: targetEmail,
              invoiceNumber: order.invoiceNumber,
              customerName: order.customerName,
              customerPhone: order.customerPhone,
              paymentMethod: 'Tunai di Kasir',
              paymentStatus: 'Lunas',
              subtotal: order.subtotal,
              discount: order.discount || 0,
              totalPrice: order.totalPrice,
              cashReceived: order.totalPrice,
              changeAmount: 0,
              cashierName: order.cashierName || 'Kasir',
              notes: order.notes,
              items: (order.items || []).map(it => ({
                namaMenu: it.namaMenu,
                qty: it.qty,
                hargaJual: it.hargaJual,
                subtotal: it.subtotal || it.hargaJual * it.qty,
              })),
              createdAt: order.createdAt,
            }),
          })
        } catch (mailErr) {
          console.warn('[handleTandaiLunas] Gagal mengirim struk pelunasan kasir:', mailErr)
        }
      }

      toast.success(
        `Pembayaran ${order.invoiceNumber} Diterima`,
        `Pesanan dari ${order.tableNumber ? `Meja ${order.tableNumber}` : 'pelanggan'} telah ditandai Lunas di kasir.${targetEmail ? ' Struk digital berhasil dikirimkan ke ' + targetEmail : ''}`
      )
      await fetchPesanan()
    } catch (err: unknown) {
      const e = err as Error
      toast.error('Gagal Memperbarui Pembayaran', e.message || 'Terjadi kesalahan sistem.')
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
    handleTandaiLunas,
    refresh: fetchPesanan,
  }
}
