import { useState } from "react";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  Building2,
  CalendarDays,
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  MoreHorizontal,
  Settings as SettingsIcon,
  Users,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Today", icon: LayoutDashboard },
  { to: "/clients", label: "Clients", icon: Building2 },
  { to: "/grievances", label: "Grievances", icon: MessageSquare },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/appointments", label: "Sessions", icon: ClipboardList },
  { to: "/team", label: "Team", icon: Users },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

const MOBILE_NAV = NAV.slice(0, 4);
const MORE_NAV = NAV.slice(4);

export function ConsoleLayout() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const navItem = (item, onNavigate) => {
    const active = pathname === item.to;
    const Icon = item.icon;
    return (
      <Link
        key={item.to}
        to={item.to}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          active
            ? "bg-secondary text-foreground"
            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
        )}
      >
        <Icon className={cn("h-4 w-4", active ? "text-primary" : "")} />
        {item.label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card md:flex">
        <div className="px-6 pb-5 pt-6">
          <Link to="/" className="font-display text-xl leading-none">
            Pikonik
          </Link>
          <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            Client CRM
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-3">{NAV.map((item) => navItem(item))}</nav>
        <div className="space-y-1 border-t border-border p-3">
          <Link
            to="/book"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
            Booking page
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
          <p className="px-3 pt-2 text-[11px] text-muted-foreground/70">
            {user?.full_name || user?.email || "Pikonik team"}
          </p>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur md:hidden">
          <Link to="/" className="font-display text-lg leading-none">
            Pikonik
          </Link>
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
            Client CRM
          </span>
        </header>
        <main className="mx-auto w-full max-w-[1180px] px-4 pb-28 pt-5 md:px-8 md:pb-14 md:pt-8">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-card/95 pb-1 backdrop-blur md:hidden">
        {MOBILE_NAV.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium text-muted-foreground"
            >
              <MoreHorizontal className="h-[18px] w-[18px]" />
              More
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader className="text-left">
              <SheetTitle className="font-display text-lg">More</SheetTitle>
            </SheetHeader>
            <div className="mt-2 space-y-1 pb-4">
              {MORE_NAV.map((item) => navItem(item, () => setMoreOpen(false)))}
              <Link
                to="/book"
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground"
              >
                <ExternalLink className="h-4 w-4" />
                Booking page
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}