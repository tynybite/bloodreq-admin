"use client";

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
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Droplets, label: 'Blood Requests', href: '/admin/blood-requests' },
  { icon: HandCoins, label: 'Financial Requests', href: '/admin/financial-requests' },
  { icon: Heart, label: 'Donations', href: '/admin/donations' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: MapPin, label: 'Locations', href: '/admin/locations' },
  { icon: Shield, label: 'Moderators', href: '/admin/moderators' },
  { icon: Megaphone, label: 'Advertisements', href: '/admin/ads' },
  { icon: Languages, label: 'Translations', href: '/admin/translations' },
  { icon: BarChart3, label: 'Reports', href: '/admin/reports' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'circOut' }}
      // Light mode: White background with blur. Dark mode: Black background with blur.
      className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar/80 backdrop-blur-2xl dark:bg-sidebar/80"
    >
      <div className="flex h-full flex-col px-4 py-8">
        {/* Logo */}
        <div className="mb-12 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/20">
            <Droplets className="h-6 w-6 text-white" fill="white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-foreground">BloodReq</h1>
            <p className="text-xs font-medium text-red-500 dark:text-red-400">Admin Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 group overflow-hidden ${
                  isActive 
                    ? 'text-red-600 dark:text-white' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}>
                  {/* Active Background with Glow */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-red-100/50 dark:bg-red-600/10 border border-red-200 dark:border-red-500/20 rounded-xl"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-50" />
                    </motion.div>
                  )}

                  <item.icon className={`relative z-10 h-5 w-5 transition-colors ${isActive ? 'text-red-600 dark:text-red-500' : 'group-hover:text-red-500 dark:group-hover:text-red-400'}`} />
                  <span className="relative z-10">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Profile / Logout */}
        <div className="mt-auto border-t border-border/50 pt-6">
          <button className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-red-500">
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </motion.aside>
  );
}

export function Header() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border/50 bg-background/50 px-8 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Welcome back,</span>
        <span className="font-semibold text-foreground">Admin</span>
      </div>
      <div className="flex items-center gap-4">
         <button 
           onClick={toggleTheme}
           className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary/50 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
         >
           <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
           <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
           <span className="sr-only">Toggle theme</span>
         </button>
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary/50 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
        </button>
        <div className="h-10 w-10 overflow-hidden rounded-full border border-border bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900">
           {/* Placeholder Avatar */}
           <img src="https://avatar.vercel.sh/admin" alt="Admin" className="h-full w-full object-cover" />
        </div>
      </div>
    </header>
  );
}
