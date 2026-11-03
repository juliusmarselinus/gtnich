'use client'

export interface UserNotificationPreferences {
  notifyTagihanOverdue: boolean // Notifikasi & email tagihan supplier melewati 1 hari
  notifyDailySales: boolean     // Notifikasi & email laporan harian penjualan pukul 22:00
  notifyFrozenBahan: boolean    // Notifikasi & email pantauan bahan beku/freezer (daging/ayam/ikan/seafood)
}

const STORAGE_KEY = 'dapur_notification_preferences'

export const DEFAULT_NOTIFICATION_PREFERENCES: UserNotificationPreferences = {
  notifyTagihanOverdue: true,
  notifyDailySales: true,
  notifyFrozenBahan: true,
}

export function getNotificationPreferences(): UserNotificationPreferences {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATION_PREFERENCES
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_NOTIFICATION_PREFERENCES
    return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES
  }
}

export function saveNotificationPreferences(prefs: UserNotificationPreferences): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch (err) {
    console.warn('Gagal menyimpan preferensi notifikasi:', err)
  }
}
