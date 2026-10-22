import { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import clsx from 'clsx'

interface StatCardProps {
  title: string
  value: string
  change?: string
  trend?: 'up' | 'down'
  helperText?: string
}

export default function StatCard({
  title,
  value,
  change,
  trend,
  helperText,
}: StatCardProps) {
  return (
    <div className="bg-[#FFFFFF] rounded-xl p-5 border border-[#EAE5DF] shadow-2xs">
      <p className="text-xs text-[#6B665F] font-medium">{title}</p>
      <p className="text-2xl font-semibold text-[#1F1D1A] mt-1.5 tracking-tight font-mono">
        {value}
      </p>

      <div className="mt-3 pt-3 border-t border-[#F4F0EB] flex items-center justify-between text-xs">
        {change && (
          <span
            className={clsx(
              'inline-flex items-center gap-1 font-medium text-[11px]',
              trend === 'up' ? 'text-[#3E6B48]' : 'text-[#C85A32]'
            )}
          >
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </span>
        )}
        {helperText && <span className="text-[11px] text-[#9C9589]">{helperText}</span>}
      </div>
    </div>
  )
}
