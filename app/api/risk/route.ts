// GET /api/risk?code=11680 — 단일 시군구 상세
import { NextRequest, NextResponse } from 'next/server';
import sigunguData from '@/data/sigungu.json';
import riskData from '@/data/risk-index.json';
import sheltersData from '@/data/shelters.json';
import type { Sigungu, RiskIndex, Shelter } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'missing code' }, { status: 400 });
  const sg = (sigunguData as Sigungu[]).find((s) => s.code === code);
  if (!sg) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const risk = (riskData as RiskIndex[]).find((r) => r.sigunguCode === code);
  const shelters = (sheltersData as Shelter[]).filter((s) => s.sigunguCode === code);
  return NextResponse.json({ sigungu: sg, risk, shelters });
}
