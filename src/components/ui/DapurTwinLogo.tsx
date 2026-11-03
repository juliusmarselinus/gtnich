import clsx from 'clsx'
import DapurTwinIcon from './DapurTwinIcon'

interface DapurTwinLogoProps {
  /** ukuran ikon dalam px */
  iconSize?: number
  showWordmark?: boolean
  className?: string
  /** @deprecated tidak dipakai lagi sejak logo diganti ikon Dapi; dibiarkan agar pemanggil lama tidak error */
  realFill?: string
}

/** Logo DapurTwin: ikon Dapi (latar kuning) + tulisan "DapurTwin". */
export default function DapurTwinLogo({ iconSize = 24, showWordmark = true, className }: DapurTwinLogoProps) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5', className)}>
      <DapurTwinIcon size={iconSize} className="flex-shrink-0 rounded-[7px] shadow-[0_1px_2px_rgba(120,70,0,0.25)]" />
      {showWordmark && <span className="text-lg font-black tracking-tight text-kopi">DapurTwin</span>}
    </span>
  )
}
