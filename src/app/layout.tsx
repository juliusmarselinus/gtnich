import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/context/ToastContext'
import { BusyProvider } from '@/context/BusyContext'

export const metadata: Metadata = {
  title: 'DapurTwin | Kembaran digital dapurmu',
  description: 'Manajemen dapur, stok, dan pembelian untuk UMKM kuliner',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="font-sans antialiased">
        <BusyProvider>
          <ToastProvider>{children}</ToastProvider>
        </BusyProvider>
      </body>
    </html>
  )
}
