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

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user } = useUser();
  const router = useRouter();
  const t = useTranslations('header');
  const tNav = useTranslations('nav');
  const tLang = useTranslations('languages');
  const { locale, setLocale, locales, localeNames, localeFlags } = useLanguage();

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
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 h-5 min-w-5 px-1.5 text-xs"
              >
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="font-display">
              {t('notifications')}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">New blood request pending</span>
              <span className="text-xs text-muted-foreground">
                A+ blood needed urgently in Dhaka
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">Financial request submitted</span>
              <span className="text-xs text-muted-foreground">
                New fundraising request for review
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">Donation verified</span>
              <span className="text-xs text-muted-foreground">
                Payment of ৳5,000 confirmed
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary">
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
