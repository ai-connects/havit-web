'use client';
import { useState } from 'react';
import { waterIntakeMl, type Climate } from '@/lib/calculators';
import { type WaterLabels, type ToolLang } from '@/lib/tool-labels';
import AppCtaBanner from './AppCtaBanner';

export default function WaterCalculator({ labels: L, lang }: { labels: WaterLabels; lang: ToolLang }) {
  const [weight, setWeight] = useState(70);
  const [hours, setHours] = useState(1);
  const [climate, setClimate] = useState<Climate>('normal');
  const [ml, setMl] = useState<number | null>(null);

  return (
    <div className="rounded-2xl border border-gray-200 p-5 md:p-7 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="block text-sm font-semibold mb-2">{L.weight}</label>
          <input type="number" min={1} value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">{L.exerciseHours}</label>
          <input type="number" min={0} max={6} step={0.25} value={hours} onChange={(e) => setHours(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">{L.climate}</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setClimate('normal')} className={`flex-1 px-3 py-2 rounded-lg border text-sm ${climate === 'normal' ? 'bg-primary-500 border-primary-500 text-gray-900 font-semibold' : 'border-gray-200 hover:bg-gray-100'}`}>{L.climateNormal}</button>
            <button type="button" onClick={() => setClimate('hot')} className={`flex-1 px-3 py-2 rounded-lg border text-sm ${climate === 'hot' ? 'bg-primary-500 border-primary-500 text-gray-900 font-semibold' : 'border-gray-200 hover:bg-gray-100'}`}>{L.climateHot}</button>
          </div>
        </div>
      </div>
      <button type="button" onClick={() => weight > 0 && setMl(waterIntakeMl(weight, hours, climate))} className="mt-6 w-full md:w-auto px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-gray-900 font-semibold transition-colors">
        {L.calculate}
      </button>
      {ml !== null && (
        <>
          <div className="mt-6 p-5 rounded-xl border-2 border-primary-500 bg-primary-50">
            <div className="text-xs uppercase tracking-wider text-primary-800 mb-1.5">{L.resultLabel}</div>
            <div className="text-3xl md:text-4xl font-bold text-primary-700">{(ml / 1000).toFixed(2)} <span className="text-base font-normal text-gray-500">L</span></div>
            <p className="text-sm text-gray-700 mt-2">≈ {Math.round(ml / 250)} {L.cupsLabel}</p>
            <p className="text-xs text-gray-500 mt-1.5">{L.help}</p>
          </div>
          <AppCtaBanner lang={lang} tool="water" />
        </>
      )}
    </div>
  );
}
