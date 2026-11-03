import { formatRupiah } from '@/lib/mock-data'
import type { LaporanData } from '../types'

export function generateLaporanPrintHTML(data: LaporanData, rangeLabel: string): string {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const menuRows = data.menuBreakdown.slice(0, 20).map((m, idx) => `
    <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${m.name}</td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${m.qty} porsi</td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600;">${formatRupiah(m.revenue)}</td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #166534; font-weight: 600;">${formatRupiah(m.profit)}</td>
    </tr>
  `).join('')

  const bahanRows = data.bahanUsage.slice(0, 15).map((b, idx) => `
    <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${b.nama}</td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${b.qty} ${b.satuan}</td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600;">${formatRupiah(b.totalEstimasiBiaya)}</td>
    </tr>
  `).join('')

  const channelRows = data.channelBreakdown.map(c => `
    <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #cbd5e1; font-size: 11.5px;">
      <span style="color: #475569;">${c.channel} (${c.count} pesanan)</span>
      <strong style="color: #0f172a;">${formatRupiah(c.totalRevenue)}</strong>
    </div>
  `).join('')

  const paymentRows = data.paymentBreakdown.map(p => `
    <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #cbd5e1; font-size: 11.5px;">
      <span style="color: #475569;">${p.paymentMethod} (${p.count} trx)</span>
      <strong style="color: #0f172a;">${formatRupiah(p.totalRevenue)}</strong>
    </div>
  `).join('')

  const salesRows = data.recentSales.slice(0, 15).map((s, idx) => `
    <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; font-size: 11px;">
      <td style="padding: 7px 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-weight: 700;">${s.invoiceNumber}</td>
      <td style="padding: 7px 10px; border-bottom: 1px solid #e2e8f0;">${s.customerName}</td>
      <td style="padding: 7px 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${s.channel}</td>
      <td style="padding: 7px 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${s.paymentMethod}</td>
      <td style="padding: 7px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700;">${formatRupiah(s.totalPrice)}</td>
      <td style="padding: 7px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #166534; font-weight: 700;">${formatRupiah(s.profit)}</td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <title>Laporan Keuangan DapurTwin - ${rangeLabel}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #1e293b;
          background: #ffffff;
          padding: 24px;
          line-height: 1.45;
          font-size: 12px;
        }
        @page {
          size: A4 portrait;
          margin: 15mm;
        }
        @media print {
          body { padding: 0; }
          .page-break { page-break-after: always; }
          .no-break { break-inside: avoid; }
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 16px;
          border-bottom: 2px solid #0f172a;
          margin-bottom: 20px;
        }
        .logo-box {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .badge {
          display: inline-block;
          background: #ffb800;
          color: #2b1d00;
          font-weight: 800;
          font-size: 18px;
          padding: 6px 14px;
          border-radius: 8px;
          letter-spacing: -0.5px;
        }
        .title {
          font-size: 18px;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.3px;
        }
        .subtitle {
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
          margin-top: 2px;
        }
        .meta {
          text-align: right;
          font-size: 11px;
        }
        .meta strong { color: #0f172a; font-size: 12px; }
        .section-title {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #475569;
          margin-bottom: 8px;
        }
        .grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        .stat-card {
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px;
          background: #f8fafc;
        }
        .stat-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 4px;
        }
        .stat-val {
          font-size: 17px;
          font-weight: 900;
          color: #0f172a;
        }
        .stat-sub {
          font-size: 10px;
          color: #64748b;
          margin-top: 3px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 11.5px;
        }
        th {
          background: #f1f5f9;
          color: #334155;
          font-weight: 800;
          font-size: 10.5px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          padding: 9px 10px;
          border-top: 1px solid #e2e8f0;
          border-bottom: 2px solid #cbd5e1;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }
        .box {
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 14px;
          background: #ffffff;
        }
        .footer {
          margin-top: 30px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          font-size: 11px;
          color: #64748b;
        }
        .signature-box {
          text-align: center;
          width: 160px;
        }
        .signature-line {
          border-bottom: 1px solid #94a3b8;
          margin-top: 45px;
          margin-bottom: 4px;
        }
      </style>
    </head>
    <body>
      <!-- Header Dokumen -->
      <div class="header">
        <div class="logo-box">
          <span class="badge">DapurTwin</span>
          <div>
            <div class="title">LAPORAN KEUANGAN & STATISTIK DAPUR</div>
            <div class="subtitle">Rekapitulasi Omzet, Profit Bersih, Resep Menu & Bahan Baku</div>
          </div>
        </div>
        <div class="meta">
          <div>Periode: <strong>${rangeLabel}</strong></div>
          <div style="color: #64748b; margin-top: 2px;">Dicetak: ${currentDate} WIB</div>
        </div>
      </div>

      <!-- 1. Ringkasan Kinerja Finansial -->
      <div class="section-title">1. Ringkasan Eksekutif Finansial</div>
      <div class="grid-3">
        <div class="stat-card" style="background: #fffbeb; border-color: #fde68a;">
          <div class="stat-label" style="color: #b45309;">Total Omzet Kotor</div>
          <div class="stat-val" style="color: #78350f;">${formatRupiah(data.summary.totalRevenue)}</div>
          <div class="stat-sub" style="color: #92400e;">${data.summary.totalTransaksi} transaksi penjualan selesai</div>
        </div>

        <div class="stat-card" style="background: #f0fdf4; border-color: #bbf7d0;">
          <div class="stat-label" style="color: #15803d;">Estimasi Profit Bersih</div>
          <div class="stat-val" style="color: #14532d;">${formatRupiah(data.summary.totalProfit)}</div>
          <div class="stat-sub" style="color: #166534;">Rata-rata margin laba ${data.summary.profitMargin}%</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Beban Modal / HPP Resep</div>
          <div class="stat-val">${formatRupiah(data.summary.totalHPP)}</div>
          <div class="stat-sub">Rata-rata transaksi: ${formatRupiah(data.summary.averageBasketSize)}</div>
        </div>
      </div>

      <!-- 2. Menu Terlaris & Kontribusi Omzet -->
      <div class="no-break">
        <div class="section-title">2. Kinerja & Kontribusi Penjualan Menu</div>
        <table>
          <thead>
            <tr>
              <th style="text-align: left;">Nama Menu Kuliner</th>
              <th style="text-align: center;">Porsi Terjual</th>
              <th style="text-align: right;">Total Omzet</th>
              <th style="text-align: right;">Estimasi Laba Bersih</th>
            </tr>
          </thead>
          <tbody>
            ${menuRows || '<tr><td colspan="4" style="text-align:center; padding: 14px; color:#94a3b8;">Belum ada penjualan menu pada periode ini.</td></tr>'}
          </tbody>
        </table>
      </div>

      <!-- 3. Konsumsi Bahan Baku Resep -->
      <div class="no-break">
        <div class="section-title">3. Akumulasi Konsumsi Bahan Baku Resep</div>
        <table>
          <thead>
            <tr>
              <th style="text-align: left;">Nama Bahan Baku</th>
              <th style="text-align: center;">Total Kuantitas Dipakai</th>
              <th style="text-align: right;">Estimasi Biaya Bahan (HPP)</th>
            </tr>
          </thead>
          <tbody>
            ${bahanRows || '<tr><td colspan="3" style="text-align:center; padding: 14px; color:#94a3b8;">Belum ada bahan yang terpotong pada periode ini.</td></tr>'}
          </tbody>
        </table>
      </div>

      <!-- 4. Saluran & Metode Pembayaran -->
      <div class="no-break">
        <div class="grid-2">
          <div class="box">
            <div class="section-title" style="margin-bottom: 10px;">Saluran Penjualan</div>
            ${channelRows || '<div style="color:#94a3b8; font-size:11px;">Tidak ada data saluran</div>'}
          </div>
          <div class="box">
            <div class="section-title" style="margin-bottom: 10px;">Metode Pembayaran Kasir</div>
            ${paymentRows || '<div style="color:#94a3b8; font-size:11px;">Tidak ada data pembayaran</div>'}
          </div>
        </div>
      </div>

      <!-- 5. Rincian Nota Penjualan Terakhir -->
      <div class="no-break">
        <div class="section-title">5. Riwayat Nota Transaksi Penjualan Terakhir</div>
        <table>
          <thead>
            <tr>
              <th style="text-align: left;">No. Invoice</th>
              <th style="text-align: left;">Pelanggan</th>
              <th style="text-align: center;">Saluran</th>
              <th style="text-align: center;">Metode</th>
              <th style="text-align: right;">Total Omzet</th>
              <th style="text-align: right;">Profit</th>
            </tr>
          </thead>
          <tbody>
            ${salesRows || '<tr><td colspan="6" style="text-align:center; padding: 14px; color:#94a3b8;">Tidak ada transaksi tercatat.</td></tr>'}
          </tbody>
        </table>
      </div>

      <!-- Footer & Pengesahan Dokumen -->
      <div class="footer no-break">
        <div>
          <strong style="color: #0f172a;">DapurTwin Management System</strong>
          <div style="font-size: 10.5px; color: #64748b; margin-top: 2px;">
            Laporan finansial ini digenerate secara otomatis dari database transaksi real-time.
          </div>
        </div>
        <div class="signature-box">
          <div>Chef / Pengelola Usaha,</div>
          <div class="signature-line"></div>
          <div style="font-size: 10px; color: #94a3b8;">( Penanggung Jawab )</div>
        </div>
      </div>
    </body>
    </html>
  `
}
