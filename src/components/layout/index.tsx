"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Droplets, 
  HandCoins, 
  Users, 
  Settings, 
  LogOut,
  Bell,
  Sun,
  Moon,
  Heart,
  MapPin,
  Shield,
  Megaphone,
  Languages,
  BarChart3,
  ChevronLeft,
  Search,
  Command,
  X,
  LayoutGrid,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useSidebar } from './SidebarContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

// Mobile Drawer Component
function MobileDrawer() {
  const pathname = usePathname();
  const { mobileOpen, setMobileOpen } = useSidebar();

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <AnimatePresence>
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          />
          
          {/* Drawer - Slides from RIGHT */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-screen w-72 bg-background border-l border-border/40 lg:hidden overflow-hidden"
          >
            {/* Decorative gradient */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-primary/20 to-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative flex h-full flex-col py-4">
              {/* Header */}
              <div className="flex items-center justify-between px-4 mb-6">
                <Link href="/admin/dashboard" className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-rose-500 to-red-600 shadow-lg shadow-primary/25">
                    <Droplets className="h-5 w-5 text-white" fill="white" />
                  </div>
                  <div>
                    <h1 className="font-display text-lg font-bold tracking-tight text-foreground">BloodReq</h1>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/80">Admin</p>
                  </div>
                </Link>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMobileOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>

              {/* Search */}
              <div className="mb-4 px-3">
                <button className="flex w-full items-center gap-2 rounded-xl border border-border/50 bg-secondary/30 px-3 py-2.5 text-sm text-muted-foreground">
                  <Search className="h-4 w-4" />
                  <span className="flex-1 text-left">Search...</span>
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto px-3 space-y-1">
                {menuItems.map((item, index) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  
                  return (
                    <Link key={item.href} href={item.href}>
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                          isActive 
                            ? 'text-primary bg-primary/10' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-primary" />
                        )}
                        <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                        <span>{item.label}</span>
                      </motion.div>
                    </Link>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="mt-auto pt-3 border-t border-border/30 px-3">
                {/* Profile info removed as requested */}
                <button className="mt-1 flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-medium text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500">
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// Desktop Sidebar Component  
function DesktopSidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebar();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

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
              <button className="flex w-full items-center gap-2 rounded-xl border border-border/50 bg-secondary/30 px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/50">
                <Search className="h-4 w-4" />
                <span className="flex-1 text-left text-xs">Search...</span>
                <kbd className="flex items-center gap-0.5 rounded border border-border/50 bg-background/50 px-1 py-0.5 text-[10px] font-medium">
                  <Command className="h-2.5 w-2.5" />K
                </kbd>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 space-y-0.5">
          {menuItems.map((item, index) => {
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
          {/* Profile info removed as requested */}

          <button className={`mt-1 flex w-full items-center rounded-xl px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <LogOut className="h-[18px] w-[18px]" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}

import { useState } from 'react';

export function Sidebar() {
  return (
    <>
      <MobileDrawer />
      <DesktopSidebar />
    </>
  );
}

export function Header() {
  const { theme, setTheme } = useTheme();
  const { mobileOpen, setMobileOpen } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/40 bg-background/80 px-4 lg:px-6 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground hidden sm:inline">Welcome,</span>
        <span className="font-semibold text-foreground">Admin</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-secondary/30 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </motion.button>

        {/* Notifications */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-secondary/30 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </motion.button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative h-9 w-9 overflow-hidden rounded-xl border border-border/50 transition-colors hover:border-border"
            >
              <img src="https://avatar.vercel.sh/admin" alt="Admin" className="h-full w-full object-cover" />
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Admin</p>
                <p className="text-xs leading-none text-muted-foreground">admin@bloodreq.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/profile" className="cursor-pointer">
                <Users className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-600 focus:bg-red-500/10 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mobile Menu Toggle - 3x3 Grid Icon */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-secondary/30 text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
        >
          <LayoutGrid className="h-4 w-4" />
        </motion.button>
      </div>
    </header>
  );
}
