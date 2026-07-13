/**
 * Skeleton afișat instant când navighezi între rutele admin — Next.js îl
 * randează în timp ce încarcă noua pagină. Feedback vizual imediat.
 */
export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      <header className="admin-page-head">
        <div>
          <div className="h-7 w-40 rounded-md bg-zinc-100" />
          <div className="mt-2 h-3 w-64 rounded-md bg-zinc-100" />
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-lg border border-zinc-200 bg-white"
          />
        ))}
      </div>

      <div className="mt-6 h-64 rounded-lg border border-zinc-200 bg-white" />
    </div>
  );
}
