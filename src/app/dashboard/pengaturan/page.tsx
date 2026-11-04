'use client'

import PengaturanModal from '@/components/PengaturanModal'
import Topbar from '@/components/Topbar'

export default function PengaturanPage() {
  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Pengaturan Dapur"
        subtitle="Kelola profil akun, identitas usaha, dan preferensi operasional dapur"
      />

      <main className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
        <PengaturanModal
          isOpen={true}
          asPage={true}
        />
      </main>
    </div>
  )
}
