'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  Wallet,
  Tag,
  Tags,
  BarChart3,
  Settings,
  TrendingDown,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';

const mainNavItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { title: 'Budgets', href: '/budgets', icon: Target },
  { title: 'Accounts', href: '/accounts', icon: Wallet },
  { title: 'Reports', href: '/reports', icon: BarChart3 },
];

const secondaryNavItems = [
  { title: 'Categories', href: '/categories', icon: Tag },
  { title: 'Labels', href: '/labels', icon: Tags },
  { title: 'Settings', href: '/settings', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <TrendingDown className="size-4" />
          </div>
          <span className="truncate text-sm font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            Expense Tracker
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="pb-4">
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5 overflow-hidden group-data-[collapsible=icon]:justify-center">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-medium">
            U
          </div>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate text-xs font-medium text-sidebar-foreground">John Doe</span>
            <span className="truncate text-xs text-muted-foreground">john@example.com</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
