"use client";

import "@/app/landing.css"; // Design tokens from landing page
import AuthSidebar from "@/components/auth/AuthSidebar";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Hybrid Layout: Noir Background
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-[#020205] text-zinc-100 selection:bg-red-600/30">
      {/* Left Column: Hybrid Sidebar */}
      <AuthSidebar />

      {/* Right Column: Interaction Form Area */}
      <div className="flex flex-col items-center justify-center p-8 overflow-y-auto w-full lg:h-full min-h-screen lg:min-h-0 relative">
         <div className="auth-noise absolute inset-0 opacity-10 pointer-events-none" />
         
         {/* Mobile Header */}
         <div className="flex w-full items-center gap-2 mb-12 lg:hidden relative z-10">
             <div className="h-6 w-6 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]"/>
             <span className="text-xl font-bold tracking-tight text-white font-sans">BloodReq</span>
         </div>
         
         <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center relative z-10">
            {children}
         </div>
      </div>
    </div>
  );
}
