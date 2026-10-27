export type FreshnessStatus = 'segar' | 'mendekati_expire' | 'kadaluarsa' | 'tidak_diketahui'

export interface AIExpiryAnalysis {
  perkiraanUmurHari: number
  kategoriKetahanan: 'sangat_rentan' | 'rentan' | 'sedang' | 'tahan_lama'
  tipsPenyimpanan: string
  alasan: string
  confidence: number
}

export interface BahanKondisi {
  id: string
  userId: string
  code?: string | null
  nama: string
  satuan: string
  hargaPerSatuan: number
  stok: number
  stokMinimum: number
  supplierId?: string | null
  namaSupplier?: string
  tanggalMasuk: string // Tanggal masuk / created_at (ISO)
  tanggalExpireManual?: string | null // Jika ada input manual
  
  // Analisis AI
  aiEstimasiExpire?: string | null // ISO Date
  aiSisaHari?: number | null
  aiStatusFreshness?: FreshnessStatus
  aiAnalysis?: AIExpiryAnalysis | null
  
  createdAt: string
  updatedAt: string
}
