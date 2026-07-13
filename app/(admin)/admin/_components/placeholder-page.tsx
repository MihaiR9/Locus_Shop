type Props = {
  title: string;
  sub?: string;
  note?: string;
};

export function PlaceholderPage({ title, sub, note }: Props) {
  return (
    <>
      <header className="admin-page-head">
        <div>
          <h1 className="admin-page-title">{title}</h1>
          {sub && <p className="admin-page-sub">{sub}</p>}
        </div>
      </header>

      <div className="admin-placeholder">
        {note ?? "În construcție. Vine la pașii următori."}
      </div>
    </>
  );
}
