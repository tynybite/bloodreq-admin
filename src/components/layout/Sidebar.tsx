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
  Search,
  Command,
  CreditCard,
} from "lucide-react";

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

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, setCollapsed } = useSidebar();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('nav');
  
  const { user } = useUser();
  const role = user?.role as AdminRole || 'admin'; 

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
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed left-0 top-0 z-40 h-screen tactile-panel border-r border-border/40 shadow-2xl overflow-hidden hidden lg:block"
    >
      {/* Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] medical-grid" />
      
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative flex h-full flex-col py-4">
        {/* Logo & Collapse */}
        <div className={`mb-10 flex items-center px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <Link href="/admin/dashboard" className="flex items-center gap-4">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl tactile-panel bg-white overflow-hidden shadow-rose-500/10"
            >
              <img src="/favicon.ico" alt="BloodReq" className="h-6 w-6 object-contain" />
            </motion.div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="overflow-hidden"
                >
                  <h1 className="font-display text-xl font-bold tracking-tighter text-foreground whitespace-nowrap">BloodReq</h1>
                  <p className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-rose-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]">{role?.replace('_', ' ') || 'Admin'}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
          
          <AnimatePresence>
            {!collapsed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCollapsed(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg tactile-button bg-secondary/30 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <div className="px-4 mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCollapsed(false)}
              className="flex h-10 w-full items-center justify-center rounded-xl tactile-button bg-secondary/30 text-muted-foreground"
            >
              <ChevronLeft className="h-4 w-4 rotate-180" />
            </motion.button>
          </div>
        )}


        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-3 custom-scrollbar">
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Link key={item.href} href={item.href}>
                <motion.div 
                  onHoverStart={() => setHoveredItem(item.href)}
                  onHoverEnd={() => setHoveredItem(null)}
                  className={`relative flex items-center transition-all duration-200 ${
                    collapsed ? 'justify-center w-12 h-12 rounded-xl mx-auto' : 'gap-4 px-4 py-3 rounded-2xl'
                  } ${
                    isActive 
                      ? 'tactile-panel-inset text-rose-500' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/20'
                  }`}
                >
                  <div className="relative flex items-center justify-center">
                    <item.icon className={`h-[18px] w-[18px] transition-transform duration-200 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_currentColor]' : 'group-hover:scale-110'}`} />
                    
                    {/* LED Indicator */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute -right-3 top-[-2px] led-indicator text-rose-500 scale-75"
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span 
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -5 }}
                        className="text-[14px] font-mono font-bold uppercase tracking-widest whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {collapsed && hoveredItem === item.href && (
                    <motion.div
                      initial={{ opacity: 0, x: 5 }}
                      animate={{ opacity: 1, x: 10 }}
                      className="absolute left-full ml-4 px-3 py-2 rounded-xl tactile-panel bg-popover text-[11px] font-mono font-bold uppercase tracking-widest text-foreground whitespace-nowrap z-50 shadow-rose-500/10"
                    >
                      {item.label}
                    </motion.div>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto px-4 py-6 border-t border-border/20">
          <button 
            onClick={handleSignOut}
            className={`flex w-full items-center rounded-xl transition-all duration-200 tactile-button bg-rose-500/5 hover:bg-rose-500/10 text-rose-500/80 hover:text-rose-500 ${collapsed ? 'justify-center h-12 w-12 mx-auto' : 'gap-4 px-4 py-3'}`}
          >
            <LogOut className="h-[18px] w-[18px]" />
            {!collapsed && <span className="text-[12px] font-mono font-bold uppercase tracking-widest">{t('logout')}</span>}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
