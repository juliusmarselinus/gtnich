// ─── Types ───────────────────────────────────────────────────────────────────

export interface RiwayatSupplier {
  tanggal: string
  keterangan: string
  jumlah: number
}

export interface Supplier {
  id: string
  nama: string
  telepon: string
  alamat: string
  kategori: string
  hargaRataRata: number
  minimalOrder: number
  riwayat: RiwayatSupplier[]
}

export interface Bahan {
  id: string
  nama: string
  satuan: string
  hargaPerSatuan: number
  stok: number
  stokMinimum: number
  supplierId: string
}

export interface ResepItem {
  bahanId: string
  namaBahan: string
  qty: number
  satuan: string
}

export interface Menu {
  id: string
  nama: string
  kategori: string
  hargaJual: number
  resep: ResepItem[]
  estimasiHPP: number
  profit: number
  profitPercent: number
}

export interface POItem {
  bahanId: string
  namaBahan: string
  satuan: string
  qty: number
  hargaEstimasi: number
  hargaAktual: number
  stokSebelum: number
  diterima: boolean
}

export type POStatus = 'draft' | 'dikirim' | 'diterima' | 'tagihan'

export interface PurchaseOrder {
  id: string
  noPO: string
  supplierId: string
  namaSupplier: string
  status: POStatus
  items: POItem[]
  totalEstimasi: number
  totalAktual: number
  tanggalBuat: string
  tanggalTerima?: string
  catatan?: string
}

export interface PenjualanItem {
  menuId: string
  namaMenu: string
  qty: number
  hargaJual: number
  hpp: number
}

export interface Penjualan {
  id: string
  noTransaksi: string
  items: PenjualanItem[]
  totalHPP: number
  totalJual: number
  profit: number
  tanggal: string
}

export interface StokLog {
  id: string
  bahanId: string
  namaBahan: string
  perubahan: number
  stokSebelum: number
  stokSesudah: number
  sumber: 'PO' | 'Penjualan' | 'Manual' | 'Opname'
  tanggal: string
}

export type RekomendasiTipe = 'Stok' | 'Keuangan' | 'Penjualan'
export type RekomendasiPriority = 'tinggi' | 'sedang' | 'rendah'

export interface Rekomendasi {
  id: string
  tipe: RekomendasiTipe
  judul: string
  deskripsi: string
  confidence: number
  priority: RekomendasiPriority
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const suppliers: Supplier[] = [
  {
    id: 'SUP-001',
    nama: 'UD Berkah Tani',
    telepon: '0812-1111-2222',
    alamat: 'Jl. Pasar Induk No. 12, Bogor',
    kategori: 'Bahan Pokok',
    hargaRataRata: 18500,
    minimalOrder: 500000,
    riwayat: [
      { tanggal: '15 Okt 2026', keterangan: 'PO Tepung & Gula', jumlah: 750000 },
      { tanggal: '01 Okt 2026', keterangan: 'PO Tepung Terigu 50kg', jumlah: 600000 },
      { tanggal: '15 Sep 2026', keterangan: 'PO Rutin Bulanan', jumlah: 820000 },
    ],
  },
  {
    id: 'SUP-002',
    nama: 'CV Nusantara Rempah',
    telepon: '0878-3333-4444',
    alamat: 'Jl. Rempah Raya No. 5, Bandung',
    kategori: 'Bumbu & Rempah',
    hargaRataRata: 45000,
    minimalOrder: 300000,
    riwayat: [
      { tanggal: '20 Okt 2026', keterangan: 'PO Cabai & Bawang', jumlah: 480000 },
      { tanggal: '05 Okt 2026', keterangan: 'PO Bumbu Rendang', jumlah: 360000 },
    ],
  },
  {
    id: 'SUP-003',
    nama: 'PT Susu Segar Nusantara',
    telepon: '0856-5555-6666',
    alamat: 'Jl. Industri Susu No. 8, Depok',
    kategori: 'Dairy & Telur',
    hargaRataRata: 22000,
    minimalOrder: 400000,
    riwayat: [
      { tanggal: '18 Okt 2026', keterangan: 'PO Telur & Mentega', jumlah: 520000 },
      { tanggal: '03 Okt 2026', keterangan: 'PO Susu UHT & Krim', jumlah: 410000 },
      { tanggal: '18 Sep 2026', keterangan: 'PO Rutin', jumlah: 490000 },
    ],
  },
  {
    id: 'SUP-004',
    nama: 'Toko Minyak Jaya',
    telepon: '0821-7777-8888',
    alamat: 'Jl. Pasar Minggu No. 33, Jakarta Selatan',
    kategori: 'Minyak & Lemak',
    hargaRataRata: 16000,
    minimalOrder: 250000,
    riwayat: [
      { tanggal: '22 Okt 2026', keterangan: 'PO Minyak Goreng 20L', jumlah: 380000 },
      { tanggal: '08 Okt 2026', keterangan: 'PO Minyak & Margarin', jumlah: 290000 },
    ],
  },
  {
    id: 'SUP-005',
    nama: 'Distributor Pisang Mas',
    telepon: '0895-9999-0000',
    alamat: 'Jl. Kebun Buah No. 7, Tangerang',
    kategori: 'Buah & Sayur',
    hargaRataRata: 8500,
    minimalOrder: 200000,
    riwayat: [
      { tanggal: '25 Okt 2026', keterangan: 'PO Pisang Kepok 100kg', jumlah: 350000 },
      { tanggal: '11 Okt 2026', keterangan: 'PO Pisang & Singkong', jumlah: 280000 },
      { tanggal: '27 Sep 2026', keterangan: 'PO Mingguan', jumlah: 210000 },
    ],
  },
  {
    id: 'SUP-006',
    nama: 'UD Kemasan Prima',
    telepon: '0812-2468-1357',
    alamat: 'Jl. Industri Kecil No. 15, Bekasi',
    kategori: 'Kemasan & Packaging',
    hargaRataRata: 3500,
    minimalOrder: 150000,
    riwayat: [
      { tanggal: '23 Okt 2026', keterangan: 'PO Plastik & Label', jumlah: 185000 },
      { tanggal: '09 Okt 2026', keterangan: 'PO Kemasan Standing Pouch', jumlah: 210000 },
    ],
  },
]

export const bahanList: Bahan[] = [
  { id: 'BHN-001', nama: 'Tepung Terigu', satuan: 'kg', hargaPerSatuan: 12000, stok: 25, stokMinimum: 10, supplierId: 'SUP-001' },
  { id: 'BHN-002', nama: 'Gula Pasir', satuan: 'kg', hargaPerSatuan: 14000, stok: 8, stokMinimum: 5, supplierId: 'SUP-001' },
  { id: 'BHN-003', nama: 'Telur Ayam', satuan: 'butir', hargaPerSatuan: 2500, stok: 60, stokMinimum: 30, supplierId: 'SUP-003' },
  { id: 'BHN-004', nama: 'Mentega', satuan: 'gr', hargaPerSatuan: 30, stok: 2000, stokMinimum: 500, supplierId: 'SUP-003' },
  { id: 'BHN-005', nama: 'Cokelat Bubuk', satuan: 'gr', hargaPerSatuan: 55, stok: 800, stokMinimum: 300, supplierId: 'SUP-001' },
  { id: 'BHN-006', nama: 'Pisang Kepok', satuan: 'kg', hargaPerSatuan: 7000, stok: 30, stokMinimum: 15, supplierId: 'SUP-005' },
  { id: 'BHN-007', nama: 'Singkong', satuan: 'kg', hargaPerSatuan: 4000, stok: 2, stokMinimum: 10, supplierId: 'SUP-005' },
  { id: 'BHN-008', nama: 'Minyak Goreng', satuan: 'liter', hargaPerSatuan: 16000, stok: 15, stokMinimum: 5, supplierId: 'SUP-004' },
  { id: 'BHN-009', nama: 'Cabai Merah', satuan: 'kg', hargaPerSatuan: 35000, stok: 0, stokMinimum: 3, supplierId: 'SUP-002' },
  { id: 'BHN-010', nama: 'Bawang Merah', satuan: 'kg', hargaPerSatuan: 28000, stok: 4, stokMinimum: 3, supplierId: 'SUP-002' },
  { id: 'BHN-011', nama: 'Garam', satuan: 'kg', hargaPerSatuan: 5000, stok: 12, stokMinimum: 2, supplierId: 'SUP-001' },
  { id: 'BHN-012', nama: 'Susu Kental Manis', satuan: 'kaleng', hargaPerSatuan: 14000, stok: 18, stokMinimum: 6, supplierId: 'SUP-003' },
  { id: 'BHN-013', nama: 'Tepung Tapioka', satuan: 'kg', hargaPerSatuan: 10000, stok: 7, stokMinimum: 5, supplierId: 'SUP-001' },
  { id: 'BHN-014', nama: 'Kacang Tanah', satuan: 'kg', hargaPerSatuan: 22000, stok: 9, stokMinimum: 4, supplierId: 'SUP-001' },
]

export const menuList: Menu[] = [
  {
    id: 'MNU-001',
    nama: 'Keripik Pisang Original',
    kategori: 'Camilan',
    hargaJual: 25000,
    resep: [
      { bahanId: 'BHN-006', namaBahan: 'Pisang Kepok', qty: 0.5, satuan: 'kg' },
      { bahanId: 'BHN-008', namaBahan: 'Minyak Goreng', qty: 0.3, satuan: 'liter' },
      { bahanId: 'BHN-011', namaBahan: 'Garam', qty: 0.01, satuan: 'kg' },
    ],
    estimasiHPP: 8300,
    profit: 16700,
    profitPercent: 66.8,
  },
  {
    id: 'MNU-002',
    nama: 'Keripik Singkong Balado',
    kategori: 'Camilan',
    hargaJual: 20000,
    resep: [
      { bahanId: 'BHN-007', namaBahan: 'Singkong', qty: 0.4, satuan: 'kg' },
      { bahanId: 'BHN-009', namaBahan: 'Cabai Merah', qty: 0.05, satuan: 'kg' },
      { bahanId: 'BHN-008', namaBahan: 'Minyak Goreng', qty: 0.25, satuan: 'liter' },
      { bahanId: 'BHN-010', namaBahan: 'Bawang Merah', qty: 0.03, satuan: 'kg' },
    ],
    estimasiHPP: 7350,
    profit: 12650,
    profitPercent: 63.3,
  },
  {
    id: 'MNU-003',
    nama: 'Brownies Kukus Cokelat',
    kategori: 'Kue',
    hargaJual: 60000,
    resep: [
      { bahanId: 'BHN-001', namaBahan: 'Tepung Terigu', qty: 0.2, satuan: 'kg' },
      { bahanId: 'BHN-002', namaBahan: 'Gula Pasir', qty: 0.15, satuan: 'kg' },
      { bahanId: 'BHN-003', namaBahan: 'Telur Ayam', qty: 4, satuan: 'butir' },
      { bahanId: 'BHN-004', namaBahan: 'Mentega', qty: 100, satuan: 'gr' },
      { bahanId: 'BHN-005', namaBahan: 'Cokelat Bubuk', qty: 80, satuan: 'gr' },
    ],
    estimasiHPP: 22300,
    profit: 37700,
    profitPercent: 62.8,
  },
  {
    id: 'MNU-004',
    nama: 'Dodol Garut Cokelat',
    kategori: 'Kue & Manisan',
    hargaJual: 55000,
    resep: [
      { bahanId: 'BHN-002', namaBahan: 'Gula Pasir', qty: 0.3, satuan: 'kg' },
      { bahanId: 'BHN-012', namaBahan: 'Susu Kental Manis', qty: 1, satuan: 'kaleng' },
      { bahanId: 'BHN-013', namaBahan: 'Tepung Tapioka', qty: 0.2, satuan: 'kg' },
      { bahanId: 'BHN-005', namaBahan: 'Cokelat Bubuk', qty: 50, satuan: 'gr' },
    ],
    estimasiHPP: 20350,
    profit: 34650,
    profitPercent: 63.0,
  },
  {
    id: 'MNU-005',
    nama: 'Keripik Tempe Krispi',
    kategori: 'Camilan',
    hargaJual: 15000,
    resep: [
      { bahanId: 'BHN-001', namaBahan: 'Tepung Terigu', qty: 0.1, satuan: 'kg' },
      { bahanId: 'BHN-008', namaBahan: 'Minyak Goreng', qty: 0.2, satuan: 'liter' },
      { bahanId: 'BHN-011', namaBahan: 'Garam', qty: 0.005, satuan: 'kg' },
    ],
    estimasiHPP: 5425,
    profit: 9575,
    profitPercent: 63.8,
  },
  {
    id: 'MNU-006',
    nama: 'Abon Sapi Premium',
    kategori: 'Lauk Kering',
    hargaJual: 75000,
    resep: [
      { bahanId: 'BHN-010', namaBahan: 'Bawang Merah', qty: 0.1, satuan: 'kg' },
      { bahanId: 'BHN-008', namaBahan: 'Minyak Goreng', qty: 0.15, satuan: 'liter' },
      { bahanId: 'BHN-011', namaBahan: 'Garam', qty: 0.01, satuan: 'kg' },
    ],
    estimasiHPP: 28250,
    profit: 46750,
    profitPercent: 62.3,
  },
]

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: 'PO-001',
    noPO: 'PO/20261025/001',
    supplierId: 'SUP-001',
    namaSupplier: 'UD Berkah Tani',
    status: 'diterima',
    items: [
      { bahanId: 'BHN-001', namaBahan: 'Tepung Terigu', satuan: 'kg', qty: 20, hargaEstimasi: 12000, hargaAktual: 12000, stokSebelum: 5, diterima: true },
      { bahanId: 'BHN-002', namaBahan: 'Gula Pasir', satuan: 'kg', qty: 10, hargaEstimasi: 14000, hargaAktual: 13500, stokSebelum: 2, diterima: true },
    ],
    totalEstimasi: 380000,
    totalAktual: 375000,
    tanggalBuat: '20 Okt 2026',
    tanggalTerima: '22 Okt 2026',
    catatan: 'Pengiriman tepat waktu',
  },
  {
    id: 'PO-002',
    noPO: 'PO/20261026/002',
    supplierId: 'SUP-002',
    namaSupplier: 'CV Nusantara Rempah',
    status: 'dikirim',
    items: [
      { bahanId: 'BHN-009', namaBahan: 'Cabai Merah', satuan: 'kg', qty: 5, hargaEstimasi: 35000, hargaAktual: 0, stokSebelum: 0, diterima: false },
      { bahanId: 'BHN-010', namaBahan: 'Bawang Merah', satuan: 'kg', qty: 8, hargaEstimasi: 28000, hargaAktual: 0, stokSebelum: 4, diterima: false },
    ],
    totalEstimasi: 399000,
    totalAktual: 0,
    tanggalBuat: '26 Okt 2026',
    catatan: 'Urgent – stok habis',
  },
  {
    id: 'PO-003',
    noPO: 'PO/20261027/003',
    supplierId: 'SUP-005',
    namaSupplier: 'Distributor Pisang Mas',
    status: 'draft',
    items: [
      { bahanId: 'BHN-006', namaBahan: 'Pisang Kepok', satuan: 'kg', qty: 50, hargaEstimasi: 7000, hargaAktual: 0, stokSebelum: 30, diterima: false },
      { bahanId: 'BHN-007', namaBahan: 'Singkong', satuan: 'kg', qty: 30, hargaEstimasi: 4000, hargaAktual: 0, stokSebelum: 2, diterima: false },
    ],
    totalEstimasi: 470000,
    totalAktual: 0,
    tanggalBuat: '27 Okt 2026',
  },
  {
    id: 'PO-004',
    noPO: 'PO/20261020/004',
    supplierId: 'SUP-003',
    namaSupplier: 'PT Susu Segar Nusantara',
    status: 'tagihan',
    items: [
      { bahanId: 'BHN-003', namaBahan: 'Telur Ayam', satuan: 'butir', qty: 100, hargaEstimasi: 2500, hargaAktual: 2500, stokSebelum: 10, diterima: true },
      { bahanId: 'BHN-012', namaBahan: 'Susu Kental Manis', satuan: 'kaleng', qty: 24, hargaEstimasi: 14000, hargaAktual: 14000, stokSebelum: 6, diterima: true },
    ],
    totalEstimasi: 586000,
    totalAktual: 586000,
    tanggalBuat: '18 Okt 2026',
    tanggalTerima: '20 Okt 2026',
    catatan: 'Tagihan jatuh tempo 3 Nov 2026',
  },
  {
    id: 'PO-005',
    noPO: 'PO/20261015/005',
    supplierId: 'SUP-004',
    namaSupplier: 'Toko Minyak Jaya',
    status: 'diterima',
    items: [
      { bahanId: 'BHN-008', namaBahan: 'Minyak Goreng', satuan: 'liter', qty: 20, hargaEstimasi: 16000, hargaAktual: 16500, stokSebelum: 3, diterima: true },
    ],
    totalEstimasi: 320000,
    totalAktual: 330000,
    tanggalBuat: '13 Okt 2026',
    tanggalTerima: '15 Okt 2026',
  },
]

export const penjualanList: Penjualan[] = [
  {
    id: 'TRX-001',
    noTransaksi: 'TRX/20261027/001',
    items: [
      { menuId: 'MNU-001', namaMenu: 'Keripik Pisang Original', qty: 3, hargaJual: 25000, hpp: 8300 },
      { menuId: 'MNU-003', namaMenu: 'Brownies Kukus Cokelat', qty: 1, hargaJual: 60000, hpp: 22300 },
    ],
    totalHPP: 47200,
    totalJual: 135000,
    profit: 87800,
    tanggal: '27 Okt 2026, 09:15 WIB',
  },
  {
    id: 'TRX-002',
    noTransaksi: 'TRX/20261027/002',
    items: [
      { menuId: 'MNU-005', namaMenu: 'Keripik Tempe Krispi', qty: 5, hargaJual: 15000, hpp: 5425 },
    ],
    totalHPP: 27125,
    totalJual: 75000,
    profit: 47875,
    tanggal: '27 Okt 2026, 10:30 WIB',
  },
  {
    id: 'TRX-003',
    noTransaksi: 'TRX/20261026/003',
    items: [
      { menuId: 'MNU-002', namaMenu: 'Keripik Singkong Balado', qty: 4, hargaJual: 20000, hpp: 7350 },
      { menuId: 'MNU-006', namaMenu: 'Abon Sapi Premium', qty: 2, hargaJual: 75000, hpp: 28250 },
    ],
    totalHPP: 85900,
    totalJual: 230000,
    profit: 144100,
    tanggal: '26 Okt 2026, 14:00 WIB',
  },
  {
    id: 'TRX-004',
    noTransaksi: 'TRX/20261026/004',
    items: [
      { menuId: 'MNU-004', namaMenu: 'Dodol Garut Cokelat', qty: 2, hargaJual: 55000, hpp: 20350 },
    ],
    totalHPP: 40700,
    totalJual: 110000,
    profit: 69300,
    tanggal: '26 Okt 2026, 16:45 WIB',
  },
  {
    id: 'TRX-005',
    noTransaksi: 'TRX/20261025/005',
    items: [
      { menuId: 'MNU-001', namaMenu: 'Keripik Pisang Original', qty: 6, hargaJual: 25000, hpp: 8300 },
      { menuId: 'MNU-005', namaMenu: 'Keripik Tempe Krispi', qty: 3, hargaJual: 15000, hpp: 5425 },
    ],
    totalHPP: 66075,
    totalJual: 195000,
    profit: 128925,
    tanggal: '25 Okt 2026, 11:20 WIB',
  },
  {
    id: 'TRX-006',
    noTransaksi: 'TRX/20261024/006',
    items: [
      { menuId: 'MNU-003', namaMenu: 'Brownies Kukus Cokelat', qty: 3, hargaJual: 60000, hpp: 22300 },
    ],
    totalHPP: 66900,
    totalJual: 180000,
    profit: 113100,
    tanggal: '24 Okt 2026, 13:00 WIB',
  },
]

export const stokLogs: StokLog[] = [
  { id: 'LOG-001', bahanId: 'BHN-001', namaBahan: 'Tepung Terigu', perubahan: +20, stokSebelum: 5, stokSesudah: 25, sumber: 'PO', tanggal: '22 Okt 2026, 10:00' },
  { id: 'LOG-002', bahanId: 'BHN-002', namaBahan: 'Gula Pasir', perubahan: +10, stokSebelum: 2, stokSesudah: 12, sumber: 'PO', tanggal: '22 Okt 2026, 10:05' },
  { id: 'LOG-003', bahanId: 'BHN-001', namaBahan: 'Tepung Terigu', perubahan: -0.6, stokSebelum: 25, stokSesudah: 24.4, sumber: 'Penjualan', tanggal: '25 Okt 2026, 11:25' },
  { id: 'LOG-004', bahanId: 'BHN-006', namaBahan: 'Pisang Kepok', perubahan: -3, stokSebelum: 33, stokSesudah: 30, sumber: 'Penjualan', tanggal: '25 Okt 2026, 11:25' },
  { id: 'LOG-005', bahanId: 'BHN-003', namaBahan: 'Telur Ayam', perubahan: +100, stokSebelum: 10, stokSesudah: 110, sumber: 'PO', tanggal: '20 Okt 2026, 14:00' },
  { id: 'LOG-006', bahanId: 'BHN-009', namaBahan: 'Cabai Merah', perubahan: -5, stokSebelum: 5, stokSesudah: 0, sumber: 'Penjualan', tanggal: '24 Okt 2026, 09:00' },
  { id: 'LOG-007', bahanId: 'BHN-008', namaBahan: 'Minyak Goreng', perubahan: +20, stokSebelum: 3, stokSesudah: 23, sumber: 'PO', tanggal: '15 Okt 2026, 13:00' },
  { id: 'LOG-008', bahanId: 'BHN-002', namaBahan: 'Gula Pasir', perubahan: -4, stokSebelum: 12, stokSesudah: 8, sumber: 'Penjualan', tanggal: '26 Okt 2026, 16:50' },
  { id: 'LOG-009', bahanId: 'BHN-007', namaBahan: 'Singkong', perubahan: -1.6, stokSebelum: 3.6, stokSesudah: 2, sumber: 'Penjualan', tanggal: '26 Okt 2026, 14:05' },
  { id: 'LOG-010', bahanId: 'BHN-011', namaBahan: 'Garam', perubahan: +5, stokSebelum: 7, stokSesudah: 12, sumber: 'Manual', tanggal: '19 Okt 2026, 08:00' },
]

export const rekomendasiList: Rekomendasi[] = [
  {
    id: 'RKM-001',
    tipe: 'Stok',
    judul: 'Reorder Cabai Merah Segera',
    deskripsi: 'Stok Cabai Merah sudah habis (0 kg). Pertimbangkan reorder dari CV Nusantara Rempah dengan minimal order Rp 300.000. Menu Keripik Singkong Balado tidak bisa diproduksi.',
    confidence: 98,
    priority: 'tinggi',
  },
  {
    id: 'RKM-002',
    tipe: 'Stok',
    judul: 'Stok Singkong Hampir Habis',
    deskripsi: 'Stok Singkong hanya tersisa 2 kg, jauh di bawah batas minimum 10 kg. Segera buat PO ke Distributor Pisang Mas sebelum kehabisan bahan.',
    confidence: 94,
    priority: 'tinggi',
  },
  {
    id: 'RKM-003',
    tipe: 'Penjualan',
    judul: 'Keripik Pisang Paling Laris',
    deskripsi: 'Menu Keripik Pisang Original terjual 9 porsi dalam 3 hari terakhir. Pastikan stok Pisang Kepok (saat ini 30 kg) mencukupi untuk produksi 2 minggu ke depan (~42 kg).',
    confidence: 87,
    priority: 'sedang',
  },
  {
    id: 'RKM-004',
    tipe: 'Keuangan',
    judul: 'HPP Keripik Singkong Naik',
    deskripsi: 'HPP Keripik Singkong Balado diperkirakan naik 8.5% karena kenaikan harga Cabai Merah. Pertimbangkan penyesuaian harga jual atau cari supplier alternatif.',
    confidence: 82,
    priority: 'sedang',
  },
  {
    id: 'RKM-005',
    tipe: 'Keuangan',
    judul: 'Margin Brownies Tertinggi',
    deskripsi: 'Brownies Kukus Cokelat memiliki profit margin 62.8% dengan HPP Rp 22.300. Produk ini layak dijadikan produk unggulan dengan promosi lebih aktif.',
    confidence: 91,
    priority: 'sedang',
  },
  {
    id: 'RKM-006',
    tipe: 'Stok',
    judul: 'Stok Bawang Merah Mendekati Minimum',
    deskripsi: 'Stok Bawang Merah tersisa 4 kg dengan batas minimum 3 kg. Segera rencanakan pembelian dari CV Nusantara Rempah sebelum kehabisan.',
    confidence: 76,
    priority: 'rendah',
  },
  {
    id: 'RKM-007',
    tipe: 'Penjualan',
    judul: 'Pola Penjualan Pagi Lebih Tinggi',
    deskripsi: 'Analisis menunjukkan 65% transaksi terjadi antara pukul 09.00–12.00. Pertimbangkan menyiapkan produk lebih awal dan promosi siang hari untuk meningkatkan penjualan sore.',
    confidence: 79,
    priority: 'rendah',
  },
  {
    id: 'RKM-008',
    tipe: 'Keuangan',
    judul: 'Tagihan PO Jatuh Tempo',
    deskripsi: 'PO/20261020/004 dari PT Susu Segar Nusantara senilai Rp 586.000 jatuh tempo pada 3 November 2026. Pastikan kas tersedia untuk pembayaran.',
    confidence: 100,
    priority: 'tinggi',
  },
]
