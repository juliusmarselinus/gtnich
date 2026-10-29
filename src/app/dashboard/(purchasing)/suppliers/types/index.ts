export interface SupplierCategory {
  id: string
  userId?: string
  nama: string
  deskripsi?: string | null
  createdAt?: string
}

export interface RiwayatSupplier {
  id?: string
  supplierId?: string
  tanggal: string
  keterangan: string
  jumlah: number
  createdAt?: string
}

export interface Supplier {
  id: string
  userId?: string
  code?: string
  nama: string
  telepon: string
  alamat: string
  categoryId?: string | null
  category?: SupplierCategory | null
  kategoriNama: string // nama kategori yang ditampilkan (baik dari relasi maupun legacy text)
  minimalOrder: number
  riwayat: RiwayatSupplier[]
  createdAt?: string
  updatedAt?: string
}

export interface SupplierFormData {
  nama: string
  telepon: string
  alamat: string
  categoryId?: string | null
  kategoriBaru?: string // Jika user ingin menambah kategori baru langsung dari form
  minimalOrder: number
}
