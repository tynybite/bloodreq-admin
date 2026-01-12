
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  HeartPulse, 
  LayoutDashboard, 
  PlusCircle, 
  User,
  LogOut,
  Bell 
} from "lucide-react";

export function UserNavbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="w-full border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
             <HeartPulse className="w-5 h-5" />
           </div>
           <span className="font-display font-bold text-xl tracking-tight">BloodReq</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
           <Link 
             href="/dashboard" 
             className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'}`}
           >
             <div className="flex items-center gap-1">
               <LayoutDashboard className="w-4 h-4" />
               Dashboard
             </div>
           </Link>
           <Link 
             href="/request-blood" 
             className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/request-blood') ? 'text-primary' : 'text-muted-foreground'}`}
           >
             <div className="flex items-center gap-1">
               <PlusCircle className="w-4 h-4" />
               Request Blood
             </div>
           </Link>
           <Link 
             href="/my-requests" 
             className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/my-requests') ? 'text-primary' : 'text-muted-foreground'}`}
           >
             <div className="flex items-center gap-1">
               <User className="w-4 h-4" />
               My Requests
             </div>
           </Link>
           <Link 
             href="/reminders" 
             className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/reminders') ? 'text-primary' : 'text-muted-foreground'}`}
           >
             <div className="flex items-center gap-1">
               <Bell className="w-4 h-4" />
               Reminders
             </div>
           </Link>
        </div>

        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
             <User className="w-5 h-5" />
           </Button>
           <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
             <LogOut className="w-5 h-5" />
           </Button>
        </div>
      </div>
    </nav>
  );
}
