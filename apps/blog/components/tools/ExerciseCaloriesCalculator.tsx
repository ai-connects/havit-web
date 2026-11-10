'use client';
import { useState } from 'react';
import { exerciseCalories, EXERCISE_METS, type ExerciseType } from '@/lib/calculators';
import { type ExerciseLabels, type ToolLang } from '@/lib/tool-labels';
import AppCtaBanner from './AppCtaBanner';

export default function ExerciseCaloriesCalculator({ labels: L, lang }: { labels: ExerciseLabels; lang: ToolLang }) {
  const [type, setType] = useState<ExerciseType>('running_8');
  const [duration, setDuration] = useState(30);
  const [weight, setWeight] = useState(70);
  const [kcal, setKcal] = useState<number | null>(null);
  const types = Object.keys(EXERCISE_METS) as ExerciseType[];

  return (
    <div className="rounded-2xl border border-gray-200 p-5 md:p-7 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2">{L.exercise}</label>
          <select value={type} onChange={(e) => setType(e.target.value as ExerciseType)} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white">
            {types.map((t) => <option key={t} value={t}>{L.exerciseLabels[t]} (METs {EXERCISE_METS[t]})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">{L.duration}</label>
          <input type="number" min={1} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">{L.weight}</label>
          <input type="number" min={1} value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white" />
        </div>
      </div>
      <button type="button" onClick={() => weight > 0 && duration > 0 && setKcal(exerciseCalories(type, duration, weight))} className="mt-6 w-full md:w-auto px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-gray-900 font-semibold transition-colors">
        {L.calculate}
      </button>
      {kcal !== null && (
        <>
          <div className="mt-6 p-5 rounded-xl border-2 border-primary-500 bg-primary-50">
            <div className="text-xs uppercase tracking-wider text-primary-800 mb-1.5">{L.resultLabel}</div>
            <div className="text-3xl md:text-4xl font-bold text-primary-700">{kcal.toLocaleString()} <span className="text-base font-normal text-gray-500">kcal</span></div>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">{L.helpResult}</p>
          </div>
          <AppCtaBanner lang={lang} tool="exercise-calories" />
        </>
      )}
    </div>
  );
}
