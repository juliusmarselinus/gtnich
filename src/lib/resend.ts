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
            <p style="font-size: 13px; line-height: 1.6; color: #8C7560; margin: 0 0 24px 0;">
              Jika ini adalah Anda, Anda tidak perlu melakukan tindakan apa pun. Apabila Anda tidak merasa melakukan aktivitas ini, segera amankan kata sandi atau akun Anda.
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
    text: `Halo ${greetingName}, akun DapurTwin Anda baru saja masuk pada ${formattedTime} WIB via ${loginMethod}.`,
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

            <h3 style="font-size: 14px; font-weight: 800; margin: 20px 0 10px 0; color: #2B221C;">Daftar Bahan yang Dipesan:</h3>
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
    text: `Purchase Order baru ${noPO} untuk supplier ${supplierName} senilai ${formattedTotal} telah dibuat di DapurTwin.`,
  })
}
