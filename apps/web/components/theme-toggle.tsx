'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative size-8 text-muted-foreground"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle dark mode"
    >
      <Sun className="size-4 scale-100 transition-transform dark:scale-0" />
      <Moon className="absolute inset-0 m-auto size-4 scale-0 transition-transform dark:scale-100" />
      <span className="sr-only">Toggle dark mode</span>
    </Button>
  );
}
