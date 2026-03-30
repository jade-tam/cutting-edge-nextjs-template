"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";

type DashboardShellProps = {
  children: React.ReactNode;
};

export default function DashboardShell({ children }: DashboardShellProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-base-200">
      <button
        className="btn btn-primary fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setIsOpen((v) => !v)}
      >
        Menu
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-base-100 transition-transform md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4">
          <h2 className="text-xl font-bold">Dashboard</h2>
        </div>
        <nav className="space-y-2 px-4 pb-4">
          <Link href="/dashboard" className="block rounded px-3 py-2 hover:bg-base-content/10">
            Overview
          </Link>
          <Link href="/" className="btn btn-outline mt-4 w-full">
            Back to site
          </Link>
        </nav>
      </aside>

      {isOpen ? (
        <button
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      ) : null}

      <main className="flex-1 p-6 pt-16 md:ml-64 md:pt-6">{children}</main>
    </div>
  );
}
