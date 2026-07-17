import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Sparkles, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Veasyble Executor Platform" },
      { name: "description", content: "Sign in to your Veasyble Executor account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const login = useStore((s) => s.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState("linh.nguyen@veasyble.com");
  const [password, setPassword] = useState("veasyble-demo");
  const [error, setError] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = login(email, password);
    if (!result.ok) {
      setError(result.message ?? "Email or password is incorrect.");
      return;
    }
    setError("");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="flex min-h-screen items-stretch bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-8 pt-12">
        <div className="rounded bg-card p-6 shadow-elevated border border-border/70">
          <div className="flex items-center gap-2 text-sm font-bold text-primary">
            <Sparkles className="h-4 w-4" /> Veasyble
          </div>
          <h1 className="mt-8 text-3xl font-bold leading-tight text-foreground">
            Executor Platform
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Sign in with the email and password Veasyble sent to your personal inbox.
          </p>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 h-12 w-full rounded border border-input bg-card px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 h-12 w-full rounded border border-input bg-card px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {error && <div className="rounded bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>}
          <button type="button" className="text-sm font-semibold text-primary" onClick={() => setResetOpen(true)}>
            Forgot password?
          </button>
          <button type="submit" className="h-12 w-full rounded bg-primary font-semibold text-primary-foreground shadow-card active:opacity-90">
            Sign in
          </button>
        </form>

        <div className="mt-auto pt-8 text-center text-sm text-muted-foreground">
          Don't have an account yet?{" "}
          <a href="https://veasyble.com/apply" className="font-semibold text-primary">Enroll your slot here</a>
        </div>
      </div>

      {resetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded bg-card p-5 shadow-elevated">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Reset password</h2>
              <button onClick={() => setResetOpen(false)} className="flex h-9 w-9 items-center justify-center rounded bg-secondary">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your Veasyble-generated email. If the account can receive resets, a link will be sent.
            </p>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="linh.nguyen@veasyble.com"
              className="mt-4 h-11 w-full rounded border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={() => {
                setResetOpen(false);
                toast("If the email is registered, a reset link has been sent.");
              }}
              className="mt-4 h-11 w-full rounded bg-primary text-sm font-semibold text-primary-foreground"
            >
              Send reset link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
