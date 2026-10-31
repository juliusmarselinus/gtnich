'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'

interface SidebarContextType {
  /** drawer mobile terbuka */
  isOpen: boolean
  toggleSidebar: () => void
  closeSidebar: () => void
  openSidebar: () => void
  /** sidebar desktop diciutkan jadi deretan ikon */
  isCollapsed: boolean
  toggleCollapsed: () => void
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  toggleSidebar: () => {},
  closeSidebar: () => {},
  openSidebar: () => {},
  isCollapsed: false,
  toggleCollapsed: () => {},
})

const COLLAPSE_KEY = 'dapurtwin_sidebar_collapsed'

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  // Ingat pilihan ciut/buka per browser
  useEffect(() => {
    try {
      setIsCollapsed(localStorage.getItem(COLLAPSE_KEY) === '1')
    } catch {
      // localStorage tidak tersedia: pakai default terbuka
    }
  }, [])

  // Otomatis tutup sidebar mobile setiap pindah halaman
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const toggleSidebar = () => setIsOpen(prev => !prev)
  const closeSidebar = () => setIsOpen(false)
  const openSidebar = () => setIsOpen(true)

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed(prev => {
      const next = !prev
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
      } catch {
        // abaikan
      }
      return next
    })
  }, [])

  return (
    <SidebarContext.Provider
      value={{ isOpen, toggleSidebar, closeSidebar, openSidebar, isCollapsed, toggleCollapsed }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}
