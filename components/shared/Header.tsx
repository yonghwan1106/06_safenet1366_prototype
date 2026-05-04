import Link from 'next/link';
import { Shield } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-purple-900">
          <Shield className="size-5" />
          <span>세이프넷 1366</span>
          <span className="text-[10px] font-normal bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">DEMO</span>
        </Link>
        <nav className="flex gap-1 text-sm">
          <NavLink href="/chat">시민 챗봇</NavLink>
          <NavLink href="/dashboard">자치구 대시보드</NavLink>
          <NavLink href="/admin/triage">관리자 시뮬</NavLink>
          <NavLink href="/about">소개</NavLink>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-md text-slate-600 hover:bg-purple-50 hover:text-purple-900 transition"
    >
      {children}
    </Link>
  );
}
