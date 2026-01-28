"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

import { useSidebar } from "./SidebarContext";
import { 
  LayoutDashboard, 
  Droplets, 
  HandCoins, 
  Users, 
  Settings, 
  LogOut,
  Bell,
  Mail,
  Heart,
  MapPin,
  Shield,
  Megaphone,
  BarChart3,
  ChevronLeft,
  CreditCard,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { filterMenuItems, AdminRole } from "@/lib/rbac";
import { useUser } from "@/contexts/UserContext";
import { auth } from "@/lib/auth/firebase-client";

// Menu item keys for translation
const menuConfig = [
  { icon: LayoutDashboard, labelKey: 'dashboard', href: '/admin/dashboard' },
  { icon: Droplets, labelKey: 'bloodRequests', href: '/admin/blood-requests' },
  { icon: HandCoins, labelKey: 'fundraisers', href: '/admin/fundraisers' },
  { icon: Heart, labelKey: 'donations', href: '/admin/donations' },
  { icon: Users, labelKey: 'users', href: '/admin/users' },
  { icon: MapPin, labelKey: 'locations', href: '/admin/locations' },
  { icon: Shield, labelKey: 'moderators', href: '/admin/moderators' },
  { icon: Megaphone, labelKey: 'ads', href: '/admin/ads' },
  { icon: BarChart3, labelKey: 'reports', href: '/admin/reports' },
  { icon: Bell, labelKey: 'notifications', href: '/admin/notifications' },
  { icon: Mail, labelKey: 'emailSettings', href: '/admin/email' },
  { icon: CreditCard, labelKey: 'paymentSettings', href: '/admin/payment-settings' },
  { icon: Settings, labelKey: 'settings', href: '/admin/settings' },
];

interface SidebarProps {
  className?: string;
  isMobile?: boolean;
}

export function Sidebar({ className, isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, setCollapsed } = useSidebar();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('nav');
  
  const { user } = useUser();
  const role = user?.role as AdminRole || 'admin'; 

  // On mobile, sidebar is never collapsed
  const isCollapsed = isMobile ? false : collapsed;

  const handleSignOut = async () => {
    await auth.signOut();
    await fetch('/api/auth/signout', { method: 'POST' });
    router.replace('/login');
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Build menu items with translated labels
  const menuItems = menuConfig.map(item => ({
    ...item,
    label: t(item.labelKey as any) || item.labelKey,
  }));

  const filteredMenuItems = role ? filterMenuItems(menuItems, role) : [];

  if (!mounted) return null;

  return (
    <motion.aside 
      initial={false}
      animate={isMobile ? undefined : { width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border/40 backdrop-blur-xl overflow-hidden", 
        !isMobile && "hidden lg:block bg-card/30",
        isMobile && "bg-card/95", /* Higher opacity for mobile */
        className
      )}
    >
      <div className="flex h-full flex-col py-6">
        {/* Logo & Collapse */}
        <div className={`mb-8 flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-6'}`}>
          <Link href="/admin/dashboard" className="flex items-center gap-4 group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25"
            >
              <img src="/favicon.ico" alt="BloodReq" className="h-6 w-6 object-contain brightness-0 invert" />
            </motion.div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="overflow-hidden"
                >
                  <h1 className="font-display text-xl font-bold tracking-tight text-foreground whitespace-nowrap">BloodReq</h1>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{role?.replace('_', ' ') || 'Admin'}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
          
          <AnimatePresence>
            {!isCollapsed && !isMobile && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCollapsed(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary/50 text-muted-foreground transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Expand button when collapsed */}
        {isCollapsed && !isMobile && (
          <div className="px-4 mb-4 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCollapsed(false)}
              className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-secondary/50 text-muted-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4 rotate-180" />
            </motion.button>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 space-y-1 scrollbar-hide">
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  onHoverStart={() => setHoveredItem(item.href)}
                  onHoverEnd={() => setHoveredItem(null)}
                  className={`relative flex items-center py-3 rounded-xl transition-all duration-200 ${
                    isCollapsed ? 'justify-center px-2' : 'px-4'
                  } ${
                    isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {/* Active Background */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}

                  {/* Hover Background - Only show if not active */}
                  {hoveredItem === item.href && !isActive && (
                    <motion.div
                      layoutId="sidebar-hover"
                      className="absolute inset-0 rounded-xl bg-secondary/50"
                      transition={{ duration: 0.2 }}
                    />
                  )}

                  {/* Icon */}
                  <item.icon className={`relative z-10 shrink-0 ${isCollapsed ? 'h-[18px] w-[18px]' : 'h-5 w-5'} ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                  
                  {/* Label */}
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className={`relative z-10 ml-3 text-sm font-medium tracking-wide whitespace-nowrap ${isActive ? 'font-bold' : ''}`}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Active Indicator Dot */}
                  {isActive && isCollapsed && (
                    <motion.div
                      layoutId="sidebar-dot"
                      className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* User Profile / Logout */}
        <div className="mt-auto px-4 pt-4 border-t border-border/40">
          <button 
            onClick={handleSignOut}
            className={`flex w-full items-center rounded-xl p-3 transition-all hover:bg-rose-500/10 hover:text-rose-600 group ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="h-5 w-5 text-muted-foreground group-hover:text-rose-600 transition-colors" />
            {!isCollapsed && (
              <span className="ml-3 text-sm font-medium text-muted-foreground group-hover:text-rose-600 transition-colors">
                {t('logout')}
              </span>
            )}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
