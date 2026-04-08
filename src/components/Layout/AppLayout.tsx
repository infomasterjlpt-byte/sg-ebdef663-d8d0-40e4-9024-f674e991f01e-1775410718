import { ReactNode, useState } from "react";
import { Navigation } from "./Navigation";
import { TopBar } from "./TopBar";
import { Footer } from "./Footer";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      
      {/* Mobile menu button */}
      <div className="lg:hidden border-b border-border bg-card px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="ml-2">Menu</span>
        </Button>
      </div>

      {/* Main layout container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 border-r border-border bg-card overflow-y-auto">
          <Navigation />
        </aside>

        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)}>
            <aside className="w-64 h-full bg-card border-r border-border overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b border-border flex items-center justify-between">
                <span className="font-semibold">Menu</span>
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <Navigation onNavigate={() => setSidebarOpen(false)} />
            </aside>
          </div>
        )}

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="container max-w-7xl mx-auto px-4 lg:px-6 py-6">
            {children}
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}