"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  title: string;
  onMenuClick?: () => void;
}

export function TopBar({ title, onMenuClick }: TopBarProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-background px-4 lg:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-sidebar-foreground"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Page title */}
      <h2 className="font-display text-sm font-semibold tracking-wide text-foreground">
        {title}
      </h2>
    </header>
  );
}
