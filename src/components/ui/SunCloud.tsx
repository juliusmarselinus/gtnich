import clsx from 'clsx'

/** Motif brand: matahari koral + awan putih, ditaruh di atas latar kuning. Murni dekorasi. */
export default function SunCloud({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={clsx('pointer-events-none absolute', className)}>
      <span className="absolute left-0 top-0 h-10 w-10 rounded-full bg-koral-terang" />
      <span className="absolute left-12 top-3 h-7 w-7 rounded-full bg-white" />
      <span className="absolute left-9 top-[22px] h-[18px] w-16 rounded-full bg-white" />
    </span>
  )
}
