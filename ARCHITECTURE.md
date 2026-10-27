# Arsitektur Aplikasi (Architecture & Engineering Guidelines)

Dokumen ini mencatat pola arsitektur berbasis fitur terisolasi (*Feature-First Folder Structure*) yang diterapkan pada modul-modul di Next.js App Router dengan integrasi **PostgreSQL Supabase (Auth, Database, & RLS)**.

---

## 1. Pola Folder Berbasis Halaman / Fitur (*Colocated Architecture*)

Setiap modul halaman mandiri (seperti `bahan`, `suppliers`, `stok-log`, `purchase-order`, `kondisi-bahan`, dll.) ditempatkan dalam foldernya sendiri dengan membagi tanggung jawab (*Separation of Concerns*) menjadi 5 lapisan:

```
src/app/dashboard/<fitur>/
├── api/                   # API Route handler spesifik (GET, POST, dsb)
│   └── route.ts
├── components/            # Komponen UI spesifik fitur (Tabel, Filter Bar, Modal, Form, Card)
│   ├── <Fitur>FilterBar.tsx
│   ├── <Fitur>Modal.tsx
│   └── <Fitur>Table.tsx
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

---

## 3. Alur Analisis Kedaluwarsa AI (`kondisi-bahan`)

1. **Input Data**: Nama bahan baku dan tanggal masuk barang (`tanggal_masuk` atau `created_at` dari database Supabase).
2. **Dual-Engine Analisis**:
   - **Google Gemini API**: Jika pengguna memasukkan API Key di bar konfigurasi, sistem memanggil model `gemini-1.5-flash` untuk menganalisis sifat biokimiawi bahan makanan, estimasi umur simpan (hari), kategori risiko pembusukan, dan tips penyimpanan.
   - **Smart Food Shelf-Life Engine (Fallback)**: Jika API Key belum diisi atau kuota habis, sistem otomatis menggunakan knowledge base internal kuliner (bahan basah kadar air tinggi: 3-5 hari; dairy/umbi: 14 hari; tepung/biji-bijian: 180 hari; bumbu/gula/minyak: 365 hari).
3. **Kalkulasi & Output**:
   - `aiEstimasiExpire`: Tanggal kedaluwarsa = `tanggalMasuk + perkiraanUmurHari`.
   - `aiSisaHari`: Selisih hari antara waktu saat ini dengan tanggal kedaluwarsa.
   - `aiStatusFreshness`:
     - `segar` (Sisa > 3 hari)
     - `mendekati_expire` (Sisa $\le$ 3 hari)
     - `kadaluarsa` (Sisa $\le$ 0 hari)
