'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useSidebar } from './SidebarContext'

export interface TourStepInfo {
  targetSelector: string
  sectionId?: string
  isSidebarItem?: boolean
  title: string
  subtitle: string
  description: string
  tip: string
  mood: 'senang' | 'khawatir'
}

/** PANDUAN KONTEN DINAMIS LENGKAP & JELAS KHUSUS PER HALAMAN (PAGE-SPECIFIC GUIDE TANPA EMOJI) */
export const PAGE_GUIDES: Record<string, TourStepInfo[]> = {
  '/dashboard': [
    {
      targetSelector: '[data-tour="overview-tasks"]',
      title: 'Tugas Operasional Dapi',
      subtitle: 'Pengingat otomatis aktivitas dapur hari ini',
      description: 'Dapi mengumpulkan semua tugas mendesak: stok bahan kritis yang harus segera dibeli, pesanan dapur yang perlu diproses, dan faktur supplier yang jatuh tempo.',
      tip: 'Selesaikan tugas dari prioritas teratas agar alur dapur tetap lancar.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="overview-omzet"]',
      title: 'Omzet & Proyeksi Penjualan',
      subtitle: 'Pantauan pendapatan dan perkiraan omzet',
      description: 'Grafik mini menunjukkan pergerakan transaksi per jam hari ini, serta estimasi proyeksi omzet berdasarkan tren penjualan hari-hari sebelumnya.',
      tip: 'Cek grafik di jam makan siang dan makan malam untuk melihat jam paling ramai.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="overview-active-orders"]',
      title: 'Pesanan Dapur Sedang Berjalan',
      subtitle: 'Antrean masak yang aktif saat ini',
      description: 'Melihat status pesanan masuk dari kasir yang sedang ditangani dapur. Klik kartu pesanan untuk melihat detail struk belanjaan pelanggan.',
      tip: 'Pesanan yang selesai di bagian dapur otomatis memperbarui tampilan ini.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="overview-summary-cards"]',
      title: 'Ringkasan Cepat & Menu Terlaris',
      subtitle: 'Stok menipis, pendapatan mingguan, dan produk favorit',
      description: 'Empat kartu ringkasan untuk memantau bahan menipis, pendapatan 7 hari terakhir, daftar pesanan terbaru, dan hidangan paling laris dibeli.',
      tip: 'Pastikan persediaan bahan untuk menu terlaris selalu aman.',
      mood: 'senang',
    },
  ],
  '/dashboard/penjualan': [
    {
      targetSelector: 'input[placeholder*="Cari menu"]',
      title: 'Pencarian Menu & Sortir',
      subtitle: 'Temukan hidangan pesanan dengan cepat',
      description: 'Ketik nama menu masakan, minuman, camilan, atau SKU untuk menyaring menu saat melayani pembeli di meja kasir.',
      tip: 'Gunakan dropdown sortir untuk menampilkan menu paling laris atau harga termurah.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="pos-menu-grid"]',
      title: 'Katalog Menu Kasir',
      subtitle: 'Daftar menu dengan pantauan stok langsung',
      description: 'Klik tombol tambah porsi pada menu yang dipesan. Informasi harga jual, modal bahan, dan sisa porsi yang tersedia langsung terpampang jelas.',
      tip: 'Menu yang bahan dasarnya habis otomatis terkunci dan tidak bisa ditambahkan ke keranjang.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="pos-cart-panel"]',
      title: 'Keranjang & Pembayaran Kasir',
      subtitle: 'Hitung tagihan, diskon, dan metode bayar',
      description: 'Atur jumlah porsi, pilih jenis pesanan (Makan di Tempat atau Bungkus), lalu selesaikan transaksi dengan Tunai (hitung kembalian otomatis) atau QRIS.',
      tip: 'Setelah transaksi dibayar, pesanan langsung terkirim ke monitor antrean dapur dan stok bahan otomatis terpotong!',
      mood: 'senang',
    },
  ],
  '/dashboard/proses-pesanan': [
    {
      targetSelector: '[data-tour="proses-status-cards"]',
      title: 'Ringkasan Antrean Masak',
      subtitle: 'Pantau beban kerja tim dapur',
      description: 'Kartu ringkasan jumlah pesanan yang berada di tahap: Menunggu giliran masak, Sedang Diproses dapur, dan Siap Disajikan ke pelanggan.',
      tip: 'Klik salah satu kartu untuk menyaring daftar pesanan sesuai statusnya.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="proses-filter-bar"]',
      title: 'Pencarian & Filter Cepat',
      subtitle: 'Cari nota tertentu di antrean',
      description: 'Ketik nomor nota kasir atau nama pelanggan untuk menemukan tiket pesanan tertentu dengan cepat di tengah jam ramai.',
      tip: 'Filter status mempermudah juru masak fokus pada pesanan yang belum tersentuh.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="proses-order-grid"]',
      title: 'Kartu Tiket Pesanan Dapur',
      subtitle: 'Detail menu pesanan & tombol status proses',
      description: 'Setiap kartu menampilkan rincian menu pesanan, catatan khusus (seperti tingkat kepedasan), dan tombol untuk memperbarui status pesanan.',
      tip: 'Tekan tombol Selesai Masak agar staf kasir atau pelayan tahu makanan siap disajikan.',
      mood: 'senang',
    },
  ],
  '/dashboard/qr-meja': [
    {
      targetSelector: '[data-tour="qr-add-btn"]',
      title: 'Tambah Meja Baru',
      subtitle: 'Daftarkan nomor meja makan dan zonanya',
      description: 'Klik tombol ini untuk memasukkan nomor meja (misal: Meja 5), kapasitas kursi, serta area penempatan seperti Area Utama, Outdoor, atau Lantai 2.',
      tip: 'Setiap meja yang didaftarkan akan otomatis memiliki link katalog online dan kode QR unik tersendiri.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="qr-status-cards"]',
      title: 'Ringkasan Kapasitas & Pesanan QR',
      subtitle: 'Pantau total meja dan pemakaian scan',
      description: 'Tiga kartu ringkasan untuk melihat total meja terpasang, daya tampung kursi pelanggan secara keseluruhan, dan akumulasi jumlah transaksi yang masuk lewat scan QR.',
      tip: 'Angka pesanan QR mencerminkan seberapa sering pelanggan memanfaatkan pemesanan mandiri dari meja.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="qr-filter-bar"]',
      title: 'Pencarian Meja & Filter Area',
      subtitle: 'Saring kartu meja berdasarkan lokasi',
      description: 'Gunakan kolom pencarian untuk menemukan meja tertentu, atau klik filter zona (Indoor, Outdoor, Lantai 2) untuk mengelompokkan tampilan kartu meja.',
      tip: 'Memudahkan Anda saat ingin mencetak ulang kartu QR per kelompok ruangan.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="qr-table-grid"]',
      title: 'Kartu Meja & Aksi Cetak QR',
      subtitle: 'Pratinjau stand akrilik, unduh PNG, dan cetak',
      description: 'Setiap kartu meja menampilkan kode QR resolusi tinggi, jumlah kursi, tombol Salin Link pemesanan, Buka Katalog, Unduh Desain Stand (PNG), dan tombol Cetak langsung.',
      tip: 'Gunakan tombol Unduh PNG untuk mencetak stand akrilik meja dengan kualitas gambar tajam dan instruksi scan 3 langkah yang ramah pelanggan.',
      mood: 'senang',
    },
  ],
  '/dashboard/purchase-order': [
    {
      targetSelector: '[data-tour="po-create-btn"]',
      title: 'Buat Pesanan Belanja Baru',
      subtitle: 'Susun rencana pengadaan bahan baku',
      description: 'Buka formulir pembuatan PO untuk memilih supplier langganan, menentukan daftar bahan yang akan dibeli, jumlah kebutuhan, dan harga kesepakatan.',
      tip: 'Kamu juga bisa memanfaatkan tombol Rekomendasi Restock AI untuk menyusun daftar belanja otomatis.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="po-status-cards"]',
      title: 'Status Pengadaan Stok',
      subtitle: 'Alur siklus pembelian bahan ke supplier',
      description: 'Memantau perkembangan belanja mulai dari: Draft rencana, Pesanan Dikirim ke toko/pasar, Barang Diterima di gudang, hingga Tagihan pembayaran.',
      tip: 'Pemisahan status ini mencegah pesanan ganda atau belanja bahan yang terlupakan.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="po-table"]',
      title: 'Daftar Pembelian & Penerimaan Barang',
      subtitle: 'Riwayat dokumen PO dan tombol konfirmasi terima',
      description: 'Menampilkan nomor PO, nama supplier, total nilai belanja, dan status kedatangan barang. Saat barang tiba, konfirmasi penerimaan di sini.',
      tip: 'Begitu penerimaan diverifikasi, jumlah stok di inventaris dapur langsung bertambah otomatis.',
      mood: 'senang',
    },
  ],
  '/dashboard/tagihan': [
    {
      targetSelector: '[data-tour="tagihan-status-cards"]',
      title: 'Ringkasan Kewajiban Pembayaran',
      subtitle: 'Total nominal dan jumlah faktur supplier',
      description: 'Melihat total nilai tagihan bahan baku yang Belum Lunas dan Sudah Lunas beserta pengingat tanggal jatuh tempo faktur distributor.',
      tip: 'Prioritaskan pelunasan pada tagihan yang mendekati tanggal jatuh tempo untuk menjaga kepercayaan supplier.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="tagihan-table"]',
      title: 'Buku Catatan Tagihan Supplier',
      subtitle: 'Kelola pembayaran dan arsip bukti lunas',
      description: 'Daftar seluruh faktur pembelian bahan lengkap dengan no. PO, nama rekanan, nominal tagihan, sisa pembayaran, dan tombol bayar.',
      tip: 'Klik tombol bayar untuk mencatat pembayaran bertahap (cicil) atau pelunasan penuh.',
      mood: 'senang',
    },
  ],
  '/dashboard/bahan': [
    {
      targetSelector: '[data-tour="bahan-status-cards"]',
      title: 'Kondisi Persediaan Bahan',
      subtitle: 'Stok aman, mendekati habis, dan kosong',
      description: 'Pantau ketersediaan bumbu dan bahan baku secara menyeluruh. Ketahui berapa bahan yang persediaannya cukup, menipis, atau kritis habis.',
      tip: 'Gunakan kartu Perlu Restock untuk melihat bahan apa saja yang harus dibeli hari ini.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="add-ingredient-btn"]',
      title: 'Tambah Master Bahan Baru',
      subtitle: 'Daftarkan bahan baku ke sistem dapur',
      description: 'Klik untuk menambahkan nama bahan, satuan takaran (kg, gram, butir, liter), harga beli standar per satuan, dan batas minimum stok aman.',
      tip: 'Isi batas stok minimum dengan tepat agar sistem bisa memberi peringatan saat bahan menipis.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="bahan-filter-bar"]',
      title: 'Pencarian & Filter Kondisi',
      subtitle: 'Cari bahan berdasarkan nama atau status',
      description: 'Ketik nama bahan untuk melihat jumlah persediaan terkini, atau pilih tab filter stok untuk memilah bahan berdasarkan statusnya.',
      tip: 'Fitur Cari Harga Pasaran juga dapat digunakan untuk membandingkan harga bahan baku terkini.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="bahan-card-grid"]',
      title: 'Katalog Kartu Bahan Baku',
      subtitle: 'Sisa stok fisik, harga beli, dan aksi ubah',
      description: 'Setiap kartu menampilkan stok saat ini, satuan takaran, supplier default, dan estimasi nilai aset bahan yang tersimpan di dapur.',
      tip: 'Klik tombol Edit untuk memperbarui harga modal jika terjadi kenaikan harga dari pasar.',
      mood: 'senang',
    },
  ],
  '/dashboard/menu': [
    {
      targetSelector: '[data-tour="menu-status-cards"]',
      title: 'Status Menu & Resep',
      subtitle: 'Kesehatan margin laba dan racikan',
      description: 'Pantau menu dengan persentase laba sehat, menu yang sudah terhubung dengan resep takaran bahan, dan hidangan yang belum memiliki resep.',
      tip: 'Lengkapi resep untuk semua menu agar modal porsi (HPP) dan pemotongan stok berjalan otomatis.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="menu-add-btn"]',
      title: 'Tambah Menu Hidangan Baru',
      subtitle: 'Daftarkan menu jualan dan racikan resep',
      description: 'Daftarkan hidangan baru beserta foto, kategori, harga jual ke pembeli, dan komposisi takaran bahan baku yang dibutuhkan.',
      tip: 'Gunakan asisten takaran bahan untuk menghitung modal bersih per porsi secara akurat.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="menu-grid"]',
      title: 'Daftar Katalog Menu & Resep',
      subtitle: 'Katalog hidangan lengkap dengan kalkulasi HPP',
      description: 'Lihat seluruh hidangan yang dijual, harga jual, estimasi modal per porsi, margin laba bersih, serta status ketersediaan bahan dasarnya.',
      tip: 'Klik kartu menu untuk mengubah harga jual atau menyunting takaran resep jika ada perubahan porsi.',
      mood: 'senang',
    },
  ],
  '/dashboard/suppliers': [
    {
      targetSelector: '[data-tour="supplier-status-cards"]',
      title: 'Daftar Supplier Langganan',
      subtitle: 'Mitra toko pasar dan distributor terdaftar',
      description: 'Melihat total rekanan dagang, jumlah supplier yang rutin memasok pesanan, dan ragam kategori bahan yang disediakan para mitra.',
      tip: 'Mencatat beberapa alternatif supplier untuk bahan yang sama dapat mencegah risiko kehabisan barang.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="supplier-add-btn"]',
      title: 'Tambah Supplier Baru',
      subtitle: 'Daftarkan kontak mitra belanja',
      description: 'Catat nama toko atau distributor, nama kontak penanggung jawab, nomor telepon atau WhatsApp, alamat, serta ketentuan minimal pemesanan.',
      tip: 'Simpan nomor WhatsApp untuk mempercepat konfirmasi pesanan belanjaan dapur.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="supplier-filter-bar"]',
      title: 'Pencarian & Filter Kategori Supplier',
      subtitle: 'Temukan mitra berdasarkan komoditas',
      description: 'Saring supplier berdasarkan spesialisasi bahan: pedagang sayur & bumbu, distributor daging & ayam, agen sembako, atau kemasan.',
      tip: 'Pencarian nama toko memudahkan pencarian saat ingin memesan ulang bahan tertentu.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="supplier-table"]',
      title: 'Tabel Rekanan & Riwayat Pasokan',
      subtitle: 'Kelola data kontak dan riwayat pemesanan',
      description: 'Tabel lengkap informasi supplier, nomor kontak, kategori bahan pasokan, serta tombol edit atau hapus data mitra.',
      tip: 'Klik kontak supplier untuk langsung terhubung via telepon atau pesan singkat.',
      mood: 'senang',
    },
  ],
  '/dashboard/kondisi-bahan': [
    {
      targetSelector: '[data-tour="kondisi-status-cards"]',
      title: 'Pemantauan Kesegaran & Masa Simpan',
      subtitle: 'Cegah bahan basi dan terbuang sia-sia',
      description: 'Memantau umur simpan persediaan bahan: bahan dalam kondisi segar, bahan mendekati batas kadaluarsa (< 3 hari), dan stok yang sudah expired.',
      tip: 'Prioritaskan memasak menu yang menggunakan bahan yang mendekati batas kadaluarsa.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="kondisi-filter-bar"]',
      title: 'Pencarian & Filter Tingkat Kesegaran',
      subtitle: 'Saring bahan yang butuh tindakan segera',
      description: 'Pilih filter untuk melihat daftar bumbu atau bahan basah yang harus segera diolah sebelum mengalami penurunan kualitas.',
      tip: 'Lakukan pemeriksaan kesegaran bahan setiap pagi sebelum dapur beroperasi.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="kondisi-card-grid"]',
      title: 'Kartu Monitoring Bahan & Anjuran Simpan',
      subtitle: 'Sisa hari masa simpan dan tips penyimpanan',
      description: 'Menampilkan detail sisa hari kesegaran, tanggal pencatatan barang masuk, anjuran suhu penyimpanan (chiller, freezer, suhu ruang), dan tombol penyesuaian stok.',
      tip: 'Jika ada bahan rusak atau susut, gunakan tombol kurangi stok untuk mencatat limbah (waste).',
      mood: 'senang',
    },
  ],
  '/dashboard/stok-log': [
    {
      targetSelector: '[data-tour="stok-log-status-cards"]',
      title: 'Ringkasan Pergerakan Barang',
      subtitle: 'Jejak mutasi masuk, mutasi keluar, dan audit',
      description: 'Pantau akumulasi seluruh barang yang masuk (dari pembelian PO) dan bahan yang keluar (karena transaksi menu kasir atau penyesuaian dapur).',
      tip: 'Mengetahui total pergerakan bahan membantu menganalisis perputaran inventaris usaha.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="stok-log-tab-bar"]',
      title: 'Buku Mutasi & Stock Opname Fisik',
      subtitle: 'Beralih antara buku harian dan audit fisik',
      description: 'Pilih tab Buku Mutasi untuk melihat catatan riwayat keluar-masuk per transaksi, atau pilih Stock Opname Fisik untuk mencocokkan jumlah stok sistem dengan barang di rak.',
      tip: 'Tombol Catat Mutasi Manual berguna saat ada bahan yang tumpah, rusak, atau bonus dari supplier.',
      mood: 'senang',
    },
  ],
  '/dashboard/laporan': [
    {
      targetSelector: '[data-tour="laporan-summary"]',
      title: 'Ringkasan Kinerja Keuangan Usaha',
      subtitle: 'Omzet kotor, modal bahan baku, dan laba bersih',
      description: 'Rekapitulasi otomatis penjualan kasir dan pengeluaran belanja bahan. Laba bersih langsung terhitung tanpa perlu pembukuan manual.',
      tip: 'Perhatikan persentase margin keuntungan untuk memastikan harga jual menu masih menguntungkan.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="laporan-controls"]',
      title: 'Rentang Periode & Cetak Laporan',
      subtitle: 'Pilih rentang tanggal dan unduh dokumen',
      description: 'Pilih laporan untuk hari ini, 7 hari terakhir, bulan ini, atau custom tanggal. Tersedia juga tombol Cetak / PDF untuk laporan pembukuan.',
      tip: 'Gunakan fitur cetak PDF saat ingin merekap laporan bulanan untuk arsip usaha.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="laporan-metrics-cards"]',
      title: 'Metrik Operasional & Transaksi',
      subtitle: 'Jumlah pesanan, rata-rata belanja, dan pengeluaran',
      description: 'Menampilkan rata-rata nilai transaksi per pelanggan, jumlah nota terjual, total biaya bahan baku (HPP), dan laba kotor yang dihasilkan.',
      tip: 'Nilai rata-rata transaksi berguna untuk merancang paket promo menu yang lebih menarik.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="laporan-trend-chart"]',
      title: 'Grafik Tren Pendapatan & Profit',
      subtitle: 'Visualisasi grafik omzet dari waktu ke waktu',
      description: 'Grafik interaktif membandingkan kenaikan omzet dan profit harian, membantu melihat hari-hari paling ramai dalam periode berjalan.',
      tip: 'Arahkan kursor ke titik grafik untuk melihat rincian angka pendapatan di hari tertentu.',
      mood: 'senang',
    },
  ],
  '/dashboard/riwayat': [
    {
      targetSelector: '[data-tour="riwayat-filter-bar"]',
      title: 'Pencarian & Pemilihan Arsip',
      subtitle: 'Beralih antara riwayat kasir dan riwayat belanja PO',
      description: 'Pilih tab Penjualan Menu untuk mencari struk pesanan pembeli, atau tab Pembelian Stok untuk memeriksa arsip dokumen PO supplier.',
      tip: 'Gunakan kotak pencarian untuk mencari no. faktur, nama pembeli, atau nama supplier.',
      mood: 'senang',
    },
  ],
  '/dashboard/simulasi': [
    {
      targetSelector: '[data-tour="simulasi-tab-cards"]',
      title: 'Simulator Bisnis & Uji Keuntungan',
      subtitle: 'Tiga model simulasi skenario dapur',
      description: 'Pilih tab simulasi: Simulasi Penjualan (proyeksi omzet target porsi), Fluktuasi Harga Supplier (dampak jika bahan naik), atau Kesiapan Stok (cek batas porsi masak).',
      tip: 'Uji coba simulasi aman dilakukan karena tidak akan mengubah catatan transaksi riil dapur Anda.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="simulasi-workspace"]',
      title: 'Panel Kalkulator Simulasi Interaktif',
      subtitle: 'Ubah porsi atau persentase kenaikan harga',
      description: 'Geser slider atau masukkan angka simulasi untuk melihat perubahan langsung pada modal per porsi, laba kotor, dan proyeksi pendapatan.',
      tip: 'Sangat bermanfaat saat ingin menentukan harga jual menu baru sebelum resmi dirilis.',
      mood: 'senang',
    },
  ],
  '/dashboard/rekomendasi': [
    {
      targetSelector: '[data-tour="rekomendasi-status-cards"]',
      title: 'Kategori Saran & Analisis Dapi',
      subtitle: 'Saran stok bahan, keuangan, dan pola penjualan',
      description: 'Dapi mengamati data dapur Anda dan merangkum anjuran berdasarkan kategori: kapan harus belanja bahan, pelunasan tagihan tempo, dan menu terlaris.',
      tip: 'Klik kartu kategori untuk memfilter saran sesuai kebutuhan mendesak.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="rekomendasi-filter-bar"]',
      title: 'Filter Saran & Perbarui Analisis',
      subtitle: 'Perbarui rekomendasi dengan data terkini',
      description: 'Tekan tombol Perbarui Analisis setelah melakukan transaksi baru agar Dapi menghitung ulang rekomendasi belanja dan operasional.',
      tip: 'Cek saran rekomendasi secara berkala untuk menjaga efisiensi modal belanja.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="rekomendasi-grid"]',
      title: 'Kartu Saran Praktis & Tindakan',
      subtitle: 'Anjuran tindakan nyata beserta tombol pintas',
      description: 'Setiap kartu menyajikan penjelasan kendala di dapur beserta solusi cepat. Klik tombol aksi pada kartu untuk langsung mengeksekusi solusinya.',
      tip: 'Misalnya, saran stok menipis dilengkapi tombol pintas untuk langsung membuat PO belanja.',
      mood: 'senang',
    },
  ],
  '/dashboard/ocr-nota': [
    {
      targetSelector: '[data-tour="ocr-hero-info"]',
      title: 'Pindai Struk Belanja Otomatis',
      subtitle: 'Ekstraksi nama bahan dan nominal belanja',
      description: 'Fitur pintar untuk membaca foto struk belanjaan pasar, nota minimarket, atau faktur supplier tanpa perlu mengetik ulang satu per satu.',
      tip: 'Sistem dapat mengenali nama bahan, takaran satuan, dan total harga belanja.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="ocr-dropzone"]',
      title: 'Area Unggah & Foto Nota',
      subtitle: 'Tarik file nota atau ambil foto langsung',
      description: 'Klik atau tarik foto nota belanjaan (format JPG, PNG, atau PDF). Pastikan foto tegak lurus dan tulisan struk terbaca jelas.',
      tip: 'Setelah dipindai, kamu bisa memeriksa dan menyesuaikan data barang sebelum disimpan ke stok atau pengeluaran.',
      mood: 'senang',
    },
  ],
  '/dashboard/pengaturan': [
    {
      targetSelector: '[data-tour="pengaturan-tabs"]',
      title: 'Navigasi Kategori Pengaturan',
      subtitle: 'Profil toko, preferensi dapur, dan keamanan',
      description: 'Pilih tab untuk mengelola profil usaha kuliner Anda, preferensi notifikasi pengingat operasional, format struk, serta keamanan kata sandi akun.',
      tip: 'Data profil toko akan otomatis dicantumkan pada bagian atas struk kasir.',
      mood: 'senang',
    },
    {
      targetSelector: '[data-tour="pengaturan-content"]',
      title: 'Formulir Pengaturan & Simpan',
      subtitle: 'Sesuaikan detail operasional usaha',
      description: 'Ubah nama usaha, alamat dapur, nomor kontak WhatsApp, catatan footer struk kasir, serta preferensi pengiriman notifikasi.',
      tip: 'Pastikan klik tombol Simpan Perubahan setelah melakukan pembaharuan data toko.',
      mood: 'senang',
    },
  ],
}

/** PANDUAN RINGKAS MODULAR KESELURUHAN APLIKASI (6 LANGKAH FOKUS TANPA EMOJI) */
export const GLOBAL_TOUR_STEPS: TourStepInfo[] = [
  {
    targetSelector: '[data-tour="tour-overview"]',
    isSidebarItem: true,
    title: 'Ringkasan Utama',
    subtitle: 'Pusat pantau operasional harian dapur',
    description:
      'Ini beranda DapurTwin! Pantau ringkasan omzet hari ini, transaksi kasir terkini, antrean masak aktif, dan pengingat stok bahan yang menipis secara real-time.',
    tip: 'Sangat baik dicek setiap pagi sebelum mulai membuka pesanan dapur.',
    mood: 'senang',
  },
  {
    targetSelector: '[data-tour="tour-modul-operasional"]',
    sectionId: 'operasional',
    isSidebarItem: true,
    title: 'Modul Operasional',
    subtitle: 'Kasir, antrean dapur, belanja PO & tagihan',
    description:
      'Pusat kegiatan harian: layani transaksi kasir (POS), pantau antrean pesanan yang harus dimasak di dapur, buat daftar belanja bahan ke pasar (PO), dan kelola tagihan supplier tempo.',
    tip: 'Saat kasir memproses bayar, stok bahan otomatis terpotong sesuai takaran resep.',
    mood: 'senang',
  },
  {
    targetSelector: '[data-tour="tour-modul-inventaris"]',
    sectionId: 'inventaris',
    isSidebarItem: true,
    title: 'Modul Bahan & Menu',
    subtitle: 'Stok bahan baku, resep hidangan & supplier',
    description:
      'Kelola persediaan bumbu dan bahan baku, atur resep takaran tiap menu, catat data toko/supplier langganan, pantau kesegaran bahan kadaluarsa, serta rekam mutasi keluar-masuk stok fisik.',
    tip: 'Menu yang resepnya lengkap akan otomatis menampilkan modal bersih (HPP) dan persentase laba porsi.',
    mood: 'senang',
  },
  {
    targetSelector: '[data-tour="tour-modul-analitik"]',
    sectionId: 'analitik',
    isSidebarItem: true,
    title: 'Modul Laporan & Analitik',
    subtitle: 'Keuntungan bersih, arsip nota & saran cerdas',
    description:
      'Lihat laporan keuangan lengkap (omzet, biaya modal bahan, dan laba bersih), cari arsip nota di riwayat, hitung simulasi kenaikan harga bahan, dan dapatkan anjuran cerdas dari Dapi.',
    tip: 'Semua grafik dan rekap laba dihitung otomatis tanpa perlu rumus rumit.',
    mood: 'senang',
  },
  {
    targetSelector: '[data-tour="tour-modul-tools"]',
    sectionId: 'tools',
    isSidebarItem: true,
    title: 'Modul Alat Bantu (Tools)',
    subtitle: 'Pindai nota belanja kertas otomatis',
    description:
      'Foto struk atau nota belanjaan dari pasar atau supermarket. Sistem pintar akan membaca nama bahan dan nominal belanja secara otomatis tanpa repot mengetik satu per satu.',
    tip: 'Hasil scan nota bisa langsung disimpan jadi stok masuk dan catatan pengeluaran.',
    mood: 'senang',
  },
  {
    targetSelector: '[data-tour="tour-pengaturan"]',
    isSidebarItem: true,
    title: 'Pengaturan & Toko',
    subtitle: 'Nama usaha, struk kasir & akun',
    description:
      'Sesuaikan profil toko kuliner Anda, alamat dan nomor telepon usaha, pesan footer pada struk kasir, serta keamanan akun kapan saja.',
    tip: 'Bantuan panduan fitur ini juga dapat dibuka kapan saja melalui tombol bantuan di pojok atas.',
    mood: 'senang',
  },
]

interface TourContextValue {
  isTourOpen: boolean
  currentStepIndex: number
  currentStep: TourStepInfo | null
  activeSteps: TourStepInfo[]
  totalSteps: number
  openTour: (pageSpecific?: boolean) => void
  closeTour: () => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (index: number) => void
  activeSectionNeeded: string | null
  isPageSpecificTour: boolean
}

const TourContext = createContext<TourContextValue | undefined>(undefined)

const TOUR_STORAGE_KEY = 'dapurtwin_feature_tour_completed_v3'

export function TourProvider({ children }: { children: ReactNode }) {
  const [isTourOpen, setIsTourOpen] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isPageSpecific, setIsPageSpecific] = useState(false)
  const pathname = usePathname()
  const { openSidebar, closeSidebar } = useSidebar()

  // Tentukan daftar langkah aktif (apakah spesifik halaman saat ini atau global)
  const activeSteps = isPageSpecific && PAGE_GUIDES[pathname] ? PAGE_GUIDES[pathname] : GLOBAL_TOUR_STEPS

  // Otomatis buka tur untuk pengguna baru pertama kali
  useEffect(() => {
    try {
      const hasCompleted = localStorage.getItem(TOUR_STORAGE_KEY)
      if (!hasCompleted) {
        const timer = setTimeout(() => {
          setIsPageSpecific(false)
          setIsTourOpen(true)
          setCurrentStepIndex(0)
        }, 1200)
        return () => clearTimeout(timer)
      }
    } catch {
      // Abaikan jika localStorage tidak aktif
    }
  }, [])

  const openTour = (pageSpecific = false) => {
    // Jika user minta panduan halaman dan halaman ini punya panduan khusus
    if (pageSpecific && PAGE_GUIDES[pathname]) {
      setIsPageSpecific(true)
    } else {
      setIsPageSpecific(false)
    }
    setCurrentStepIndex(0)
    setIsTourOpen(true)
  }

  const closeTour = () => {
    setIsTourOpen(false)
    closeSidebar()
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true')
    } catch {
      // Abaikan error penyimpanan
    }
  }

  const nextStep = () => {
    if (currentStepIndex < activeSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
    } else {
      closeTour()
    }
  }

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }

  const goToStep = (index: number) => {
    if (index >= 0 && index < activeSteps.length) {
      setCurrentStepIndex(index)
    }
  }

  const currentStep = activeSteps[currentStepIndex] || activeSteps[0]
  const activeSectionNeeded = currentStep?.sectionId || null

  // SINKRONISASI MOBILE: Jika langkah menargetkan item sidebar di layar mobile, otomatis buka sidebar drawer
  useEffect(() => {
    if (!isTourOpen) return
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024
    if (isMobile) {
      if (currentStep?.isSidebarItem) {
        openSidebar()
      } else {
        closeSidebar()
      }
    }
  }, [isTourOpen, currentStepIndex, currentStep, openSidebar, closeSidebar])

  return (
    <TourContext.Provider
      value={{
        isTourOpen,
        currentStepIndex,
        currentStep,
        activeSteps,
        totalSteps: activeSteps.length,
        openTour,
        closeTour,
        nextStep,
        prevStep,
        goToStep,
        activeSectionNeeded,
        isPageSpecificTour: isPageSpecific,
      }}
    >
      {children}
    </TourContext.Provider>
  )
}

export function useTour() {
  const context = useContext(TourContext)
  if (!context) {
    throw new Error('useTour must be used within a TourProvider')
  }
  return context
}
