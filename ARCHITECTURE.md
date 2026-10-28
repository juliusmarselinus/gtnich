# Arsitektur Aplikasi (Architecture & Engineering Guidelines)

Dokumen ini mencatat pola arsitektur berbasis fitur terisolasi (*Feature-First Folder Structure*) yang diterapkan pada modul-modul di Next.js App Router dengan integrasi **PostgreSQL Supabase (Auth, Database, & RLS)**.

---

## 1. Pola Folder Berbasis Halaman / Fitur (*Colocated Architecture*)

Setiap modul halaman mandiri (seperti `bahan`, `suppliers`, `stok-log`, `purchase-order`, `kondisi-bahan`, `menu`, dll.) ditempatkan dalam foldernya sendiri dengan membagi tanggung jawab (*Separation of Concerns*) menjadi 5 lapisan:

```
src/app/dashboard/<fitur>/
├── api/                   # API Route handler spesifik (GET, POST, dsb)
│   └── route.ts
├── components/            # Komponen UI spesifik fitur (Tabel, Filter Bar, Modal, Form, Card)
│   ├── <Fitur>CardGrid.tsx / <Fitur>Table.tsx
│   ├── <Fitur>Modal.tsx
│   └── <Fitur>FilterBar.tsx
├── hooks/                 # Custom Hook mengelola lifecycle, filter, search, & error
│   └── use<Fitur>.ts
├── services/              # Komunikasi langsung ke Supabase (Data Access Object / DAO) & AI Service
│   └── <fitur>Service.ts
├── types/                 # Definisi Typescript (Entity, DTO, Form Data, Status)
│   └── index.ts
└── page.tsx               # Presenter utama (Mengorkestrasi Hook & Komponen)
```

---

## 2. Modul yang Telah Mengadopsi Arsitektur Ini

| Modul | Lokasi | Keterangan Database & Integrasi | Alur Mutasi & Validasi |
| :--- | :--- | :--- | :--- |
| **Bahan Baku** | `src/app/dashboard/bahan/` | Tabel `bahan` & `suppliers` | CRUD stok fisik, harga per satuan, ambang batas minimum. |
| **Suppliers** | `src/app/dashboard/suppliers/` | Tabel `suppliers`, `supplier_categories`, `supplier_riwayat` | Normalisasi kategori pasokan terpusat, profil kontak distributor, riwayat pasokan. |
| **Stok Log & Opname** | `src/app/dashboard/stok-log/` | Tabel `stok_logs` & `bahan` | Audit keluar-masuk (Masuk +, Keluar -), mutasi manual, rekonsiliasi Stock Opname fisik ke database. |
| **Purchase Order (PO)** | `src/app/dashboard/purchase-order/` | Tabel `purchase_orders`, `po_items`, `bahan`, `stok_logs`, `supplier_riwayat` | Siklus bertahap: Draft $\rightarrow$ Dikirim $\rightarrow$ Diterima (+Auto Stok & Log Mutasi) $\rightarrow$ Tagihan. |
| **Kondisi Bahan & Expire AI** | `src/app/dashboard/kondisi-bahan/` | Tabel `bahan` & Google Gemini API / Smart Food Shelf-Life Engine | Menganalisis nama bahan dan tanggal masuk $\rightarrow$ memperkirakan tanggal kedaluwarsa, sisa hari, status kesegaran, serta tips penyimpanan. |
| **Menu & Resep Masakan** | `src/app/dashboard/menu/` | Tabel `menus`, `resep_items`, & `bahan` | Pembuatan menu & komposisi resep bahan (BOM - Bill of Materials), kalkulasi HPP otomatis, dan margin laba riil. |

---

## 3. Alur Pembuatan Menu & Resep (`menu`)

1. **Relasi Many-to-Many via Resep (BOM)**:
   - Satu baris menu di tabel `menus` terhubung ke banyak item bahan di tabel `resep_items` (`menu_id` & `bahan_id`).
2. **Kalkulasi HPP & Margin Otomatis**:
   - $\text{HPP} = \sum (\text{Harga per Satuan Bahan} \times \text{Takaran Qty})$.
   - $\text{Profit} = \text{Harga Jual} - \text{HPP}$.
   - $\text{Margin Laba (\%)} = (\text{Profit} / \text{Harga Jual}) \times 100$.
3. **Penyimpanan Transaksional**:
   - Saat menu disimpan, header disimpan ke tabel `menus`.
   - Seluruh item komposisi resep disimpan ke tabel `resep_items`.
   - Nilai `estimasi_hpp` di tabel `menus` disinkronkan secara otomatis.
   - Saat menu dihapus, seluruh baris `resep_items` terkait otomatis terhapus secara beruntun (*cascade delete*).

---

## 4. Sistem Satuan Standar & Konversi Otomatis (`src/lib/satuan.ts`)

1. **Satuan Master Bahan**:
   - Master bahan baku (`bahan`) didukung dengan pilihan satuan bawaan standar industri dapur/F&B: `kg`, `gram`, `liter`, `ml`, `butir`, `pcs`, `sachet`, `bungkus`, `kaleng`, `botol`, `pack`, `lembar`, `sdm`, `sdt`.
   - Mendukung opsi penambahan satuan kustom (*custom unit*) jika pengguna memiliki kemasan unik.
2. **Fleksibilitas Satuan di Resep Menu**:
   - Di resep menu, takaran dapat menggunakan pecahan yang relevan (misal: bahan master terdaftar dalam `kg`, namun di resep ditulis `200 gram`, `1 sdm`, atau `1 sdt`).
   - Sistem melakukan normalisasi rasio konversi secara matematis (`getUnitConversionFactor`) saat menghitung HPP live dan menyimpan kuantitas ke database `resep_items`, memastikan kalkulasi stok dan HPP selalu presisi.

3. **Fleksibilitas Satuan Pembelian di Purchase Order (PO)**:
   - Pembuatan PO memungkinkan pemesanan dalam satuan kemasan / grosir (misal: `karung (25kg)`, `jerigen (5L)`, `dus/karton`, `tray (30 butir)`, `pack (50 pcs)` atau satuan turunan `gram`, `ml`).
   - Saat satuan diganti di modal PO, sistem otomatis menyesuaikan taksiran harga satuan sesuai rasio pengali.
   - Saat status PO ditandai **Diterima**, sistem mengonversi kuantitas order secara akurat ke kuantitas satuan master bahan di database dan mencatat rinciannya di log mutasi `stok_logs`.
