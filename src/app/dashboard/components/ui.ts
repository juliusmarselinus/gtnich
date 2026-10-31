/** Kelas bersama untuk kartu-kartu beranda. */
export const card = 'rounded-[28px] bg-white shadow-kartu'
export const cardTitle = 'text-base font-extrabold tracking-tight text-kopi'
export const textLink = 'text-[13px] font-bold text-koral-gelap hover:underline'

export function channelInitials(channel: string) {
  const c = channel.toLowerCase()
  if (c.includes('whatsapp')) return 'WA'
  if (c.includes('toko') || c.includes('kasir')) return 'TK'
  if (c.includes('online') || c.includes('web')) return 'WEB'
  return channel.slice(0, 2).toUpperCase()
}

export function formatJam(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return '-'
  }
}

/** "2,49 jt" / "850 rb" untuk label grafik */
export function rupiahPendek(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} jt`
  if (v >= 1_000) return `${Math.round(v / 1_000)} rb`
  return `${v}`
}
