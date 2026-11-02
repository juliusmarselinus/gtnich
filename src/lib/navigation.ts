import {
  ShoppingCart,
  ChefHat,
  ClipboardList,
  Truck,
  Receipt,
  ScanLine,
  Package,
  Gauge,
  Database,
  BarChart3,
  History,
  Lightbulb,
  Wrench,
  Settings,
} from 'lucide-react'
import TwinIcon from '@/components/ui/TwinIcon'

export interface NavItem {
  href: string
  label: string
  desc: string
  icon: React.ElementType
}

export interface NavSection {
  id: string
  label: string
  icon: React.ElementType
  items: NavItem[]
}

/**
 * Satu sumber untuk Sidebar (dropdown per modul) dan katalog "Semua fitur" di beranda.
 * Pengelompokan & label mengikuti sidebar tim (Operasional / Inventaris / Analitik & Laporan / Tools).
 */
export const navSections: NavSection[] = [
  {
    id: 'operasional',
    label: 'Operasional',
    icon: ShoppingCart,
    items: [
      { href: '/dashboard/penjualan', label: 'Input Penjualan', desc: 'Kasir POS cepat & auto potong stok', icon: ShoppingCart },
      { href: '/dashboard/purchase-order', label: 'Pembelian Stok', desc: 'Pemesanan bahan & verifikasi barang', icon: ClipboardList },
      { href: '/dashboard/tagihan', label: 'Tagihan Supplier', desc: 'Monitoring invoice tempo & pembayaran', icon: Receipt },
    ],
  },
  {
    id: 'inventaris',
    label: 'Inventaris',
    icon: Package,
    items: [
      { href: '/dashboard/bahan', label: 'Data Bahan', desc: 'Katalog bahan, satuan & harga pokok', icon: Package },
      { href: '/dashboard/menu', label: 'Menu & Resep', desc: 'Kalkulasi HPP & harga jual', icon: ChefHat },
      { href: '/dashboard/suppliers', label: 'Supplier', desc: 'Vendor rekanan, histori & min order', icon: Truck },
      { href: '/dashboard/kondisi-bahan', label: 'Kondisi Bahan', desc: 'Visual meter stok aman vs kritis', icon: Gauge },
      { href: '/dashboard/stok-log', label: 'Stok Log & Opname', desc: 'Log mutasi & rekonsiliasi fisik', icon: Database },
    ],
  },
  {
    id: 'analitik',
    label: 'Analitik & Laporan',
    icon: BarChart3,
    items: [
      { href: '/dashboard/laporan', label: 'Laporan Keuangan', desc: 'Omzet, margin laba & konsumsi bahan', icon: BarChart3 },
      { href: '/dashboard/riwayat', label: 'Riwayat Transaksi', desc: 'Arsip transaksi kasir & PO', icon: History },
      { href: '/dashboard/simulasi', label: 'Simulasi Bisnis', desc: 'Proyeksi profit & harga bahan', icon: TwinIcon },
      { href: '/dashboard/rekomendasi', label: 'Rekomendasi AI', desc: 'Saran restock & efisiensi', icon: Lightbulb },
    ],
  },
  {
    id: 'tools',
    label: 'Tools & Utilitas',
    icon: Wrench,
    items: [
      { href: '/dashboard/ocr-nota', label: 'OCR Nota', desc: 'Scan foto nota belanja jadi data', icon: ScanLine },
      { href: '/dashboard/pengaturan', label: 'Pengaturan', desc: 'Identitas dapur, kanal & profil usaha', icon: Settings },
    ],
  },
]

export const totalFitur = navSections.reduce((n, s) => n + s.items.length, 0)
