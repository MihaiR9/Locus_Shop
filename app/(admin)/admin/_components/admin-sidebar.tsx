"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingBag,
  Wine,
  Boxes,
  Users,
  BadgePercent,
  RotateCcw,
  Banknote,
  LineChart,
  FileText,
  SlidersHorizontal,
  FolderOpen,
  Blocks,
  Mail,
  Settings,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type NavSection = {
  title: string | null;
  items: NavItem[];
};

const SECTIONS: NavSection[] = [
  {
    title: null,
    items: [
      { href: "/admin", label: "Acasă", icon: Home },
      { href: "/admin/comenzi", label: "Comenzi", icon: ShoppingBag },
      { href: "/admin/produse", label: "Produse", icon: Wine },
      { href: "/admin/colectii", label: "Colecții", icon: Layers },
      { href: "/admin/stoc", label: "Stoc", icon: Boxes },
      { href: "/admin/clienti", label: "Clienți", icon: Users },
      { href: "/admin/reduceri", label: "Reduceri", icon: BadgePercent },
      { href: "/admin/retururi", label: "Retururi", icon: RotateCcw },
    ],
  },
  {
    title: "Financiar",
    items: [
      { href: "/admin/finante", label: "Finanțe", icon: Banknote },
      { href: "/admin/analize", label: "Analize", icon: LineChart },
    ],
  },
  {
    title: "Canal · magazin online",
    items: [
      { href: "/admin/pagini", label: "Pagini", icon: FileText },
      { href: "/admin/preferinte", label: "Preferințe", icon: SlidersHorizontal },
      { href: "/admin/fisiere", label: "Fișiere", icon: FolderOpen },
      { href: "/admin/emailuri", label: "Emailuri", icon: Mail },
      { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
    ],
  },
  {
    title: "Integrări",
    items: [
      { href: "/admin/aplicatii", label: "Aplicații", icon: Blocks },
    ],
  },
];

function isItemActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AdminSidebar() {
  const pathname = usePathname();

  const renderLink = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = isItemActive(pathname, item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-1.5 text-[13px] transition-colors",
          isActive
            ? "bg-white/10 font-medium text-white"
            : "text-zinc-400 hover:bg-white/5 hover:text-white",
        )}
      >
        <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
        <span>{item.label}</span>
      </Link>
    );
  };

  const settingsItem: NavItem = {
    href: "/admin/setari",
    label: "Setări",
    icon: Settings,
  };

  return (
    <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-4">
      {SECTIONS.map((section, idx) => (
        <div key={section.title ?? idx} className="flex flex-col gap-0.5">
          {section.title && (
            <div className="mb-1 px-3 pt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
              {section.title}
            </div>
          )}
          {section.items.map(renderLink)}
        </div>
      ))}

      <div className="mt-auto flex flex-col gap-0.5 border-t border-white/10 pt-3">
        {renderLink(settingsItem)}
      </div>
    </nav>
  );
}
