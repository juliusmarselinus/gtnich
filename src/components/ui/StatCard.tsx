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
    <div className="clay-card p-3.5 sm:p-5 relative overflow-hidden group flex flex-col justify-between">
      {/* Top clean sunset accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFBF35] to-[#FF8F2B]" />

      <div>
        <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-wider truncate">
          {title}
        </p>
        <p className="text-lg sm:text-2xl font-black text-slate-900 mt-1 sm:mt-1.5 tracking-tight font-mono truncate">
          {value}
        </p>
      </div>

      <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1 text-[10px] sm:text-xs">
        {change && (
          <span
            className={clsx(
              'inline-flex items-center gap-1 font-bold text-[9px] sm:text-[11px] px-2 py-0.5 rounded-full clay-pill whitespace-nowrap',
              trend === 'up' 
                ? 'bg-amber-50 text-[#C76710] border border-amber-200/80' 
                : 'bg-rose-50 text-rose-700 border border-rose-200/80'
            )}
          >
            {trend === 'up' ? <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#FF8F2B]" /> : <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
            {change}
          </span>
        )}
        {helperText && (
          <span className="text-[9px] sm:text-[11px] text-slate-500 font-medium truncate">
            {helperText}
          </span>
        )}
      </div>
    </div>
  )
}
