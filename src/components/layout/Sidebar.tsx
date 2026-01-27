"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { 
  LayoutDashboard, 
  Droplets, 
  HandCoins, 
  Users, 
  Settings, 
  LogOut,
  MapPin,
  Megaphone,
  Flag,
  ShieldCheck,
  CreditCard,
  Mail,
  Bell,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/layout/SidebarContext";

interface SidebarProps {
  className?: string;
  isMobile?: boolean; // If true, disable collapse logic or force expanded
}

export const Sidebar = ({ className, isMobile = false }: SidebarProps) => {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const { collapsed, setCollapsed } = useSidebar();

  // If mobile, force expanded state for visual purposes (layout ignores width)
  // But strictly speaking, Sidebar context tracks 'collapsed' globally for Desktop.
  // We'll use a local effectiveCollapsed
  const isCollapsed = isMobile ? false : collapsed;
  const sidebarWidth = isCollapsed ? 'w-[72px]' : 'w-[260px]';

  const routes = [
    { label: t('dashboard'), icon: LayoutDashboard, href: "/admin/dashboard" },
    { label: t('bloodRequests'), icon: Droplets, href: "/admin/blood-requests" },
    { label: t('users'), icon: Users, href: "/admin/users" },
    { label: t('fundraisers'), icon: HandCoins, href: "/admin/fundraisers" }, 
    { label: t('donations'), icon: HandCoins, href: "/admin/donations" },
    { label: t('locations'), icon: MapPin, href: "/admin/locations" }, 
    { label: t('ads'), icon: Megaphone, href: "/admin/ads" },
    { label: t('reports'), icon: Flag, href: "/admin/reports" },
    { label: t('moderators'), icon: ShieldCheck, href: "/admin/moderators" },
    { label: t('paymentSettings'), icon: CreditCard, href: "/admin/payment-settings" },
    { label: t('email'), icon: Mail, href: "/admin/email" },
    { label: t('notifications'), icon: Bell, href: "/admin/notifications" },
    { label: t('settings'), icon: Settings, href: "/admin/settings" },
  ];

  return (
    <div className={cn(
        "fixed inset-y-0 left-0 z-30 space-y-4 py-4 flex flex-col h-full sidebar-bento text-[#1D1D1F] transition-[width] duration-300 ease-in-out", 
        sidebarWidth,
        className
    )}>
      <div className="px-3 py-2 flex-1 flex flex-col">
        <Link href="/admin/dashboard" className={cn("flex items-center mb-10 transition-all", isCollapsed ? "justify-center" : "pl-3 gap-3")}>
          <div className="relative w-8 h-8 flex items-center justify-center bg-[#FF2D55] rounded-lg shadow-lg shadow-red-500/30 flex-shrink-0">
            <Droplets className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
             <h1 className="text-xl font-bold tracking-tight whitespace-nowrap overflow-hidden">
                BloodReq
             </h1>
          )}
        </Link>
        
        <div className="space-y-1 flex-1 overflow-y-auto overflow-x-hidden">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full font-medium cursor-pointer nav-item-bento transition-all",
                pathname === route.href ? "nav-item-bento-active" : "hover:bg-black/5 dark:hover:bg-white/10",
                isCollapsed ? "justify-center" : "justify-start"
              )}
              title={isCollapsed ? route.label : undefined}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 flex-shrink-0 transition-all", isCollapsed ? "mr-0" : "mr-3", pathname === route.href ? "text-white" : "text-[#86868b] group-hover:text-[#1D1D1F]")} />
                {!isCollapsed && <span className="truncate">{route.label}</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="px-3 py-2 mt-auto space-y-2">
        {/* Toggle Button (Desktop Only) */}
        {!isMobile && (
            <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center hover:bg-black/5 dark:hover:bg-white/10 text-[#86868b]"
                onClick={() => setCollapsed(!collapsed)}
            >
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
        )}

        {/* Logout Button */}
        <Button 
            variant="ghost" 
            className={cn(
                "w-full text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all",
                isCollapsed ? "justify-center px-0" : "justify-start"
            )}
            onClick={() => window.location.href = '/login'}
            title={isCollapsed ? t('logout') : undefined}
        >
            <LogOut className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
            {!isCollapsed && t('logout')}
        </Button>
      </div>
    </div>
  );
};
