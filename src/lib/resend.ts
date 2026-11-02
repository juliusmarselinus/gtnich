import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY || ''
const resend = resendApiKey ? new Resend(resendApiKey) : null

// Default sender untuk Resend domain testing: 'DapurTwin <onboarding@resend.dev>'
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'DapurTwin <onboarding@resend.dev>'

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

/**
 * Helper untuk mengirim email menggunakan Resend API
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  if (!resend) {
    console.warn('[Resend] RESEND_API_KEY belum dikonfigurasi di environment.')
    return { success: false, error: 'RESEND_API_KEY is not configured' }
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    })

    if (data.error) {
      console.error('[Resend] Gagal kirim email:', data.error)
      return { success: false, error: data.error }
    }

    return { success: true, data: data.data }
  } catch (error: unknown) {
    const err = error as Error
    console.error('[Resend] Exception saat kirim email:', err.message)
    return { success: false, error: err.message }
  }
}

/**
 * Template & Pengiriman Email Notifikasi Login
 */
export async function sendLoginNotificationEmail({
  email,
  userName,
  loginMethod = 'Email & Kata Sandi',
  loginTime = new Date(),
  ipAddress,
}: {
  email: string
  userName?: string
  loginMethod?: string
  loginTime?: Date
  ipAddress?: string
}) {
  const formattedTime = loginTime.toLocaleString('id-ID', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: 'Asia/Jakarta',
  })

  const greetingName = userName || email.split('@')[0]

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Notifikasi Masuk Akun DapurTwin</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FFF8EE; margin: 0; padding: 24px; color: #2B221C;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 24px; border: 1px solid #F2E3D0; overflow: hidden; box-shadow: 0 4px 20px rgba(178, 98, 20, 0.08);">
          <div style="background-color: #FF8F28; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">DapurTwin</h1>
            <p style="color: #FFF2E0; margin: 6px 0 0 0; font-size: 13px;">Asisten Pintar Operasional Dapur Kuliner</p>
          </div>
          <div style="padding: 28px 24px;">
            <p style="font-size: 16px; margin: 0 0 16px 0; font-weight: 600;">Halo, ${greetingName}! 👋</p>
            <p style="font-size: 14px; line-height: 1.6; color: #6F5C4A; margin: 0 0 20px 0;">
              Kami mendeteksi adanya aktivitas login baru ke akun DapurTwin Anda. Berikut rincian aktivitas masuk:
            </p>
            <div style="background-color: #FFFBF5; border: 1.5px solid #F2E3D0; border-radius: 16px; padding: 16px; margin-bottom: 20px; font-size: 13px; line-height: 1.7;">
              <div><strong>Akun Email:</strong> ${email}</div>
              <div><strong>Metode Masuk:</strong> ${loginMethod}</div>
              <div><strong>Waktu:</strong> ${formattedTime} WIB</div>
              ${ipAddress ? `<div><strong>IP Address:</strong> ${ipAddress}</div>` : ''}
            </div>

            <!-- List data yang dikirim ke email ini -->
            <div style="background-color: #F8F4EE; border-radius: 14px; padding: 14px 16px; margin-bottom: 20px;">
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #6F5C4A; text-transform: uppercase; letter-spacing: 0.5px;">
                📋 Rincian Data Dalam Email Ini:
              </p>
              <ul style="margin: 0; padding-left: 18px; font-size: 12.5px; color: #524336; line-height: 1.6;">
                <li>Alamat email akun login DapurTwin</li>
                <li>Metode autentikasi (Google OAuth / Email & Kata Sandi)</li>
                <li>Waktu dan tanggal aktivitas masuk</li>
                ${ipAddress ? '<li>Alamat IP perangkat login</li>' : '<li>Status keamanan sesi akun</li>'}
              </ul>
            </div>

            <!-- Catatan No-Reply & Otomatis -->
            <div style="background-color: #FFF0E0; border-left: 4px solid #FF8F28; border-radius: 8px; padding: 12px 14px; margin-bottom: 22px;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #8F4C0D;">
                ℹ️ <strong>Pemberitahuan Otomatis:</strong> Email ini dikirim secara otomatis oleh sistem DapurTwin untuk keamanan akun Anda. <strong>Mohon untuk tidak membalas email ini</strong> karena pesan balasan tidak dipantau.
              </p>
            </div>

            <p style="font-size: 13px; line-height: 1.6; color: #8C7560; margin: 0 0 24px 0;">
              Jika ini adalah Anda, Anda tidak perlu melakukan tindakan apa pun. Apabila Anda tidak merasa melakukan aktivitas ini, segera amankan kata sandi akun Anda.
            </p>
            <div style="text-align: center;">
              <a href="https://dapurtwin.app/dashboard" style="display: inline-block; background-color: #FF8F28; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 50px;">
                Buka Dashboard Dapur
              </a>
            </div>
          </div>
          <div style="background-color: #FAF6F0; padding: 16px 24px; text-align: center; font-size: 11px; color: #BCA184; border-top: 1px solid #F2E3D0;">
            © ${new Date().getFullYear()} DapurTwin. Kelola bahan, resep, dan pesanan dapur kuliner dengan rapi.
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: `🔐 Notifikasi Masuk Akun DapurTwin (${greetingName})`,
    html,
    text: `Halo ${greetingName}, akun DapurTwin Anda baru saja masuk pada ${formattedTime} WIB via ${loginMethod}. Email ini dikirim otomatis oleh sistem, mohon untuk tidak membalas.`,
  })
}

/**
 * Template & Pengiriman Email Notifikasi Purchase Order
 */
export async function sendPurchaseOrderNotificationEmail({
  email,
  storeName,
  ownerName,
  noPO,
  supplierName,
  totalEstimasi,
  items,
  catatan,
}: {
  email: string
  storeName?: string
  ownerName?: string
  noPO: string
  supplierName: string
  totalEstimasi: number
  items: Array<{
    namaBahan: string
    qty: number
    satuan: string
    hargaEstimasi: number
  }>
  catatan?: string | null
}) {
  const formattedTotal = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(totalEstimasi)

  const itemsRows = items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #F2E3D0;">
        <td style="padding: 10px 8px; font-weight: 600; color: #2B221C;">${item.namaBahan}</td>
        <td style="padding: 10px 8px; text-align: center; color: #6F5C4A;">${item.qty} ${item.satuan}</td>
        <td style="padding: 10px 8px; text-align: right; color: #2B221C;">
          ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.hargaEstimasi)}
        </td>
        <td style="padding: 10px 8px; text-align: right; font-weight: 700; color: #B5560A;">
          ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.qty * item.hargaEstimasi)}
        </td>
      </tr>
    `
    )
    .join('')

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Purchase Order Baru Dibuat - ${noPO}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FFF8EE; margin: 0; padding: 24px; color: #2B221C;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; border: 1px solid #F2E3D0; overflow: hidden; box-shadow: 0 4px 20px rgba(178, 98, 20, 0.08);">
          <div style="background-color: #FF8F28; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">DapurTwin</h1>
            <p style="color: #FFF2E0; margin: 6px 0 0 0; font-size: 13px;">Pembelian Stok Bahan Baku Baru</p>
          </div>
          <div style="padding: 28px 24px;">
            <p style="font-size: 16px; margin: 0 0 8px 0; font-weight: 700;">Pesanan Pembelian (PO) Berhasil Dibuat! 📋</p>
            <p style="font-size: 14px; line-height: 1.6; color: #6F5C4A; margin: 0 0 20px 0;">
              Halo <strong>${ownerName || 'Chef'}</strong>${storeName ? ` (${storeName})` : ''}, ada Purchase Order baru yang baru saja dicatat di sistem operasional dapur Anda.
            </p>
            
            <div style="background-color: #FFFBF5; border: 1.5px solid #F2E3D0; border-radius: 16px; padding: 16px; margin-bottom: 20px; font-size: 13px; line-height: 1.7;">
              <div><strong>Nomor PO:</strong> <span style="font-family: monospace; color: #B5560A; font-weight: 700;">${noPO}</span></div>
              <div><strong>Supplier / Toko:</strong> ${supplierName}</div>
              <div><strong>Tanggal Pembuatan:</strong> ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</div>
              <div><strong>Total Estimasi Biaya:</strong> <span style="font-size: 15px; font-weight: 800; color: #2B221C;">${formattedTotal}</span></div>
              ${catatan ? `<div><strong>Catatan:</strong> <em>"${catatan}"</em></div>` : ''}
            </div>

            <!-- List data yang dikirim ke email ini -->
            <div style="background-color: #F8F4EE; border-radius: 14px; padding: 14px 16px; margin-bottom: 20px;">
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #6F5C4A; text-transform: uppercase; letter-spacing: 0.5px;">
                📋 Rincian Data Dalam Email Ini:
              </p>
              <ul style="margin: 0; padding-left: 18px; font-size: 12.5px; color: #524336; line-height: 1.6;">
                <li>Nomor referensi Purchase Order (${noPO})</li>
                <li>Nama vendor / supplier yang dituju (${supplierName})</li>
                <li>Rincian ${items.length} item bahan baku (nama bahan, kuantitas, satuan, dan harga)</li>
                <li>Total estimasi nominal pembelanjaan (${formattedTotal})</li>
                <li>Catatan pengadaan bahan dari tim dapur</li>
              </ul>
            </div>

            <h3 style="font-size: 14px; font-weight: 800; margin: 20px 0 10px 0; color: #2B221C;">Tabel Rincian Bahan yang Dipesan:</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 12.5px; margin-bottom: 24px;">
              <thead>
                <tr style="background-color: #FAF4EB; text-align: left; border-bottom: 2px solid #E8D7C3;">
                  <th style="padding: 10px 8px; color: #6F5C4A;">Bahan</th>
                  <th style="padding: 10px 8px; text-align: center; color: #6F5C4A;">Jumlah</th>
                  <th style="padding: 10px 8px; text-align: right; color: #6F5C4A;">Harga Est.</th>
                  <th style="padding: 10px 8px; text-align: right; color: #6F5C4A;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <!-- Catatan No-Reply & Otomatis -->
            <div style="background-color: #FFF0E0; border-left: 4px solid #FF8F28; border-radius: 8px; padding: 12px 14px; margin-bottom: 22px;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #8F4C0D;">
                ℹ️ <strong>Pemberitahuan Otomatis:</strong> Email ini dibuat dan dikirim secara otomatis oleh sistem manajemen inventaris DapurTwin. <strong>Mohon untuk tidak membalas email ini</strong> secara langsung.
              </p>
            </div>

            <div style="text-align: center; margin-top: 24px;">
              <a href="https://dapurtwin.app/dashboard/purchase-order" style="display: inline-block; background-color: #FF8F28; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 50px;">
                Lihat di Dashboard Purchase Order
              </a>
            </div>
          </div>
          <div style="background-color: #FAF6F0; padding: 16px 24px; text-align: center; font-size: 11px; color: #BCA184; border-top: 1px solid #F2E3D0;">
            © ${new Date().getFullYear()} DapurTwin · Sistem Manajemen & Inventaris Dapur Cerdas.
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: `📦 Purchase Order Baru: ${noPO} - ${supplierName} (${formattedTotal})`,
    html,
    text: `Purchase Order baru ${noPO} untuk supplier ${supplierName} senilai ${formattedTotal} telah dibuat di DapurTwin. Email ini dikirim secara otomatis, mohon untuk tidak membalas.`,
  })
}

/**
 * Template & Pengiriman Email Struk Penjualan / Notifikasi Transaksi Kasir
 * Bisa dikirim ke pelanggan (sebagai e-receipt) maupun ke owner dapur
 */
export async function sendSaleTransactionEmail({
  email,
  isCustomerCopy = false,
  storeName = 'DapurTwin',
  ownerName,
  invoiceNumber,
  customerName = 'Pelanggan Umum',
  customerPhone,
  customerEmail,
  paymentMethod = 'Tunai / Cash',
  paymentStatus = 'Lunas',
  subtotal,
  discount = 0,
  totalPrice,
  cashReceived,
  changeAmount,
  cashierName = 'Kasir Dapur',
  notes,
  items,
  createdAt = new Date(),
}: {
  email: string
  isCustomerCopy?: boolean
  storeName?: string
  ownerName?: string
  invoiceNumber: string
  customerName?: string
  customerPhone?: string | null
  customerEmail?: string | null
  paymentMethod?: string
  paymentStatus?: string
  subtotal: number
  discount?: number
  totalPrice: number
  cashReceived?: number | null
  changeAmount?: number | null
  cashierName?: string
  notes?: string | null
  items: Array<{
    namaMenu: string
    qty: number
    hargaJual: number
    subtotal: number
  }>
  createdAt?: Date | string
}) {
  const formattedTotal = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(totalPrice)

  const tgl = new Date(createdAt).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  })

  const showCash = paymentMethod?.toLowerCase().includes('tunai') || (cashReceived != null && cashReceived > 0)

  // Desain struk thermal digital bersih, sama persis dengan struk POS
  const itemsListHtml = items
    .map(
      (item) => `
      <div style="margin-bottom: 10px;">
        <div style="font-weight: 700; color: #1e293b; font-size: 13px;">${item.namaMenu}</div>
        <div style="display: flex; justify-content: space-between; font-size: 11.5px; color: #64748b; margin-top: 2px;">
          <span>${item.qty} x ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.hargaJual)}</span>
          <span style="font-weight: 700; color: #1e293b;">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.subtotal)}</span>
        </div>
      </div>
    `
    )
    .join('')

  const dashBorder = `border-top: 1px dashed #cbd5e1; margin: 12px 0;`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Struk Pembayaran - ${invoiceNumber}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Courier New', Courier, monospace, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px 12px; color: #1e293b;">
        <div style="max-width: 360px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 24px 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); font-family: 'Courier New', Courier, monospace, monospace;">
          
          <!-- Header Struk -->
          <div style="text-align: center; margin-bottom: 12px;">
            <div style="font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px;">${storeName}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Struk Pembayaran</div>
          </div>

          <div style="${dashBorder}"></div>

          <!-- Info Transaksi -->
          <div style="font-size: 11.5px; line-height: 1.6; color: #334155;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">No. Nota</span>
              <span style="font-weight: 700; color: #0f172a;">${invoiceNumber}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">Waktu</span>
              <span>${tgl}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">Kasir</span>
              <span>${cashierName}</span>
            </div>
            ${customerName && customerName !== 'Pelanggan Umum' ? `
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">Pelanggan</span>
              <span>${customerName}</span>
            </div>` : ''}
          </div>

          <div style="${dashBorder}"></div>

          <!-- Daftar Menu Pesanan -->
          <div style="margin: 8px 0;">
            ${itemsListHtml}
          </div>

          <div style="${dashBorder}"></div>

          <!-- Total Belanja -->
          <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 800; color: #0f172a; margin: 4px 0;">
            <span>TOTAL</span>
            <span>${formattedTotal}</span>
          </div>

          <!-- Rincian Metode & Pembayaran -->
          <div style="margin-top: 8px; font-size: 11.5px; line-height: 1.6; color: #334155;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">Metode</span>
              <span>${paymentMethod}</span>
            </div>
            ${showCash && cashReceived != null && cashReceived > 0 ? `
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">Uang diterima</span>
              <span>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(cashReceived)}</span>
            </div>` : ''}
            ${showCash && changeAmount != null ? `
            <div style="display: flex; justify-content: space-between; font-weight: 700;">
              <span style="color: #64748b; font-weight: normal;">Kembalian</span>
              <span>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(changeAmount)}</span>
            </div>` : ''}
          </div>

          ${notes ? `
          <div style="${dashBorder}"></div>
          <div style="font-size: 11px; color: #475569;">
            <span style="color: #64748b;">Catatan: </span>${notes}
          </div>` : ''}

          <div style="${dashBorder}"></div>

          <!-- Ucapan Penutup Struk -->
          <div style="text-align: center; font-size: 11px; color: #64748b; margin-top: 10px;">
            Terima kasih, selamat menikmati!
          </div>

          <!-- Pemberitahuan Otomatis Ringkas Sesuai Aturan -->
          <div style="margin-top: 18px; padding-top: 10px; border-top: 1px dotted #cbd5e1; text-align: center; font-size: 10px; color: #94a3b8; line-height: 1.4;">
            Email struk ini dikirim secara otomatis. Mohon untuk tidak membalas.
          </div>
        </div>
      </body>
    </html>
  `

  const subject = isCustomerCopy
    ? `🧾 Struk Pembayaran ${storeName} - ${invoiceNumber} (${formattedTotal})`
    : `💰 Transaksi Penjualan: ${invoiceNumber} - ${formattedTotal}`

  return sendEmail({
    to: email,
    subject,
    html,
    text: `Struk Pembayaran ${storeName} - ${invoiceNumber}. Total: ${formattedTotal}. Metode: ${paymentMethod}. Email ini dikirim secara otomatis, mohon untuk tidak membalas.`,
  })
}
