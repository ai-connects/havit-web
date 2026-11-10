'use client';
import { useState } from 'react';
import { sleepTimesForWake } from '@/lib/calculators';
import { type SleepCycleLabels, type ToolLang } from '@/lib/tool-labels';
import AppCtaBanner from './AppCtaBanner';

function parseTime(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
  return d;
}

function fmtTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function SleepCycleCalculator({ labels: L, lang }: { labels: SleepCycleLabels; lang: ToolLang }) {
  const [wake, setWake] = useState('07:00');
  const [rows, setRows] = useState<{ cycles: number; bedtime: Date }[] | null>(null);

  return (
    <div className="rounded-2xl border border-gray-200 p-5 md:p-7 bg-white">
      <div className="grid grid-cols-1 max-w-xs">
        <label className="block text-sm font-semibold mb-2">{L.wakeTime}</label>
        <input type="time" value={wake} onChange={(e) => setWake(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white" />
      </div>
      <button type="button" onClick={() => setRows(sleepTimesForWake(parseTime(wake)))} className="mt-6 w-full md:w-auto px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-gray-900 font-semibold transition-colors">
        {L.calculate}
      </button>
      {rows && (
        <>
          <div className="mt-6">
            <h3 className="font-bold text-lg mb-3">{L.resultHeader}</h3>
            <div className="space-y-2.5">
              {rows.map((r, i) => (
                <div key={r.cycles} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${i === 0 ? 'border-2 border-primary-500 bg-primary-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div>
                    <div className="text-2xl md:text-3xl font-bold text-primary-700">{fmtTime(r.bedtime)}</div>
                    <div className="text-xs text-gray-500">{r.cycles} {L.cyclesLabel} · {r.cycles * 1.5}h</div>
                  </div>
                  {i === 0 && <span className="text-xs uppercase tracking-wider font-bold text-primary-700">★</span>}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-500">{L.helpRow}</p>
          </div>
          <AppCtaBanner lang={lang} tool="sleep-cycle" />
        </>
      )}
    </div>
  );
}
