'use client';

import { cn } from '@/lib/utils';

interface CategoryIconProps {
  icon: string | null;
  color: string;
  className?: string;
}

export function CategoryIcon({ icon, color, className }: CategoryIconProps) {
  const bg = /^#[0-9a-fA-F]{6}$/.test(color) ? `${color}26` : color;

  return (
    <span
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-lg text-lg leading-none',
        className,
      )}
      style={{ backgroundColor: bg }}
      aria-hidden="true"
    >
      {icon ?? '🏷️'}
    </span>
  );
}
