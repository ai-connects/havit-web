'use client';

import { useState } from 'react';
import { navyBodyFat, ACE_CUTS, type Sex, type Unit, ftInToCm, inToCm } from '@/lib/calculators';
import AppCtaBanner from './AppCtaBanner';
import type { ToolLang } from '@/lib/tool-labels';
import type { BodyFatLabels } from '@/lib/tool-bmi-bodyfat';

const INPUT = 'w-full px-3 py-2 rounded-lg border border-gray-200 bg-white';
const btn = (on: boolean) => `flex-1 px-3 py-2 rounded-lg border text-sm ${on ? 'bg-primary-500 border-primary-500 text-gray-900 font-semibold' : 'border-gray-200 hover:bg-gray-100'}`;
const r1 = (n: number) => Math.round(n * 10) / 10;

/** ACE range text for category i of a sex. */
function aceRange(sex: Sex, i: number): string {
  const c = ACE_CUTS[sex];
  const lo = sex === 'male' ? 2 : 10;
  if (i === 0) return `${lo}–${c[0] - 1}%`;
  if (i === 4) return `≥ ${c[3]}%`;
  return `${c[i - 1]}–${c[i] - 1}%`;
}

export default function BodyFatCalculator({ labels: L, lang }: { labels: BodyFatLabels; lang: ToolLang }) {
  const startImperial = lang === 'en';
  const [sex, setSex] = useState<Sex>('male');
  const [unit, setUnit] = useState<Unit>(startImperial ? 'imperial' : 'metric');
  const [heightCm, setHeightCm] = useState(178);
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(10);
  const [neck, setNeck] = useState(startImperial ? 15 : 38);
  const [waist, setWaist] = useState(startImperial ? 33.5 : 85);
  const [hip, setHip] = useState(startImperial ? 38 : 96);
  const [res, setRes] = useState<{ pct: number; cat: number } | 'invalid' | null>(null);

  function switchUnit(next: Unit) {
    if (next === unit) return;
    if (next === 'imperial') {
      const totalIn = Math.round(heightCm / 2.54);
      setHeightFt(Math.floor(totalIn / 12)); setHeightIn(totalIn % 12);
      setNeck(r1(neck / 2.54)); setWaist(r1(waist / 2.54)); setHip(r1(hip / 2.54));
    } else {
      setHeightCm(Math.round(ftInToCm(heightFt, heightIn)));
      setNeck(Math.round(inToCm(neck))); setWaist(Math.round(inToCm(waist))); setHip(Math.round(inToCm(hip)));
    }
    setUnit(next); setRes(null);
  }

  function compute() {
    const cv = (v: number) => (unit === 'metric' ? v : inToCm(v));
    const pct = navyBodyFat({
      sex,
      heightCm: unit === 'metric' ? heightCm : ftInToCm(heightFt, heightIn),
      neckCm: cv(neck), waistCm: cv(waist), hipCm: cv(hip),
    });
    if (pct === null || !isFinite(pct) || pct < 0 || pct > 70) { setRes('invalid'); return; }
    const cat = ACE_CUTS[sex].filter((c) => pct >= c).length;
    setRes({ pct, cat });
  }

  const u = unit === 'metric' ? 'cm' : 'in';
  const ok = res && res !== 'invalid' ? res : null;
  const num = (v: number, set: (n: number) => void) => (
    <div className="flex items-center gap-2">
      <input type="number" min={1} step="any" value={v} onChange={(e) => set(Number(e.target.value))} className={INPUT} />
      <span className="text-sm text-gray-500">{u}</span>
    </div>
  );
  return (
    <div className="rounded-2xl border border-gray-200 p-5 md:p-7 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold mb-2">{L.sex}</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setSex('male'); setRes(null); }} className={btn(sex === 'male')}>{L.male}</button>
            <button type="button" onClick={() => { setSex('female'); setRes(null); }} className={btn(sex === 'female')}>{L.female}</button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">{L.units}</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => switchUnit('metric')} className={btn(unit === 'metric')}>{L.metric}</button>
            <button type="button" onClick={() => switchUnit('imperial')} className={btn(unit === 'imperial')}>{L.imperial}</button>
          </div>
        </div>
        <div className="md:col-span-2">
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
        <div><label className="block text-sm font-semibold mb-2">{L.neck}</label>{num(neck, setNeck)}</div>
        <div><label className="block text-sm font-semibold mb-2">{L.waist}</label>{num(waist, setWaist)}</div>
        {sex === 'female' && <div><label className="block text-sm font-semibold mb-2">{L.hip}</label>{num(hip, setHip)}</div>}
      </div>

      <button type="button" onClick={compute} className="mt-6 w-full md:w-auto px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-gray-900 font-semibold text-base transition-colors">
        {L.calculate}
      </button>

      {res === 'invalid' && <p className="mt-4 text-sm text-gray-600">{L.invalid}</p>}
      {ok && (
        <div className="mt-6 p-5 rounded-xl border-2 border-primary-500 bg-primary-50">
          <div className="text-xs uppercase tracking-wider text-primary-800 mb-1.5">{L.resultLabel}</div>
          <div className="text-3xl md:text-4xl font-bold text-primary-700">{ok.pct.toFixed(1)}<span className="text-base font-normal text-gray-500"> %</span></div>
          <p className="text-sm text-gray-900 font-medium mt-2">{L.categoryLabel}: {L.categoryNames[ok.cat]} ({aceRange(sex, ok.cat)})</p>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">{L.estimateNote}</p>
        </div>
      )}

      <div className="mt-6 overflow-x-auto">
        <div className="text-sm font-semibold mb-2">{L.rangeHeader} — {sex === 'male' ? L.male : L.female}</div>
        <table className="w-full text-sm border border-gray-200 rounded-lg">
          <tbody>
            {L.categoryNames.map((n, i) => (
              <tr key={n} className={`border-t border-gray-200 ${ok && ok.cat === i ? 'bg-primary-50 font-semibold' : ''}`}>
                <td className="px-3 py-2">{n}</td>
                <td className="px-3 py-2 text-right whitespace-nowrap">{aceRange(sex, i)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {ok && <AppCtaBanner lang={lang} tool="body-fat" />}
    </div>
  );
}
