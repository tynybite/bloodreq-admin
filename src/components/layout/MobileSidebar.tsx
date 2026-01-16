"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";

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
  CreditCard,
} from "lucide-react";

import { filterMenuItems, AdminRole } from "@/lib/rbac";
import { useUser } from "@/contexts/UserContext";
import { auth } from "@/lib/auth/firebase-client";
import { Button } from "@/components/ui/button";

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

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('nav');
  
  const { user } = useUser();
  const role = user?.role as AdminRole || 'admin'; 

  const handleSignOut = async () => {
    await auth.signOut();
    await fetch('/api/auth/signout', { method: 'POST' });
    router.replace('/login');
    onClose();
  };

  const handleNavClick = (href: string) => {
    router.push(href);
    onClose();
  };

  // Build menu items with translated labels
  const menuItems = menuConfig.map(item => ({
    ...item,
    label: t(item.labelKey as any) || item.labelKey,
  }));

  const filteredMenuItems = role ? filterMenuItems(menuItems, role) : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 z-50 h-screen w-72 border-r border-border/40 bg-background/95 backdrop-blur-xl overflow-hidden lg:hidden"
          >
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-primary/15 to-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative flex h-full flex-col py-4">
              {/* Header with Close Button */}
              <div className="mb-6 flex items-center justify-between px-4">
                <Link href="/admin/dashboard" onClick={onClose} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg shadow-primary/25 overflow-hidden">
                    <img src="/favicon.ico" alt="BloodReq" className="h-6 w-6 object-contain" />
                  </div>
                  <div className="overflow-hidden">
                    <h1 className="font-display text-lg font-bold tracking-tight text-foreground whitespace-nowrap">BloodReq</h1>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/80">{role?.replace('_', ' ') || 'Admin'}</p>
                  </div>
                </Link>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-9 w-9 rounded-lg bg-secondary/50 hover:bg-secondary"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto px-3 space-y-1">
                {filteredMenuItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  
                  return (
                    <button
                      key={item.href}
                      onClick={() => handleNavClick(item.href)}
                      className={`relative w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                        isActive 
                          ? 'text-primary bg-primary/10' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="mobile-active-indicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-primary"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}

                      <item.icon className={`h-[18px] w-[18px] ${isActive ? 'text-primary' : ''}`} />
                      <span className="text-[15px] font-medium whitespace-nowrap">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="mt-auto pt-3 border-t border-border/30 px-3">
                <button 
                  onClick={handleSignOut}
                  className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
                >
                  <LogOut className="h-[18px] w-[18px]" />
                  <span>{t('logout')}</span>
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
