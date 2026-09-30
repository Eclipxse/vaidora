"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  SquaresFour,
  Drop,
  Images,
  Stack,
  GearSix,
  SignOut,
  ArrowUpRight,
  List,
  X,
} from "../icons";
import { request } from "./helpers";
export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname(),
    router = useRouter();
  const [open, setOpen] = useState(false);
  const links = [
    ["/admin", "Overview", SquaresFour],
    ["/admin/products", "Products & inventory", Drop],
    ["/admin/bulk", "Bulk product generator", Stack],
    ["/admin/templates", "Product image templates", Images],
    ["/admin/content", "Store content & settings", GearSix],
  ] as const;
  return (
    <div className="admin-shell">
      <aside className={open ? "admin-sidebar open" : "admin-sidebar"}>
        <Link href="/admin" className="wordmark">
          VAIDORA<span>OWNER STUDIO</span>
        </Link>
        <button
          className="icon-button sidebar-close"
          aria-label="Close admin navigation"
          onClick={() => setOpen(false)}
        >
          <X size={23} />
        </button>
        <nav>
          {links.map(([href, label, Icon]) => (
            <Link
              className={path === href ? "active" : ""}
              key={href}
              href={href}
              onClick={() => setOpen(false)}
            >
              <Icon size={20} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/" target="_blank">
            View storefront
            <ArrowUpRight size={18} />
          </Link>
          <button
            onClick={async () => {
              await request("/api/admin/session", undefined, "DELETE");
              router.push("/admin/login");
              router.refresh();
            }}
          >
            <SignOut size={18} />
            Sign out
          </button>
        </div>
      </aside>
      <div className="admin-body">
        <header className="admin-topbar">
          <button
            className="icon-button admin-menu"
            aria-label="Open admin navigation"
            onClick={() => setOpen(true)}
          >
            <List size={23} />
          </button>
          <span>Vaidora / Owner studio</span>
          <span className="small muted">WhatsApp catalog</span>
        </header>
        <main id="main" className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}
