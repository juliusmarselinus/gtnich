// Helper utilitas untuk menentukan kemasan pasar dan rekomendasi kuantitas restock
export function getKemasanPasarFallback(nama: string, satuan: string, hargaPerSatuan: number) {
  const n = nama.toLowerCase()
  const s = satuan.toLowerCase().trim()

  if (s === 'gram' || s === 'gr' || s === 'g') {
    if (n.includes('beras') || n.includes('tepung') || n.includes('gula')) {
      const kgPrice = hargaPerSatuan * 1000
      return {
        kemasanPasar: 'Karung / Bal (25 kg)',
        isiKemasan: 25000,
        satuanKemasan: 'gram',
        hargaPasarKemasan: kgPrice * 25,
        rentangHargaPasar: `Rp ${(kgPrice * 25 * 0.95).toLocaleString('id-ID')} - Rp ${(kgPrice * 25 * 1.08).toLocaleString('id-ID')}`,
        minQtyBeli: 1000,
      }
    }
    const kgPrice = hargaPerSatuan * 1000
    return {
      kemasanPasar: 'Kemasan 1 Kg (Pack)',
      isiKemasan: 1000,
      satuanKemasan: 'gram',
      hargaPasarKemasan: kgPrice > 0 ? kgPrice : 25000,
      rentangHargaPasar: `Rp ${(kgPrice * 0.95).toLocaleString('id-ID')} - Rp ${(kgPrice * 1.1).toLocaleString('id-ID')}`,
      minQtyBeli: 500,
    }
  }

  if (s === 'kg') {
    if (n.includes('beras') || n.includes('terigu') || n.includes('tapioka')) {
      return {
        kemasanPasar: 'Karung 25 Kg',
        isiKemasan: 25,
        satuanKemasan: 'kg',
        hargaPasarKemasan: hargaPerSatuan * 25,
        rentangHargaPasar: `Rp ${(hargaPerSatuan * 25 * 0.92).toLocaleString('id-ID')} - Rp ${(hargaPerSatuan * 25 * 1.05).toLocaleString('id-ID')}`,
        minQtyBeli: 5,
      }
    }
    return {
      kemasanPasar: 'Per Kg / Ikat Grosir',
      isiKemasan: 1,
      satuanKemasan: 'kg',
      hargaPasarKemasan: hargaPerSatuan,
      rentangHargaPasar: `Rp ${(hargaPerSatuan * 0.95).toLocaleString('id-ID')} - Rp ${(hargaPerSatuan * 1.1).toLocaleString('id-ID')}`,
      minQtyBeli: 2,
    }
  }

  if (s === 'ml') {
    if (n.includes('minyak') || n.includes('saus') || n.includes('kecap') || n.includes('sirup')) {
      const literPrice = hargaPerSatuan * 1000
      return {
        kemasanPasar: 'Jerigen 5 Liter',
        isiKemasan: 5000,
        satuanKemasan: 'ml',
        hargaPasarKemasan: literPrice * 5,
        rentangHargaPasar: `Rp ${(literPrice * 5 * 0.95).toLocaleString('id-ID')} - Rp ${(literPrice * 5 * 1.1).toLocaleString('id-ID')}`,
        minQtyBeli: 1000,
      }
    }
    return {
      kemasanPasar: 'Botol / Pouch 1 Liter',
      isiKemasan: 1000,
      satuanKemasan: 'ml',
      hargaPasarKemasan: hargaPerSatuan * 1000,
      rentangHargaPasar: `Rp ${(hargaPerSatuan * 950).toLocaleString('id-ID')} - Rp ${(hargaPerSatuan * 1100).toLocaleString('id-ID')}`,
      minQtyBeli: 1000,
    }
  }

  if (s === 'liter' || s === 'l') {
    if (n.includes('minyak')) {
      return {
        kemasanPasar: 'Jerigen 18 Liter / Dus (12L)',
        isiKemasan: 18,
        satuanKemasan: 'liter',
        hargaPasarKemasan: hargaPerSatuan * 18,
        rentangHargaPasar: `Rp ${(hargaPerSatuan * 18 * 0.95).toLocaleString('id-ID')} - Rp ${(hargaPerSatuan * 18 * 1.05).toLocaleString('id-ID')}`,
        minQtyBeli: 2,
      }
    }
    return {
      kemasanPasar: 'Jerigen 5 Liter',
      isiKemasan: 5,
      satuanKemasan: 'liter',
      hargaPasarKemasan: hargaPerSatuan * 5,
      rentangHargaPasar: `Rp ${(hargaPerSatuan * 5 * 0.95).toLocaleString('id-ID')} - Rp ${(hargaPerSatuan * 5 * 1.1).toLocaleString('id-ID')}`,
      minQtyBeli: 2,
    }
  }

  if (s === 'butir' || s === 'butir telur') {
    return {
      kemasanPasar: 'Tray (30 butir)',
      isiKemasan: 30,
      satuanKemasan: 'butir',
      hargaPasarKemasan: hargaPerSatuan * 30,
      rentangHargaPasar: `Rp ${(hargaPerSatuan * 30 * 0.95).toLocaleString('id-ID')} - Rp ${(hargaPerSatuan * 30 * 1.08).toLocaleString('id-ID')}`,
      minQtyBeli: 30,
    }
  }

  if (s === 'lembar' || s === 'pcs') {
    return {
      kemasanPasar: 'Pack (50 pcs) / Dus',
      isiKemasan: 50,
      satuanKemasan: s,
      hargaPasarKemasan: hargaPerSatuan * 50,
      rentangHargaPasar: `Rp ${(hargaPerSatuan * 50 * 0.95).toLocaleString('id-ID')} - Rp ${(hargaPerSatuan * 50 * 1.1).toLocaleString('id-ID')}`,
      minQtyBeli: 20,
    }
  }

  return {
    kemasanPasar: `Paket Grosir / Dus`,
    isiKemasan: 10,
    satuanKemasan: s,
    hargaPasarKemasan: hargaPerSatuan * 10,
    rentangHargaPasar: `Rp ${(hargaPerSatuan * 9.5).toLocaleString('id-ID')} - Rp ${(hargaPerSatuan * 11).toLocaleString('id-ID')}`,
    minQtyBeli: 5,
  }
}
