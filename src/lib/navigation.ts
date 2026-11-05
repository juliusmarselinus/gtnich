import {
  ShoppingCart,
  CookingPot,
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
 * Pengaturan dipisahkan menjadi navigasi utilitas sistem khusus di sidebar bawah.
 */
export const navSections: NavSection[] = [
  {
    id: 'operasional',
    label: 'Operasional',
    icon: ShoppingCart,
    items: [
      { href: '/dashboard/penjualan', label: 'Kasir Penjualan', desc: 'Catat pesanan & potong stok otomatis', icon: ShoppingCart },
      { href: '/dashboard/proses-pesanan', label: 'Proses Pesanan', desc: 'Antrean pesanan & pre-order dapur', icon: CookingPot },
      { href: '/dashboard/purchase-order', label: 'Belanja Stok', desc: 'Pesan bahan & cek belanjaan datang', icon: ClipboardList },
      { href: '/dashboard/tagihan', label: 'Tagihan Supplier', desc: 'Catatan nota tempo & jatuh tempo', icon: Receipt },
    ],
  },
  {
    id: 'inventaris',
    label: 'Inventaris',
    icon: Package,
    items: [
      { href: '/dashboard/bahan', label: 'Daftar Bahan', desc: 'Stok bahan baku & harga beli', icon: Package },
      { href: '/dashboard/menu', label: 'Menu & Resep', desc: 'Takaran resep, modal porsi & harga jual', icon: ChefHat },
      { href: '/dashboard/suppliers', label: 'Supplier & Toko', desc: 'Langganan pasar, kontak & minimal order', icon: Truck },
      { href: '/dashboard/kondisi-bahan', label: 'Kondisi Bahan', desc: 'Pantau stok menipis & bahan basi', icon: Gauge },
      { href: '/dashboard/stok-log', label: 'Riwayat & Cek Stok', desc: 'Keluar-masuk bahan & cocokkan fisik', icon: Database },
    ],
  },
  {
    id: 'analitik',
    label: 'Analitik & Laporan',
    icon: BarChart3,
    items: [
      { href: '/dashboard/laporan', label: 'Laporan Keuangan', desc: 'Pemasukan omzet, untung & biaya bahan', icon: BarChart3 },
      { href: '/dashboard/riwayat', label: 'Riwayat Transaksi', desc: 'Arsip nota kasir & riwayat belanja', icon: History },
      { href: '/dashboard/simulasi', label: 'Simulasi Bisnis', desc: 'Hitung potensi omzet & harga bahan naik', icon: TwinIcon },
      { href: '/dashboard/rekomendasi', label: 'Saran Dapur AI', desc: 'Tips belanja hemat & menu terlaris', icon: Lightbulb },
    ],
  },
  {
    id: 'tools',
    label: 'Tools & Utilitas',
    icon: Wrench,
    items: [
      { href: '/dashboard/ocr-nota', label: 'Foto Nota Belanja', desc: 'Foto nota pasar langsung jadi data bahan', icon: ScanLine },
    ],
  },
]

export const settingsItem: NavItem = {
  href: '/dashboard/pengaturan',
  label: 'Pengaturan',
  desc: 'Nama usaha, alamat, struk & profil akun',
  icon: Settings,
}

export const totalFitur = navSections.reduce((n, s) => n + s.items.length, 0)
