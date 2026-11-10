import { formatRupiah } from '@/lib/mock-data'
import type { LaporanData } from '../types'

/**
 * Menghasilkan HTML laporan dengan identitas visual DapurTwin:
 * - Nuansa warna hangat (#F7F5F0 base, aksen kuning dapur #FFB800, terracotta #D8431F, amber #8A5A00)
 * - Kartu ringkasan finansial (6 metrik) persis seperti kartu modul dashboard
 * - Efisiensi data yang padat, rapi, dan modular (multi-halaman siap cetak/PDF)
 */
export function generateLaporanPrintHTML(data: LaporanData, rangeLabel: string): string {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const menuRows = data.menuBreakdown.slice(0, 25).map((m, idx) => `
    <tr style="background: ${idx % 2 === 0 ? '#FFFFFF' : '#FFFDF9'};">
      <td style="padding: 7px 10px; border-bottom: 1px solid #EBE4D5; font-weight: 700; color: #2B1D00;">${m.name}</td>
      <td style="padding: 7px 10px; border-bottom: 1px solid #EBE4D5; text-align: center; color: #5C4A2A;">${m.qty} porsi</td>
      <td style="padding: 7px 10px; border-bottom: 1px solid #EBE4D5; text-align: right; font-weight: 800; color: #2B1D00;">${formatRupiah(m.revenue)}</td>
      <td style="padding: 7px 10px; border-bottom: 1px solid #EBE4D5; text-align: right; color: #1E6B3E; font-weight: 800;">${formatRupiah(m.profit)}</td>
    </tr>
  `).join('')

  const bahanRows = data.bahanUsage.slice(0, 25).map((b, idx) => `
    <tr style="background: ${idx % 2 === 0 ? '#FFFFFF' : '#FFFDF9'};">
      <td style="padding: 7px 10px; border-bottom: 1px solid #EBE4D5; font-weight: 700; color: #2B1D00;">${b.nama}</td>
      <td style="padding: 7px 10px; border-bottom: 1px solid #EBE4D5; text-align: center; color: #5C4A2A;">${b.qty} ${b.satuan}</td>
      <td style="padding: 7px 10px; border-bottom: 1px solid #EBE4D5; text-align: right; font-weight: 800; color: #2B1D00;">${formatRupiah(b.totalEstimasiBiaya)}</td>
    </tr>
  `).join('')

  const channelRows = data.channelBreakdown.map(c => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px dashed #E0D5BE; font-size: 11px;">
      <span style="color: #6E583B; font-weight: 600;">${c.channel} <span style="font-size: 10px; color: #8A7252;">(${c.count} pesanan)</span></span>
      <strong style="color: #2B1D00; font-weight: 800;">${formatRupiah(c.totalRevenue)}</strong>
    </div>
  `).join('')

  const paymentRows = data.paymentBreakdown.map(p => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px dashed #E0D5BE; font-size: 11px;">
      <span style="color: #6E583B; font-weight: 600;">${p.paymentMethod} <span style="font-size: 10px; color: #8A7252;">(${p.count} trx)</span></span>
      <strong style="color: #2B1D00; font-weight: 800;">${formatRupiah(p.totalRevenue)}</strong>
    </div>
  `).join('')

  const salesRows = data.recentSales.slice(0, 20).map((s, idx) => `
    <tr style="background: ${idx % 2 === 0 ? '#FFFFFF' : '#FFFDF9'}; font-size: 10.5px;">
      <td style="padding: 6px 8px; border-bottom: 1px solid #EBE4D5; font-family: monospace; font-weight: 800; color: #2B1D00;">${s.invoiceNumber}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #EBE4D5; color: #3A2A14;">${s.customerName}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #EBE4D5; text-align: center; color: #6E583B;">${s.channel}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #EBE4D5; text-align: center; color: #6E583B;">${s.paymentMethod}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #EBE4D5; text-align: right; font-weight: 800; color: #2B1D00;">${formatRupiah(s.totalPrice)}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #EBE4D5; text-align: right; color: #1E6B3E; font-weight: 800;">${formatRupiah(s.profit)}</td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <title>Laporan Keuangan DapurTwin - ${rangeLabel}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #2B1D00;
          background: #FFFFFF;
          padding: 24px;
          line-height: 1.4;
          font-size: 11.5px;
        }
        @page {
          size: A4 portrait;
          margin: 12mm 14mm;
        }
        @media print {
          body { padding: 0; background: #FFFFFF; }
          .no-break { break-inside: avoid; page-break-inside: avoid; }
        }

        /* Banner Kop Header Tema DapurTwin */
        .kop-banner {
          background: #FFB800;
          border-radius: 18px;
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          border: 1px solid #E8A700;
        }
        .kop-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .dapi-box {
          width: 44px;
          height: 44px;
          background: #FFFFFF;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #FFE49A;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }
        .kop-text h1 {
          font-size: 19px;
          font-weight: 900;
          color: #2B1D00;
          letter-spacing: -0.4px;
          line-height: 1.2;
        }
        .kop-text p {
          font-size: 11px;
          color: #5C4005;
          font-weight: 600;
          margin-top: 2px;
        }
        .kop-badge {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #FFE49A;
          border-radius: 12px;
          padding: 8px 14px;
          text-align: right;
        }
        .kop-badge .periode {
          font-size: 12px;
          font-weight: 800;
          color: #2B1D00;
        }
        .kop-badge .timestamp {
          font-size: 10px;
          color: #7A5700;
          margin-top: 2px;
        }

        /* Section Heading */
        .sec-head {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 14px 0 8px 0;
        }
        .sec-icon {
          width: 22px;
          height: 22px;
          border-radius: 7px;
          background: #FFE49A;
          color: #8A5A00;
          font-size: 11px;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sec-title {
          font-size: 11.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          color: #6E5325;
        }

        /* 6 Kartu Statistik Persis Dashboard */
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 9px;
          margin-bottom: 16px;
        }
        .stat-card {
          border-radius: 14px;
          padding: 11px 13px;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.06);
        }
        .stat-card.kuning { background: #FFF3CC; border-color: #F8E5A0; }
        .stat-card.hijau { background: #E6F5E4; border-color: #CBEBC7; }
        .stat-card.biru { background: #E0F2FE; border-color: #BAE6FD; }
        .stat-card.merah { background: #FDE8E4; border-color: #F8CAC0; }
        .stat-card.ungu { background: #EDE9FF; border-color: #DDD6FE; }

        .stat-label {
          font-size: 9.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 4px;
          color: #6E5325;
        }
        .stat-val {
          font-size: 16px;
          font-weight: 900;
          letter-spacing: -0.3px;
          color: #2B1D00;
        }
        .stat-val.hijau { color: #1A6B40; }
        .stat-sub {
          font-size: 9.5px;
          color: #7A623C;
          margin-top: 3px;
          font-weight: 600;
        }

        /* Tabel Data Elegan */
        table {
          width: 100%;
          border-collapse: collapse;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #EDE0C4;
          margin-bottom: 14px;
          font-size: 11px;
        }
        thead th {
          background: #FFF6D6;
          color: #8A5A00;
          font-weight: 800;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          padding: 8px 10px;
          border-bottom: 1.5px solid #FFD166;
        }

        /* 2 Kolom Saluran & Pembayaran */
        .dual-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 14px;
        }
        .dual-box {
          background: #FFFBF2;
          border: 1px solid #EDE0C4;
          border-radius: 14px;
          padding: 12px 14px;
        }

        /* Footer Pengesahan */
        .laporan-footer {
          margin-top: 24px;
          padding-top: 14px;
          border-top: 1.5px solid #EBE4D5;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          font-size: 10.5px;
          color: #7A623C;
        }
        .ttd-box {
          text-align: center;
          width: 150px;
        }
        .ttd-line {
          border-bottom: 1px solid #A89575;
          margin-top: 40px;
          margin-bottom: 3px;
        }
      </style>
    </head>
    <body>
      <!-- Header Kop Utama DapurTwin -->
      <div class="kop-banner">
        <div class="kop-brand">
          <div class="dapi-box">
            <!-- Ikon Kepala Dapi Grafis Vektor -->
            <svg viewBox="44 26 152 182" width="28" height="33" xmlns="http://www.w3.org/2000/svg">
              <path d="M58 132 L56 56 Q90 68 112 104 Z" fill="#FF8F28" stroke="#C9620C" stroke-width="2" />
              <path d="M68 116 L66 74 Q86 84 100 104 Z" fill="#FFD9C2" />
              <path d="M182 132 L184 56 Q150 68 128 104 Z" fill="#FF8F28" stroke="#C9620C" stroke-width="2" />
              <path d="M172 116 L174 74 Q154 84 140 104 Z" fill="#FFD9C2" />
              <path d="M56 74 L56 56 L72 62 Z" fill="#2B221C" />
              <path d="M184 74 L184 56 L168 62 Z" fill="#2B221C" />
              <path d="M120 86 C164 86 192 114 194 148 C195 166 187 180 174 188 L186 198 L160 198 C148 204 134 206 120 206 C106 206 92 204 80 198 L54 198 L66 188 C53 180 45 166 46 148 C48 114 76 86 120 86 Z" fill="#FF8F28" stroke="#C9620C" stroke-width="2" />
              <path d="M120 144 C138 144 158 158 164 176 C156 196 138 204 120 204 C102 204 84 196 76 176 C82 158 102 144 120 144 Z" fill="#FFF3DC" />
              <ellipse cx="76" cy="170" rx="10" ry="6" fill="#FF775D" opacity=".45" />
              <ellipse cx="164" cy="170" rx="10" ry="6" fill="#FF775D" opacity=".45" />
              <ellipse cx="96" cy="148" rx="10" ry="13" fill="#2B221C" />
              <ellipse cx="144" cy="148" rx="10" ry="13" fill="#2B221C" />
              <circle cx="99" cy="143" r="3.5" fill="#FFFFFF" />
              <circle cx="147" cy="143" r="3.5" fill="#FFFFFF" />
              <path d="M110 166 Q120 161 130 166 Q126 176 120 177 Q114 176 110 166 Z" fill="#2B221C" />
              <path d="M108 183 Q114 191 120 183 Q126 191 132 183" stroke="#2B221C" stroke-width="3.5" stroke-linecap="round" fill="none" />
            </svg>
          </div>
          <div class="kop-text">
            <h1>DapurTwin</h1>
            <p>Laporan & Rekapitulasi Statistik Keuangan Dapur</p>
          </div>
        </div>
        <div class="kop-badge">
          <div class="periode">Periode: ${rangeLabel}</div>
          <div class="timestamp">Dicetak: ${currentDate} WIB</div>
        </div>
      </div>

      <!-- 1. Enam Metrik Utama Finansial (Desain Kartu Persis Dashboard) -->
      <div class="sec-head">
        <div class="sec-icon">1</div>
        <div class="sec-title">Ringkasan Eksekutif Finansial</div>
      </div>
      <div class="stat-grid">
        <div class="stat-card kuning">
          <div class="stat-label">Total Omzet Penjualan</div>
          <div class="stat-val">${formatRupiah(data.summary.totalRevenue)}</div>
          <div class="stat-sub">${data.summary.totalTransaksi} transaksi selesai tercatat</div>
        </div>
        <div class="stat-card hijau">
          <div class="stat-label">Estimasi Profit Bersih</div>
          <div class="stat-val hijau">${formatRupiah(data.summary.totalProfit)}</div>
          <div class="stat-sub">Rata-rata margin laba ${data.summary.profitMargin}%</div>
        </div>
        <div class="stat-card biru">
          <div class="stat-label">Rata-rata per Trx (AOV)</div>
          <div class="stat-val">${formatRupiah(data.summary.averageBasketSize)}</div>
          <div class="stat-sub">Nominal per pesanan pelanggan</div>
        </div>
        <div class="stat-card kuning">
          <div class="stat-label">Total HPP / Beban Modal</div>
          <div class="stat-val">${formatRupiah(data.summary.totalHPP)}</div>
          <div class="stat-sub">Akumulasi biaya bahan baku resep</div>
        </div>
        <div class="stat-card merah">
          <div class="stat-label">Bahan Baku Terpakai</div>
          <div class="stat-val">${data.summary.totalBahanTerpakaiJenis} Jenis</div>
          <div class="stat-sub">Termutasi otomatis dari kasir</div>
        </div>
        <div class="stat-card ungu">
          <div class="stat-label">Pengadaan Belanja PO</div>
          <div class="stat-val">${formatRupiah(data.summary.totalBiayaPengadaan)}</div>
          <div class="stat-sub">${data.summary.totalPOApproved} nota belanja bahan masuk</div>
        </div>
      </div>

      <!-- 2. Kinerja Penjualan Menu Kuliner -->
      <div class="no-break">
        <div class="sec-head">
          <div class="sec-icon">2</div>
          <div class="sec-title">Kinerja & Kontribusi Penjualan Menu</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="text-align: left;">Nama Menu Masakan</th>
              <th style="text-align: center;">Porsi Terjual</th>
              <th style="text-align: right;">Total Omzet</th>
              <th style="text-align: right;">Estimasi Laba Bersih</th>
            </tr>
          </thead>
          <tbody>
            ${menuRows || '<tr><td colspan="4" style="text-align:center; padding: 12px; color:#8A7252;">Belum ada penjualan menu pada periode ini.</td></tr>'}
          </tbody>
        </table>
      </div>

      <!-- 3. Konsumsi Bahan Baku Resep -->
      <div class="no-break">
        <div class="sec-head">
          <div class="sec-icon">3</div>
          <div class="sec-title">Akumulasi Konsumsi Bahan Baku Resep</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="text-align: left;">Nama Bahan Baku</th>
              <th style="text-align: center;">Total Kuantitas Dipakai</th>
              <th style="text-align: right;">Estimasi Biaya Bahan (HPP)</th>
            </tr>
          </thead>
          <tbody>
            ${bahanRows || '<tr><td colspan="3" style="text-align:center; padding: 12px; color:#8A7252;">Belum ada bahan baku yang terpotong pada periode ini.</td></tr>'}
          </tbody>
        </table>
      </div>

      <!-- 4. Saluran & Metode Pembayaran Kasir -->
      <div class="no-break">
        <div class="dual-grid">
          <div class="dual-box">
            <div class="sec-title" style="margin-bottom: 8px;">Kinerja Saluran Penjualan</div>
            ${channelRows || '<div style="color:#8A7252; font-size:11px;">Tidak ada data saluran</div>'}
          </div>
          <div class="dual-box">
            <div class="sec-title" style="margin-bottom: 8px;">Metode Pembayaran Kasir</div>
            ${paymentRows || '<div style="color:#8A7252; font-size:11px;">Tidak ada data metode pembayaran</div>'}
          </div>
        </div>
      </div>

      <!-- 5. Riwayat Nota Transaksi Terakhir -->
      <div class="no-break">
        <div class="sec-head">
          <div class="sec-icon">4</div>
          <div class="sec-title">Riwayat Transaksi Penjualan Terakhir Masuk Rekapitulasi</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="text-align: left;">No. Invoice</th>
              <th style="text-align: left;">Pelanggan</th>
              <th style="text-align: center;">Saluran</th>
              <th style="text-align: center;">Metode</th>
              <th style="text-align: right;">Total Omzet</th>
              <th style="text-align: right;">Profit Bersih</th>
            </tr>
          </thead>
          <tbody>
            ${salesRows || '<tr><td colspan="6" style="text-align:center; padding: 12px; color:#8A7252;">Tidak ada transaksi tercatat.</td></tr>'}
          </tbody>
        </table>
      </div>

      <!-- Footer & Pengesahan Dokumen -->
      <div class="laporan-footer no-break">
        <div>
          <strong style="color: #2B1D00; font-size: 11px;">DapurTwin - Sistem Manajemen Operasional Dapur</strong>
          <div style="font-size: 10px; color: #7A623C; margin-top: 2px;">
            Dokumen ini dibuat otomatis dari rekap transaksi penjualan DapurTwin.
          </div>
        </div>
        <div class="ttd-box">
          <div style="font-weight: 600;">Chef / Pemilik Usaha,</div>
          <div class="ttd-line"></div>
          <div style="font-size: 9.5px; color: #8A7252;">( Penanggung Jawab Dapur )</div>
        </div>
      </div>
    </body>
    </html>
  `
}
