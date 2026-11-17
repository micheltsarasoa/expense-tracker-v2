'use client';

import { Button } from '@/components/ui/button';

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div>
        <p className="text-base font-medium">Something went wrong</p>
        <p className="text-sm text-muted-foreground mt-1">
          We couldn&rsquo;t load this page. Please try again.
        </p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
