# DapurTwin

Aplikasi web manajemen operasional dapur, inventori bahan baku, dan kalkulasi HPP (*Harga Pokok Penjualan*) untuk bisnis F&B / UMKM kuliner. Dibangun dengan Next.js App Router dan PostgreSQL via Supabase.

---

## 📌 Ringkasan Sistem

DapurTwin menghubungkan alur harian dapur: mulai dari pembelian bahan baku ke supplier, pencatatan stok fisik dan opname, penyusunan resep menu (BOM), hingga pencatatan transaksi kasir POS yang langsung memotong bahan terkait secara otomatis.

---

## 🚀 Fitur Utama

### 1. Operasional Harian
- **Ringkasan (Dashboard Utama):** Metrik pergerakan bahan menipis, peringatan kedaluwarsa, nilai stok, serta grafik tren penjualan.
- **Kasir Penjualan (POS):** Input pesanan menu dengan kalkulasi harga riil, otomatis memotong stok bahan baku berdasarkan takaran resep, serta mencatat riwayat mutasi keluar.
- **Purchase Order (PO):** Pencatatan pesanan ke supplier dengan dukungan satuan grosir (karung, dus, tray, jerigen). Saat status ditandai **Diterima**, kuantitas otomatis dikonversi ke satuan master bahan dan menambah stok fisik.
- **Tagihan Supplier:** Pelacakan status pembayaran faktur/nota supplier (belum lunas, jatuh tempo, lunas).

### 2. Inventori & Resep (BOM)
- **Data Bahan Baku:** Master inventori bahan, harga beli per satuan, stok minimum, dan batas peringatan habis.
- **Menu & Resep Masakan:** Komposisi bahan per menu (*Bill of Materials*). Menghitung estimasi HPP, margin laba, dan rekomendasi harga jual secara otomatis.
- **Multi-Satuan & Konversi Otomatis:** Input resep fleksibel (misal: bahan dasar disimpan dalam `kg`, tetapi takaran resep menggunakan `gram`, `sdm`, atau `sdt`).
- **Supplier Directory:** Profil kontak supplier dan riwayat pasokan barang.
- **Stok Log & Opname:** Audit log keluar-masuk barang secara berkala serta rekonsiliasi stok fisik ke database.
- **Estimasi Kesegaran Bahan:** Analisis perkiraan umur simpan bahan (*shelf-life*) dan rekomendasi penyimpanan berdasarkan tanggal masuk.

### 3. Analitik & Alat Bantu
- **Laporan Penjualan & Pemakaian:** Rangkuman omzet, laba kotor, metode pembayaran, dan konsumsi bahan pada rentang waktu tertentu.
- **Simulasi Biaya & Kebutuhan:** Perhitungan kebutuhan bahan jika target porsi dinaikkan serta simulasi dampak fluktuasi harga bahan terhadap margin menu.
- **Rekomendasi Operasional:** Peringatan bahan yang sering habis, margin menu rendah, dan evaluasi pengeluaran.
- **OCR Nota (Eksperimental/Dalam Pengembangan):** Rencana pemindaian foto nota fisik supplier untuk mempercepat input data PO.

---

## 🛠️ Arsitektur & Teknologi

- **Frontend & Server:** [Next.js](https://nextjs.org/) (App Router), React, TypeScript
- **Styling & UI:** Tailwind CSS, Lucide React, Recharts
- **Database & Autentikasi:** [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Supabase Auth)
- **Struktur Kode:** *Feature-First Colocated Architecture* (setiap modul halaman memiliki `components/`, `hooks/`, `services/`, `types/`, dan `api/` tersendiri).

---

## 💻 Panduan Instalasi Lokal

### 1. Prasyarat
- Node.js (versi 18.x atau yang lebih baru)
- Akun proyek Supabase aktif

### 2. Kloning & Pemasangan Dependensi
```bash
git clone <url-repository>
cd gtnich
npm install
```

### 3. Konfigurasi Environment Variable
Salin file `.env.example` ke `.env.local` (atau buat file `.env.local` baru) lalu isi kredensial Supabase Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Skema Database
Jalankan berkas SQL migrasi yang tersedia di folder `supabase/` pada SQL Editor Supabase untuk menyiapkan tabel `bahan`, `menus`, `resep_items`, `purchase_orders`, `orders`, `stok_logs`, dan relasi terkait.

### 5. Menjalankan Aplikasi
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

---

## 📁 Struktur Direktori

```text
src/
├── app/
│   ├── dashboard/          # Modul fungsional dapur & operasional
│   │   ├── bahan/          # Manajemen stok bahan baku
│   │   ├── menu/           # Resep, komposisi takaran, & HPP
│   │   ├── penjualan/      # Kasir POS & potong stok otomatis
│   │   ├── purchase-order/ # Pembelian & penerimaan barang
│   │   ├── suppliers/      # Direktori pemasok & kategori
│   │   ├── tagihan/        # Faktur & pembayaran tempo
│   │   ├── stok-log/       # Log audit mutasi & opname fisik
│   │   ├── kondisi-bahan/  # Estimasi kesegaran & shelf-life
│   │   ├── laporan/        # Analitik penjualan & pemakaian bahan
│   │   ├── simulasi/       # Simulasi margin & kebutuhan porsi
│   │   └── rekomendasi/    # Saran pengadaan & audit stok
│   ├── login/              # Otentikasi Supabase
│   └── page.tsx            # Redirect ke dashboard / login
├── components/             # Komponen global (Sidebar, Topbar, Modal)
├── lib/
│   ├── satuan.ts           # Logika konversi satuan & normalisasi takaran
│   └── supabase/           # Inisialisasi Supabase client & server helper
└── types/                  # Definisi TypeScript global
```

---

## 📄 Lisensi & Kontribusi

Proyek ini dikembangkan secara internal untuk mendukung operasional dapur UMKM kuliner. Untuk detail arsitektur teknis lebih lanjut, silakan baca [ARCHITECTURE.md](file:///Users/kevin/Documents/BakeTacos/Tanpa Judul/gtnich/ARCHITECTURE.md).
