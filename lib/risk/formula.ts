// Risk-Index 산식
import type { RiskComponents } from '@/types';

/**
 * Risk = (0.4 * counselDensity + 0.3 * recallRate)
 *      × (1 - shelterAvailability)
 *      × (1 + multicultureWeight + childcareWeight - 2)  // weights are 1.0~1.5 → 정규화
 *      × 100
 */
export function computeRiskIndex(c: RiskComponents): number {
  const baseDemand = 0.4 * c.counselDensity + 0.3 * c.recallRate;
  const supplyGap = 1 - c.shelterAvailability;
  const vulnerabilityBoost = 1 + (c.multicultureWeight - 1) + (c.childcareWeight - 1);
  const raw = baseDemand * supplyGap * vulnerabilityBoost * 100;
  return Math.max(0, Math.min(100, Math.round(raw * 10) / 10));
}

export function riskColorScale(score: number): string {
  // d3-scale-chromatic interpolateReds 모방
  if (score < 20) return '#fef0d9';
  if (score < 35) return '#fdcc8a';
  if (score < 50) return '#fc8d59';
  if (score < 65) return '#e34a33';
  if (score < 80) return '#b30000';
  return '#7a0000';
}

export function severityToColor(severity: number): { bg: string; text: string; label: string } {
  if (severity <= 3) return { bg: '#dcfce7', text: '#166534', label: '저위험' };
  if (severity <= 6) return { bg: '#fef3c7', text: '#92400e', label: '중위험' };
  return { bg: '#fee2e2', text: '#991b1b', label: '응급' };
}
