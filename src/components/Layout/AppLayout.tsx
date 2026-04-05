import { ReactNode } from "react";
import { Navigation } from "./Navigation";
import { TopBar } from "./TopBar";
import { Footer } from "./Footer";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <Navigation />
      <main className="flex-1 container py-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}