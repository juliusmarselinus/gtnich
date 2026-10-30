'use client'

import { useState, useEffect, useCallback } from 'react'
import { notificationService, NotificationItem } from '@/services/notificationService'

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [dismissedIds, setDismissedIds] = useState<string[]>([])

  // Load ID notifikasi yang disembunyikan/dihapus dari localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dapur_dismissed_notifications')
      if (stored) {
        setDismissedIds(JSON.parse(stored))
      }
    } catch {
      // ignore
    }
  }, [])

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
    } catch (err) {
      console.warn('Failed to fetch notifications:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    // Poll notifikasi setiap 30 detik
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

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
