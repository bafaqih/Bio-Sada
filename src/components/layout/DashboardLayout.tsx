// DashboardLayout.tsx
import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Home,
  List,
  ArrowDownToLine,
  UserCheck,
  BadgeDollarSign,
  LogOut,
  Recycle,
  ChevronsUpDown,
  User,
  ChevronRight,
  Map,
  ClipboardList,
  Loader2,
  Hourglass,
  RefreshCw,
} from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';
import { useAddresses } from '@/hooks/useAddresses';
import type { UserRole } from '@/lib/types';

import { TooltipProvider } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';

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
    { label: 'Daftar Limbah', href: '/dashboard/waste-list', icon: List },
    {
      label: 'Tugas',
      icon: ClipboardList,
      matchPrefix: true,
      subItems: [
        { label: 'Tugas Aktif', href: '/dashboard/task/active' },
        { label: 'Riwayat Tugas', href: '/dashboard/task/history' },
      ],
    },
  ],
  admin: [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Daftar Limbah', href: '/dashboard/waste-list', icon: List },
    {
      label: 'Manajemen Pengguna',
      icon: UserCheck,
      matchPrefix: true,
      subItems: [
        { label: 'Mitra', href: '/dashboard/management/partner' },
        { label: 'Nasabah', href: '/dashboard/management/customer' },
      ],
    },
    { label: 'Log Transaksi', href: '/dashboard/transaction', icon: BadgeDollarSign },
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
  const { profile, logout, fetchProfile } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [hidePrompt, setHidePrompt] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const navItems = NAV_ITEMS[profile?.role ?? 'customers'];
  const roleLabel = ROLE_LABELS[profile?.role ?? 'customers'];
  
  const { data: addresses, isLoading: addressesLoading } = useAddresses(profile?.id);
  
  const isCustomer = profile?.role === 'customers';
  const isPartner = profile?.role === 'partners';
  
  const hasAddress = !addressesLoading && addresses && addresses.length > 0;
  const noAddressYet = !addressesLoading && addresses !== undefined && addresses.length === 0;
  const needsAddress = (isCustomer || isPartner) && noAddressYet && !hidePrompt;
  
  // Hanya tampilkan modal Menunggu Persetujuan jika mitra SUDAH benar-benar punya alamat
  const needsApproval = isPartner && !profile?.is_verified && hasAddress;

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

  /** Refresh partner verification status */
  const handleRefreshApproval = async () => {
    if (!profile) return;
    setIsRefreshing(true);
    try {
      await fetchProfile(profile.id);
      // Re-read from store after fetch
      const updated = useAuthStore.getState().profile;
      if (updated?.is_verified) {
        toast.success('Akun mitra Anda berhasil disetujui! Selamat bergabung 🎉');
      } else {
        toast.info('Status masih menunggu persetujuan. Silakan coba lagi nanti.');
      }
    } catch {
      toast.error('Gagal memeriksa status. Coba lagi.');
    } finally {
      setIsRefreshing(false);
    }
  };

  /** Get current page title string */
  const getPageTitle = () => {
    if (location.pathname === '/dashboard/profile') return 'Profil Saya';
    if (location.pathname.startsWith('/dashboard/task/') && location.pathname !== '/dashboard/task/active' && location.pathname !== '/dashboard/task/history') return 'Detail Tugas';
    // Admin detail pages
    if (location.pathname.match(/^\/dashboard\/management\/partner\/.+/)) return 'Detail Mitra';
    if (location.pathname.match(/^\/dashboard\/management\/customer\/.+/)) return 'Detail Nasabah';
    if (location.pathname.match(/^\/dashboard\/transaction\/.+/)) return 'Detail Transaksi';
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
                                    ? 'bg-emerald-50 font-semibold text-emerald-700 hover:bg-emerald-50! hover:text-emerald-700!'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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
                                        className={
                                          subActive
                                            ? 'bg-emerald-50/50 font-medium text-emerald-600 hover:bg-emerald-50/50! hover:text-emerald-600!'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
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
                          tooltip={item.label}
                          className={
                            active
                              ? 'bg-emerald-50 font-semibold text-emerald-700 hover:bg-emerald-50! hover:text-emerald-700!'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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
                      <Avatar className="h-8 w-8 rounded-full border-2 border-emerald-200">
                        <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? ''} />
                        <AvatarFallback className="rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-semibold text-white">
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

      {/* Global No-Address Warning for Customers & Partners */}
      {needsAddress && (
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-lg p-6 sm:px-8 sm:py-7 [&>button]:hidden text-center z-[100]" onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader className="flex flex-col items-center sm:text-center mt-0">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 mb-4">
                <Map className="h-8 w-8 text-amber-600" />
              </div>
              <DialogTitle className="text-2xl tracking-tight font-bold text-gray-900">Alamat Belum Diatur</DialogTitle>
            </DialogHeader>
            <div className="pt-1 pb-0">
              <p className="text-sm leading-relaxed text-gray-500">
                {isPartner
                  ? 'Sebagai mitra, Anda wajib mengisi alamat terlebih dahulu sebelum akun dapat diproses untuk persetujuan admin.'
                  : 'Profil Anda memerlukan alamat utama untuk dapat melakukan request penjemputan sampah. Harap setel lokasi Anda sekarang.'}
              </p>
            </div>
            <DialogFooter className="mt-4 w-full sm:justify-center">
              <Button
                size="lg"
                onClick={() => {
                  setHidePrompt(true);
                  navigate('/dashboard/profile', { state: { openNewAddress: true } });
                }}
                className="h-12 w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700 hover:shadow-emerald-500/30"
              >
                Atur Alamat Sekarang <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Partner Approval Gate — blocks all features until admin approves */}
      {needsApproval && (
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-lg p-6 sm:px-8 sm:py-7 [&>button]:hidden text-center z-[100]" onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader className="flex flex-col items-center sm:text-center mt-0">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4 animate-pulse">
                <Hourglass className="h-8 w-8 text-blue-600" />
              </div>
              <DialogTitle className="text-2xl tracking-tight font-bold text-gray-900">Menunggu Persetujuan</DialogTitle>
            </DialogHeader>
            <div className="pt-1 pb-0">
              <p className="text-sm leading-relaxed text-gray-500">
                Akun Anda sedang menunggu persetujuan dari Admin Bio-Sada. Silakan tunggu dan klik tombol di bawah untuk memeriksa status.
              </p>
            </div>
            <DialogFooter className="mt-4 w-full sm:justify-center">
              <Button
                size="lg"
                onClick={handleRefreshApproval}
                disabled={isRefreshing}
                className="h-12 w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-base font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-indigo-700 hover:shadow-blue-500/30 disabled:opacity-60"
              >
                {isRefreshing ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memeriksa...</>
                ) : (
                  <><RefreshCw className="mr-2 h-5 w-5" /> Periksa Status</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </TooltipProvider>
  );
}
