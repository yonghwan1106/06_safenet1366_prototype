import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <div className="text-6xl font-extrabold text-purple-700">404</div>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">페이지를 찾을 수 없습니다</h1>
      <p className="mt-2 text-slate-600">요청한 페이지가 이동했거나 존재하지 않습니다.</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-purple-700 px-6 py-3 text-white font-semibold hover:bg-purple-800">
        홈으로 돌아가기
      </Link>
    </div>
  );
}
