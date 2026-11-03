import { sendEmail } from './resend'
import { DAPURTWIN_LOGO_BASE64 } from './logoBase64'

export interface SendFrozenBahanAlertOptions {
  email: string
  storeName?: string
  ownerName?: string
  items: Array<{
    nama: string
    stok: number
    satuan: string
    sisaHari?: number | null
    estimasiExpire?: string | null
    tipsPenyimpanan?: string
  }>
}

/**
 * Kirim email peringatan bahan beku (daging, ayam, ikan, seafood, frozen food)
 * Menggunakan bahasa ramah bagi pemilik dapur dan tim masak non-IT
 */
export async function sendFrozenBahanAlertEmail({
  email,
  storeName = 'DapurTwin',
  ownerName = 'Pengelola Dapur',
  items,
}: SendFrozenBahanAlertOptions) {
  if (!items || items.length === 0) return { success: true }

  const todayStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const itemRowsHtml = items
    .map(it => {
      const sisaHariText =
        it.sisaHari !== null && it.sisaHari !== undefined
          ? it.sisaHari <= 0
            ? '<span style="color: #DC2626; font-weight: bold;">Sudah Melewati Batas</span>'
            : `<span style="color: #D97706; font-weight: bold;">${it.sisaHari} Hari Lagi</span>`
          : '<span style="color: #64748B;">Perlu Dicek</span>'

      return `
        <tr style="border-bottom: 1px solid #F1E5D5;">
          <td style="padding: 12px 10px; font-weight: 700; color: #2B1D00; font-size: 13px;">
            ❄️ ${it.nama}
            <div style="font-size: 11px; color: #786551; font-weight: normal; margin-top: 3px;">
              ${it.tipsPenyimpanan || 'Wajib disimpan stabil di suhu beku freezer (-18°C) dan periksa proses thawing sebelum memasak.'}
            </div>
          </td>
          <td style="padding: 12px 10px; text-align: center; font-weight: 700; color: #2B1D00; font-size: 13px; font-family: monospace;">
            ${it.stok} ${it.satuan}
          </td>
          <td style="padding: 12px 10px; text-align: right; font-size: 12px;">
            ${sisaHariText}
          </td>
        </tr>
      `
    })
    .join('')

  const html = `
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="utf-8">
        <title>Peringatan Bahan Beku Freezer Dapur</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F5EE; margin: 0; padding: 24px; color: #33271E;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #EADBCC; box-shadow: 0 10px 25px rgba(43,29,0,0.06);">
          
          <!-- Header -->
          <div style="background-color: #0284C7; padding: 28px 24px; text-align: center;">
            <img src="${DAPURTWIN_LOGO_BASE64}" alt="DapurTwin" style="height: 38px; margin-bottom: 8px; filter: brightness(0) invert(1);" />
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.3px;">
              ❄️ Pantauan Bahan Beku (Freezer)
            </h1>
            <p style="color: #E0F2FE; margin: 6px 0 0 0; font-size: 13px; font-weight: 500;">
              ${storeName} · Tanggal: ${todayStr}
            </p>
          </div>

          <!-- Body Konten -->
          <div style="padding: 24px 24px 30px 24px;">
            <p style="font-size: 14px; line-height: 1.6; color: #3D2E20; margin-top: 0;">
              Halo <strong>${ownerName}</strong>,
            </p>
            <p style="font-size: 13px; line-height: 1.6; color: #5C4A3A;">
              Sistem inventori DapurTwin mendeteksi terdapat <strong>${items.length} bahan kategori beku</strong> (daging, ayam, seafood, atau olahan beku) di freezer dapur Anda yang perlu diperhatikan kondisinya:
            </p>

            <!-- Tabel Daftar Bahan Beku -->
            <table style="width: 100%; border-collapse: collapse; margin: 18px 0; background-color: #FFFDF9; border-radius: 12px; overflow: hidden; border: 1px solid #F1E5D5;">
              <thead>
                <tr style="background-color: #E0F2FE; text-align: left; border-bottom: 2px solid #BAE6FD;">
                  <th style="padding: 10px; font-size: 12px; color: #0369A1;">Nama Bahan Beku</th>
                  <th style="padding: 10px; font-size: 12px; text-align: center; color: #0369A1;">Stok Dapur</th>
                  <th style="padding: 10px; font-size: 12px; text-align: right; color: #0369A1;">Batas Waktu</th>
                </tr>
              </thead>
              <tbody>
                ${itemRowsHtml}
              </tbody>
            </table>

            <!-- Tips Operasional Dapur Non-IT -->
            <div style="background-color: #F0F9FF; border-left: 4px solid #0284C7; border-radius: 10px; padding: 14px 16px; margin: 20px 0;">
              <h4 style="margin: 0 0 6px 0; font-size: 13px; font-weight: 800; color: #0369A1;">
                💡 Langkah Operasional Dapur yang Disarankan:
              </h4>
              <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #0F172A; line-height: 1.6;">
                <li>Pastikan suhu freezer tetap terjaga di bawah <strong>-18°C</strong> agar tekstur dan kesegaran bahan tidak rusak.</li>
                <li>Lakukan proses pencairan (thawing) perlahan di chiller (suhu 4°C) minimal 8-12 jam sebelum bahan dimasak.</li>
                <li>Gunakan prinsip <strong>FIFO (First In First Out)</strong>: olah bahan yang masuk lebih awal terlebih dahulu.</li>
                <li>Jangan bekukan kembali bahan hewani yang sudah dicairkan demi standar keamanan pangan.</li>
              </ul>
            </div>

            <!-- Tombol Buka Aplikasi -->
            <div style="text-align: center; margin-top: 26px;">
              <a href="https://dapurtwin.app/dashboard/kondisi-bahan" style="display: inline-block; background-color: #0284C7; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 12px 28px; border-radius: 50px; box-shadow: 0 4px 12px rgba(2,132,199,0.25);">
                Lihat Kondisi Bahan di Dashboard
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #F8F5EE; padding: 16px 24px; text-align: center; font-size: 11px; color: #8C7B6B; border-top: 1px solid #EADBCC;">
            Pemberitahuan otomatis kualitas &amp; stok dapur dari DapurTwin · Anda dapat mengatur preferensi notifikasi di menu Pengaturan.
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: `❄️ Pantauan Bahan Beku (Freezer): ${items.map(i => i.nama).slice(0, 2).join(', ')}${items.length > 2 ? ' dll' : ''} - ${storeName}`,
    html,
    text: `Peringatan Pantauan Bahan Beku Dapur (${storeName}). Terdapat ${items.length} bahan beku yang memerlukan perhatian di freezer: ${items.map(i => `${i.nama} (${i.stok} ${i.satuan})`).join(', ')}. Pastikan suhu freezer stabil dan terapkan prinsip FIFO.`,
  })
}
