"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <Sidebar className="hidden lg:flex" />

      {/* Mobile sidebar (sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar border-border">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar with mobile menu trigger */}
        <header className="flex h-14 items-center gap-4 border-b border-border bg-background px-4 lg:px-6">
          <button
            className="lg:hidden text-sidebar-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="sr-only">Open menu</span>
          </button>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          {children}
        </div>
      </main>

      {/* Mobile bottom tabs */}
      <MobileNav />
    </div>
  );
}
