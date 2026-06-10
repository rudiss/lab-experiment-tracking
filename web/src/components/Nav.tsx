"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/format";

const groups: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: "Overview",
    links: [{ href: "/", label: "Dashboard" }],
  },
  {
    heading: "Research",
    links: [
      { href: "/projects", label: "Projects" },
      { href: "/experiments", label: "Experiments" },
      { href: "/measurements", label: "Measurements" },
      { href: "/samples", label: "Samples" },
      { href: "/researchers", label: "Researchers" },
    ],
  },
  {
    heading: "Catalog",
    links: [
      { href: "/catalog/roles", label: "Roles" },
      { href: "/catalog/specimen-types", label: "Specimen Types" },
      { href: "/catalog/measurement-types", label: "Measurement Types" },
    ],
  },
];

export function Nav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.heading}>
          <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {group.heading}
          </p>
          <ul className="space-y-0.5">
            {group.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "block rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
