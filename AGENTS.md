<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# UI & UX Design Rules (Anti-Slop)

- **Dilarang keras menggunakan label/badge dekoratif hampa informasi**:
  - Jangan menambahkan teks klise seperti *"Kondisi Dapur Hari Ini"* atau sejenisnya yang dipadukan dengan icon bintang (`Sparkles`, `Star`, atau icon dekoratif sejenis dari `lucide-react`).
  - Elemen dekoratif semacam ini tidak menambah informasi operasional yang berguna bagi pengguna dan merupakan indikasi klise AI Slop.
  - Setiap label, badge, atau indikator di antarmuka harus memuat informasi fungsional nyata (misal: status stok kritis, angka perubahan nominal, atau status koneksi dapur).
  - Dilarang menggunakan animasi blinking/pulsing dekoratif yang tidak fungsional (misal: titik hijau/merah `animate-pulse` pada nomor meja) yang membuat UI terkesan generik AI slop. Tampilkan nomor meja dan informasi pesanan dengan jelas, tegas, bersih, dan fungsional.

- **Aturan Desain Warna & Pola Antarmuka (Sesuai Halaman Kasir Penjualan)**:
  - Panel Keranjang: Gunakan struktur kartu putih `bg-white rounded-[28px] p-5 shadow-[0_2px_16px_rgba(140,100,30,0.06)]` dengan tombol aksi transaksi utama bernuansa oranye-koral kasir (`bg-[#D8431F] hover:bg-[#BF3818] text-white`).
  - Baris Menu Keranjang: Gunakan latar krem hangat `bg-[#FFF9EC] rounded-[20px] p-3` dengan tombol kuantitas `+` dan `-` putih rounded-full berbayang halus (`bg-white hover:bg-[#FFEBB0] text-slate-600`).
  - Pilihan Pembayaran & Badge: Gunakan aksen kuning hangat (`#FFB800`, `#FFF6D6`, `#FFF0DB`, `#7A5A10`) dan hijau operasional dapur (`#7F9A2E`, `#E2EBC0`) untuk status pembayaran lunas. Hindari kontras hitam pekat monokrom yang tidak sesuai identitas DapurTwin.

- **Standar Notifikasi (Toast Notification Rules)**:
  - Dilarang keras menggunakan `alert()`, `confirm()`, atau dialog bawaan browser untuk notifikasi operasional pengguna.
  - Wajib selalu menggunakan custom toast hook: `const toast = useToast()` dari `@/context/ToastContext`.
  - Gunakan metode yang sesuai: `toast.success(title, message)`, `toast.error(title, message)`, `toast.warning(title, message)`, atau `toast.info(title, message)`.
