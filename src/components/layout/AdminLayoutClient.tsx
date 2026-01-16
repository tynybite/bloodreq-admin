"use client";

import { ReactNode, useEffect, useState } from 'react';
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { Header } from "@/components/layout/Header";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";
import BloodCellsBackground from "@/components/reactbits/BloodCellsBackground";
import { UserProvider, AdminUser } from "@/contexts/UserContext";

function LayoutContent({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      // Close mobile menu when switching to desktop
      if (desktop) {
        setIsMobileMenuOpen(false);
      }
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const marginLeft = isDesktop ? (collapsed ? 72 : 260) : 0;

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-red-500/30 selection:text-red-900 dark:selection:text-red-200">
      {/* Dynamic Background */}
      <BloodCellsBackground className="fixed inset-0 z-0 opacity-20 dark:opacity-35" />
      
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      {/* Main Content - margin adjusts dynamically */}
      <div 
        className="relative z-10 flex flex-col min-h-screen transition-[margin-left] duration-[250ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]"
        style={{ marginLeft }}
      >
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-x-hidden p-4 lg:p-6">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function AdminLayoutClient({ children, user }: { children: ReactNode; user: AdminUser }) {
  return (
    <UserProvider user={user}>
      <SidebarProvider>
        <LayoutContent>{children}</LayoutContent>
      </SidebarProvider>
    </UserProvider>
  );
}
