# DapurTwin 🍳🦊

> **Sistem Operasional Dapur, Manajemen Inventori Bahan Baku, dan Kalkulasi HPP (*Harga Pokok Penjualan*) Otomatis untuk Bisnis F&B dan UMKM Kuliner.**

DapurTwin adalah aplikasi web full-stack modern yang dirancang khusus untuk memecahkan persoalan klasik bisnis kuliner: ketidakpastian stok, resep yang tidak terstandarisasi, kebocoran bahan baku, serta kesulitan menghitung margin keuntungan dan HPP secara akurat. Dilengkapi dengan asisten maskot interaktif **Dapi** yang responsif terhadap data operasional dapur secara *real-time*.

---

## 📌 Fitur Unggulan

### 1. Kasir POS & Pengurangan Stok Otomatis Berbasis Resep
- **Multi-Channel Sales**: Mendukung penjualan *Toko Langsung / Dine-in*, *Pesanan WhatsApp*, *GoFood*, *GrabFood*, dan *ShopeeFood*.
- **Live Stock Deduction**: Saat pesanan diselesaikan, stok seluruh bahan baku yang tertera pada resep (*Bill of Materials*) otomatis terpotong dari gudang dan tercatat di riwayat mutasi stok.
- **Indikator Porsi Siap Masak**: Menghitung secara *real-time* berapa porsi maksimal yang bisa dimasak berdasarkan sisa stok bahan terendah di gudang.
- **Metode Pembayaran**: Mendukung pembayaran Tunai (dengan kalkulator uang kembalian) dan **QRIS Dinamis Otomatis** (terintegrasi API Midtrans dengan pengecekan status *settlement* real-time).
- **Cetak Struk Kasir**: Desain nota struk termal yang siap cetak atau dibagikan ke WhatsApp pelanggan.

### 2. Katalog Menu & Kalkulator HPP (*Bill of Materials*)
- **Penyusunan Resep Presisi**: Tautkan berbagai bahan baku ke dalam satu menu porsi saji.
- **Engine Konversi Satuan Cerdas (`lib/satuan.ts`)**: Otomatis mengonversi satuan takaran resep (`gram`, `sdm`, `sdt`, `ml`) ke satuan master bahan baku di gudang (`kg`, `liter`, `pcs`).
- **Live HPP & Margin Profit**: Kalkulasi otomatis modal bahan baku dan persentase laba kotor saat menentukan harga jual.
- **Pencarian Resep AI (`/api/ai-resep`)**: Fitur cerdas yang mengusulkan takaran bahan dan perkiraan komposisi resep masakan secara otomatis.

### 3. Pengadaan Bahan Baku (Purchase Order) & OCR Nota
- **Siklus PO Terintegrasi**: Alur pembuatan PO ke supplier terdaftar maupun pembelian pasar langsung (*Tanpa Supplier*), dengan status: *Draf* $\rightarrow$ *Kirim ke Supplier* $\rightarrow$ *Diterima*.
- **Verifikasi Penerimaan Barang**: Rekonsiliasi jumlah barang yang dipesan vs aktual yang diterima, input selisih harga pasar, serta opsi update otomatis harga master bahan di gudang.
- **Otomatisasi Stok & Tagihan**: Saat PO berstatus diterima, stok gudang otomatis bertambah dan faktur tagihan tempo otomatis tercatat di modul Keuangan.
- **AI OCR Scan Nota Fisik**: Pindai foto struk belanja pasar/supermarket menggunakan AI Vision untuk mengekstrak nama barang, kuantitas, dan harga secara instan menjadi data digital.

### 4. Manajemen Inventori, Kartu Stok & Kesegaran Bahan
- **Master Bahan Baku**: Pengaturan stok minimum (*safety stock*), peringatan dini bahan habis (*Habis*, *Rendah*, *Aman*), dan harga pokok.
- **Audit Log Mutasi & Stock Opname**: Riwayat jejak audit keluar-masuk barang (dari PO, Penjualan POS, atau penyesuaian manual/waste) serta fitur rekonsiliasi stok fisik gudang.
- **Monitoring Kedaluwarsa & Shelf-Life**: Estimasi masa simpan bahan segar sejak tanggal penerimaan dengan rekomendasi penyimpanan agar meminimalisir *food waste*.

### 5. Tagihan Supplier & Keuangan Operasional
- **Manajemen Hutang Tempo**: Pelacakan tanggal jatuh tempo faktur supplier, status *Belum Lunas*, *Lunas*, atau *Jatuh Tempo (Overdue)*.
- **Pencatatan Pembayaran**: Rekam metode pembayaran dan nomor referensi bukti pelunasan faktur.

### 6. Analitik, Laporan & Simulasi Bisnis
- **Laporan Penjualan & Profit**: Visualisasi omzet, total HPP terpakai, laba kotor (*Gross Profit*), dan rata-rata nilai transaksi (*AOV*) dengan filter periode fleksibel (7 hari, 30 hari, bulan ini, dsb).
- **Rekomendasi Cerdas**: Saran proaktif pengadaan stok sebelum jam sibuk dan deteksi menu yang kurang laku (*deadstock*).
- **Simulasi Proyeksi Bisnis**: Uji coba skenario target kenaikan porsi penjualan, perhitungan kebutuhan pasokan bahan batch katering, dan simulasi dampak kenaikan harga bahan distributor terhadap margin keuntungan.

### 7. Asisten Maskot Dapi & Pusat Notifikasi
- **Living Mascot Dapi**: Maskot interaktif berbasis SVG murni yang bereaksi terhadap kursor mouse dan data riil dapur (senang saat ada omzet, cemas saat stok kritis menipis).
- **Notification Center**: Peringatan stok kritis, tagihan supplier jatuh tempo, dan deteksi otomatis kenaikan harga beli bahan dengan tombol satu-klik *"Terapkan Harga Baru"*.
- **Email Transaksional Otomatis**: Integrasi API Resend untuk pengiriman rekap penjualan harian dan alert tagihan overdue ke email pemilik usaha.

---

## 🛠️ Stack Teknologi

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) | React Server Components & Serverless API Routes |
| **Library UI** | [React 19](https://react.dev/) | Arsitektur UI berbasis komponen modular reaktif |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Desain *warm claymorphism* khas DapurTwin |
| **Bahasa** | [TypeScript v5](https://www.typescriptlang.org/) | Menjamin keamanan tipe (*type safety*) di seluruh alur |
| **Database & Auth** | [Supabase](https://supabase.com/) | PostgreSQL 15+, Supabase Auth, Row Level Security (RLS) |
| **Visualisasi Data**| [Recharts](https://recharts.org/) | Diagram grafik tren omzet, arus kas, dan breakdown penjualan |
| **Ikonografi** | [Lucide React](https://lucide.dev/) | Paket ikon modern, bersih, dan konsisten |
| **Payment Gateway** | [Midtrans Core API](https://midtrans.com/) | Pembayaran QRIS Dinamis otomatis |
| **AI & OCR** | 9Router (Gemini Vision / OpenCode) & Tesseract.js | Pemindaian nota fisik & rekomendasi racikan resep AI |
| **Email Service** | [Resend](https://resend.com/) | Pengiriman email transaksional dan notifikasi otomatis |

---

## 📂 Struktur Direktori

DapurTwin menerapkan arsitektur **Feature-First Colocated**, di mana setiap domain fitur mengelompokkan komponen, hooks, services, dan types miliknya sendiri:

```text
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                           # Landing page & onboarding interaktif Dapi
│   │   └── login/                             # Halaman autentikasi masuk & daftar akun
│   ├── dashboard/
│   │   ├── page.tsx                           # Overview / Pusat kendali utama dapur
│   │   ├── (pos)/
│   │   │   ├── penjualan/                     # Kasir POS & pemotongan stok otomatis
│   │   │   └── menu/                          # Manajemen menu, resep (BOM), & HPP
│   │   ├── (purchasing)/
│   │   │   ├── purchase-order/                # Pembelian stok bahan & verifikasi masuk
│   │   │   ├── suppliers/                     # Direktori kontak distributor / supplier
│   │   │   └── ocr-nota/                      # AI scan struk belanja pasar fisik
│   │   ├── (inventory)/
│   │   │   ├── bahan/                         # Master bahan baku & safety stock
│   │   │   ├── stok-log/                      # Audit mutasi stok & stock opname fisik
│   │   │   └── kondisi-bahan/                 # Estimasi kesegaran & masa kedaluwarsa
│   │   ├── (finance)/
│   │   │   └── tagihan/                       # Faktur hutang dagang supplier
│   │   ├── (analytics)/
│   │   │   ├── laporan/                       # Laporan penjualan, omzet, & laba kotor
│   │   │   ├── riwayat/                       # Arsip transaksi kasir & pesanan PO
│   │   │   ├── rekomendasi/                   # Saran analitik cerdas operasional
│   │   │   └── simulasi/                      # Simulasi margin, supply batch, & harga
│   │   └── pengaturan/                        # Profil toko & preferensi notifikasi
│   └── api/                                   # Background notification webhooks & endpoints
├── components/                                # Komponen global (Topbar, Sidebar, Modal, Logo)
│   └── ui/                                    # Komponen DapiFace, DapiMiniIllustration, StatCard
├── hooks/                                     # Custom hooks global (useNotifications, useBahan)
├── lib/
│   ├── satuan.ts                              # Engine konversi unit takaran resep ke master
│   ├── supabase/                              # Klien Supabase (client, server, middleware)
│   └── resend.ts                              # Konfigurasi pengiriman email
└── services/                                  # Layanan integrasi data & API
```

---

## 🚀 Panduan Instalasi Lokal

### 1. Prasyarat
- **Node.js**: Versi 20.x atau lebih baru.
- **npm**, **pnpm**, atau **yarn**.
- Proyek aktif di **[Supabase](https://supabase.com/)**.

### 2. Kloning Repositori & Pasang Dependensi
```bash
git clone https://github.com/username/dapurtwin.git
cd dapurtwin
npm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```

Lengkapi kredensial berikut di dalam file `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: Midtrans QRIS Payment Gateway
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_IS_PRODUCTION=false

# Optional: Resend Email Notification
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=DapurTwin <onboarding@resend.dev>

# Optional: AI Vision / OCR Nota & Resep
NEXT_9ROUTER_URL=https://router.hitungmin.my.id/v1
NEXT_9ROUTER_KEY=your-api-key
NEXT_9ROUTER_MODEL=gemini/gemini-3.1-flash-lite
```

### 4. Setup Database Supabase
Jalankan berkas migrasi SQL yang berada di dalam folder `supabase/` pada **SQL Editor** dashboard Supabase Anda secara berurutan untuk menyiapkan tabel, indeks relasi, trigger pemotongan stok atomik, dan fungsi Row Level Security (RLS).

### 5. Jalankan Server Development
```bash
npm run dev
```
Buka browser di alamat [http://localhost:3000](http://localhost:3000) (atau port yang tertera pada terminal).

---

## 📜 Lisensi & Atribusi

Proyek ini dilisensikan di bawah **MIT License**. Seluruh pustaka pihak ketiga (`Next.js`, `React`, `Tailwind CSS`, `Supabase`, `Recharts`, `Lucide React`) menggunakan lisensi open-source standar industri (**MIT**, **ISC**, dan **Apache-2.0**).
