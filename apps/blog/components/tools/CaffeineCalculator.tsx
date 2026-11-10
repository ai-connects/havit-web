'use client';
import { useState } from 'react';
import { latestCaffeineCupTime } from '@/lib/calculators';
import { type CaffeineLabels, type ToolLang } from '@/lib/tool-labels';
import AppCtaBanner from './AppCtaBanner';

function parseTime(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function fmtTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function CaffeineCalculator({ labels: L, lang }: { labels: CaffeineLabels; lang: ToolLang }) {
  const [bed, setBed] = useState('23:00');
  const [dose, setDose] = useState(95);
  const [target, setTarget] = useState(30);
  const [result, setResult] = useState<string | null>(null);

  function compute() {
    if (dose <= 0 || target <= 0) return;
    const d = latestCaffeineCupTime(parseTime(bed), dose, target);
    setResult(fmtTime(d));
  }

  return (
    <div className="rounded-2xl border border-gray-200 p-5 md:p-7 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="block text-sm font-semibold mb-2">{L.bedtime}</label>
          <input type="time" value={bed} onChange={(e) => setBed(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">{L.dose}</label>
          <input type="number" min={1} value={dose} onChange={(e) => setDose(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">{L.targetAtBed}</label>
          <input type="number" min={1} value={target} onChange={(e) => setTarget(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white" />
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-500 leading-relaxed">{L.doseExamples}</p>
      <button type="button" onClick={compute} className="mt-6 w-full md:w-auto px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-gray-900 font-semibold transition-colors">
        {L.calculate}
      </button>
      {result && (
        <>
          <div className="mt-6 p-5 rounded-xl border-2 border-primary-500 bg-primary-50">
            <div className="text-xs uppercase tracking-wider text-primary-800 mb-1.5">{L.resultLabel}</div>
            <div className="text-4xl md:text-5xl font-bold text-primary-700">{result}</div>
            <p className="text-xs text-gray-600 mt-2">{L.helpResult}</p>
          </div>
          <AppCtaBanner lang={lang} tool="caffeine" />
        </>
      )}
    </div>
  );
}
