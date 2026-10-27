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
      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-black text-slate-800 mt-1.5 tracking-tight font-mono">
        {value}
      </p>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {change && (
          <span
            className={clsx(
              'inline-flex items-center gap-1 font-bold text-[11px] px-2.5 py-0.5 rounded-full clay-pill',
              trend === 'up' 
                ? 'bg-emerald-50 text-emerald-600' 
                : 'bg-rose-50 text-rose-600'
            )}
          >
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </span>
        )}
        {helperText && <span className="text-[11px] text-slate-400 font-medium">{helperText}</span>}
      </div>
    </div>
  )
}
