'use client'

import PengaturanModal from '@/components/PengaturanModal'
import Topbar from '@/components/Topbar'

export default function PengaturanPage() {
  return (
    <div className="flex-1 pb-16">
      <Topbar
        title="Pengaturan Usaha"
        subtitle="Atur nama usaha, alamat toko, nomor kontak, format struk, dan profil akun"
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
