export type FreshnessStatus = 'segar' | 'mendekati_expire' | 'kadaluarsa' | 'sudah_dimusnahkan' | 'tidak_diketahui'
export type RunoutStatus = 'habis' | 'kritis' | 'waspada' | 'aman' | 'tidak_aktif'

export interface PenjualanKondisi {
  lajuHarian: number // konsumsi rata-rata per hari
  estimasiHariHabis: number | null // stok / lajuHarian, null jika tidak ada penjualan
  statusHabis: RunoutStatus
  totalTerjual30Hari: number
}

export interface AIExpiryAnalysis {
  perkiraanUmurHari: number
  kategoriKetahanan: 'sangat_rentan' | 'rentan' | 'sedang' | 'tahan_lama'
  tipsPenyimpanan: string
  alasan: string
  confidence: number
}

export interface BatchMasukItem {
  batchId: string
  batchNo?: number // Nomor urut batch (misal #1, #2)
  batchQty: number
  tanggalMasuk: string
  sumberMasuk: string
  nomorReferensi?: string | null
  aiEstimasiExpire?: string | null
  aiSisaHari?: number | null
  aiStatusFreshness?: FreshnessStatus
  isExpired?: boolean
  isDibuang?: boolean // Ditandai sudah dibuang / dimusnahkan
}

export interface BahanKondisi {
  id: string
  userId: string
  code?: string | null
  nama: string
  satuan: string
  hargaPerSatuan: number
  totalStok: number // Akumulasi total stok saat ini
  stokMinimum: number
  supplierId?: string | null
  namaSupplier?: string
  tanggalExpireManual?: string | null
  
  // Analisis Agregat Bahan
  aiStatusFreshness?: FreshnessStatus
  aiSisaHari?: number | null // Sisa hari terdekat
  aiEstimasiExpire?: string | null // Expire batch terdekat
  aiAnalysis?: AIExpiryAnalysis | null

  // Estimasi Kebutuhan / Kehabisan Bahan Berdasarkan Penjualan
  penjualan?: PenjualanKondisi

  // Rincian Riwayat Batch Barang Masuk (PO / Mutasi) di dalam satu card
  batches: BatchMasukItem[]
  expiredBatchesCount: number // Jumlah batch yang sudah lewat expire
  
  createdAt: string
  updatedAt: string
}
