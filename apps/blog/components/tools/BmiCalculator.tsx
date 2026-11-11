'use client';

import { useState } from 'react';
import { bmi as calcBmi, whtr as calcWhtr, bmiCategoryIndex, type Unit, lbToKg, kgToLb, ftInToCm, inToCm } from '@/lib/calculators';
import AppCtaBanner from './AppCtaBanner';
import type { ToolLang } from '@/lib/tool-labels';
import type { BmiLabels } from '@/lib/tool-bmi-bodyfat';

const INPUT = 'w-full px-3 py-2 rounded-lg border border-gray-200 bg-white';
const btn = (on: boolean) => `flex-1 px-3 py-2 rounded-lg border text-sm ${on ? 'bg-primary-500 border-primary-500 text-gray-900 font-semibold' : 'border-gray-200 hover:bg-gray-100'}`;
const r1 = (n: number) => Math.round(n * 10) / 10;

/** "18.5–22.9" style range text for category i (lower bound inclusive, upper = next cut − 0.1). */
export function bmiRangeText(cuts: number[], i: number): string {
  const lo = i === 0 ? null : cuts[i - 1];
  const hi = i === cuts.length ? null : cuts[i];
  if (lo === null) return `< ${hi}`;
  if (hi === null) return `≥ ${lo}`;
  return `${lo}–${r1(hi - 0.1)}`;
}

export default function BmiCalculator({ labels: L, lang }: { labels: BmiLabels; lang: ToolLang }) {
  const startImperial = lang === 'en';
  const [unit, setUnit] = useState<Unit>(startImperial ? 'imperial' : 'metric');
  const [weight, setWeight] = useState(startImperial ? 143 : 65);
  const [heightCm, setHeightCm] = useState(170);
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(7);
  const [waist, setWaist] = useState<number | ''>('');
  const [res, setRes] = useState<{ bmi: number; cat: number; whtr: number | null } | 'invalid' | null>(null);

  function switchUnit(next: Unit) {
    if (next === unit) return;
    const hCm = unit === 'metric' ? heightCm : ftInToCm(heightFt, heightIn);
    if (next === 'imperial') {
      const totalIn = Math.round(hCm / 2.54);
      setHeightFt(Math.floor(totalIn / 12)); setHeightIn(totalIn % 12);
      setWeight(Math.round(kgToLb(weight)));
      if (waist !== '') setWaist(r1(waist / 2.54));
    } else {
      setHeightCm(Math.round(hCm));
      setWeight(Math.round(lbToKg(weight)));
      if (waist !== '') setWaist(Math.round(inToCm(waist)));
    }
    setUnit(next); setRes(null);
  }

  function compute() {
    const wKg = unit === 'metric' ? weight : lbToKg(weight);
    const hCm = unit === 'metric' ? heightCm : ftInToCm(heightFt, heightIn);
    if (!(wKg > 0 && hCm > 0)) { setRes('invalid'); return; }
    const b = calcBmi(wKg, hCm);
    const wCm = waist === '' || waist <= 0 ? null : unit === 'metric' ? waist : inToCm(waist);
    setRes({ bmi: b, cat: bmiCategoryIndex(b, L.cuts), whtr: wCm ? calcWhtr(wCm, hCm) : null });
  }

  const ok = res && res !== 'invalid' ? res : null;
  return (
    <div className="rounded-2xl border border-gray-200 p-5 md:p-7 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2">{L.units}</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => switchUnit('metric')} className={btn(unit === 'metric')}>{L.metric}</button>
            <button type="button" onClick={() => switchUnit('imperial')} className={btn(unit === 'imperial')}>{L.imperial}</button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">{L.weight} ({unit === 'metric' ? 'kg' : 'lb'})</label>
          <input type="number" min={1} value={weight} onChange={(e) => setWeight(Number(e.target.value))} className={INPUT} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">{L.height}</label>
          {unit === 'metric' ? (
            <div className="flex items-center gap-2">
              <input type="number" min={1} value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} className={INPUT} />
              <span className="text-sm text-gray-500">cm</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <input type="number" min={0} value={heightFt} onChange={(e) => setHeightFt(Number(e.target.value))} className={INPUT} />
                <span className="text-sm text-gray-500">{L.feet}</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" min={0} max={11} value={heightIn} onChange={(e) => setHeightIn(Number(e.target.value))} className={INPUT} />
                <span className="text-sm text-gray-500">{L.inches}</span>
              </div>
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2">{L.waist} ({unit === 'metric' ? 'cm' : 'in'})</label>
          <input type="number" min={0} value={waist} onChange={(e) => setWaist(e.target.value === '' ? '' : Number(e.target.value))} className={INPUT} />
        </div>
      </div>

      <button type="button" onClick={compute} className="mt-6 w-full md:w-auto px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-gray-900 font-semibold text-base transition-colors">
        {L.calculate}
      </button>

      {res === 'invalid' && <p className="mt-4 text-sm text-gray-600">{L.invalid}</p>}
      {ok && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border-2 border-primary-500 bg-primary-50">
            <div className="text-xs uppercase tracking-wider text-primary-800 mb-1.5">{L.bmiLabel}</div>
            <div className="text-3xl md:text-4xl font-bold text-primary-700">{ok.bmi.toFixed(1)}</div>
            <p className="text-sm text-gray-900 font-medium mt-2">{L.categoryLabel}: {L.categoryNames[ok.cat]} ({bmiRangeText(L.cuts, ok.cat)})</p>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{L.standardNote}</p>
          </div>
          {ok.whtr !== null && (
            <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-1.5">{L.whtrLabel}</div>
              <div className="text-3xl md:text-4xl font-bold text-primary-700">{ok.whtr.toFixed(2)}</div>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">{ok.whtr < 0.5 ? L.whtrBelow : L.whtrAbove}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 overflow-x-auto">
        <div className="text-sm font-semibold mb-2">{L.tableHeader} ({L.standardName})</div>
        <table className="w-full text-sm border border-gray-200 rounded-lg">
          <tbody>
            {L.categoryNames.map((n, i) => (
              <tr key={n} className={`border-t border-gray-200 ${ok && ok.cat === i ? 'bg-primary-50 font-semibold' : ''}`}>
                <td className="px-3 py-2">{n}</td>
                <td className="px-3 py-2 text-right whitespace-nowrap">{bmiRangeText(L.cuts, i)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {ok && <AppCtaBanner lang={lang} tool="bmi" />}
    </div>
  );
}
