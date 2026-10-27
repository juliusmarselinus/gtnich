# Arsitektur Aplikasi (Architecture & Engineering Guidelines)

Dokumen ini mencatat pola arsitektur berbasis fitur terisolasi (*Feature-First Folder Structure*) yang diterapkan pada modul-modul di Next.js App Router dengan integrasi **PostgreSQL Supabase (Auth, Database, & RLS)**.

---

## 1. Pola Folder Berbasis Halaman / Fitur (*Colocated Architecture*)

Setiap modul halaman mandiri (seperti `bahan`, `suppliers`, dll.) ditempatkan dalam foldernya sendiri dengan membagi tanggung jawab (*Separation of Concerns*) menjadi 5 lapisan:

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

## 2. Tanggung Jawab Tiap Lapisan (*Layer Responsibilities*)

### a. `types/index.ts`
- Menyediakan tipe data murni untuk entitas database, form data input/edit, serta status kondisional.
- Menjamin konsistensi tipe antara respons database dan tampilan UI.

### b. `services/<fitur>Service.ts`
- Bertindak sebagai lapisan abstraksi data (*Data Access Layer*) ke Supabase.
- **Validasi Sesi**: Memeriksa sesi pengguna aktif menggunakan `supabase.auth.getSession()` untuk memastikan kepatuhan terhadap Row Level Security (RLS).
- **Sanitasi Data**: Melakukan normalisasi nilai (mengubah `""` menjadi `null` untuk relasi UUID foreign key, cast ke numeric/number).
- **Pemetaan Data (*Mapping*)**: Mengonversi format kolom `snake_case` PostgreSQL menjadi `camelCase` TypeScript.
- **Error Transparency**: Menangkap dan membungkus error Supabase (`message`, `details`, `hint`, `code`) menjadi pesan yang mudah dimengerti.

### c. `hooks/use<Fitur>.ts`
- Menyediakan *stateful logic* bagi komponen UI.
- Menyimpan state: `list`, `loading`, `error`, `search`, `filterStatus`, `userEmail`.
- **Murni Tanpa Dummy**: Menghubungkan langsung ke database asli tanpa fallback mock data statis yang dapat menutupi data riil.
- **Auto Sync Auth**: Memasang pendengar `supabase.auth.onAuthStateChange` sehingga saat user login atau logout, data otomatis di-fetch ulang secara reaktif.

### d. `components/`
- Komponen *stateless / presentation*:
  - **FilterBar**: Pencarian teks, badge status, tombol aksi tambah.
  - **Table**: Render baris data, aksi expand detail/riwayat, tombol edit dan hapus.
  - **Modal**: Form input/edit terisolasi lengkap dengan status `isSubmitting` dan validasi input.

### e. `api/route.ts`
- Menyediakan endpoint REST standar Next.js App Router (`/dashboard/<fitur>/api`) jika fitur memerlukan interaksi via HTTP client standar.

### f. `page.tsx`
- Bertindak sebagai *root orchestrator* halaman.
- Mengonsumsi custom hook dan mendistribusikan data ke komponen UI.
- Menampilkan status peringatan autentikasi jika user belum melakukan sign-in.

---

## 3. Modul yang Telah Mengadopsi Arsitektur Ini

| Modul | Lokasi | Keterangan Database |
| :--- | :--- | :--- |
| **Bahan Baku** | `src/app/dashboard/bahan/` | Terhubung ke tabel `bahan` & `suppliers` |
| **Suppliers** | `src/app/dashboard/suppliers/` | Terhubung ke tabel `suppliers` & `supplier_riwayat` |

---

## 4. Keamanan & Konvensi Multi-Tenant (Supabase RLS)

- Seluruh tabel entitas bisnis wajib menyertakan kolom `user_id UUID NOT NULL REFERENCES public.profiles(id)`.
- RLS diaktifkan (`ENABLE ROW LEVEL SECURITY`) dengan policy:
  ```sql
  CREATE POLICY "Users can manage their own data"
      ON public.<tabel>
      FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  ```
- Sebelum melakukan insert entitas, service memastikan profil akun pengguna telah terdaftar di tabel `public.profiles`.
