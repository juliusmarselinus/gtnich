'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useSidebar } from './SidebarContext'

export interface TourStepInfo {
  targetSelector: string
  sectionId?: string
  isSidebarItem?: boolean
  title: string
  subtitle: string
  description: string
  tip: string
  mood: 'senang' | 'khawatir'
}

/** PANDUAN KONTEN DINAMIS KHUSUS PER HALAMAN (PAGE-SPECIFIC GUIDE) */
export const PAGE_GUIDES: Record<string, TourStepInfo[]> = {
  '/dashboard/penjualan': [
    {
      targetSelector: 'input[placeholder*="Cari menu"]',
      title: 'Pencarian & Filter Menu',
      subtitle: 'Temukan hidangan pesanan dengan cepat',
      description: 'Ketik nama makanan atau pilih pill kategori di bawahnya untuk memfilter menu yang diinginkan pelanggan.',
      tip: 'Gunakan filter kategori jika daftar menumu sudah banyak!',
      mood: 'senang',
    },
    {
      targetSelector: '.anim-pos-grid',
      title: 'Katalog Menu Kasir',
      subtitle: 'Pilih hidangan pesanan pembeli',
      description: 'Klik tombol tambah porsi pada menu yang dipesan. Informasi harga jual dan sisa stok dapur terpantau langsung.',
      tip: 'Menu yang bahannya habis otomatis diberi peringatan.',
      mood: 'senang',
    },
    {
      targetSelector: '.anim-pos-cart, [data-tour="cart-container"]',
      title: 'Keranjang & Pembayaran POS',
      subtitle: 'Ringkasan tagihan & proses transaksi',
      description: 'Lihat akumulasi porsi, estimasi modal bahan (HPP), dan laba kotor seketika sebelum memproses pembayaran tunai atau QRIS.',
      tip: 'Bisa pilih metode Tunai (auto kembalian) atau QRIS statis/dinamis.',
      mood: 'senang',
    },
  ],
  '/dashboard/proses-pesanan': [
    {
      targetSelector: '[data-tour="proses-status-cards"]',
      title: 'Status Antrean Dapur',
      subtitle: 'Filter cepat proses memasak',
      description: 'Pantau pesanan mulai dari Menunggu, Sedang Diproses dapur, hingga Pesanan Selesai disajikan.',
      tip: 'Klik kartu status untuk memfilter pesanan yang perlu segera disiapkan!',
      mood: 'senang',
    },
  ],
  '/dashboard/purchase-order': [
    {
      targetSelector: '[data-tour="po-status-cards"]',
      title: 'Status Belanja Bahan (PO)',
      subtitle: 'Pantau siklus pengadaan stok',
      description: 'Mulai dari Draft rencana belanja, Dikirim ke pasar/supplier, Diterima di gudang dapur, hingga Tagihan tempo.',
      tip: 'Pastikan klik Verifikasi Penerimaan pas barang datang agar stok otomatis bertambah!',
      mood: 'senang',
    },
  ],
  '/dashboard/bahan': [
    {
      targetSelector: 'input[placeholder*="Cari"]',
      title: 'Cari & Filter Bahan Dapur',
      subtitle: 'Temukan stok bumbu dan bahan baku',
      description: 'Ketik nama bahan atau filter berdasarkan kondisi stok (aman, menipis, atau habis).',
      tip: 'Ada tombol Cari Harga Pasaran untuk cek harga bahan terkini.',
      mood: 'senang',
    },
  ],
  '/dashboard/menu': [
    {
      targetSelector: 'input[placeholder*="Cari"]',
      title: 'Daftar Menu & Resep Dapur',
      subtitle: 'Atur komposisi takaran bahan tiap hidangan',
      description: 'Lengkapi resep untuk tiap menu agar sistem bisa menghitung modal bersih per porsi (HPP) dan untungmu secara otomatis.',
      tip: 'Menu tanpa resep ditandai agar kamu bisa melengkapinya.',
      mood: 'senang',
    },
  ],
  '/dashboard/laporan': [
    {
      targetSelector: '[data-tour="laporan-summary"]',
      title: 'Ringkasan Kinerja Keuangan',
      subtitle: 'Omzet, modal bahan & untung bersih',
      description: 'Rekapitulasi otomatis seluruh transaksi kasir dan belanja bahan dapur dalam periode yang kamu pilih.',
      tip: 'Bisa difilter per hari ini, minggu ini, atau bulan ini.',
      mood: 'senang',
    },
  ],
}

/** PANDUAN UMUM KESELURUHAN APLIKASI (GLOBAL TOUR DARI SIDEBAR / TOPBAR) */
export const GLOBAL_TOUR_STEPS: TourStepInfo[] = [
  {
    targetSelector: '[data-tour="tour-overview"]',
    isSidebarItem: true,
    title: 'Ringkasan Aktivitas Dapur',
    subtitle: 'Pusat kendali operasional dapur harian',
    description:
      'Di sini Dapi merangkum tugas harian: bahan yang menipis, pesanan masuk, dan tagihan belanja yang harus dibayar.',
    tip: 'Cek setiap pagi sebelum mulai buka dapur!',
    mood: 'senang',
  },
  {
    targetSelector: '[data-tour="tour-penjualan"]',
    sectionId: 'operasional',
    isSidebarItem: true,
    title: 'Kasir Penjualan Cepat',
    subtitle: 'Catat pesanan & potong stok otomatis',
    description:
      'Gunakan menu ini untuk melayani pembeli. Begitu pesanan dibayar tunai atau QRIS, stok bahan resep otomatis terpotong.',
    tip: 'Bisa cetak struk kasir atau kirim nota ke email pelanggan.',
    mood: 'senang',
  },
  {
    targetSelector: '[data-tour="tour-proses-pesanan"]',
    sectionId: 'operasional',
    isSidebarItem: true,
    title: 'Antrean Pesanan & Pre-Order',
    subtitle: 'Pantau pesanan yang harus dimasak',
    description:
      'Semua pesanan yang masuk antre di sini. Cocok juga untuk pesanan katering atau kue pre-order agar siap tepat waktu.',
    tip: 'Geser status pesanan dari Menunggu, Diproses, hingga Selesai.',
    mood: 'senang',
  },
  {
    targetSelector: '[data-tour="tour-purchase-order"]',
    sectionId: 'operasional',
    isSidebarItem: true,
    title: 'Belanja Stok Bahan (PO)',
    subtitle: 'Rencana belanja pasar & supplier',
    description:
      'Bikin daftar belanjaan sebelum ke pasar. Pas barang sampai, tinggal ceklist untuk nambah stok otomatis.',
    tip: 'Bisa scan foto nota belanjaan langsung pakai fitur Foto Nota!',
    mood: 'senang',
  },
  {
    targetSelector: '[data-tour="tour-tagihan"]',
    sectionId: 'operasional',
    isSidebarItem: true,
    title: 'Tagihan Belanja Supplier',
    subtitle: 'Pantau nota tempo agar tidak telat bayar',
    description:
      'Semua nota pembelian bahan dari supplier yang belum lunas tersimpan rapi lengkap dengan pengingat tanggal jatuh tempo.',
    tip: 'Dapur tertib bebas dari denda keterlambatan supplier.',
    mood: 'senang',
  },
  {
    targetSelector: '[data-tour="tour-bahan"]',
    sectionId: 'inventaris',
    isSidebarItem: true,
    title: 'Daftar Bahan Baku',
    subtitle: 'Kelola sisa stok dan harga beli',
    description:
      'Daftarkan seluruh persediaan bahan dapurmu di sini—tepung, minyak, bumbu, hingga kemasan. Dapi ingatkan kalau stok menipis.',
    tip: 'Bisa bandingkan harga beli dengan harga pasaran terbaru!',
    mood: 'senang',
  },
  {
    targetSelector: '[data-tour="tour-menu"]',
    sectionId: 'inventaris',
    isSidebarItem: true,
    title: 'Menu & Resep (Modal HPP)',
    subtitle: 'Ketahui modal riil tiap porsi hidangan',
    description:
      'Masukkan takaran bumbu untuk tiap menu. DapurTwin otomatis menghitung modal bersih per porsi (HPP) dan untung bersihmu.',
    tip: 'Kunci dapur anti-boncos ada di takaran resep yang rapi.',
    mood: 'senang',
  },
  {
    targetSelector: '[data-tour="tour-suppliers"]',
    sectionId: 'inventaris',
    isSidebarItem: true,
    title: 'Supplier & Toko Pasar',
    subtitle: 'Buku kontak langganan belanja',
    description:
      'Simpan kontak toko pasar langganan, nomor WhatsApp pedagang, minimal order, dan riwayat pasokan bahan.',
    tip: 'Belanja bahan jadi lebih cepat karena kontak toko selalu siap.',
    mood: 'senang',
  },
  {
    targetSelector: '[data-tour="tour-kondisi-bahan"]',
    sectionId: 'inventaris',
    isSidebarItem: true,
    title: 'Kondisi & Kesegaran Bahan',
    subtitle: 'Pantau masa simpan dan kedaluwarsa',
    description:
      'Pantau bahan yang mendekati tanggal basi sebelum rusak atau menurunkan mutu cita rasa masakan dapur.',
    tip: 'Prioritaskan bahan yang mendekati kedaluwarsa untuk dimasak duluan.',
    mood: 'senang',
  },
  {
    targetSelector: '[data-tour="tour-stok-log"]',
    sectionId: 'inventaris',
    isSidebarItem: true,
    title: 'Riwayat Stok & Cek Fisik',
    subtitle: 'Catatan mutasi keluar-masuk bahan',
    description:
      'Jejak pergerakan bahan dari belanjaan masuk, potongan penjualan kasir, hingga hasil perhitungan fisik (Stock Opname).',
    tip: 'Cocokkan stok fisik di dapur berkala untuk hindari selisih.',
    mood: 'senang',
  },
  {
    targetSelector: '[data-tour="tour-laporan"]',
    sectionId: 'analitik',
    isSidebarItem: true,
    title: 'Laporan Penjualan & Untung',
    subtitle: 'Rekap omzet dan keuntungan bersih',
    description:
      'Pantau omzet harian, keuntungan bersih, dan pengeluaran bahan dapurmu secara jelas dan transparan.',
    tip: 'Bisa diekspor untuk pembukuan usaha!',
    mood: 'senang',
  },
  {
    targetSelector: '[data-tour="tour-riwayat"]',
    sectionId: 'analitik',
    isSidebarItem: true,
    title: 'Riwayat Transaksi & Nota',
    subtitle: 'Arsip nota kasir dan riwayat belanja',
    description:
      'Cari kembali nota penjualan kasir lama atau rincian pesanan belanjaan bahan yang sudah selesai diproses.',
    tip: 'Lengkap dengan rincian jam transaksi dan nama kasir.',
    mood: 'senang',
  },
  {
    targetSelector: '[data-tour="tour-simulasi"]',
    sectionId: 'analitik',
    isSidebarItem: true,
    title: 'Simulasi Bisnis & Untung',
    subtitle: 'Uji target porsi & harga bahan naik',
    description:
      'Hitung estimasi laba jika porsi masak dinaikkan atau jika harga bahan baku di pasar distributor mengalami kenaikan.',
    tip: 'Rencanakan target jualan dengan proyeksi data nyata.',
    mood: 'senang',
  },
  {
    targetSelector: '[data-tour="tour-rekomendasi"]',
    sectionId: 'analitik',
    isSidebarItem: true,
    title: 'Saran Dapur AI',
    subtitle: 'Tips cerdas efisiensi dapur Anda',
    description:
      'Dapi menganalisis data dapur untuk memberikan masukan: menu apa yang paling laku dan tips belanja bahan hemat.',
    tip: 'Terapkan saran Dapi untuk memaksimalkan margin untung.',
    mood: 'senang',
  },
  {
    targetSelector: '[data-tour="tour-ocr-nota"]',
    sectionId: 'tools',
    isSidebarItem: true,
    title: 'Foto Struk / Nota Belanja',
    subtitle: 'Scan nota pasar jadi data otomatis',
    description:
      'Cukup foto nota belanjaan pasar dari HP Anda, DapurTwin membaca nama barang dan harga untuk dicatat ke stok.',
    tip: 'Hemat waktu tanpa perlu mengetik ulang belanjaan pasar.',
    mood: 'senang',
  },
  {
    targetSelector: '[data-tour="tour-pengaturan"]',
    isSidebarItem: true,
    title: 'Pengaturan Usaha',
    subtitle: 'Nama toko, alamat, struk & profil',
    description:
      'Sesuaikan identitas dapur, alamat di struk kasir, opsi pajak, serta preferensi operasional usaha kuliner Anda.',
    tip: 'Lengkapi profil usaha agar struk kasir tampil profesional.',
    mood: 'senang',
  },
]

interface TourContextType {
  isTourOpen: boolean
  currentStepIndex: number
  currentStep: TourStepInfo
  activeSteps: TourStepInfo[]
  totalSteps: number
  openTour: (pageSpecific?: boolean) => void
  closeTour: () => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (index: number) => void
  activeSectionNeeded: string | null
  isPageSpecificTour: boolean
}

const TourContext = createContext<TourContextType | undefined>(undefined)

const TOUR_STORAGE_KEY = 'dapurtwin_feature_highlight_v2'

export function TourProvider({ children }: { children: ReactNode }) {
  const [isTourOpen, setIsTourOpen] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isPageSpecific, setIsPageSpecific] = useState(false)
  const pathname = usePathname()
  const { openSidebar, closeSidebar } = useSidebar()

  // Tentukan daftar langkah aktif (apakah spesifik halaman saat ini atau global)
  const activeSteps = isPageSpecific && PAGE_GUIDES[pathname] ? PAGE_GUIDES[pathname] : GLOBAL_TOUR_STEPS

  // Otomatis buka tur untuk pengguna baru pertama kali
  useEffect(() => {
    try {
      const hasCompleted = localStorage.getItem(TOUR_STORAGE_KEY)
      if (!hasCompleted) {
        const timer = setTimeout(() => {
          setIsPageSpecific(false)
          setIsTourOpen(true)
          setCurrentStepIndex(0)
        }, 1200)
        return () => clearTimeout(timer)
      }
    } catch {
      // Abaikan jika localStorage tidak aktif
    }
  }, [])

  const openTour = (pageSpecific = false) => {
    // Jika user minta panduan halaman dan halaman ini punya panduan khusus
    if (pageSpecific && PAGE_GUIDES[pathname]) {
      setIsPageSpecific(true)
    } else {
      setIsPageSpecific(false)
    }
    setCurrentStepIndex(0)
    setIsTourOpen(true)
  }

  const closeTour = () => {
    setIsTourOpen(false)
    closeSidebar()
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true')
    } catch {
      // Abaikan error penyimpanan
    }
  }

  const nextStep = () => {
    if (currentStepIndex < activeSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
    } else {
      closeTour()
    }
  }

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }

  const goToStep = (index: number) => {
    if (index >= 0 && index < activeSteps.length) {
      setCurrentStepIndex(index)
    }
  }

  const currentStep = activeSteps[currentStepIndex] || activeSteps[0]
  const activeSectionNeeded = currentStep?.sectionId || null

  // SINKRONISASI MOBILE: Jika langkah menargetkan item sidebar di layar mobile, otomatis buka sidebar drawer
  useEffect(() => {
    if (!isTourOpen) return
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024
    if (isMobile) {
      if (currentStep?.isSidebarItem) {
        openSidebar()
      } else {
        closeSidebar()
      }
    }
  }, [isTourOpen, currentStepIndex, currentStep, openSidebar, closeSidebar])

  return (
    <TourContext.Provider
      value={{
        isTourOpen,
        currentStepIndex,
        currentStep,
        activeSteps,
        totalSteps: activeSteps.length,
        openTour,
        closeTour,
        nextStep,
        prevStep,
        goToStep,
        activeSectionNeeded,
        isPageSpecificTour: isPageSpecific,
      }}
    >
      {children}
    </TourContext.Provider>
  )
}

export function useTour() {
  const context = useContext(TourContext)
  if (!context) {
    throw new Error('useTour must be used within a TourProvider')
  }
  return context
}
