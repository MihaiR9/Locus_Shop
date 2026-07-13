"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Mail } from "lucide-react";
import { adminLoginWithEmail } from "./actions";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<
    | { kind: "idle" }
    | { kind: "sent"; email: string }
    | { kind: "error"; message: string }
  >({ kind: "idle" });
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await adminLoginWithEmail(email);
      if (res.ok) setState({ kind: "sent", email });
      else setState({ kind: "error", message: res.error });
    });
  }

  if (state.kind === "sent") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-emerald-50 p-3 text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-zinc-900">
            Link trimis
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Deschide inbox-ul <strong>{state.email}</strong> și dă click pe
            linkul din email pentru a te autentifica.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setState({ kind: "idle" })}
          className="text-xs text-zinc-500 underline underline-offset-2 hover:text-zinc-800"
        >
          Alt email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="admin-email">Email admin</Label>
        <Input
          id="admin-email"
          type="email"
          placeholder="office@domeniul-locus.ro"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
          required
          autoComplete="email"
        />
      </div>

      {state.kind === "error" && (
        <p className="text-xs text-red-600" role="alert">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={isPending || !email}>
        <Mail className="mr-2 h-4 w-4" />
        {isPending ? "Se trimite..." : "Trimite link magic"}
      </Button>
    </form>
  );
}
