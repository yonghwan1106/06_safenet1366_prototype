'use client';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="ko">
      <body>
        <div style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h1 style={{ fontSize: 24, color: '#7c3aed' }}>예기치 못한 오류가 발생했습니다</h1>
          <p style={{ marginTop: 12, color: '#64748b' }}>{error.message}</p>
          <button onClick={reset} style={{ marginTop: 16, padding: '10px 24px', background: '#7c3aed', color: '#fff', border: 0, borderRadius: 999, cursor: 'pointer' }}>
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
