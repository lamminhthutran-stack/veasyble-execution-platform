import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const isAuthed = useStore((s) => s.isAuthed);
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: isAuthed ? "/dashboard" : "/login", replace: true });
  }, [isAuthed, navigate]);
  return <div className="min-h-screen bg-background" />;
}
