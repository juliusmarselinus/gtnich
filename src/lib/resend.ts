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
 * Template & Pengiriman Email Selamat Datang & Registrasi Berhasil (Congratulations)
 */
export async function sendWelcomeRegistrationEmail({
  email,
  userName,
  storeName,
  registrationMethod = 'Email & Kata Sandi',
}: {
  email: string
  userName?: string
  storeName?: string
  registrationMethod?: string
}) {
  const greetingName = userName || email.split('@')[0]
  const kitchenName = storeName || `Dapur ${greetingName}`

  const methodLabel = registrationMethod.includes('Google')
    ? 'Akun Google'
    : 'Email dan Kata Sandi'

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Selamat Datang di DapurTwin - Pendaftaran Berhasil!</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FFF8EE; margin: 0; padding: 24px; color: #2B221C;">
        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; border: 1px solid #F2E3D0; overflow: hidden; box-shadow: 0 4px 20px rgba(178, 98, 20, 0.08);">
          <div style="background-color: #FF8F28; padding: 28px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">DapurTwin</h1>
            <p style="color: #FFF2E0; margin: 6px 0 0 0; font-size: 13.5px;">Aplikasi Pembukuan & Kasir Dapur Kuliner</p>
          </div>
          
          <div style="padding: 28px 24px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-size: 36px; display: inline-block;">🎉</span>
              <h2 style="font-size: 20px; font-weight: 800; color: #2B221C; margin: 8px 0 4px 0;">Selamat Bergabung, ${greetingName}!</h2>
              <p style="font-size: 14px; color: #6F5C4A; margin: 0;">Pendaftaran akun usaha Anda telah berhasil dan langsung aktif.</p>
            </div>

            <p style="font-size: 14px; line-height: 1.6; color: #524336; margin: 0 0 20px 0;">
              Halo <strong>${greetingName}</strong>, selamat datang di DapurTwin! Sekarang pencatatan belanja bahan, resep menu, kasir jualan, dan keuntungan dapur <strong>${kitchenName}</strong> bisa dikelola dengan jauh lebih mudah dan rapi tanpa ribet.
            </p>

            <div style="background-color: #FFFBF5; border: 1.5px solid #F2E3D0; border-radius: 16px; padding: 16px; margin-bottom: 20px; font-size: 13px; line-height: 1.8;">
              <div><strong>Alamat Email:</strong> <span style="color: #B5560A; font-weight: 700;">${email}</span></div>
              <div><strong>Nama Pemilik:</strong> ${greetingName}</div>
              <div><strong>Nama Dapur / Toko:</strong> ${kitchenName}</div>
              <div><strong>Cara Mendaftar:</strong> ${methodLabel}</div>
              <div><strong>Tanggal Terdaftar:</strong> ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</div>
            </div>

            <!-- Rincian isi email -->
            <div style="background-color: #F8F4EE; border-radius: 14px; padding: 14px 16px; margin-bottom: 20px;">
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #6F5C4A; text-transform: uppercase; letter-spacing: 0.5px;">
                📋 Informasi di Email Ini:
              </p>
              <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #524336; line-height: 1.6;">
                <li>Konfirmasi bahwa akun usaha Anda sudah aktif</li>
                <li>Rincian nama pemilik dan nama dapur Anda</li>
                <li>Panduan praktis 3 langkah mudah mulai jualan</li>
              </ul>
            </div>

            <div style="background-color: #FAF4EB; border-radius: 14px; padding: 16px; margin-bottom: 22px; font-size: 13px; line-height: 1.8; color: #524336;">
              <strong style="color: #2B221C; display: block; margin-bottom: 6px; font-size: 13.5px;">🍳 3 Langkah Mudah Mulai Pakai DapurTwin:</strong>
              1. <strong>Catat Bahan Baku:</strong> Masukkan stok bahan dan harga beli yang biasa Anda beli di pasar / supplier.<br/>
              2. <strong>Bikin Menu & Resep:</strong> Masukkan menu jualan Anda. Modal per porsi (HPP) dan keuntungan akan dihitung otomatis.<br/>
              3. <strong>Buka Kasir Penjualan:</strong> Catat setiap pesanan pembeli di menu Kasir. Stok bahan dapur Anda otomatis berkurang sendiri tanpa perlu hitung manual.
            </div>

            <!-- Catatan No-Reply & Otomatis ramah non-IT -->
            <div style="background-color: #FFF0E0; border-left: 4px solid #FF8F28; border-radius: 8px; padding: 12px 14px; margin-bottom: 22px;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #8F4C0D;">
                ℹ️ <strong>Surat Otomatis:</strong> Pesan ini dikirim secara otomatis oleh aplikasi DapurTwin. <strong>Anda tidak perlu membalas email ini.</strong>
              </p>
            </div>

            <div style="text-align: center; margin-top: 24px;">
              <a href="https://dapurtwin.app/dashboard" style="display: inline-block; background-color: #FF8F28; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 30px; border-radius: 50px; box-shadow: 0 4px 12px rgba(255, 143, 40, 0.3);">
                Buka & Mulai Atur Dapur
              </a>
            </div>
          </div>
          
          <div style="background-color: #FAF6F0; padding: 16px 24px; text-align: center; font-size: 11px; color: #BCA184; border-top: 1px solid #F2E3D0;">
            © ${new Date().getFullYear()} DapurTwin · Sahabat operasional dan hitung untung dapur kuliner Anda.
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: `🎉 Selamat Bergabung di DapurTwin, ${greetingName}! Akun Usaha Anda Siap Digunakan`,
    html,
    text: `Selamat datang ${greetingName}! Pendaftaran akun dapur Anda di DapurTwin telah berhasil. Kelola bahan baku, resep menu, kasir penjualan, dan pantau keuntungan usaha kuliner Anda dengan mudah. Email ini dikirim secara otomatis, mohon untuk tidak membalas.`,
  })
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

  const methodLabel = loginMethod.includes('Google')
    ? 'Akun Google'
    : 'Email dan Kata Sandi'

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Pemberitahuan Masuk Akun DapurTwin</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FFF8EE; margin: 0; padding: 24px; color: #2B221C;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 24px; border: 1px solid #F2E3D0; overflow: hidden; box-shadow: 0 4px 20px rgba(178, 98, 20, 0.08);">
          <div style="background-color: #FF8F28; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">DapurTwin</h1>
            <p style="color: #FFF2E0; margin: 6px 0 0 0; font-size: 13px;">Keamanan & Pemberitahuan Akun</p>
          </div>
          <div style="padding: 28px 24px;">
            <p style="font-size: 16px; margin: 0 0 16px 0; font-weight: 600;">Halo, ${greetingName}! 👋</p>
            <p style="font-size: 14px; line-height: 1.6; color: #6F5C4A; margin: 0 0 20px 0;">
              Kami memberitahukan bahwa akun DapurTwin Anda baru saja dibuka (masuk/login). Berikut rincian waktunya:
            </p>
            <div style="background-color: #FFFBF5; border: 1.5px solid #F2E3D0; border-radius: 16px; padding: 16px; margin-bottom: 20px; font-size: 13px; line-height: 1.8;">
              <div><strong>Akun Email:</strong> ${email}</div>
              <div><strong>Cara Masuk:</strong> ${methodLabel}</div>
              <div><strong>Waktu Masuk:</strong> ${formattedTime} WIB</div>
            </div>

            <!-- List data yang dikirim ke email ini -->
            <div style="background-color: #F8F4EE; border-radius: 14px; padding: 14px 16px; margin-bottom: 20px;">
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #6F5C4A; text-transform: uppercase; letter-spacing: 0.5px;">
                📋 Rincian Informasi di Email Ini:
              </p>
              <ul style="margin: 0; padding-left: 18px; font-size: 12.5px; color: #524336; line-height: 1.6;">
                <li>Alamat email yang digunakan untuk membuka akun</li>
                <li>Cara masuk (${methodLabel})</li>
                <li>Hari, tanggal, dan jam saat akun dibuka</li>
              </ul>
            </div>

            <!-- Catatan No-Reply & Otomatis -->
            <div style="background-color: #FFF0E0; border-left: 4px solid #FF8F28; border-radius: 8px; padding: 12px 14px; margin-bottom: 22px;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #8F4C0D;">
                ℹ️ <strong>Pemberitahuan Otomatis:</strong> Pesan ini dikirim otomatis demi menjaga keamanan akun dapur Anda. <strong>Mohon untuk tidak membalas email ini.</strong>
              </p>
            </div>

            <p style="font-size: 13px; line-height: 1.6; color: #8C7560; margin: 0 0 24px 0;">
              Jika memang Anda yang baru saja membuka akun, Anda bisa mengabaikan pesan ini. Namun jika bukan Anda, segera ganti kata sandi akun Anda agar tetap aman.
            </p>
            <div style="text-align: center;">
              <a href="https://dapurtwin.app/dashboard" style="display: inline-block; background-color: #FF8F28; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 50px;">
                Buka Halaman Utama Dapur
              </a>
            </div>
          </div>
          <div style="background-color: #FAF6F0; padding: 16px 24px; text-align: center; font-size: 11px; color: #BCA184; border-top: 1px solid #F2E3D0;">
            © ${new Date().getFullYear()} DapurTwin. Membantu usaha kuliner Anda makin rapi dan menguntungkan.
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: `🔐 Pemberitahuan: Akun DapurTwin Anda Baru Saja Dibuka (${greetingName})`,
    html,
    text: `Halo ${greetingName}, akun DapurTwin Anda baru saja dibuka pada ${formattedTime} WIB via ${methodLabel}. Email ini dikirim otomatis oleh sistem demi keamanan akun, mohon untuk tidak membalas.`,
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
            <p style="color: #FFF2E0; margin: 6px 0 0 0; font-size: 13px;">Belanja Stok Bahan Dapur</p>
          </div>
          <div style="padding: 28px 24px;">
            <p style="font-size: 16px; margin: 0 0 8px 0; font-weight: 700;">Pesanan Belanja Bahan Telah Dicatat! 📋</p>
            <p style="font-size: 14px; line-height: 1.6; color: #6F5C4A; margin: 0 0 20px 0;">
              Halo <strong>${ownerName || 'Chef'}</strong>${storeName ? ` (${storeName})` : ''}, daftar pesanan belanja bahan baru saja berhasil dicatat di DapurTwin.
            </p>
            
            <div style="background-color: #FFFBF5; border: 1.5px solid #F2E3D0; border-radius: 16px; padding: 16px; margin-bottom: 20px; font-size: 13px; line-height: 1.7;">
              <div><strong>Nomor Pesanan:</strong> <span style="font-family: monospace; color: #B5560A; font-weight: 700;">${noPO}</span></div>
              <div><strong>Toko / Supplier:</strong> ${supplierName}</div>
              <div><strong>Tanggal Dibuat:</strong> ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</div>
              <div><strong>Perkiraan Total Belanja:</strong> <span style="font-size: 15px; font-weight: 800; color: #2B221C;">${formattedTotal}</span></div>
              ${catatan ? `<div><strong>Catatan:</strong> <em>"${catatan}"</em></div>` : ''}
            </div>

            <!-- List data yang dikirim ke email ini -->
            <div style="background-color: #F8F4EE; border-radius: 14px; padding: 14px 16px; margin-bottom: 20px;">
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #6F5C4A; text-transform: uppercase; letter-spacing: 0.5px;">
                📋 Rincian Belanja di Email Ini:
              </p>
              <ul style="margin: 0; padding-left: 18px; font-size: 12.5px; color: #524336; line-height: 1.6;">
                <li>Nomor pesanan (${noPO})</li>
                <li>Toko atau tempat beli (${supplierName})</li>
                <li>Daftar ${items.length} macam bahan yang dibeli (nama bahan, banyak, dan harga satuan)</li>
                <li>Total perkiraan uang belanja (${formattedTotal})</li>
              </ul>
            </div>

            <h3 style="font-size: 14px; font-weight: 800; margin: 20px 0 10px 0; color: #2B221C;">Daftar Bahan yang Dipesan:</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 12.5px; margin-bottom: 24px;">
              <thead>
                <tr style="background-color: #FAF4EB; text-align: left; border-bottom: 2px solid #E8D7C3;">
                  <th style="padding: 10px 8px; color: #6F5C4A;">Bahan</th>
                  <th style="padding: 10px 8px; text-align: center; color: #6F5C4A;">Banyaknya</th>
                  <th style="padding: 10px 8px; text-align: right; color: #6F5C4A;">Harga Satuan</th>
                  <th style="padding: 10px 8px; text-align: right; color: #6F5C4A;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <!-- Catatan No-Reply & Otomatis -->
            <div style="background-color: #FFF0E0; border-left: 4px solid #FF8F28; border-radius: 8px; padding: 12px 14px; margin-bottom: 22px;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #8F4C0D;">
                ℹ️ <strong>Surat Otomatis:</strong> Pesan ini dikirim secara otomatis oleh aplikasi DapurTwin. <strong>Anda tidak perlu membalas email ini.</strong>
              </p>
            </div>

            <div style="text-align: center; margin-top: 24px;">
              <a href="https://dapurtwin.app/dashboard/purchase-order" style="display: inline-block; background-color: #FF8F28; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 50px;">
                Lihat Daftar Pembelian di Aplikasi
              </a>
            </div>
          </div>
          <div style="background-color: #FAF6F0; padding: 16px 24px; text-align: center; font-size: 11px; color: #BCA184; border-top: 1px solid #F2E3D0;">
            © ${new Date().getFullYear()} DapurTwin · Sahabat pencatatan belanja dapur kuliner Anda.
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: `📦 Pesanan Belanja Bahan: ${noPO} - ${supplierName} (${formattedTotal})`,
    html,
    text: `Pesanan belanja bahan baru ${noPO} untuk ${supplierName} senilai ${formattedTotal} telah dicatat di DapurTwin. Email ini dikirim secara otomatis, mohon untuk tidak membalas.`,
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

/**
 * Template & Pengiriman Email Peringatan Tagihan Belanja Bahan Melewati 1 Hari (Jatuh Tempo)
 */
export async function sendOverdueBillEmail({
  email,
  ownerName,
  storeName = 'DapurTwin',
  noPO,
  supplierName,
  totalTagihan,
  daysLate = 1,
  tanggalTerima,
}: {
  email: string
  ownerName?: string
  storeName?: string
  noPO: string
  supplierName: string
  totalTagihan: number
  daysLate?: number
  tanggalTerima?: string | Date
}) {
  const formattedTotal = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(totalTagihan)

  const formattedDate = tanggalTerima
    ? new Date(tanggalTerima).toLocaleDateString('id-ID', { dateStyle: 'full' })
    : '-'

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Pengingat Pembayaran Belanja Bahan - ${noPO}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FFF8EE; margin: 0; padding: 24px; color: #2B221C;">
        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; border: 1px solid #F2E3D0; overflow: hidden; box-shadow: 0 4px 20px rgba(178, 98, 20, 0.08);">
          <div style="background-color: #D8431F; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">${storeName}</h1>
            <p style="color: #FFF2E0; margin: 6px 0 0 0; font-size: 13px;">Pengingat Pembayaran Belanja Bahan Dapur</p>
          </div>
          
          <div style="padding: 26px 22px;">
            <p style="font-size: 16px; margin: 0 0 8px 0; font-weight: 700; color: #B3361B;">
              Ada Tagihan Belanja Bahan yang Belum Dibayar Lebih dari 1 Hari! ⚠️
            </p>
            <p style="font-size: 13.5px; line-height: 1.6; color: #6F5C4A; margin: 0 0 20px 0;">
              Halo <strong>${ownerName || 'Chef / Pemilik Dapur'}</strong>, bahan belanjaan dari toko/supplier sudah diterima di dapur sejak ${daysLate} hari yang lalu, namun catatan pembayarannya belum ditandai lunas di sistem.
            </p>
            
            <div style="background-color: #FFFBF5; border: 1.5px solid #F2E3D0; border-radius: 16px; padding: 16px; margin-bottom: 20px; font-size: 13px; line-height: 1.7;">
              <div><strong>Nomor Nota / Pesanan:</strong> <span style="font-family: monospace; color: #B5560A; font-weight: 700;">${noPO}</span></div>
              <div><strong>Nama Toko / Supplier:</strong> ${supplierName}</div>
              <div><strong>Tanggal Bahan Diterima di Dapur:</strong> ${formattedDate}</div>
              <div><strong>Jumlah yang Harus Dibayar:</strong> <span style="font-size: 15px; font-weight: 800; color: #B3361B;">${formattedTotal}</span></div>
              <div><strong>Status:</strong> <span style="color: #B3361B; font-weight: 700;">Belum Dibayar (&gt; ${daysLate} hari)</span></div>
            </div>

            <!-- List data yang dikirim ke email ini -->
            <div style="background-color: #F8F4EE; border-radius: 14px; padding: 14px 16px; margin-bottom: 20px;">
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #6F5C4A; text-transform: uppercase; letter-spacing: 0.5px;">
                📋 Rincian yang Kami Cantumkan di Surat Ini:
              </p>
              <ul style="margin: 0; padding-left: 18px; font-size: 12.5px; color: #524336; line-height: 1.6;">
                <li>Nomor nota catatan belanja (${noPO})</li>
                <li>Nama toko / supplier yang bersangkutan (${supplierName})</li>
                <li>Uang belanja yang perlu diselesaikan (${formattedTotal})</li>
                <li>Lama keterlambatan pembayaran (${daysLate} hari setelah bahan tiba)</li>
              </ul>
            </div>

            <div style="background-color: #FFF0E0; border-left: 4px solid #FF8F28; border-radius: 8px; padding: 12px 14px; margin-bottom: 22px;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #8F4C0D;">
                ℹ️ <strong>Surat Pengingat Otomatis:</strong> Surat ini dikirimkan otomatis oleh sistem DapurTwin untuk membantu menjaga kelancaran pasokan bahan dapur Anda. <strong>Mohon untuk tidak membalas email ini secara langsung.</strong>
              </p>
            </div>

            <div style="text-align: center; margin-top: 24px;">
              <a href="https://dapurtwin.app/dashboard/tagihan" style="display: inline-block; background-color: #D8431F; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 50px;">
                Buka & Tandai Lunas di Menu Tagihan
              </a>
            </div>
          </div>
          
          <div style="background-color: #FAF6F0; padding: 16px 24px; text-align: center; font-size: 11px; color: #BCA184; border-top: 1px solid #F2E3D0;">
            © ${new Date().getFullYear()} ${storeName} · DapurTwin Manajemen Operasional Dapur.
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: `⚠️ Pengingat Tagihan Bahan Lewat 1 Hari: ${noPO} - ${supplierName} (${formattedTotal})`,
    html,
    text: `Pengingat tagihan toko/supplier ${supplierName} untuk nota belanja ${noPO} sebesar ${formattedTotal} telah melewati 1 hari dan belum diselesaikan. Surat ini dikirim secara otomatis, mohon untuk tidak membalas.`,
  })
}

/**
 * Template & Pengiriman Email Laporan Harian Penjualan Otomatis (Jam 22:00)
 */
export async function sendDailySalesReportEmail({
  email,
  ownerName,
  storeName = 'DapurTwin',
  date = new Date(),
  totalSales,
  totalOrders,
  totalProfit,
  topMenus,
  paymentBreakdown,
}: {
  email: string
  ownerName?: string
  storeName?: string
  date?: Date | string
  totalSales: number
  totalOrders: number
  totalProfit: number
  topMenus: Array<{ namaMenu: string; qty: number; subtotal: number }>
  paymentBreakdown?: Array<{ method: string; total: number; count: number }>
}) {
  const formattedSales = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(totalSales)

  const formattedProfit = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(totalProfit)

  const formattedDate = new Date(date).toLocaleDateString('id-ID', {
    dateStyle: 'full',
    timeZone: 'Asia/Jakarta',
  })

  const topMenuRows = topMenus.length > 0
    ? topMenus
        .map(
          (m, idx) => `
        <tr style="border-bottom: 1px solid #F2E3D0;">
          <td style="padding: 9px 8px; font-weight: 600; color: #2B221C;">${idx + 1}. ${m.namaMenu}</td>
          <td style="padding: 9px 8px; text-align: center; color: #6F5C4A;">${m.qty} porsi</td>
          <td style="padding: 9px 8px; text-align: right; font-weight: 700; color: #B5560A;">
            ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(m.subtotal)}
          </td>
        </tr>
      `
        )
        .join('')
    : `<tr><td colspan="3" style="padding: 12px; text-align: center; color: #8A725D;">Tidak ada menu terjual hari ini</td></tr>`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Rekap Penjualan Dapur Hari Ini - ${formattedDate}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FFF8EE; margin: 0; padding: 24px; color: #2B221C;">
        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; border: 1px solid #F2E3D0; overflow: hidden; box-shadow: 0 4px 20px rgba(178, 98, 20, 0.08);">
          <div style="background-color: #FF8F28; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">${storeName}</h1>
            <p style="color: #FFF2E0; margin: 6px 0 0 0; font-size: 13px;">Rekap Penjualan & Perkiraan Keuntungan Dapur Hari Ini (Pukul 22:00)</p>
          </div>
          
          <div style="padding: 26px 22px;">
            <p style="font-size: 16px; margin: 0 0 8px 0; font-weight: 700;">
              Catatan Penjualan Hari Ini Sudah Selesai Dihitung! 📊
            </p>
            <p style="font-size: 13.5px; line-height: 1.6; color: #6F5C4A; margin: 0 0 20px 0;">
              Halo <strong>${ownerName || 'Chef / Pemilik Dapur'}</strong>, berikut adalah rangkuman hasil penjualan dan perkiraan keuntungan bersih dapur Anda untuk hari <strong>${formattedDate}</strong> setelah tutup kasir malam.
            </p>
            
            <!-- Ringkasan Kartu Metrik -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
              <div style="background-color: #FFFBF5; border: 1.5px solid #F2E3D0; border-radius: 14px; padding: 14px; text-align: center;">
                <div style="font-size: 11px; font-weight: 700; color: #8A725D; text-transform: uppercase;">Total Pemasukan Kotor</div>
                <div style="font-size: 17px; font-weight: 800; color: #2B221C; margin-top: 4px;">${formattedSales}</div>
              </div>
              <div style="background-color: #FFFBF5; border: 1.5px solid #F2E3D0; border-radius: 14px; padding: 14px; text-align: center;">
                <div style="font-size: 11px; font-weight: 700; color: #8A725D; text-transform: uppercase;">Perkiraan Untung Bersih</div>
                <div style="font-size: 17px; font-weight: 800; color: #2D7A1F; margin-top: 4px;">${formattedProfit}</div>
              </div>
            </div>

            <div style="background-color: #FFFBF5; border: 1.5px solid #F2E3D0; border-radius: 14px; padding: 14px 16px; margin-bottom: 20px; font-size: 13px; line-height: 1.7;">
              <div><strong>Total Nota Pembelian:</strong> ${totalOrders} pelanggan dilayani</div>
              <div><strong>Rata-rata Belanja per Pembeli:</strong> ${totalOrders > 0 ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalSales / totalOrders) : 'Rp 0'}</div>
              <div><strong>Waktu Tutup Buku Kasir:</strong> Pukul 22:00 WIB (${formattedDate})</div>
            </div>

            <!-- List data yang dikirim ke email ini -->
            <div style="background-color: #F8F4EE; border-radius: 14px; padding: 14px 16px; margin-bottom: 20px;">
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #6F5C4A; text-transform: uppercase; letter-spacing: 0.5px;">
                📋 Rincian yang Disampaikan di Surat Ini:
              </p>
              <ul style="margin: 0; padding-left: 18px; font-size: 12.5px; color: #524336; line-height: 1.6;">
                <li>Total uang masuk dari penjualan hari ini (${formattedSales})</li>
                <li>Perkiraan untung bersih (${formattedProfit}) dari total ${totalOrders} nota pembelian</li>
                <li>Daftar menu masakan yang paling laris dipesan pelanggan</li>
                <li>Hasil hitungan tutup kasir malam pukul 22:00 WIB</li>
              </ul>
            </div>

            <h3 style="font-size: 14px; font-weight: 800; margin: 20px 0 10px 0; color: #2B221C;">Menu yang Paling Banyak Dipesan Hari Ini:</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 22px;">
              <thead>
                <tr style="background-color: #FAF4EB; text-align: left; border-bottom: 2px solid #E8D7C3;">
                  <th style="padding: 9px 8px; color: #6F5C4A;">Menu Masakan</th>
                  <th style="padding: 9px 8px; text-align: center; color: #6F5C4A;">Jumlah Terjual</th>
                  <th style="padding: 9px 8px; text-align: right; color: #6F5C4A;">Total Uang Masuk</th>
                </tr>
              </thead>
              <tbody>
                ${topMenuRows}
              </tbody>
            </table>

            <!-- Catatan No-Reply & Otomatis -->
            <div style="background-color: #FFF0E0; border-left: 4px solid #FF8F28; border-radius: 8px; padding: 12px 14px; margin-bottom: 22px;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #8F4C0D;">
                ℹ️ <strong>Surat Rekap Otomatis:</strong> Catatan rekap ini dikirim otomatis setiap malam jam 22:00 oleh sistem DapurTwin untuk mempermudah pengecekan tanpa harus menghitung nota manual. <strong>Mohon untuk tidak membalas email ini secara langsung.</strong> Anda dapat menyalakan atau mematikan pengiriman surat ini kapan saja di menu Pengaturan.
              </p>
            </div>

            <div style="text-align: center; margin-top: 24px;">
              <a href="https://dapurtwin.app/dashboard/laporan" style="display: inline-block; background-color: #FF8F28; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 50px;">
                Buka Catatan Lengkap di Layar Laporan
              </a>
            </div>
          </div>
          
          <div style="background-color: #FAF6F0; padding: 16px 24px; text-align: center; font-size: 11px; color: #BCA184; border-top: 1px solid #F2E3D0;">
            © ${new Date().getFullYear()} ${storeName} · DapurTwin Manajemen Operasional Dapur.
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: `📈 Rekap Penjualan Dapur Hari Ini (${formattedDate}) - ${formattedSales}`,
    html,
    text: `Rekap penjualan dapur ${storeName} tanggal ${formattedDate}. Total Pemasukan: ${formattedSales}, Perkiraan Untung Bersih: ${formattedProfit}, Jumlah Pembeli: ${totalOrders}. Surat ini dikirim secara otomatis pada tutup kasir jam 22:00, mohon untuk tidak membalas.`,
  })
}
