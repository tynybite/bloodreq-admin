"use client";

import "@/app/landing.css"; // Design tokens from landing page
import AuthSidebar from "@/components/auth/AuthSidebar";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Grid Layout: 2 Columns on Large Screens
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-cream text-zinc-900 light">
      {/* Left Column: Visual Sidebar */}
      <AuthSidebar />

      {/* Right Column: Interaction Form Area */}
      <div className="flex flex-col items-center justify-center p-8 overflow-y-auto w-full lg:h-full min-h-screen lg:min-h-0">
         {/* Mobile Header (Only visible on small screens to prevent overlap) */}
         <div className="flex w-full items-center gap-2 mb-12 lg:hidden">
             <div className="h-6 w-6 rounded-full bg-red-600"/>
             <span className="text-xl font-bold tracking-tight text-zinc-900">BloodReq</span>
         </div>
         
         <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center">
            {children}
         </div>
         
         {/* Spacer for bottom balance if needed */}
         <div className="h-8 lg:hidden" />
      </div>
    </div>
  );
}
