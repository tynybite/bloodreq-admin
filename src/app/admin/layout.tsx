import { Sidebar, Header } from "@/components/layout";
import BloodCellsBackground from "@/components/reactbits/BloodCellsBackground";
import "../globals.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen bg-background text-foreground overflow-hidden selection:bg-red-500/30 selection:text-red-900 dark:selection:text-red-200">
      
      {/* Dynamic Background */}
      <BloodCellsBackground className="fixed inset-0 z-0 opacity-40 dark:opacity-60" />
      
      {/* Sidebar - Fixed */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="relative z-10 flex flex-1 flex-col lg:ml-64 transition-all duration-300 ease-in-out">
        <Header />
        <main className="flex-1 overflow-x-hidden p-6 lg:p-10">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
