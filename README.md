# DapurTwin 🍳🦊

> **Sistem Operasional Dapur, Manajemen Inventori Bahan Baku, dan Kalkulasi HPP (*Harga Pokok Penjualan*) Otomatis untuk Bisnis F&B dan UMKM Kuliner.**

DapurTwin adalah platform operasional dapur dan kasir POS modern yang dirancang untuk mengatasi persoalan mendasar bisnis kuliner: ketidakpastian stok bahan baku, resep yang belum terstandarisasi, kebocoran bahan, kesulitan menghitung margin dan HPP per porsi, serta antrean pesanan yang terfragmentasi antara kasir dan meja makan.

Dilengkapi dengan maskot interaktif **Dapi** yang responsif terhadap data operasional dapur secara *real-time*, DapurTwin menjamin pencatatan transaksi, pemotongan stok otomatis, hingga pengiriman struk digital berjalan tanpa hambatan.

---

## 📌 Fitur Unggulan

### 1. Self-Order Meja Pelanggan via QR Code (`/order/[storeId]`)
- **Pemesanan Mandiri Tanpa Antre**: Pelanggan memindai QR code di meja untuk membuka katalog menu interaktif langsung dari peramban ponsel pintar tanpa perlu memasang aplikasi.
- **Katalog Menu Dinamis**: Menampilkan foto, nama menu, harga, badge kategori, dan status ketersediaan porsi secara *live*.
- **Pilihan Pembayaran Fleksibel**:
  - **QRIS Dinamis**: Pembayaran langsung di meja menggunakan e-Wallet / m-Banking dengan konfirmasi dan struk digital instan.
  - **Bayar di Kasir**: Pesanan langsung diteruskan ke antrean dapur; struk digital otomatis dikirimkan ke email pelanggan segera setelah kasir mengonfirmasi penerimaan pembayaran lunas.
- **Validasi Kuantitas & Batas Stok**: Mencegah pelanggan memesan menu melebihi sisa porsi bahan yang tersedia di dapur.

### 2. Generator & Manajemen QR Meja (`/dashboard/qr-meja`)
- **Kelola Meja Dinamis**: Tambah, ubah nomor meja, atur kapasitas kursi, dan tentukan lokasi meja (Area Utama, Indoor, Outdoor, Lantai 2).
- **Desain Kartu Meja Siap Cetak**: Pratinjau kartu akrilik meja elegan dengan nomor meja tegas, kode QR resolusi tinggi, instruksi ringkas 3 langkah scan, dan maskot Dapi.
- **Ekspor Dokumen**: Unduh kartu meja dalam format gambar PNG siap pajang dan cetak langsung ke kertas/printer kasir.

### 3. Kitchen Display System & Proses Pesanan (`/dashboard/proses-pesanan`)
- **Papan Kendali Antrean Dapur Terpadu**: Mengintegrasikan seluruh pesanan masuk dari meja mandiri (Self-Order), kasir toko langsung, pesanan WhatsApp, hingga layanan pesan antar (GoFood, GrabFood, ShopeeFood).
- **Indikator Kesiapan Bahan Resep Real-Time**: Sistem otomatis memeriksa ketersediaan stok bahan di gudang terhadap kebutuhan resep pesanan:
  - Label hijau: *Bahan Tersedia* (siap diproses).
  - Label merah: *Bahan Kurang* (disertai rincian kekurangan bahan spesifik).
- **Siklus Status Pesanan**: Alur pemrosesan jelas: *Menunggu Konfirmasi* $\rightarrow$ *Sedang Dimasak / Diproses* $\rightarrow$ *Pesanan Selesai Siap Saji*.
- **Konfirmasi Pelunasan & Kirim Struk Kasir**: Tombol *"Terima Kasir (Lunas)"* untuk pesanan meja dengan pengiriman otomatis struk resmi ke email pelanggan via Resend API.

### 4. Kasir POS & Pemotongan Stok Otomatis Berbasis Resep (`/dashboard/penjualan`)
- **Multi-Channel Sales**: Mendukung penjualan *Toko Langsung / Dine-in*, *Pesanan WhatsApp*, *GoFood*, *GrabFood*, dan *ShopeeFood*.
- **Live Stock Deduction**: Saat pesanan diselesaikan, stok seluruh bahan baku yang tertera pada resep (*Bill of Materials*) otomatis terpotong dari gudang dan tercatat di riwayat mutasi stok.
- **Kalkulator Pembayaran & Kembalian**: Penghitungan uang tunai, diskon, opsi pajak (inklusif/eksklusif), dan integrasi pembayaran QRIS Dinamis.
- **Cetak Struk Kasir & WhatsApp**: Nota kasir termal siap cetak atau dibagikan ke nomor kontak pelanggan.

### 5. Katalog Menu & Kalkulator HPP (*Bill of Materials*) (`/dashboard/menu`)
- **Penyusunan Resep Presisi**: Tautkan berbagai bahan baku ke dalam satu menu porsi saji.
- **Engine Konversi Satuan Cerdas (`lib/satuan.ts`)**: Otomatis mengonversi satuan takaran resep (`gram`, `sdm`, `sdt`, `ml`) ke satuan master bahan baku di gudang (`kg`, `liter`, `pcs`).
- **Live HPP & Margin Profit**: Kalkulasi otomatis modal bahan baku dan persentase laba kotor saat menentukan harga jual.
- **Pencarian Resep AI (`/api/ai-resep`)**: Fitur cerdas yang mengusulkan takaran bahan dan perkiraan komposisi resep masakan secara otomatis.

### 6. Pengadaan Bahan Baku (Purchase Order) & OCR Nota (`/dashboard/purchase-order`)
- **Siklus PO Terintegrasi**: Alur pembuatan PO ke supplier terdaftar maupun pembelian pasar langsung (*Tanpa Supplier*), dengan status: *Draf* $\rightarrow$ *Kirim ke Supplier* $\rightarrow$ *Diterima*.
- **Verifikasi Penerimaan Barang**: Rekonsiliasi jumlah barang yang dipesan vs aktual yang diterima, input selisih harga pasar, serta opsi update otomatis harga master bahan di gudang.
- **Otomatisasi Stok & Tagihan**: Saat PO berstatus diterima, stok gudang otomatis bertambah dan faktur tagihan tempo otomatis tercatat di modul Keuangan.
- **AI OCR Scan Nota Fisik (`/dashboard/ocr-nota`)**: Pindai foto struk belanja pasar/supermarket menggunakan AI Vision untuk mengekstrak nama barang, kuantitas, dan harga secara instan menjadi data digital.

### 7. Manajemen Inventori, Kartu Stok & Kesegaran Bahan (`/dashboard/bahan`)
- **Master Bahan Baku**: Pengaturan stok minimum (*safety stock*), peringatan dini bahan habis (*Habis*, *Rendah*, *Aman*), dan harga pokok.
- **Audit Log Mutasi & Stock Opname (`/dashboard/stok-log`)**: Riwayat jejak audit keluar-masuk barang (dari PO, Penjualan POS, atau penyesuaian manual/waste) serta fitur rekonsiliasi stok fisik gudang.
- **Monitoring Kedaluwarsa & Shelf-Life (`/dashboard/kondisi-bahan`)**: Estimasi masa simpan bahan segar sejak tanggal penerimaan dengan rekomendasi penyimpanan agar meminimalisir *food waste*.

### 8. Tagihan Supplier & Keuangan Operasional (`/dashboard/tagihan`)
- **Manajemen Hutang Tempo**: Pelacakan tanggal jatuh tempo faktur supplier, status *Belum Lunas*, *Lunas*, atau *Jatuh Tempo (Overdue)*.
- **Pencatatan Pembayaran**: Rekam metode pembayaran dan nomor referensi bukti pelunasan faktur.

### 9. Analitik, Laporan & Simulasi Bisnis (`/dashboard/laporan`)
- **Laporan Penjualan & Profit**: Visualisasi omzet, total HPP terpakai, laba kotor (*Gross Profit*), dan rata-rata nilai transaksi (*AOV*) dengan filter periode fleksibel (7 hari, 30 hari, bulan ini, dsb).
- **Rekomendasi Cerdas (`/dashboard/rekomendasi`)**: Saran proaktif pengadaan stok sebelum jam sibuk dan deteksi menu yang kurang laku (*deadstock*).
- **Simulasi Proyeksi Bisnis (`/dashboard/simulasi`)**: Uji coba skenario target kenaikan porsi penjualan, perhitungan kebutuhan pasokan bahan batch katering, dan simulasi dampak kenaikan harga bahan distributor terhadap margin keuntungan.

### 10. Asisten Maskot Dapi & Proteksi Antarmuka
- **Living Mascot Dapi**: Maskot interaktif berbasis SVG murni yang responsif terhadap data riil dapur (senang saat ada omzet, cemas saat stok kritis menipis).
- **Global Action Blocker (`BusyContext`)**: Mengunci tombol dan aksi antarmuka saat sistem sedang memproses transaksi atau mutasi data untuk mencegah *double submit* atau tabrakan data jaringan.
- **Konfirmasi Aksi Aman (`ConfirmModal`)**: Seluruh aksi penghapusan dan pengubahan status divalidasi melalui modal konfirmasi kustom ramah pengguna tanpa dialog bawaan browser yang mengganggu.
- **Email Transaksional Otomatis**: Integrasi API Resend untuk pengiriman struk digital pelanggan dan alert operasional ke email pemilik usaha.

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
| **Email Service** | [Resend](https://resend.com/) | Pengiriman email transaksi dan struk digital resmi |
| **AI & OCR** | 9Router (Gemini Vision) & Tesseract.js | Pemindaian nota fisik & rekomendasi racikan resep AI |

---

## 📂 Struktur Direktori

DapurTwin menerapkan arsitektur **Feature-First Colocated**, di mana setiap domain fitur mengelompokkan komponen, hooks, services, dan types miliknya sendiri:

```text
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                           # Landing page & onboarding interaktif Dapi
│   │   └── login/                             # Halaman autentikasi masuk & daftar akun
│   ├── order/
│   │   └── [storeId]/                         # Portal pemesanan mandiri meja pelanggan (QR Order)
│   ├── dashboard/
│   │   ├── page.tsx                           # Overview / Pusat kendali utama dapur
│   │   ├── (pos)/
│   │   │   ├── penjualan/                     # Kasir POS & pemotongan stok otomatis
│   │   │   ├── proses-pesanan/                # KDS / Antrean dapur & verifikasi bahan resep
│   │   │   ├── qr-meja/                       # Manajemen & pencetakan kartu QR meja
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
│   └── api/                                   # API route & webhook pembayaran/email
├── components/                                # Komponen global (Topbar, Sidebar, Modal, Logo)
│   └── ui/                                    # Komponen DapiMascot, ConfirmModal, Pagination, StatCard
├── context/                                   # ToastContext & BusyContext (global action hold)
├── hooks/                                     # Custom hooks global
├── lib/
│   ├── satuan.ts                              # Engine konversi unit takaran resep ke master
│   ├── supabase/                              # Klien Supabase (client, server, middleware)
│   └── resend.ts                              # Konfigurasi pengiriman email struk transaksi
└── services/                                  # Layanan integrasi data & API
```

---

## 🗄️ Skema Database & Relasi (Supabase PostgreSQL)

DapurTwin dirancang dengan arsitektur multi-tenant berbasis `user_id` yang terhubung ke `auth.users` dan tabel induk profil bisnis `public.profiles`. Seluruh tabel operasional menerapkan kontrol isolasi data menggunakan **Row Level Security (RLS)**.

### Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
  PROFILES ||--o{ SUPPLIERS : "mengelola"
  PROFILES ||--o{ SUPPLIER_CATEGORIES : "membuat"
  PROFILES ||--o{ BAHAN : "memiliki inventori"
  PROFILES ||--o{ MENUS : "memiliki katalog"
  PROFILES ||--o{ CUSTOMERS : "mencatat pelanggan"
  PROFILES ||--o{ ORDERS : "menerima transaksi"
  PROFILES ||--o{ PURCHASE_ORDERS : "melakukan pengadaan"
  PROFILES ||--o{ REKOMENDASI : "menerima insight"
  PROFILES ||--o{ OCR_RECEIPTS : "memindai nota"
  PROFILES ||--o{ STORE_TABLES : "mengatur meja QR"

  SUPPLIER_CATEGORIES ||--o{ SUPPLIERS : "mengelompokkan"
  SUPPLIERS ||--o{ BAHAN : "menyediakan bahan"
  SUPPLIERS ||--o{ PURCHASE_ORDERS : "menerima PO"
  SUPPLIERS ||--o{ SUPPLIER_RIWAYAT : "riwayat transaksi"

  MENUS ||--|{ RESEP_ITEMS : "memiliki rincian resep"
  BAHAN ||--o{ RESEP_ITEMS : "digunakan dalam resep"
  BAHAN ||--o{ PO_ITEMS : "dipesan dalam PO"
  BAHAN ||--o{ STOK_LOGS : "mencatat mutasi fisik"

  PURCHASE_ORDERS ||--|{ PO_ITEMS : "memiliki item pengadaan"
  CUSTOMERS ||--o{ ORDERS : "melakukan pemesanan"
  ORDERS ||--|{ ORDER_ITEMS : "memiliki rincian item"
  MENUS ||--o{ ORDER_ITEMS : "dijual dalam pesanan"
```

---

### Kamus Data & Relasi Entitas

#### 1. Core Akun & Master Supplier
| Entitas | Deskripsi & Tujuan | Foreign Key & Relasi Kunci |
| :--- | :--- | :--- |
| `profiles` | Master profil toko/dapur, pengaturan pajak resto, dan status setup bisnis. | `id` $\rightarrow$ `auth.users(id)` |
| `supplier_categories` | Kategori klasifikasi supplier (misal: *Pasar Basah*, *Packaging*, *Dry Goods*). | `user_id` $\rightarrow$ `profiles(id)` |
| `suppliers` | Direktori pemasok bahan baku lengkap dengan kontak dan minimal order. | `user_id` $\rightarrow$ `profiles(id)`<br>`category_id` $\rightarrow$ `supplier_categories(id)` |
| `supplier_riwayat` | Catatan riwayat pembayaran/transaksi historis kepada supplier. | `user_id` $\rightarrow$ `profiles(id)`<br>`supplier_id` $\rightarrow$ `suppliers(id)` |

#### 2. Inventori Bahan Baku & Resep Menu (Bill of Materials)
| Entitas | Deskripsi & Tujuan | Foreign Key & Relasi Kunci |
| :--- | :--- | :--- |
| `bahan` | Master bahan baku gudang, harga beli pokok per satuan, stok aktual, & safety stock. | `user_id` $\rightarrow$ `profiles(id)`<br>`supplier_id` $\rightarrow$ `suppliers(id)` (Opsional) |
| `menus` | Katalog menu makanan/minuman, harga jual, estimasi HPP, dan status aktif. | `user_id` $\rightarrow$ `profiles(id)` |
| `resep_items` | Rincian bahan baku per menu porsi (BOM) untuk pemotongan stok otomatis. | `user_id` $\rightarrow$ `profiles(id)`<br>`menu_id` $\rightarrow$ `menus(id)`<br>`bahan_id` $\rightarrow$ `bahan(id)` |
| `stok_logs` | Jejak audit mutasi kartu stok keluar-masuk (sumber: penjualan, PO, koreksi/waste). | `user_id` $\rightarrow$ `profiles(id)`<br>`bahan_id` $\rightarrow$ `bahan(id)` |

#### 3. Penjualan POS, Antrean Dapur & Self-Order Meja
| Entitas | Deskripsi & Tujuan | Foreign Key & Relasi Kunci |
| :--- | :--- | :--- |
| `store_tables` | Master nomor meja, kapasitas kursi, zona meja, dan penghitung scan QR. | `user_id` $\rightarrow$ `auth.users(id)` |
| `customers` | Buku data kontak pelanggan setia toko (nama, telepon, email, alamat). | `user_id` $\rightarrow$ `profiles(id)` |
| `orders` | Induk transaksi penjualan (nota invoice, status pesanan, pembayaran tunai/QRIS, nomor meja). | `user_id` $\rightarrow$ `profiles(id)`<br>`customer_id` $\rightarrow$ `customers(id)` (Opsional) |
| `order_items` | Baris rincian menu yang dipesan, kuantitas porsi, harga jual, dan snapshot HPP. | `user_id` $\rightarrow$ `profiles(id)`<br>`order_id` $\rightarrow$ `orders(id)`<br>`menu_id` $\rightarrow$ `menus(id)` |

#### 4. Pengadaan (Purchasing), AI Vision & Sistem
| Entitas | Deskripsi & Tujuan | Foreign Key & Relasi Kunci |
| :--- | :--- | :--- |
| `purchase_orders` | Dokumen pesanan pengadaan bahan ke supplier (Draft, Terkirim, Diterima). | `user_id` $\rightarrow$ `profiles(id)`<br>`supplier_id` $\rightarrow$ `suppliers(id)` |
| `po_items` | Baris bahan yang dipesan dalam PO (harga estimasi vs aktual diterima di gudang). | `user_id` $\rightarrow$ `profiles(id)`<br>`po_id` $\rightarrow$ `purchase_orders(id)`<br>`bahan_id` $\rightarrow$ `bahan(id)` |
| `ocr_receipts` | Arsip pemindaian AI Vision terhadap foto struk fisik pasar/supermarket. | `user_id` $\rightarrow$ `profiles(id)` |
| `rekomendasi` | Hasil kalkulasi analitik AI untuk saran pengadaan bahan dan evaluasi menu lambat. | `user_id` $\rightarrow$ `profiles(id)` |
| `notifications` | Notifikasi sistem, peringatan stok kritis, dan tagihan jatuh tempo ke user. | `user_id` $\rightarrow$ `auth.users(id)` |

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

Lengkapi variabel konfigurasi di dalam file `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Resend Email Transactional Service
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=DapurTwin <dapurtwin@your-verified-domain.com>

# Midtrans QRIS Payment Gateway (Opsional)
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_IS_PRODUCTION=false

# AI Vision / OCR Nota & Resep (Opsional)
NEXT_9ROUTER_URL=https://router.hitungmin.my.id/v1
NEXT_9ROUTER_KEY=your-api-key
NEXT_9ROUTER_MODEL=gemini/gemini-3.1-flash-lite
```

### 4. Setup Database Supabase
Jalankan berkas migrasi SQL yang berada di dalam folder `supabase/` pada **SQL Editor** dashboard Supabase Anda secara berurutan untuk menyiapkan tabel, indeks relasi, trigger pemotongan stok atomik, dan fungsi Row Level Security (RLS).

### 5. Jalankan Pengujian Otomatis
```bash
npm test
```

### 6. Jalankan Server Development
```bash
npm run dev
```
Buka browser di alamat [http://localhost:3000](http://localhost:3000).

---

## 📜 Lisensi & Atribusi

Proyek ini dilisensikan di bawah **MIT License**. Seluruh pustaka pihak ketiga (`Next.js`, `React`, `Tailwind CSS`, `Supabase`, `Recharts`, `Lucide React`) menggunakan lisensi open-source standar industri (**MIT**, **ISC**, dan **Apache-2.0**).
