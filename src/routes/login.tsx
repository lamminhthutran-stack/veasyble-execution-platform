import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Sparkles } from "lucide-react";

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
  const [password, setPassword] = useState("••••••••");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    login();
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen bg-background flex items-stretch">
      <div className="mx-auto w-full max-w-md min-h-screen flex flex-col px-6 pt-14 pb-8">
        <div className="bg-gradient-hero rounded-3xl p-6 text-white shadow-elevated">
          <div className="flex items-center gap-2 text-sm font-medium opacity-90">
            <Sparkles className="h-4 w-4" /> Veasyble
          </div>
          <h1 className="mt-8 text-3xl font-bold leading-tight">
            Set up campaigns.<br />Get paid on time.
          </h1>
          <p className="mt-3 text-sm text-white/85">
            The execution platform for retail campaign setup.
          </p>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full h-12 rounded-xl bg-card border border-input px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full h-12 rounded-xl bg-card border border-input px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="button"
            className="text-sm text-primary font-medium"
            onClick={() => alert("A password reset link will be sent to your email.")}
          >
            Forgot password?
          </button>
          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-card active:opacity-90"
          >
            Sign in
          </button>
        </form>

        <div className="mt-auto pt-8 text-center text-sm text-muted-foreground">
          Don't have an account yet?{" "}
          <a href="https://veasyble.com/apply" className="text-primary font-semibold">Enroll your slot here</a>
        </div>
      </div>
    </div>
  );
}
