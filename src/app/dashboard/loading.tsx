import { Skeleton, StatCardsSkeleton, TableSkeleton } from '@/components/ui/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="flex-1 pb-16">
      {/* Topbar Skeleton */}
      <div className="border-b border-[#F2ECE1] bg-white px-4 py-4 sm:px-6 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-44 rounded-full" />
            <Skeleton className="h-4 w-64 rounded-full" />
          </div>
          <Skeleton className="h-11 w-32 rounded-full" />
        </div>
      </div>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 p-4 sm:p-6 md:p-8">
        {/* Hero banner skeleton */}
        <div className="rounded-[36px] bg-[#FAF6EE] border border-[#EBE6DC] p-8 sm:p-10 space-y-4">
          <Skeleton className="h-8 w-60 rounded-full" />
          <Skeleton className="h-4 w-96 rounded-full" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-11 w-36 rounded-full" />
            <Skeleton className="h-11 w-32 rounded-full" />
          </div>
        </div>

        {/* Stat Cards */}
        <StatCardsSkeleton count={4} />

        {/* Content Table / Cards */}
        <TableSkeleton rows={5} />
      </main>
    </div>
  )
}
