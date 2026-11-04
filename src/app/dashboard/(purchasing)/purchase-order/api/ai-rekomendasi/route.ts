import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AIPORekomendasiItem } from '../../types'

interface RawAIItemResponse {
  bahanId: string
  rekomendasiQty: number
  kecepatanHabis?: 'Tinggi' | 'Sedang' | 'Rendah'
  alasan?: string
  kemasanPasar?: string
  isiKemasan?: number
  satuanKemasan?: string
  hargaPasarKemasan?: number
  rentangHargaPasar?: string
}

interface AIAnalysisResult {
  summary: string
  items: RawAIItemResponse[]
}

// Helper untuk memperkirakan ukuran kemasan standar grosir di pasar Indonesia jika AI tidak merespon
function getKemasanPasarFallback(nama: string, satuan: string, hargaPerSatuan: number) {
  const n = nama.toLowerCase()
  const s = satuan.toLowerCase().trim()

  if (s === 'gram' || s === 'gr' || s === 'g') {
    // Di pasar umumnya dibeli per Pack 500g, 1 Kg, atau Karung 25kg / 50kg
    if (n.includes('beras') || n.includes('tepung') || n.includes('gula')) {
      const kgPrice = hargaPerSatuan * 1000
      return {
        kemasanPasar: 'Karung / Bal (25 kg)',
        isiKemasan: 25000,
        satuanKemasan: 'gram',
        hargaPasarKemasan: kgPrice * 25,
        rentangHargaPasar: `Rp ${(kgPrice * 25 * 0.95).toLocaleString('id-ID')} - Rp ${(kgPrice * 25 * 1.08).toLocaleString('id-ID')}`,
        minQtyBeli: 1000, // Minimal beli 1 kg (1000 gram), bukan 1 gram!
      }
    }
    const kgPrice = hargaPerSatuan * 1000
    return {
      kemasanPasar: 'Kemasan 1 Kg (Pack)',
      isiKemasan: 1000,
      satuanKemasan: 'gram',
      hargaPasarKemasan: kgPrice > 0 ? kgPrice : 25000,
      rentangHargaPasar: `Rp ${(kgPrice * 0.95).toLocaleString('id-ID')} - Rp ${(kgPrice * 1.1).toLocaleString('id-ID')}`,
      minQtyBeli: 500, // Minimal beli 500 gr / 1 kg
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
    // Minimal botol / jerigen
    if (n.includes('minyak') || n.includes('saus') || n.includes('kecap') || n.includes('sirup')) {
      const literPrice = hargaPerSatuan * 1000
      return {
        kemasanPasar: 'Jerigen 5 Liter',
        isiKemasan: 5000,
        satuanKemasan: 'ml',
        hargaPasarKemasan: literPrice * 5,
        rentangHargaPasar: `Rp ${(literPrice * 5 * 0.95).toLocaleString('id-ID')} - Rp ${(literPrice * 5 * 1.1).toLocaleString('id-ID')}`,
        minQtyBeli: 1000, // Minimal 1 Liter (1000 ml)
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

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Pengguna tidak terautentikasi' }, { status: 401 })
    }

    // 1. Ambil data master bahan beserta supplier-nya
    const { data: rawBahan, error: errBahan } = await supabase
      .from('bahan')
      .select('id, nama, satuan, stok, stok_minimum, harga_per_satuan, supplier_id, suppliers(id, nama)')
      .eq('user_id', user.id)

    if (errBahan) {
      return NextResponse.json({ success: false, error: errBahan.message }, { status: 500 })
    }

    const bahanList = rawBahan || []
    if (bahanList.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          summary: 'Belum ada data master bahan baku di dapur Anda.',
          items: [],
        },
      })
    }

    // 2. Ambil data transaksi penjualan (orders + order_items) dalam 30 hari terakhir
    const dateLimit = new Date()
    dateLimit.setDate(dateLimit.getDate() - 30)

    const { data: rawOrders } = await supabase
      .from('orders')
      .select('id, created_at, order_items(id, menu_id, nama_menu, qty)')
      .eq('user_id', user.id)
      .gte('created_at', dateLimit.toISOString())

    // 3. Ambil data pengeluaran stok riil dari stok_logs dalam 30 hari terakhir
    const { data: rawStokLogs } = await supabase
      .from('stok_logs')
      .select('id, bahan_id, perubahan, tipe, sumber, created_at')
      .eq('user_id', user.id)
      .gte('created_at', dateLimit.toISOString())

    // 4. Hitung total konsumsi riil per bahan_id dari stok_logs
    const consumptionMap: Record<string, { totalKeluar: number; logCount: number }> = {}
    ;(rawStokLogs || []).forEach(log => {
      const bId = log.bahan_id
      const perubahan = Number(log.perubahan) || 0
      if (bId && (perubahan < 0 || log.tipe === 'keluar' || log.sumber === 'Penjualan' || log.sumber === 'Dapur')) {
        const qtyKeluar = Math.abs(perubahan)
        if (!consumptionMap[bId]) {
          consumptionMap[bId] = { totalKeluar: 0, logCount: 0 }
        }
        consumptionMap[bId].totalKeluar += qtyKeluar
        consumptionMap[bId].logCount += 1
      }
    })

    // 5. Agregasi penjualan menu terlaris
    const menuSalesMap: Record<string, number> = {}
    ;(rawOrders || []).forEach(order => {
      ;(order.order_items || []).forEach((item: any) => {
        const name = item.nama_menu || 'Menu'
        menuSalesMap[name] = (menuSalesMap[name] || 0) + (Number(item.qty) || 0)
      })
    })

    const topMenus = Object.entries(menuSalesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, qty]) => `${name} (${qty} porsi terjual)`)
      .join(', ')

    // 6. Siapkan ringkasan bahan untuk analisis AI
    const bahanSummaryForAI = bahanList.map(b => {
      const consumption = consumptionMap[b.id] || { totalKeluar: 0, logCount: 0 }
      const avgDailyKeluar = (consumption.totalKeluar / 30).toFixed(2)
      const currentStock = Number(b.stok) || 0
      const minStock = Number(b.stok_minimum) || 0
      const daysOfSupply =
        Number(avgDailyKeluar) > 0 ? (currentStock / Number(avgDailyKeluar)).toFixed(1) : 'Banyak/Statis'

      const fallbackKemasan = getKemasanPasarFallback(b.nama, b.satuan, Number(b.harga_per_satuan) || 0)

      return {
        id: b.id,
        nama: b.nama,
        satuan: b.satuan,
        stokSekarang: currentStock,
        stokMinimum: minStock,
        hargaPerSatuan: Number(b.harga_per_satuan) || 0,
        supplierId: b.supplier_id || (b.suppliers as any)?.id || null,
        namaSupplier: (b.suppliers as any)?.nama || null,
        totalKeluar30Hari: consumption.totalKeluar,
        rataRataKeluarPerHari: avgDailyKeluar,
        estimasiHariHabis: daysOfSupply,
        standardMarketPackaging: fallbackKemasan.kemasanPasar,
      }
    })

    // 7. Panggil AI untuk analisa mendalam & kemasan pasar
    const routerUrl = process.env.NEXT_9ROUTER_URL || 'https://router.hitungmin.my.id/v1'
    const routerKey = process.env.NEXT_9ROUTER_KEY || ''
    const routerModel = process.env.NEXT_9ROUTER_MODEL || 'gemini/gemini-3.5-flash-lite'

    let aiResult: AIAnalysisResult | null = null

    if (routerUrl && routerKey) {
      let endpoint = routerUrl.trim()
      if (!endpoint.includes('/chat/completions') && !endpoint.includes('/generateContent')) {
        endpoint = endpoint.replace(/\/+$/, '') + '/chat/completions'
      }

      const promptSystem = `Anda adalah Food & Beverage Supply Chain Specialist & Purchasing Manager restoran profesional di Indonesia.
Tugas Anda adalah menganalisis data historis konsumsi riil dan penjualan kasir, lalu menentukan bahan yang harus dibeli beserta kuantitas & kemasan pasaran grosir Indonesia.

ATURAN KUANTITAS PEMBELIAN & KEMASAN PASAR (SANGAT PENTING):
1. JANGAN PERNAH merekomendasikan jumlah pembelian mikro yang tidak masuk akal di operasional dapur/pasar (misalnya "1 gram", "2 ml", "0.5 pcs"). Pembelian bahan baku di pasar/supplier selalu dalam takaran standar wajar:
   - Bahan tepung/gula/garam dengan satuan master gram: Beli minimal 1.000 gram (1 kg pack) atau kelipatan kg / karung (25.000 gram).
   - Minyak/saus dengan satuan master ml: Beli minimal 1.000 ml (1 liter botol/pouch) atau jerigen (5.000 ml / 18.000 ml).
   - Telur: Beli dalam tray (30 butir) atau minimal 1-2 kg (15-30 butir).
   - Daging/sayur: Beli minimal 1 - 5 kg.
2. Hitung rata-rata harga di pasaran grosir Indonesia per paket/kemasan pembelian:
   - "kemasanPasar": Nama kemasan umum di pasar/supplier (contoh: "Karung 25 Kg", "Jerigen 5 Liter", "Tray 30 Butir", "Pack 1 Kg", "Dus (12 botol)").
   - "isiKemasan": Jumlah isi dalam satuan master (contoh: jika master gram & beli 1 pack 1 kg -> isiKemasan: 1000).
   - "hargaPasarKemasan": Perkiraan harga pasar rata-rata untuk 1 kemasan tersebut di Indonesia.
   - "rentangHargaPasar": Rentang harga pasaran (contoh: "Rp 260.000 - Rp 280.000").
3. Prioritaskan bahan yang konsumsinya tinggi atau stoknya menipis relatif terhadap pemakaian 7-14 hari ke depan. Jangan rekomendasikan dead stock.
4. Output HANYA JSON valid tanpa teks lain, tanpa markdown (\`\`\`json).

Format JSON:
{
  "summary": "Ringkasan ringkas strategi belanja dapur & kondisi stok saat ini...",
  "items": [
    {
      "bahanId": "id-bahan",
      "rekomendasiQty": 1000,
      "kecepatanHabis": "Tinggi" | "Sedang" | "Rendah",
      "alasan": "Penjelasan ringkas berbasis data pemakaian riil & tren",
      "kemasanPasar": "Pack 1 Kg",
      "isiKemasan": 1000,
      "satuanKemasan": "gram",
      "hargaPasarKemasan": 16000,
      "rentangHargaPasar": "Rp 15.000 - Rp 17.500"
    }
  ]
}`

      const promptUser = `Data Dapur Saat Ini:
- Menu Terlaris (30 Hari): ${topMenus || 'Belum ada data penjualan tercatat'}
- Total Transaksi: ${(rawOrders || []).length} transaksi
- Daftar Bahan & Pemakaian Riil:
${JSON.stringify(bahanSummaryForAI, null, 2)}

Tentukan rekomendasi item bahan yang perlu dibeli dengan kuantitas paket pasar yang realistis dan harga rata-rata pasaran di Indonesia!`

      try {
        const aiResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${routerKey}`,
          },
          body: JSON.stringify({
            model: routerModel,
            messages: [
              { role: 'system', content: promptSystem },
              { role: 'user', content: promptUser },
            ],
            temperature: 0.2,
          }),
        })

        if (aiResponse.ok) {
          const resJson = await aiResponse.json()
          const rawContent = resJson.choices?.[0]?.message?.content || ''
          let cleanJson = rawContent.trim()
          if (cleanJson.includes('```json')) {
            cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '').trim()
          } else if (cleanJson.includes('```')) {
            cleanJson = cleanJson.replace(/```/g, '').trim()
          }
          const firstBrace = cleanJson.indexOf('{')
          const lastBrace = cleanJson.lastIndexOf('}')
          if (firstBrace !== -1 && lastBrace !== -1) {
            cleanJson = cleanJson.substring(firstBrace, lastBrace + 1)
            const parsed = JSON.parse(cleanJson)
            if (parsed && Array.isArray(parsed.items)) {
              aiResult = parsed
            }
          }
        }
      } catch (e) {
        console.warn('AI PO call failed, using heuristic fallback:', e)
      }
    }

    // 8. Normalization & Penyesuaian Kuantitas Wajar Pasar
    const resultMap = new Map<string, AIPORekomendasiItem>()

    if (aiResult && Array.isArray(aiResult.items) && aiResult.items.length > 0) {
      aiResult.items.forEach(aiItem => {
        const rawB = bahanSummaryForAI.find(b => b.id === aiItem.bahanId)
        if (rawB) {
          const fallback = getKemasanPasarFallback(rawB.nama, rawB.satuan, rawB.hargaPerSatuan)
          // Pastikan tidak ada kuantitas tidak masuk akal (mis. 1 gram)
          const baseQty = Number(aiItem.rekomendasiQty) || 0
          const sensibleQty = Math.max(fallback.minQtyBeli, Math.round(baseQty))

          resultMap.set(rawB.id, {
            bahanId: rawB.id,
            namaBahan: rawB.nama,
            satuan: rawB.satuan,
            stokSekarang: rawB.stokSekarang,
            stokMinimum: rawB.stokMinimum,
            rekomendasiQty: sensibleQty,
            estimasiHarga: rawB.hargaPerSatuan,
            alasan: aiItem.alasan || `Tingkat perputaran aktif: ${rawB.totalKeluar30Hari} ${rawB.satuan} dalam 30 hari.`,
            kecepatanHabis: aiItem.kecepatanHabis || (rawB.stokSekarang <= rawB.stokMinimum ? 'Tinggi' : 'Sedang'),
            kemasanPasar: aiItem.kemasanPasar || fallback.kemasanPasar,
            isiKemasan: aiItem.isiKemasan || fallback.isiKemasan,
            satuanKemasan: aiItem.satuanKemasan || fallback.satuanKemasan,
            hargaPasarKemasan: aiItem.hargaPasarKemasan || fallback.hargaPasarKemasan,
            rentangHargaPasar: aiItem.rentangHargaPasar || fallback.rentangHargaPasar,
            supplierId: rawB.supplierId,
            namaSupplier: rawB.namaSupplier,
          })
        }
      })
    }

    // Algoritma Fallback Cerdas jika AI tidak mengembalikan item
    if (resultMap.size === 0) {
      bahanSummaryForAI.forEach(b => {
        const dailyBurn = Number(b.rataRataKeluarPerHari)
        const isDepleted = b.stokSekarang <= b.stokMinimum
        const isFastMoving = b.totalKeluar30Hari > 0
        const fallback = getKemasanPasarFallback(b.nama, b.satuan, b.hargaPerSatuan)

        if (isFastMoving && dailyBurn > 0) {
          const daysLeft = b.stokSekarang / dailyBurn
          if (daysLeft <= 7 || isDepleted) {
            // Hitung kebutuhan aman 14 hari
            const rawNeeded = dailyBurn * 14 - b.stokSekarang
            // Bulatkan ke kelipatan kemasan pasar
            const targetQty = Math.max(fallback.minQtyBeli, Math.ceil(rawNeeded / fallback.isiKemasan) * fallback.isiKemasan)

            resultMap.set(b.id, {
              bahanId: b.id,
              namaBahan: b.nama,
              satuan: b.satuan,
              stokSekarang: b.stokSekarang,
              stokMinimum: b.stokMinimum,
              rekomendasiQty: targetQty,
              estimasiHarga: b.hargaPerSatuan,
              alasan: `Konsumsi rata-rata ${dailyBurn.toFixed(1)} ${b.satuan}/hari. Stok tersisa diprediksi habis dalam ${Math.max(0, Math.round(daysLeft))} hari.`,
              kecepatanHabis: daysLeft <= 3 ? 'Tinggi' : 'Sedang',
              kemasanPasar: fallback.kemasanPasar,
              isiKemasan: fallback.isiKemasan,
              satuanKemasan: fallback.satuanKemasan,
              hargaPasarKemasan: fallback.hargaPasarKemasan,
              rentangHargaPasar: fallback.rentangHargaPasar,
              supplierId: b.supplierId,
              namaSupplier: b.namaSupplier,
            })
          }
        } else if (isDepleted) {
          const rawNeed = (b.stokMinimum * 2) - b.stokSekarang
          const targetQty = Math.max(fallback.minQtyBeli, Math.ceil(Math.max(1, rawNeed) / fallback.isiKemasan) * fallback.isiKemasan)

          resultMap.set(b.id, {
            bahanId: b.id,
            namaBahan: b.nama,
            satuan: b.satuan,
            stokSekarang: b.stokSekarang,
            stokMinimum: b.stokMinimum,
            rekomendasiQty: targetQty,
            estimasiHarga: b.hargaPerSatuan,
            alasan: `Stok saat ini (${b.stokSekarang} ${b.satuan}) berada di bawah batas minimum (${b.stokMinimum} ${b.satuan}).`,
            kecepatanHabis: b.stokSekarang === 0 ? 'Tinggi' : 'Sedang',
            kemasanPasar: fallback.kemasanPasar,
            isiKemasan: fallback.isiKemasan,
            satuanKemasan: fallback.satuanKemasan,
            hargaPasarKemasan: fallback.hargaPasarKemasan,
            rentangHargaPasar: fallback.rentangHargaPasar,
            supplierId: b.supplierId,
            namaSupplier: b.namaSupplier,
          })
        }
      })
    }

    const items = Array.from(resultMap.values())
    const summary =
      aiResult?.summary ||
      `Dapi AI merekomendasikan ${items.length} bahan baku untuk dibeli dengan takaran paket pasar standar berdasarkan perputaran dapur 30 hari terakhir.`

    return NextResponse.json({
      success: true,
      data: {
        summary,
        items,
      },
    })
  } catch (error: any) {
    console.error('Error generating AI PO Recommendation:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Internal Server Error' }, { status: 500 })
  }
}
