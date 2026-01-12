"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
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
  Languages,
  BarChart3,
  ChevronLeft,
  Search,
  Command,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Droplets, label: 'Blood Requests', href: '/admin/blood-requests' },
  { icon: HandCoins, label: 'Financial', href: '/admin/financial-requests' },
  { icon: Heart, label: 'Donations', href: '/admin/donations' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: MapPin, label: 'Locations', href: '/admin/locations' },
  { icon: Shield, label: 'Moderators', href: '/admin/moderators' },
  { icon: Megaphone, label: 'Ads', href: '/admin/ads' },
  { icon: Languages, label: 'Translations', href: '/admin/translations' },
  { icon: BarChart3, label: 'Reports', href: '/admin/reports' },
  { icon: Bell, label: 'Notifications', href: '/admin/notifications' },
  { icon: Mail, label: 'Email Settings', href: '/admin/email' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, setCollapsed } = useSidebar();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.aside 
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed left-0 top-0 z-40 h-screen border-r border-border/40 bg-background/95 backdrop-blur-xl overflow-hidden hidden lg:block"
    >
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-primary/15 to-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative flex h-full flex-col py-4">
        {/* Logo & Collapse */}
        <div className={`mb-6 flex items-center px-3 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-rose-500 to-red-600 shadow-lg shadow-primary/25"
            >
              <Droplets className="h-5 w-5 text-white" fill="white" />
            </motion.div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <h1 className="font-display text-lg font-bold tracking-tight text-foreground whitespace-nowrap">BloodReq</h1>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/80">Admin</p>
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
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <div className="px-3 mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCollapsed(false)}
              className="flex h-10 w-full items-center justify-center rounded-xl bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4 rotate-180" />
            </motion.button>
          </div>
        )}

        {/* Quick Search */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 px-3"
            >
              <button className="flex w-full items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                <Search className="h-4 w-4" />
                <span className="flex-1 text-left">Search...</span>
                <kbd className="pointer-events-none flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] leading-tight">
                  <Command className="h-3 w-3" />K
                </kbd>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Link key={item.href} href={item.href}>
                <motion.div 
                  onHoverStart={() => setHoveredItem(item.href)}
                  onHoverEnd={() => setHoveredItem(null)}
                  className={`relative flex items-center rounded-xl transition-colors ${
                    collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
                  } ${
                    isActive 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-primary"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}

                  <div className={collapsed ? 'h-9 w-9 flex items-center justify-center rounded-lg' : ''}>
                    <item.icon className={`h-[18px] w-[18px] ${isActive ? 'text-primary' : ''}`} />
                  </div>

                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span 
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-[15px] font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {collapsed && hoveredItem === item.href && (
                    <motion.div
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute left-full ml-2 px-2.5 py-1.5 rounded-lg bg-popover border border-border shadow-lg text-xs font-medium text-foreground whitespace-nowrap z-50"
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
        <div className="mt-auto pt-3 border-t border-border/30 px-2">
          <button 
            onClick={handleSignOut}
            className={`mt-1 flex w-full items-center rounded-xl px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 ${collapsed ? 'justify-center' : 'gap-3'}`}
          >
            <LogOut className="h-[18px] w-[18px]" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
