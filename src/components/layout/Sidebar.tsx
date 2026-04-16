"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageSquare,
  Kanban,
  Users,
  Target,
  Swords,
  Mail,
  BookOpen,
  UsersRound,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const mainNav = [
  { href: "/dashboard", label: "Command Center", icon: LayoutDashboard },
  { href: "/chat", label: "AI Coach", icon: MessageSquare },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/clients", label: "Clients", icon: Users },
];

const toolsNav = [
  { href: "/objection", label: "Objection Handler", icon: Shield },
  { href: "/roleplay/new", label: "Role Play", icon: Swords },
  { href: "/email/draft", label: "Email Draft", icon: Mail },
  { href: "/reviews", label: "Weekly Review", icon: BookOpen },
];

const teamNav = [
  { href: "/team", label: "Team Dashboard", icon: UsersRound },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r border-border bg-sidebar",
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5">
        <Link href="/dashboard">
          <h1 className="font-display text-xl font-bold text-gradient-gold tracking-wide">
            NILES
          </h1>
        </Link>
      </div>

      <Separator className="bg-border" />

      <ScrollArea className="flex-1 px-3 py-4">
        {/* Main Navigation */}
        <nav className="space-y-1">
          {mainNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-sidebar-foreground hover:bg-[var(--niles-surface-hover)] hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive && "text-gold-500")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Tools */}
        <div className="mt-6">
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-[var(--text-faint)]">
            Tools
          </p>
          <nav className="space-y-1">
            {toolsNav.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-sidebar-foreground hover:bg-[var(--niles-surface-hover)] hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive && "text-gold-500")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Team */}
        <div className="mt-6">
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-[var(--text-faint)]">
            Team
          </p>
          <nav className="space-y-1">
            {teamNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-sidebar-foreground hover:bg-[var(--niles-surface-hover)] hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive && "text-gold-500")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </ScrollArea>

      <Separator className="bg-border" />

      {/* Bottom actions */}
      <div className="p-3 space-y-1">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === "/settings"
              ? "bg-accent text-accent-foreground"
              : "text-sidebar-foreground hover:bg-[var(--niles-surface-hover)] hover:text-foreground"
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-[var(--niles-surface-hover)] hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      {/* Attribution */}
      <div className="px-6 py-3 border-t border-border">
        <p className="text-[10px] text-[var(--text-faint)] leading-tight">
          Powered by The Pharaoh&apos;s Pitch
          <br />
          by Ivan Yong
        </p>
      </div>
    </aside>
  );
}
