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
    <div className="clay-card p-5 relative overflow-hidden group">
      {/* Top clean sunset accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFBF35] to-[#FF8F2B]" />

      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-black text-slate-900 mt-1.5 tracking-tight font-mono">
        {value}
      </p>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {change && (
          <span
            className={clsx(
              'inline-flex items-center gap-1 font-bold text-[11px] px-2.5 py-0.5 rounded-full clay-pill',
              trend === 'up' 
                ? 'bg-amber-50 text-[#C76710] border border-amber-200/80' 
                : 'bg-rose-50 text-rose-700 border border-rose-200/80'
            )}
          >
            {trend === 'up' ? <TrendingUp className="w-3 h-3 text-[#FF8F2B]" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </span>
        )}
        {helperText && <span className="text-[11px] text-slate-500 font-medium">{helperText}</span>}
      </div>
    </div>
  )
}
