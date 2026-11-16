import { Suspense } from 'react';
import { getUserId } from '@/lib/auth';
import { stackServerApp } from '@/lib/stack';
import { settingsService } from '@/services/instances';
import { SettingsClient, type SettingsInitial } from './settings-client';

export default async function SettingsPage() {
  const userId = await getUserId();
  const [user, settings] = await Promise.all([
    stackServerApp.getUser(),
    settingsService.getByUserId(userId).catch(() => null),
  ]);

  // Fall back to the table's column defaults when no settings row exists yet;
  // the first save upserts a real row.
  const initial: SettingsInitial = {
    currencySymbol: settings?.currencySymbol ?? '$',
    currencyPosition:
      (settings?.currencyPosition as SettingsInitial['currencyPosition']) ?? 'before',
    decimalSeparator: settings?.decimalSeparator ?? '.',
    thousandSeparator: settings?.thousandSeparator ?? ',',
    dateFormat: (settings?.dateFormat as SettingsInitial['dateFormat']) ?? 'MM/DD/YYYY',
    timeFormat: (settings?.timeFormat as SettingsInitial['timeFormat']) ?? '12h',
  };

  const profile = {
    displayName: user?.displayName ?? '',
    email: user?.primaryEmail ?? '',
  };

  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-2xl space-y-6 py-2">
          <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
          <div className="h-48 animate-pulse rounded-lg bg-muted" />
          <div className="h-48 animate-pulse rounded-lg bg-muted" />
        </div>
      }
    >
      <SettingsClient initial={initial} profile={profile} />
    </Suspense>
  );
}
