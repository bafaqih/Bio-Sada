// DashboardLayout.tsx
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Home,
  List,
  ArrowDownToLine,
  Inbox,
  UserCheck,
  BadgeDollarSign,
  LogOut,
  Recycle,
  ChevronsUpDown,
  User,
  ChevronRight,
} from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/lib/types';

import { TooltipProvider } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// ── Navigation menu items per role ──────────────────────────

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  /** If true, match pathname with startsWith instead of exact */
  matchPrefix?: boolean;
  subItems?: { label: string; href: string }[];
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  customers: [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Daftar Limbah', href: '/dashboard/waste-list', icon: List },
    {
      label: 'Setor Sampah',
      icon: ArrowDownToLine,
      matchPrefix: true,
      subItems: [
        { label: 'Request Penjemputan', href: '/dashboard/deposit/request' },
        { label: 'Riwayat Request', href: '/dashboard/deposit/history' },
      ],
    },
  ],
  partners: [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Order Masuk', href: '/dashboard/orders', icon: Inbox },
  ],
  admin: [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Verifikasi Mitra', href: '/dashboard/verify-partners', icon: UserCheck },
    { label: 'Harga Sampah', href: '/dashboard/waste-prices', icon: BadgeDollarSign },
  ],
};

/** Map role to Indonesian display label */
const ROLE_LABELS: Record<UserRole, string> = {
  customers: 'Nasabah',
  partners: 'Mitra Pengepul',
  admin: 'Administrator',
};

// ── Helper: Get user initials for avatar fallback ───────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ── Main Layout Component ───────────────────────────────────

export default function DashboardLayout() {
  const { profile, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = NAV_ITEMS[profile?.role ?? 'customers'];
  const roleLabel = ROLE_LABELS[profile?.role ?? 'customers'];

  const handleLogout = async () => {
    await logout();
    toast.success('Berhasil keluar. Sampai jumpa!');
  };

  /** Check if a nav item is active */
  const isNavActive = (item: NavItem): boolean => {
    if (item.subItems) {
      return item.subItems.some((sub) => location.pathname === sub.href);
    }
    if (item.matchPrefix && item.href) {
      return location.pathname.startsWith(item.href);
    }
    return location.pathname === item.href;
  };

  /** Get current page title string */
  const getPageTitle = () => {
    if (location.pathname === '/dashboard/profile') return 'Profil Saya';
    for (const item of navItems) {
      if (item.subItems) {
        const activeSub = item.subItems.find((sub) => location.pathname === sub.href);
        if (activeSub) return activeSub.label;
      } else if (item.href && location.pathname === item.href) {
        return item.label;
      }
    }
    return 'Dashboard';
  };

  return (
    <TooltipProvider>
      <SidebarProvider>
        {/* ── Sidebar ──────────────────────────────────── */}
        <Sidebar collapsible="icon" className="border-r-emerald-100">
          {/* Logo */}
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                  <Link to="/dashboard" id="sidebar-logo">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/20">
                      <Recycle className="h-4.5 w-4.5 text-white" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-bold text-gray-900">Bio-Sada</span>
                      <span className="truncate text-xs text-gray-400">Bank Sampah Digital</span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          {/* Navigation */}
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-gray-400">Menu Utama</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const active = isNavActive(item);

                    // Submenu (Collapsible)
                    if (item.subItems) {
                      return (
                        <Collapsible
                          key={item.label}
                          defaultOpen={active}
                          className="group/collapsible"
                        >
                          <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton
                                tooltip={item.label}
                                className={
                                  active
                                    ? 'bg-emerald-50 font-semibold text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800'
                                    : 'text-gray-600 hover:bg-emerald-50/60 hover:text-emerald-700'
                                }
                              >
                                <item.icon className="h-4 w-4" />
                                <span>{item.label}</span>
                                <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {item.subItems.map((sub) => {
                                  const subActive = location.pathname === sub.href;
                                  return (
                                    <SidebarMenuSubItem key={sub.href}>
                                      <SidebarMenuSubButton
                                        asChild
                                        isActive={subActive}
                                        className={
                                          subActive
                                            ? 'font-medium text-emerald-700'
                                            : 'text-gray-500 hover:text-emerald-600'
                                        }
                                      >
                                        <Link to={sub.href}>{sub.label}</Link>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  );
                                })}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </SidebarMenuItem>
                        </Collapsible>
                      );
                    }

                    // Normal Item
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={item.label}
                          className={
                            active
                              ? 'bg-emerald-50 font-semibold text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800'
                              : 'text-gray-600 hover:bg-emerald-50/60 hover:text-emerald-700'
                          }
                        >
                          <Link to={item.href!}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* Footer — User Info */}
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      id="sidebar-user-menu"
                      className="transition-colors hover:bg-emerald-50/60"
                    >
                      <Avatar className="h-8 w-8 rounded-lg border border-emerald-200">
                        <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? ''} />
                        <AvatarFallback className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-semibold text-white">
                          {getInitials(profile?.full_name ?? 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold text-gray-800">
                          {profile?.full_name ?? 'Pengguna'}
                        </span>
                        <span className="truncate text-xs text-gray-400">{roleLabel}</span>
                      </div>
                      <ChevronsUpDown className="ml-auto h-4 w-4 text-gray-400" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 rounded-xl"
                    side="top"
                    align="end"
                    sideOffset={4}
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none text-gray-800">
                          {profile?.full_name}
                        </p>
                        <p className="text-xs leading-none text-gray-400">{roleLabel}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      id="btn-profile"
                      onClick={() => navigate('/dashboard/profile')}
                      className="cursor-pointer text-gray-700 focus:bg-emerald-50 focus:text-emerald-700"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profil Saya
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      id="btn-logout"
                      onClick={handleLogout}
                      className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Keluar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        {/* ── Main Content Area ─────────────────────────── */}
        <SidebarInset>
          {/* Header */}
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-gray-100 bg-white/80 px-4 backdrop-blur-sm transition-[width,height] ease-linear">
            <SidebarTrigger className="-ml-1 text-gray-500 hover:text-emerald-600" />
            <Separator orientation="vertical" className="mr-2 h-4 bg-gray-200" />
            <div className="flex flex-1 items-center justify-between">
              <h2 className="text-sm font-medium text-gray-500">
                {getPageTitle()}
              </h2>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-x-hidden bg-gradient-to-br from-gray-50/50 via-white to-emerald-50/30 p-4 md:p-6">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
