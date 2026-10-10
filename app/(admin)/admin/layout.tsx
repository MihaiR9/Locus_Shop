import { Inter } from "next/font/google";
import "./admin.css";

/** Inter doar pentru admin — declarat aici, nu în root layout, ca să nu se
 *  preîncarce pe paginile publice. */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

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
  return <div className={`admin-scope ${inter.variable}`}>{children}</div>;
}
