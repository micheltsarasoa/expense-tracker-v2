'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  Wallet,
  Tag,
  Tags,
  BarChart3,
  Settings,
  Bell,
  ChevronDown,
} from 'lucide-react';

import { SidebarTrigger } from '@/components/ui/sidebar';

function getInitials(name: string | null | undefined): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? '';
  const b = parts[1]?.[0] ?? '';
  return (parts.length === 1 ? a : a + b).toUpperCase();
}
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const pageTitles: Record<string, { title: string; icon: React.ElementType }> = {
  '/dashboard': { title: 'Dashboard', icon: LayoutDashboard },
  '/transactions': { title: 'Transactions', icon: ArrowLeftRight },
  '/budgets': { title: 'Budgets', icon: Target },
  '/accounts': { title: 'Accounts', icon: Wallet },
  '/categories': { title: 'Categories', icon: Tag },
  '/labels': { title: 'Labels', icon: Tags },
  '/reports': { title: 'Reports', icon: BarChart3 },
  '/settings': { title: 'Settings', icon: Settings },
};

function getPageInfo(pathname: string) {
  const match = Object.entries(pageTitles).find(
    ([path]) => pathname === path || pathname.startsWith(path + '/'),
  );
  return match ? match[1] : { title: 'Dashboard', icon: LayoutDashboard };
}

export function DashboardNavbar() {
  const pathname = usePathname();
  const user = useUser();
  const pageInfo = getPageInfo(pathname);
  const PageIcon = pageInfo.icon;

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

      <Separator orientation="vertical" className="h-5" />

      <div className="flex items-center gap-2 min-w-0">
        <PageIcon className="size-4 text-muted-foreground shrink-0" />
        <h1 className="text-sm font-semibold truncate">{pageInfo.title}</h1>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />

        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
          <Bell className="size-4" />
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-8 px-2">
              <Avatar className="size-6">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {getInitials(user?.displayName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:block">{user?.displayName ?? ''}</span>
              <ChevronDown className="size-3 text-muted-foreground hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{user?.displayName ?? ''}</span>
                <span className="text-xs text-muted-foreground">{user?.primaryEmail ?? ''}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="size-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => user?.signOut()}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
