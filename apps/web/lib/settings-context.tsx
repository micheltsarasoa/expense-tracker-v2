'use client';

import { createContext, useContext } from 'react';
import { formatMoney, formatDate, type DateFormat, type MoneyFormat } from '@/lib/format';

/** The user's display preferences relevant to rendering money and dates. */
export interface AppSettings extends MoneyFormat {
  dateFormat: DateFormat;
}

const SettingsContext = createContext<AppSettings | null>(null);

export function SettingsProvider({
  value,
  children,
}: {
  value: AppSettings;
  children: React.ReactNode;
}) {
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

/**
 * Returns formatters bound to the current user's settings. `money` applies the
 * currency symbol/position/separators; `date` applies the date format.
 */
export function useFormat() {
  const settings = useContext(SettingsContext);
  if (!settings) {
    throw new Error('useFormat must be used within a SettingsProvider');
  }
  return {
    settings,
    money: (value: number | string) => formatMoney(value, settings),
    date: (iso: string) => formatDate(iso, settings.dateFormat),
  };
}
