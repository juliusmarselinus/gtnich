import clsx from 'clsx'

interface BadgeProps {
  status: string
}

// Warna status bernuansa kertas bookpaper/novel: tidak mencolok, berkarakter natural
const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
  // Menunggu: Terracotta / Ochre hangat (menunggu antrean/pembayaran)
  menunggu: {
    label: 'Menunggu',
    bg: 'bg-[#FDF6ED]',
    text: 'text-[#B45309]',
    dot: 'bg-[#D97706]',
    border: 'border-[#F6E3CE]',
  },
  // Diproses: Sepia / Slate Kopi (sedang dikemas/dipersiapkan gudang)
  diproses: {
    label: 'Diproses',
    bg: 'bg-[#F2EDE4]',
    text: 'text-[#63513D]',
    dot: 'bg-[#8C7355]',
    border: 'border-[#DFD6C8]',
  },
  // Dikirim: Indigo Plum Vintage (sedang di kurir jalan)
  dikirim: {
    label: 'Dikirim',
    bg: 'bg-[#F3EEF8]',
    text: 'text-[#6B3E8C]',
    dot: 'bg-[#8F5EB8]',
    border: 'border-[#E4D7F0]',
  },
  // Selesai: Forest / Olive Sage lembut (transaksi tuntas)
  selesai: {
    label: 'Selesai',
    bg: 'bg-[#EFF5EE]',
    text: 'text-[#2D5A34]',
    dot: 'bg-[#407B4A]',
    border: 'border-[#D5E6D4]',
  },

  // Channels
  'WhatsApp': {
    label: 'WhatsApp',
    bg: 'bg-[#EFF7F0]',
    text: 'text-[#246332]',
    dot: 'bg-[#2E8544]',
    border: 'border-[#D6EBDA]',
  },
  'Toko Langsung': {
    label: 'Toko Offline',
    bg: 'bg-[#FAF3EA]',
    text: 'text-[#8A5016]',
    dot: 'bg-[#B46D28]',
    border: 'border-[#EDE0D0]',
  },
  'Katalog Online': {
    label: 'Web Store',
    bg: 'bg-[#FAF0E6]',
    text: 'text-[#94441E]',
    dot: 'bg-[#BF5E2E]',
    border: 'border-[#ECDCCB]',
  },
}

export default function Badge({ status }: BadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    bg: 'bg-[#F5F2EC]',
    text: 'text-[#5C564E]',
    dot: 'bg-[#8C8477]',
    border: 'border-[#E0DACE]',
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border whitespace-nowrap',
        config.bg,
        config.text,
        config.border
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}
