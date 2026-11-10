'use client';
import { useState } from 'react';
import { proteinRange, type ProteinGoal } from '@/lib/calculators';
import { type ProteinLabels, type ToolLang } from '@/lib/tool-labels';
import AppCtaBanner from './AppCtaBanner';

export default function ProteinCalculator({ labels: L, lang }: { labels: ProteinLabels; lang: ToolLang }) {
  const [weight, setWeight] = useState(70);
  const [goal, setGoal] = useState<ProteinGoal>('strength');
  const [r, setR] = useState<{ low: number; high: number; perMeal: number } | null>(null);
  const goals: ProteinGoal[] = ['sedentary', 'endurance', 'strength', 'cut', 'older_adult'];

  return (
    <div className="rounded-2xl border border-gray-200 p-5 md:p-7 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold mb-2">{L.weight}</label>
          <input type="number" min={1} value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">{L.goal}</label>
          <select value={goal} onChange={(e) => setGoal(e.target.value as ProteinGoal)} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white">
            {goals.map((g) => <option key={g} value={g}>{L.goalLabels[g]}</option>)}
          </select>
        </div>
      </div>
      <button type="button" onClick={() => weight > 0 && setR(proteinRange(weight, goal))} className="mt-6 w-full md:w-auto px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-gray-900 font-semibold transition-colors">
        {L.calculate}
      </button>
      {r && (
        <>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border-2 border-primary-500 bg-primary-50">
              <div className="text-xs uppercase tracking-wider text-primary-800 mb-1.5">{L.rangeLabel}</div>
              <div className="text-3xl md:text-4xl font-bold text-primary-700">{r.low}–{r.high} <span className="text-base font-normal text-gray-500">{L.help}</span></div>
            </div>
            <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-1.5">{L.perMealLabel}</div>
              <div className="text-3xl md:text-4xl font-bold text-primary-700">{r.perMeal} <span className="text-base font-normal text-gray-500">g</span></div>
            </div>
          </div>
          <AppCtaBanner lang={lang} tool="protein" />
        </>
      )}
    </div>
  );
}
