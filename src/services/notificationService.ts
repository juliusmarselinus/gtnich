import { createClient } from '@/lib/supabase/client'
import { formatRupiah } from '@/lib/mock-data'

export interface NotificationItem {
  id: string
  userId?: string
  title: string
  detail: string
  type: 'penjualan' | 'po' | 'stok' | 'tagihan' | 'system'
  link?: string
  isRead: boolean
  createdAt: string
  timeAgo: string
}

function getTimeAgo(dateString: string): string {
  try {
    const now = new Date()
    const past = new Date(dateString)
    const diffMs = now.getTime() - past.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffMin < 1) return 'Baru saja'
    if (diffMin < 60) return `${diffMin}m yang lalu`
    if (diffHour < 24) return `${diffHour}j yang lalu`
    if (diffDay < 7) return `${diffDay}h yang lalu`
    return past.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  } catch {
    return 'Baru saja'
  }
}

export const notificationService = {
  // Ambil notifikasi pengguna (dengan fallback sintesis cerdas jika tabel belum di-create via SQL Editor)
  async getNotifications(): Promise<NotificationItem[]> {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return []

    // 1. Coba kueri tabel notifications
    const { data: dbData, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (!error && dbData && dbData.length > 0) {
      return dbData.map(n => ({
        id: n.id,
        userId: n.user_id,
        title: n.title,
        detail: n.detail,
        type: n.type || 'system',
        link: n.link || undefined,
        isRead: Boolean(n.is_read),
        createdAt: n.created_at,
        timeAgo: getTimeAgo(n.created_at),
      }))
    }

    // 2. Fallback cerdas: Sintesiskan notifikasi langsung dari peristiwa riil tabel orders, bahan, & PO
    const notifications: NotificationItem[] = []

    const [ordersRes, bahanRes, poRes] = await Promise.all([
      supabase
        .from('orders')
        .select('id, invoice_number, total_price, channel, payment_method, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4),
      supabase
        .from('bahan')
        .select('id, nama, stok, stok_minimum, satuan, updated_at')
        .eq('user_id', user.id),
      supabase
        .from('purchase_orders')
        .select('id, no_po, nama_supplier, status, total_aktual, total_estimasi, updated_at, created_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(4),
    ])

    // Notifikasi Transaksi Penjualan Masuk
    ;(ordersRes.data || []).forEach(o => {
      notifications.push({
        id: `synth-ord-${o.id}`,
        title: `Penjualan Kasir Selesai (${o.invoice_number})`,
        detail: `Transaksi sebesar ${formatRupiah(Number(o.total_price) || 0)} berhasil dicatat via ${o.channel || 'Kasir Langsung'}.`,
        type: 'penjualan',
        link: '/dashboard/riwayat',
        isRead: false,
        createdAt: o.created_at,
        timeAgo: getTimeAgo(o.created_at),
      })
    })

    // Notifikasi Peringatan Stok Bahan Menipis
    ;(bahanRes.data || []).forEach(b => {
      const stok = Number(b.stok) || 0
      const min = Number(b.stok_minimum) || 0
      if (min > 0 && stok <= min) {
        notifications.push({
          id: `synth-bhn-${b.id}`,
          title: `Peringatan Stok Menipis: ${b.nama}`,
          detail: `Stok tersisa ${stok} ${b.satuan} (batas aman minimum: ${min} ${b.satuan}). Segera buat Purchase Order.`,
          type: 'stok',
          link: '/dashboard/purchase-order',
          isRead: false,
          createdAt: b.updated_at || new Date().toISOString(),
          timeAgo: getTimeAgo(b.updated_at || new Date().toISOString()),
        })
      }
    })

    // Notifikasi Tagihan Supplier / Barang Diterima
    ;(poRes.data || []).forEach(p => {
      if (p.status === 'tagihan') {
        notifications.push({
          id: `synth-po-tagihan-${p.id}`,
          title: `Tagihan Menunggu Pembayaran (${p.no_po})`,
          detail: `Tagihan dari ${p.nama_supplier || 'Supplier'} senilai ${formatRupiah(Number(p.total_aktual || p.total_estimasi) || 0)} siap diselesaikan.`,
          type: 'tagihan',
          link: '/dashboard/tagihan',
          isRead: false,
          createdAt: p.updated_at || p.created_at,
          timeAgo: getTimeAgo(p.updated_at || p.created_at),
        })
      } else if (p.status === 'diterima') {
        notifications.push({
          id: `synth-po-diterima-${p.id}`,
          title: `Barang PO Diterima (${p.no_po})`,
          detail: `Pasokan bahan dari ${p.nama_supplier || 'Distributor'} telah diverifikasi dan stok gudang terupdate.`,
          type: 'po',
          link: '/dashboard/purchase-order',
          isRead: true,
          createdAt: p.updated_at || p.created_at,
          timeAgo: getTimeAgo(p.updated_at || p.created_at),
        })
      }
    })

    // Sort descending berdasarkan waktu
    return notifications.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  // Tandai semua sebagai dibaca
  async markAllAsRead(): Promise<void> {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
  },

  // Hapus notifikasi berdasarkan ID
  async deleteNotification(id: string): Promise<void> {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // Jika bukan ID sintesis, hapus dari tabel DB
    if (!id.startsWith('synth-')) {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
    }
  },

  // Hapus semua notifikasi
  async clearAllNotifications(): Promise<void> {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id)
  },

  // Buat notifikasi kustom baru
  async createNotification(payload: {
    title: string
    detail: string
    type?: 'penjualan' | 'po' | 'stok' | 'tagihan' | 'system'
    link?: string
    metadata?: any
  }): Promise<void> {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('notifications').insert({
      user_id: user.id,
      title: payload.title,
      detail: payload.detail,
      type: payload.type || 'system',
      link: payload.link || null,
      metadata: payload.metadata || {},
    })
  },
}
