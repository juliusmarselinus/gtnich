# Panduan Desain & UI/UX Sistem (Design System & Guidelines)

Dokumen ini mendefinisikan bahasa desain, token visual, serta standar komponen interaktif antarmuka yang digunakan di seluruh aplikasi, mengikuti estetika **Soft Claymorphism & Neumorphism F&B Modern**.

---

## 1. Filosofi & Karakteristik Desain (Claymorphism UI)

1. **Clay Cards & Insets**:
   - Komponen utama (kartu, modal, container) menggunakan efek menggembung lembut (*soft extruded clay*) dengan kombinasi drop shadow terang dan gelap:
     ```css
     box-shadow: 8px 8px 18px #d6dfea, -8px -8px 18px #ffffff,
                 inset 2px 2px 4px rgba(255, 255, 255, 0.9),
                 inset -2px -2px 4px rgba(200, 215, 230, 0.25);
     ```
   - Form input & filter field menggunakan kelas `.clay-inset` (cekung ke dalam) yang memberi kesan *embossed/recessed*.

2. **Aksen & Warna Utama**:
   - **Primary / Emerald**: `#10b981` ke `#059669` (Aksen kesegaran bahan pangan, konfirmasi, laba positif, dan aksi primer).
   - **Background Base**: `#f1f5f9` / `#f3f6fa` dengan *radial gradients* pastel halus.
   - **Neutral Slate**: `#1e293b` (Teks utama), `#64748b` (Teks sekunder/label), `#94a3b8` (Placeholder).

---

## 2. Standar Komponen Dropdown Kustom (`CustomSelect`)

Aplikasi **melarang keras penggunaan tag default browser (`<select>` dan `<option>`)** karena merusak konsistensi claymorphism dan tidak dapat dikustomisasi secara mulus di berbagai browser/OS.

Semua dropdown wajib menggunakan komponen:
```tsx
import CustomSelect from '@/components/ui/CustomSelect'
```

### Spesifikasi Teknis `CustomSelect`:
- **File Lokasi**: `src/components/ui/CustomSelect.tsx`
- **Fitur Utama**:
  1. **Tampilan Claymorphism**: Trigger button bertekstur `.clay-inset` atau `.clay-card`, menyatu sempurna dengan formulir clay.
  2. **Floating Menu**: Popup dropdown mengambang halus (*smooth elevation*) dengan border lembut dan bayangan clay, dilengkapi indikator checklist (`Check`) pada item aktif.
  3. **Indikator Chevron Dinamis**: Ikon panah berputar lembut (`rotate-180`) saat terbuka dan berubah warna ke hijau emerald.
  4. **Pencarian Cepat (Searchable)**: Mendukung filter live ketikan (`searchable={true}`) untuk dropdown dengan banyak pilihan bahan/data.
  5. **Sublabel & Ikon**: Mendukung penambahan subteks (misal: sisa stok, nama satuan master, kategori supplier) dan ikon custom.
  6. **Aksesibilitas & UX**:
     - *Click-outside-to-close* via document event listener.
     - Navigasi keyboard (`Enter`, `Space`, `Escape`).
     - State `disabled` dan penanganan `error`.

### Contoh Penggunaan:

#### Kasus Standar:
```tsx
<CustomSelect
  value={kategori}
  onChange={val => setKategori(val)}
  options={['Camilan', 'Kue & Manisan', 'Minuman']}
/>
```

#### Kasus dengan Sublabel & Pencarian (Searchable):
```tsx
<CustomSelect
  value={selectedBahanId}
  onChange={val => setSelectedBahanId(val)}
  placeholder="-- Pilih Bahan Baku --"
  searchable={true}
  searchPlaceholder="Ketik nama bahan..."
  options={bahanList.map(b => ({
    value: b.id,
    label: b.nama,
    sublabel: `Stok: ${b.stok} ${b.satuan}`,
  }))}
/>
```

---

## 3. Daftar Halaman & Modul yang Mengadopsi `CustomSelect`

| Modul | Lokasi File | Titik Dropdown yang Diganti |
| :--- | :--- | :--- |
| **Bahan Baku** | `src/app/dashboard/bahan/components/BahanModal.tsx` | Pemilihan satuan standar & pemilihan supplier terkait |
| **Suppliers** | `src/app/dashboard/suppliers/components/SupplierModal.tsx` | Pemilihan kategori supplier hasil normalisasi |
| **Purchase Order** | `src/app/dashboard/purchase-order/components/POWizardModal.tsx` | Pemilihan bahan baku saat pembuatan order (searchable) |
| **Stok Log** | `src/app/dashboard/stok-log/components/ManualMutasiModal.tsx` | Pemilihan bahan baku untuk mutasi masuk/keluar (searchable) |
| **Menu & Resep** | `src/app/dashboard/menu/components/MenuModal.tsx` | Pemilihan kategori menu, satuan pecahan resep, dan bahan baku |
| **Simulasi Finansial** | `src/app/dashboard/simulasi/page.tsx` | Target menu simulasi omzet, pemilihan bahan fluktuasi harga, & menu supply |
| **Tagihan Supplier** | `src/app/dashboard/tagihan/page.tsx` & `TagihanDetailModal.tsx` | Pemilihan filter supplier & metode pembayaran faktur |
| **Input Penjualan (Kasir)** | `src/app/dashboard/penjualan/components/CartPOS.tsx` | Saluran penjualan & metode pembayaran kasir |

---

## 4. Standar Tipografi, Spasi & Anti-Overflow (Anti-Clipping Rules)

Untuk menjaga estetika dan kenyamanan visual di seluruh perangkat (Desktop, Tablet, Mobile), setiap komponen antarmuka wajib mematuhi aturan penempatan teks berikut:

1. **Dilarang Menempatkan Teks Terpotong / Tertimpa (*No Text Clipping or Overlap*)**:
   - Seluruh teks judul, label, angka harga, dan kuantitas tidak boleh tertimpa oleh ikon, tombol aksi, atau elemen lain.
   - Hindari penggunaan `truncate` kaku dengan lebar piksel kecil yang memotong informasi penting. Gunakan `line-clamp-2` atau fleksibilitas `flex-wrap` / `min-w-0` agar kata tetap terbaca utuh.

2. **Dilarang Menempatkan Badge / Teks Terlalu di Sudut Luar (*No Off-Card Badges*)**:
   - Badge kuantitas, status, atau counter tidak boleh menggunakan posisi negatif ekstrem (seperti `-top-2 -right-2` yang menjorok keluar batas kartu) karena menyebabkan tampilan berantakan di layar kecil, terpotong oleh `overflow-hidden`, atau menimpa kartu di sebelahnya.
   - Badge wajib diletakkan secara rapi **di dalam (*in-flow*) batas kartu** (contoh: di bagian header kartu dengan padding internal yang lega).

3. **Padding Aman Minimal (*Safe Margins*)**:
   - Setiap teks wajib memiliki jarak minimal `0.5rem` (8px) dari batas terluar kontainer pembungkusnya.
   - Baris dalam tabel wajib menggunakan padding vertikal minimal `py-3` dan horizontal `px-4` atau `px-5` dengan pembungkus `overflow-x-auto` agar tidak mepet ke tepi layar ponsel.

4. **Kualitas Frasa Status & Keterangan (*Human-friendly Microcopy*)**:
   - Gunakan frasa yang jelas, formal, dan komunikatif:
     - ❌ *"4 di keranjang"* ➔ ✔️ *"4 Porsi Terpilih"*
     - ❌ *"0 produk"* ➔ ✔️ *"Stok Habis (0 pcs)"*
     - ❌ *"PO"* ➔ ✔️ *"Purchase Order"*

