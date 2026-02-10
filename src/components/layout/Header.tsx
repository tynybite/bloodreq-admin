"use client";

import { Bell, Moon, Sun, Search, Menu, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { auth } from "@/lib/auth/firebase-client";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from 'react';
interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);  const router = useRouter();
  const t = useTranslations('header');
  const tNav = useTranslations('nav');
  const tLang = useTranslations('languages');
  const { locale, setLocale, locales, localeNames, localeFlags } = useLanguage();
  
  // Notification State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      if (!auth.currentUser) return;
      
      const token = await auth.currentUser.getIdToken();
      const res = await fetch('/api/admin/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.data.notifications);
          setUnreadCount(data.data.unreadCount);
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ id })
      });
      // Optimistic update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark read', error);
    }
  };

  const markAllRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ markAll: true })
      });
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all read', error);
    }
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.is_read) {
      markNotificationRead(notif.id);
    }
    setNotificationsOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 60 seconds
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      await fetch('/api/auth/signout', { method: 'POST' });
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to log out");
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="glass sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('search')}
            className="w-80 bg-secondary/50 pl-10 focus:bg-secondary"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <Globe className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t('language')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {locales.map((loc) => (
              <DropdownMenuItem 
                key={loc}
                onClick={() => setLocale(loc)}
                className={locale === loc ? 'bg-primary/10 text-primary' : ''}
              >
                <span className="mr-2 text-base">{localeFlags[loc]}</span>
                {localeNames[loc]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground"
        >
          {mounted && theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* Notifications */}
        <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 min-w-5 px-1.5 text-xs flex items-center justify-center"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-2 py-1.5">
              <DropdownMenuLabel className="font-display">
                {t('notifications')}
              </DropdownMenuLabel>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-auto px-2 py-0.5 text-xs text-primary hover:text-primary/80"
                  onClick={markAllRead}
                >
                  Mark all read
                </Button>
              )}
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map((notif) => (
                  <DropdownMenuItem 
                    key={notif.id} 
                    className={`flex flex-col items-start gap-1 py-3 cursor-pointer ${!notif.is_read ? 'bg-primary/5' : ''}`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="flex w-full justify-between items-start">
                      <span className={`font-medium ${!notif.is_read ? 'text-primary' : ''}`}>
                        {notif.title}
                      </span>
                      {!notif.is_read && (
                        <span className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-2">
                      {notif.message}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60 w-full text-right mt-1">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </span>
                  </DropdownMenuItem>
                ))
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary cursor-pointer">
              {t('viewAll')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 pl-2 pr-3"
            >
              <Avatar className="h-8 w-8 border-2 border-primary/20">
                <AvatarImage src={user?.avatar_url || "/avatars/admin.jpg"} alt="Admin" />
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {user?.email?.substring(0,2).toUpperCase() || "AD"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium">{user?.full_name || "Admin User"}</p>
                <p className="text-xs text-muted-foreground">{user?.email || "admin@bloodreq.com"}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-display">
              {t('myAccount')}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/admin/settings" className="w-full cursor-pointer">{t('profileSettings')}</a>
            </DropdownMenuItem>
            <DropdownMenuItem>{t('security')}</DropdownMenuItem>
            <DropdownMenuItem>{t('activityLog')}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
               className="text-destructive focus:text-destructive cursor-pointer"
               onClick={handleLogout}
            >
              {tNav('logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
