// BrandMark — the tela folded-paper "t" app mark. Indigo rounded tile + white
// sheet + a dark fold pocket. Colors come from theme tokens (--accent /
// --accent-fg) so it tracks the active theme; the fold is a fixed dark wash.
// Geometry is shared verbatim with the favicon / landing header (512 viewBox).
export function BrandMark({
  size = 24,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="HomeOS"
      className={className}
    >
      <rect width="512" height="512" rx="112" fill="var(--accent)" />
      {/* HomeOS «H»: two rounded uprights + a crossbar tucked under the left one. */}
      <path fill="var(--accent-fg)" d="M168 224H280Q296 224 296 240V272Q296 288 280 288H168Z" />
      <path fill="var(--accent-fg)" d="M146 128H174Q192 128 192 146V366Q192 384 174 384H146Q128 384 128 366V146Q128 128 146 128Z" />
      <path fill="var(--accent-fg)" d="M338 128H366Q384 128 384 146V366Q384 384 366 384H338Q320 384 320 366V146Q320 128 338 128Z" />
    </svg>
  )
}
