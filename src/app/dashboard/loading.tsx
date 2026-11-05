import {
  Skeleton,
  MascotSkeleton,
  OmzetCardSkeleton,
  KembaranCardSkeleton,
  ActiveOrderStripSkeleton,
  StatCardsSkeleton,
} from '@/components/ui/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="flex-1 pb-16">
      {/* Topbar Skeleton */}
      <div className="border-b border-[#F2ECE1] bg-white px-4 py-4 sm:px-6 md:px-8">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-44 rounded-full" />
            <Skeleton className="h-4 w-64 rounded-full" />
          </div>
          <Skeleton className="h-11 w-32 rounded-full" />
        </div>
      </div>

      <main className="mx-auto flex max-w-[1240px] flex-col gap-4 px-4 pt-2 sm:px-6 md:px-8">
        {/* Baris 1: Tugas Dapi dengan Maskot + Omzet & Kembaran Dapur */}
        <div className="flex flex-wrap items-stretch gap-4">
          <div className="flex min-w-0 flex-[3_1_400px]">
            <MascotSkeleton
              variant="tasks"
              message="Dapi cek dapur dulu…"
              submessage="Sedang memeriksa stok bahan, tagihan, dan pesanan hari ini"
            />
          </div>
          <div className="flex min-w-0 flex-[2_1_300px] flex-col gap-4">
            <OmzetCardSkeleton />
            <KembaranCardSkeleton />
          </div>
        </div>

        {/* Baris 2: Strip Pesanan Berjalan */}
        <ActiveOrderStripSkeleton />

        {/* Baris 3: 4 Kartu Ringkasan Operasional */}
        <StatCardsSkeleton count={4} />

        {/* Baris 4: Placeholder Modul Sistem */}
        <div className="rounded-[28px] bg-white p-6 shadow-kartu space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-44 rounded-full" />
            <Skeleton className="h-4 w-28 rounded-full" />
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-[22px] bg-[#FAF7F2] p-3.5 space-y-2.5">
                <div className="flex items-center gap-2.5 pb-1">
                  <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                  <Skeleton className="h-4 w-24 rounded-full flex-1" />
                </div>
                <Skeleton className="h-10 w-full rounded-2xl bg-white" />
                <Skeleton className="h-10 w-full rounded-2xl bg-white" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
