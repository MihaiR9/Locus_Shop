import "./admin.css";

/**
 * Admin root layout — reset stiluri pentru tot ce e sub /admin.
 * Fundal alb, font system-sans pentru UI, tokens neutrali (zinc).
 *
 * Nu conține sidebar — acesta trăiește în (authed)/layout.tsx, ca
 * pagina /admin/login (public) să NU aibă chrome.
 */
export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="admin-scope">{children}</div>;
}
