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
    <div className="h-screen w-screen bg-background overflow-hidden flex justify-center">
      <div className="w-full max-w-md h-full bg-background flex flex-col relative overflow-hidden">
        {title && (
          <header className="z-30 bg-background/85 backdrop-blur-xl border-b border-border/60 shrink-0">
            <div className="flex items-center justify-between h-14 px-5">
              <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
              {right}
            </div>
          </header>
        )}
        <main className="flex-1 overflow-y-auto pb-24 scrollbar-none">
          {children}
        </main>
        <nav className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border z-40 shrink-0">
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
