import { formatRupiah } from '@/lib/mock-data'
import type { ReceiptData } from '../components/Receipt'

export function generateReceiptPrintHTML(data: ReceiptData): string {
  const tgl = new Date(data.createdAt).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const showCash = data.cashReceived != null && data.cashReceived > 0

  const itemsHTML = data.items.map(it => `
    <div style="margin-bottom: 6px;">
      <div style="font-weight: 700; color: #000;">${it.namaMenu}</div>
      <div style="display: flex; justify-content: space-between; font-size: 11px; color: #333;">
        <span>${it.qty} x ${formatRupiah(it.hargaJual)}</span>
        <span style="font-weight: 700;">${formatRupiah(it.subtotal)}</span>
      </div>
    </div>
  `).join('')

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <title>Struk - ${data.invoiceNumber || 'Transaksi'}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: "Courier New", Courier, monospace, monospace;
          background: #ffffff;
          color: #000000;
          font-size: 12px;
          line-height: 1.4;
          padding: 8px 10px;
          width: 80mm;
          margin: 0 auto;
        }
        @page {
          size: 80mm auto;
          margin: 0;
        }
        @media print {
          body {
            width: 100%;
            padding: 4mm 6mm;
          }
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: 700; }
        .dash {
          border-top: 1px dashed #444;
          margin: 8px 0;
        }
        .flex-between {
          display: flex;
          justify-content: space-between;
          gap: 8px;
        }
        .row-meta {
          font-size: 11px;
          margin-bottom: 2px;
        }
        .row-meta .label {
          color: #555;
        }
        .brand-title {
          font-size: 16px;
          font-weight: 900;
          letter-spacing: -0.5px;
          text-transform: uppercase;
        }
        .brand-sub {
          font-size: 11px;
          color: #444;
        }
        .total-row {
          font-size: 14px;
          font-weight: 900;
          padding: 3px 0;
        }
        .footer-text {
          font-size: 10.5px;
          color: #555;
          text-align: center;
          margin-top: 6px;
        }
      </style>
    </head>
    <body>
      <div class="text-center" style="margin-bottom: 6px;">
        <div class="brand-title">DAPURTWIN</div>
        <div class="brand-sub">Struk Pembayaran Kasir</div>
        ${data.isPreview ? '<div style="font-size: 10px; font-weight: bold; margin-top: 2px;">*** PRATINJAU TRANSAKSI ***</div>' : ''}
      </div>

      <div class="dash"></div>

      <div class="row-meta flex-between">
        <span class="label">No. Nota</span>
        <span class="font-bold text-right">${data.invoiceNumber || 'Dibuat saat bayar'}</span>
      </div>
      <div class="row-meta flex-between">
        <span class="label">Waktu</span>
        <span class="text-right">${tgl}</span>
      </div>
      <div class="row-meta flex-between">
        <span class="label">Kasir</span>
        <span class="text-right">${data.cashierName}</span>
      </div>
      ${data.customerName ? `
        <div class="row-meta flex-between">
          <span class="label">Pelanggan</span>
          <span class="text-right font-bold">${data.customerName}</span>
        </div>
      ` : ''}
      ${data.customerEmail ? `
        <div class="row-meta flex-between">
          <span class="label">E-Receipt</span>
          <span class="text-right" style="font-size: 10px;">${data.customerEmail}</span>
        </div>
      ` : ''}

      <div class="dash"></div>

      <div>
        ${itemsHTML}
      </div>

      <div class="dash"></div>

      <div class="flex-between total-row">
        <span>TOTAL</span>
        <span>${formatRupiah(data.total)}</span>
      </div>

      <div style="font-size: 11px; margin-top: 4px;">
        <div class="flex-between" style="margin-bottom: 2px;">
          <span style="color: #555;">Metode Bayar</span>
          <span class="font-bold">${data.paymentMethod}</span>
        </div>
        ${showCash ? `
          <div class="flex-between" style="margin-bottom: 2px;">
            <span style="color: #555;">Uang Diterima</span>
            <span>${formatRupiah(data.cashReceived as number)}</span>
          </div>
        ` : ''}
        ${showCash && data.changeAmount != null ? `
          <div class="flex-between font-bold">
            <span>Kembalian</span>
            <span>${formatRupiah(data.changeAmount)}</span>
          </div>
        ` : ''}
      </div>

      ${data.notes ? `
        <div class="dash"></div>
        <div style="font-size: 10.5px;">
          <span style="color: #555;">Catatan: </span>
          <span>${data.notes}</span>
        </div>
      ` : ''}

      <div class="dash"></div>
      <div class="footer-text">
        Terima kasih atas pesanan Anda!<br>Selamat menikmati hidangan kami.
      </div>
    </body>
    </html>
  `
}
