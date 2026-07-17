import { Link, useLocation } from "@tanstack/react-router";
import { LayoutGrid, Store, ListChecks, WalletCards, UserRound } from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/dashboard", label: "Home", icon: LayoutGrid },
  { to: "/marketplace", label: "Market", icon: Store },
  { to: "/activity", label: "Activity", icon: ListChecks },
  { to: "/earnings", label: "Earnings", icon: WalletCards },
  { to: "/profile", label: "Profile", icon: UserRound },
] as const;

export function AppShell({ children, title, right }: { children: ReactNode; title?: string; right?: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md min-h-screen bg-background pb-24 relative">
        {title && (
          <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/60">
            <div className="flex items-center justify-between h-14 px-5">
              <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
              {right}
            </div>
          </header>
        )}
        <main>{children}</main>
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card/95 backdrop-blur-xl border-t border-border">
          <ul className="grid grid-cols-5 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            {nav.map((n) => {
              const active =
                pathname.startsWith(n.to) || (pathname.startsWith("/history") && n.to === "/activity");
              const Icon = n.icon;
              return (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    className={`flex flex-col items-center gap-1 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                      active ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? "stroke-[2.4]" : ""}`} />
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
