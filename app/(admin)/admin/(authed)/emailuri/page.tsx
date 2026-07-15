import type { Metadata } from "next";
import Link from "next/link";
import { Mail, User, Building } from "lucide-react";
import { listEmailTemplates } from "@/lib/admin/email-templates-queries";
import { formatRelDate } from "../../_components/rel-date";

export const metadata: Metadata = { title: "Emailuri · Admin" };

export default async function EmailsListPage() {
  const templates = await listEmailTemplates();

  return (
    <>
      <header className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Emailuri</h1>
          <p className="admin-page-sub">
            Textele din emailurile trimise automat. Designul rămâne în cod —
            aici modifici doar conținutul. Preview live în editor.
          </p>
        </div>
      </header>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-left text-[11px] uppercase tracking-[0.06em] text-zinc-500">
                <th className="py-2.5 pl-4 font-medium">Email</th>
                <th className="py-2.5 font-medium">Destinatar</th>
                <th className="py-2.5 font-medium">Subiect (actual)</th>
                <th className="py-2.5 font-medium">Actualizat</th>
                <th className="py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr
                  key={t.key}
                  className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60"
                >
                  <td className="py-3 pl-4">
                    <Link
                      href={`/admin/emailuri/${t.key}`}
                      className="flex items-start gap-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-zinc-100">
                        <Mail className="h-4 w-4 text-zinc-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-zinc-900 hover:underline">
                          {t.name}
                        </div>
                        <div className="mt-0.5 text-[11px] text-zinc-500">
                          {t.description}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-700">
                      {t.destination === "client" ? (
                        <>
                          <User className="h-3 w-3 text-zinc-400" />
                          Client
                        </>
                      ) : (
                        <>
                          <Building className="h-3 w-3 text-zinc-400" />
                          Admin
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-xs text-zinc-600">{t.subject}</span>
                  </td>
                  <td className="py-3">
                    <span className="text-xs text-zinc-600">
                      {t.updatedAt ? formatRelDate(t.updatedAt) : "—"}
                    </span>
                  </td>
                  <td className="py-3">
                    {t.isCustomized ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        Personalizat
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                        Default
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/emailuri/${t.key}`}
                      className="text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:underline"
                    >
                      Editează
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-600">
        <p className="mb-2">
          <strong className="text-zinc-900">Cum funcționează:</strong> textele
          suportă interpolare cu <code className="rounded bg-white px-1 py-0.5 font-mono">{`{{variabilă}}`}</code>.
          Variabilele disponibile diferă per template (afișate în editor).
        </p>
        <p className="text-zinc-500">
          Când marketing sau tu modifici textul, se salvează în DB. Emailurile
          trimise ulterior folosesc noile texte imediat — fără redeploy.
        </p>
      </div>
    </>
  );
}
