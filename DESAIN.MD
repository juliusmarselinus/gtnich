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
| **Orders** | `src/app/dashboard/orders/page.tsx` | Saluran penjualan & metode pembayaran |
