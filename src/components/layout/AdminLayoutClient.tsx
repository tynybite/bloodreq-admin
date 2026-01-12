"use client";

import { ReactNode, useEffect, useState } from 'react';
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";
import BloodCellsBackground from "@/components/reactbits/BloodCellsBackground";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

function LayoutContent({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Admin access check
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Handled by middleware mostly, but double check
        router.push('/login');
        return;
      }

      // Check admin status
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error || !adminUser) {
        toast.error("Access denied. Admin privileges required.");
        await supabase.auth.signOut();
        router.push('/login');
      }
    };
    
    checkAdmin();
  }, [router, supabase]);

  const marginLeft = isDesktop ? (collapsed ? 72 : 260) : 0;

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-red-500/30 selection:text-red-900 dark:selection:text-red-200">
      {/* Dynamic Background */}
      <BloodCellsBackground className="fixed inset-0 z-0 opacity-20 dark:opacity-35" />
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content - margin adjusts dynamically */}
      <div 
        className="relative z-10 flex flex-col min-h-screen transition-[margin-left] duration-[250ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]"
        style={{ marginLeft }}
      >
        <Header />
        <main className="flex-1 overflow-x-hidden p-4 lg:p-6">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function AdminLayoutClient({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
