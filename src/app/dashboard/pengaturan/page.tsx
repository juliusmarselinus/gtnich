'use client'

import { useRouter } from 'next/navigation'
import PengaturanModal from '@/components/PengaturanModal'
import Topbar from '@/components/Topbar'

export default function PengaturanPage() {
  const router = useRouter()

  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Pengaturan Dapur"
        subtitle="Kelola profil akun, identitas usaha, dan preferensi operasional dapur"
      />

      <PengaturanModal
        isOpen={true}
        onClose={() => router.push('/dashboard')}
      />
    </div>
  )
}
