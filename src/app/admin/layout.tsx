import { Sidebar, Header } from "@/components/layout";
import "../globals.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark flex min-h-screen bg-background text-foreground">
      {/* Sidebar - Fixed */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:ml-64">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

