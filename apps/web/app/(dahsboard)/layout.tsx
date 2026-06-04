import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { DashboardNavbar } from '@/components/dashboard-navbar';
import { getUserId } from '@/lib/auth';
import { settingsService } from '@/services/instances';
import { SettingsProvider, type AppSettings } from '@/lib/settings-context';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const userId = await getUserId();
  const row = await settingsService.getByUserId(userId).catch(() => null);
  const settings: AppSettings = {
    currencySymbol: row?.currencySymbol ?? '$',
    currencyPosition: (row?.currencyPosition as AppSettings['currencyPosition']) ?? 'before',
    decimalSeparator: row?.decimalSeparator ?? '.',
    thousandSeparator: row?.thousandSeparator ?? ',',
    dateFormat: (row?.dateFormat as AppSettings['dateFormat']) ?? 'MM/DD/YYYY',
  };

  return (
    <SettingsProvider value={settings}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardNavbar />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </SettingsProvider>
  );
}
