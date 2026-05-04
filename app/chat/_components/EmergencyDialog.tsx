'use client';
import { useChatStore } from '@/store/useChatStore';
import { X, Phone, MapPin, CheckSquare } from 'lucide-react';

export function EmergencyDialog() {
  const { emergencyOpen, closeEmergency, messages } = useChatStore();
  const lastTriage = [...messages].reverse().find((m) => m.triage)?.triage;
  if (!emergencyOpen || !lastTriage || lastTriage.routing !== 'emergency-112') return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-red-600 text-white p-4 flex items-center justify-between rounded-t-2xl">
          <div className="font-bold flex items-center gap-2">
            🚨 응급 상황 — 즉시 도움 필요
          </div>
          <button onClick={closeEmergency}><X className="size-5" /></button>
        </div>

        <div className="p-4 space-y-4">
          <a href="tel:112" className="block bg-red-600 hover:bg-red-700 text-white text-center py-4 rounded-xl text-2xl font-bold">
            <Phone className="inline size-6 mr-2" /> 112 즉시 호출
          </a>
          <a href="tel:1366" className="block bg-amber-600 text-white text-center py-3 rounded-xl text-lg font-bold">
            <Phone className="inline size-5 mr-2" /> 1366 (24시간 상담)
          </a>

          {lastTriage.shelters && lastTriage.shelters.length > 0 && (
            <div>
              <div className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
                <MapPin className="size-4" /> 가까운 보호시설
              </div>
              <div className="space-y-2">
                {lastTriage.shelters.slice(0, 3).map((s) => (
                  <div key={s.id} className="rounded-lg border p-3 bg-slate-50">
                    <div className="font-bold text-sm">{s.name}</div>
                    <div className="text-xs text-slate-600 mt-1">
                      가용 {s.capacity - s.occupied}/{s.capacity}석 · {s.type === 'emergency' ? '응급' : s.type === 'short' ? '단기' : '장기'}
                      {s.multilingual && ' · 다국어 지원'}
                    </div>
                    <a href={`tel:${s.phone.replace(/\D/g, '')}`} className="text-xs text-amber-700 font-semibold mt-1 block">
                      📞 {s.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lastTriage.safetyPlan && (
            <div>
              <div className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
                <CheckSquare className="size-4" /> 안전 계획
              </div>
              <ol className="space-y-1 text-sm text-slate-700">
                {lastTriage.safetyPlan.map((step, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-bold text-red-600">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
