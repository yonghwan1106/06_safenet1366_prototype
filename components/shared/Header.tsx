'use client';

import Link from 'next/link';
import { Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { href: '/chat', label: '시민 챗봇' },
  { href: '/dashboard', label: '자치구 대시보드' },
  { href: '/admin/triage', label: '관리자 시뮬' },
  { href: '/about', label: '소개' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b bg-white/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between gap-2">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-purple-900 whitespace-nowrap shrink-0"
          onClick={() => setOpen(false)}
        >
          <Shield className="size-5 shrink-0" />
          <span>세이프넷 1366</span>
          <span className="hidden sm:inline text-[10px] font-normal bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
            DEMO
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-1 text-sm">
          {NAV.map((n) => (
            <NavLink key={n.href} href={n.href}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile burger */}
        <button
          aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 rounded-md text-slate-700 hover:bg-purple-50"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t bg-white shadow-sm animate-fadein-up">
          <nav className="px-3 py-2 flex flex-col gap-1 text-sm">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-md text-slate-700 hover:bg-purple-50 hover:text-purple-900 transition"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-md text-slate-600 hover:bg-purple-50 hover:text-purple-900 transition whitespace-nowrap"
    >
      {children}
    </Link>
  );
}
