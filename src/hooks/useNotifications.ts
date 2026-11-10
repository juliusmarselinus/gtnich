'use client'

import { useState, useEffect, useCallback } from 'react'
import { notificationService, NotificationItem } from '@/services/notificationService'
import { getNotificationPreferences } from '@/lib/notificationSettings'
import { createClient } from '@/lib/supabase/client'

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem('dapur_dismissed_notifications')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await notificationService.getNotifications()
      // Filter yang sudah di-dismiss oleh user
      let dismissed: string[] = []
      try {
        const stored = localStorage.getItem('dapur_dismissed_notifications')
        if (stored) dismissed = JSON.parse(stored)
      } catch {}

      const filtered = data.filter(n => !dismissed.includes(n.id))
      setNotifications(filtered)

      // Cek dan kirim email otomatis jika fitur diaktifkan di Pengaturan
      const prefs = getNotificationPreferences()

      // 1. Tagihan supplier overdue melewati 1 hari
      if (prefs.notifyTagihanOverdue) {
        const overdueBills = filtered.filter(n => n.id.startsWith('synth-po-overdue-'))
        if (overdueBills.length > 0) {
          const supabase = createClient()
          const { data: sessionData } = await supabase.auth.getSession()
          const userEmail = sessionData?.session?.user?.email
          const userId = sessionData?.session?.user?.id

          if (userEmail && userId) {
            // Cek log email yang sudah terkirim hari ini agar tidak spam (maksimal 1x per hari per PO)
            const todayStr = new Date().toISOString().slice(0, 10)
            let sentOverdueMap: Record<string, string> = {}
            try {
              const raw = localStorage.getItem('dapur_sent_overdue_emails')
              if (raw) sentOverdueMap = JSON.parse(raw)
            } catch {}

            for (const bill of overdueBills) {
              const lastSent = sentOverdueMap[bill.id]
              if (lastSent !== todayStr) {
                // Panggil endpoint kirim email overdue tagihan
                fetch('/api/notify-overdue-tagihan', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: userEmail,
                    noPO: bill.title.replace('Peringatan: Tagihan Lewat 1 Hari (', '').replace(')', ''),
                    supplierName: bill.detail.split('dari ')[1]?.split(' sebesar')[0] || 'Supplier',
                    totalTagihan: 0,
                    daysLate: 1,
                  }),
                }).catch(e => console.warn('Gagal memicu email tagihan overdue:', e))

                sentOverdueMap[bill.id] = todayStr
              }
            }
            try {
              localStorage.setItem('dapur_sent_overdue_emails', JSON.stringify(sentOverdueMap))
            } catch {}
          }
        }
      }

      // 2. Laporan penjualan harian kini dikelola secara otomatis & tepat waktu via server cron / n8n workflow.
      // Sesi browser tidak perlu memicu polling manual di localStorage.

      // 3. Notifikasi & Email Pantauan Bahan Beku (Freezer)
      if (prefs.notifyFrozenBahan) {
        const frozenNotifs = filtered.filter(n => n.id.startsWith('synth-frozen-') && n.metadata?.isFrozen)
        if (frozenNotifs.length > 0) {
          const supabase = createClient()
          const { data: sessionData } = await supabase.auth.getSession()
          const userEmail = sessionData?.session?.user?.email
          const userId = sessionData?.session?.user?.id

          if (userEmail && userId) {
            const todayStr = new Date().toISOString().slice(0, 10)
            const lastFrozenSent = localStorage.getItem('dapur_last_frozen_email_date')
            
            // Batasi pengiriman email 1x sehari agar tidak membebani kuota & email user
            if (lastFrozenSent !== todayStr) {
              const items = frozenNotifs.map(fn => ({
                nama: fn.metadata?.namaBahan || fn.title.replace('Pantauan Bahan Beku: ', ''),
                stok: fn.metadata?.stok || 0,
                satuan: fn.metadata?.satuan || 'satuan',
                tipsPenyimpanan: 'Pastikan suhu freezer stabil di bawah -18°C dan lakukan proses thawing perlahan di chiller.',
              }))

              fetch('/api/notify-frozen-bahan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: userEmail,
                  items,
                }),
              })
                .then(() => {
                  localStorage.setItem('dapur_last_frozen_email_date', todayStr)
                })
                .catch(e => console.warn('Gagal memicu email bahan beku:', e))
            }
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    const poll = async () => {
      try {
        const data = await notificationService.getNotifications()
        if (!ignore) {
          let dismissed: string[] = []
          try {
            const stored = localStorage.getItem('dapur_dismissed_notifications')
            if (stored) dismissed = JSON.parse(stored)
          } catch {}
          setNotifications(data.filter(n => !dismissed.includes(n.id)))
        }
      } catch (err) {
        console.warn('Failed to fetch notifications:', err)
      }
    }

    poll()
    // Polling hanya berjalan jika dokumen sedang aktif (tab terlihat) untuk hemat CPU di low spec device
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return
      poll()
    }, 30000)
    return () => {
      ignore = true
      clearInterval(interval)
    }
  }, [])

  const dismissNotification = async (id: string) => {
    // Optimistic UI update
    setNotifications(prev => prev.filter(n => n.id !== id))
    const updated = [...dismissedIds, id]
    setDismissedIds(updated)
    try {
      localStorage.setItem('dapur_dismissed_notifications', JSON.stringify(updated))
    } catch {}

    try {
      await notificationService.deleteNotification(id)
    } catch (e) {
      console.warn('Gagal menghapus notifikasi dari DB:', e)
    }
  }

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    await notificationService.markAllAsRead()
  }

  const clearAll = async () => {
    const allIds = notifications.map(n => n.id)
    setNotifications([])
    const updated = Array.from(new Set([...dismissedIds, ...allIds]))
    setDismissedIds(updated)
    try {
      localStorage.setItem('dapur_dismissed_notifications', JSON.stringify(updated))
    } catch {}

    try {
      await notificationService.clearAllNotifications()
    } catch (e) {
      console.warn('Gagal menghapus semua notifikasi dari DB:', e)
    }
  }

  const applyPriceUpdate = async (notificationId: string, bahanId: string, newPrice: number) => {
    await notificationService.applyPriceUpdate(notificationId, bahanId, newPrice)
    setNotifications(prev =>
      prev.map(n => {
        if (n.id === notificationId) {
          return {
            ...n,
            isRead: true,
            metadata: {
              ...n.metadata,
              applied: true,
            },
          }
        }
        return n
      })
    )
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return {
    notifications,
    unreadCount,
    isLoading,
    refresh: fetchNotifications,
    markAllRead,
    dismissNotification,
    clearAll,
    applyPriceUpdate,
  }
}
