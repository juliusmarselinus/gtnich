/** Ikon "kembaran": lingkaran penuh + lingkaran putus-putus, sama dengan logo DapurTwin. */
export default function TwinIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="9" cy="12" r="6" />
      <circle cx="15" cy="12" r="6" strokeDasharray="3 2.5" />
    </svg>
  )
}
