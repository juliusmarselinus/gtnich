import clsx from 'clsx'

interface DapurTwinLogoProps {
  /** warna lingkaran "dapur nyata"; putih di atas kuning, kuning di atas putih */
  realFill?: string
  showWordmark?: boolean
  className?: string
}

/** Logo DapurTwin: lingkaran penuh (dapur nyata) + lingkaran putus-putus (kembarannya). */
export default function DapurTwinLogo({
  realFill = '#FFB800',
  showWordmark = true,
  className,
}: DapurTwinLogoProps) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5', className)}>
      <svg width="28" height="20" viewBox="0 0 38 26" aria-hidden="true">
        <circle cx="12" cy="13" r="10" fill={realFill} />
        <circle cx="25" cy="13" r="10" fill="none" stroke="#2B221C" strokeWidth="3" strokeDasharray="4 3" />
      </svg>
      {showWordmark && (
        <span className="text-lg font-black tracking-tight text-kopi">DapurTwin</span>
      )}
    </span>
  )
}
