# Arsitektur Aplikasi (Architecture & Engineering Guidelines)

Dokumen ini mencatat pola arsitektur berbasis fitur terisolasi (*Feature-First Folder Structure*) yang diterapkan pada modul-modul di Next.js App Router dengan integrasi **PostgreSQL Supabase (Auth, Database, & RLS)**.

---

## 1. Pola Folder Berbasis Halaman / Fitur (*Colocated Architecture*)

Setiap modul halaman mandiri (seperti `bahan`, `suppliers`, `stok-log`, `purchase-order`, dll.) ditempatkan dalam foldernya sendiri dengan membagi tanggung jawab (*Separation of Concerns*) menjadi 5 lapisan:

```
src/app/dashboard/<fitur>/
├── api/                   # API Route handler spesifik (GET, POST, dsb)
│   └── route.ts
├── components/            # Komponen UI spesifik fitur (Tabel, Filter Bar, Modal, Form)
│   ├── <Fitur>FilterBar.tsx
│   ├── <Fitur>Modal.tsx
│   └── <Fitur>Table.tsx
├── hooks/                 # Custom Hook mengelola lifecycle, filter, search, & error
│   └── use<Fitur>.ts
├── services/              # Komunikasi langsung ke Supabase (Data Access Object / DAO)
│   └── <fitur>Service.ts
├── types/                 # Definisi Typescript (Entity, DTO, Form Data, Status)
│   └── index.ts
└── page.tsx               # Presenter utama (Mengorkestrasi Hook & Komponen)
```

---

## 2. Modul yang Telah Mengadopsi Arsitektur Ini

| Modul | Lokasi | Keterangan Database | Alur Mutasi & Validasi |
| :--- | :--- | :--- | :--- |
| **Bahan Baku** | `src/app/dashboard/bahan/` | Tabel `bahan` & `suppliers` | CRUD stok fisik, harga per satuan, ambang batas minimum. |
| **Suppliers** | `src/app/dashboard/suppliers/` | Tabel `suppliers`, `supplier_categories`, `supplier_riwayat` | Normalisasi kategori pasokan terpusat, profil kontak distributor, riwayat pasokan. |
| **Stok Log & Opname** | `src/app/dashboard/stok-log/` | Tabel `stok_logs` & `bahan` | Audit keluar-masuk (Masuk +, Keluar -), mutasi manual, rekonsiliasi Stock Opname fisik ke database. |
| **Purchase Order (PO)** | `src/app/dashboard/purchase-order/` | Tabel `purchase_orders`, `po_items`, `bahan`, `stok_logs`, `supplier_riwayat` | Siklus bertahap: Draft $\rightarrow$ Dikirim $\rightarrow$ Diterima (+Auto Stok & Log Mutasi) $\rightarrow$ Tagihan. |

---

## 3. Alur Otomasi Purchase Order (PO Lifecycle)

1. **Wizard Pembuatan PO**:
   - Langkah 1: Pilih supplier tujuan (mengambil data dari tabel `suppliers`) dan input catatan opsional.
   - Langkah 2: Pilih bahan baku (mengambil data dari tabel `bahan`), input kuantitas diorder dan estimasi harga per satuan.
   - Langkah 3: Konfirmasi dan simpan sebagai `draft` di tabel `purchase_orders` beserta detail item di `po_items`.
2. **Siklus Status & Dampak ke Database**:
   - `draft`: PO baru terbuat.
   - `dikirim`: PO telah diteruskan ke pihak supplier/distributor.
   - `diterima`: **Trigger Mutasi Otomatis**:
     1. Stok bahan di tabel `bahan` otomatis bertambah (`stok = stok + qty`).
     2. Menuliskan riwayat mutasi masuk ke tabel `stok_logs` (sumber: `'PO'`).
     3. Menandai item di `po_items` sebagai `diterima = true`.
     4. Menambahkan histori transaksi ke tabel `supplier_riwayat`.
   - `tagihan`: PO masuk ke antrean kewajiban pembayaran/keuangan toko.
