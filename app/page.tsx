export default function HomePage() {
  const swatches = [
    ["pamant", "#EBE1DA"],
    ["nisip", "#CBBEAE"],
    ["piatra", "#A89D8D"],
    ["vie", "#3E4336"],
    ["stejar", "#4A3C2D"],
    ["pivnita", "#1A1A1A"],
  ] as const;
  const onDark = new Set(["vie", "stejar", "pivnita"]);

  return (
    <main className="container-locus py-24">
      <p className="eyebrow text-ink-mute">Faza 0 · Setup</p>

      <h1 className="display mt-8 text-ink">
        un loc.
        <br />
        un timp.
        <br />
        un vin.
      </h1>

      <p className="lead mt-10 max-w-md text-ink-soft">
        Stack online: Next.js 16 · Tailwind 3 · tokens Locus active. Italiana
        pentru titluri, IBM Plex Mono pentru UI. Următorul pas — port landing
        din <code>reference/Landing_V1.html</code>.
      </p>

      <div className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {swatches.map(([name, hex]) => {
          const fg = onDark.has(name) ? "#EBE1DA" : "#1A1A1A";
          return (
            <div
              key={name}
              className="border border-line p-4"
              style={{ background: hex }}
            >
              <p className="caps" style={{ color: fg }}>
                {name}
              </p>
              <p className="caps mt-1 opacity-60" style={{ color: fg }}>
                {hex}
              </p>
            </div>
          );
        })}
      </div>
    </main>
  );
}
