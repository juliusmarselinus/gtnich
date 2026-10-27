# Arsitektur Aplikasi (Architecture & Engineering Guidelines)

Dokumen ini mencatat pola arsitektur berbasis fitur terisolasi (*Feature-First Folder Structure*) yang diterapkan pada modul-modul di Next.js App Router dengan integrasi **PostgreSQL Supabase (Auth, Database, & RLS)**.

---

## 1. Pola Folder Berbasis Halaman / Fitur (*Colocated Architecture*)

Setiap modul halaman mandiri (seperti `bahan`, `suppliers`, `stok-log`, dll.) ditempatkan dalam foldernya sendiri dengan membagi tanggung jawab (*Separation of Concerns*) menjadi 5 lapisan:

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
| **Suppliers** | `src/app/dashboard/suppliers/` | Tabel `suppliers`, `supplier_categories`, `supplier_riwayat` | Normalisasi kategori pasokan, profil kontak distributor, riwayat pasokan. |
| **Stok Log & Opname** | `src/app/dashboard/stok-log/` | Tabel `stok_logs` & `bahan` | Audit keluar-masuk (Masuk +, Keluar -), mutasi manual, rekonsiliasi Stock Opname fisik ke database. |

---

## 3. Alur Pencatatan Mutasi Stok (`stok-log`)

1. **Jejak Audit Real-time**:
   Setiap perubahan stok mencatat:
   - `bahan_id`: Bahan yang mengalami perubahan.
   - `stok_sebelum`: Saldo stok sebelum perubahan.
   - `perubahan`: Nominal mutasi (positif `+` untuk masuk, negatif `-` untuk keluar).
   - `stok_sesudah`: Saldo akhir stok setelah kalkulasi.
   - `sumber`: Kategori sumber (`PO`, `Penjualan`, `Manual`, `Opname`, `Penyesuaian`).
   - `catatan`: Alasan mutasi (contoh: bahan rusak, retur, selisih fisik gudang).
2. **Sinkronisasi Dua Arah (*Atomic Update*)**:
   - Saat input mutasi manual (`masuk` / `keluar`), sistem memvalidasi ketersediaan stok fisik agar tidak bernilai negatif, memperbarui tabel `bahan`, dan menuliskan baris baru di `stok_logs`.
   - Pada Stock Opname, hanya bahan yang mengalami selisih (`selisih !== 0`) yang disinkronisasi ke tabel `bahan` dan dicatat ke `stok_logs` dengan sumber `Opname`.
