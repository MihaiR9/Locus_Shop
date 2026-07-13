"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { adminLogoutAction } from "../login/actions";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      onClick={() => startTransition(() => adminLogoutAction())}
      disabled={isPending}
      className="flex items-center gap-2 text-xs text-zinc-500 transition-colors hover:text-white disabled:opacity-50"
    >
      <LogOut className="h-3.5 w-3.5" />
      <span>{isPending ? "..." : "Ieșire"}</span>
    </button>
  );
}
