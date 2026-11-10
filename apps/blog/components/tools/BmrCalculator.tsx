'use client';

import { useState } from 'react';
import {
  bmrMifflinStJeor,
  tdee as calcTdee,
  ACTIVITY_MULTIPLIER,
  type ActivityLevel,
  type Sex,
  type Unit,
  lbToKg,
  ftInToCm,
} from '@/lib/calculators';
import AppCtaBanner from './AppCtaBanner';
import type { ToolLang } from '@/lib/tool-labels';

interface Labels {
  sex: string;
  male: string;
  female: string;
  age: string;
  weight: string;
  height: string;
  units: string;
  metric: string;
  imperial: string;
  activity: string;
  activityLevels: Record<ActivityLevel, string>;
  calculate: string;
  result: string;
  bmrLabel: string;
  tdeeLabel: string;
  bmrHelp: string;
  tdeeHelp: string;
  feet: string;
  inches: string;
}

interface Props {
  labels: Labels;
  lang: ToolLang;
}

export default function BmrCalculator({ labels, lang }: Props) {
  const [sex, setSex] = useState<Sex>('male');
  const [age, setAge] = useState(30);
  const [unit, setUnit] = useState<Unit>('metric');
  const [weight, setWeight] = useState(70);
  const [heightCm, setHeightCm] = useState(170);
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(7);
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [result, setResult] = useState<{ bmr: number; tdee: number } | null>(null);

  function compute() {
    const wKg = unit === 'metric' ? weight : lbToKg(weight);
    const hCm = unit === 'metric' ? heightCm : ftInToCm(heightFt, heightIn);
    if (wKg <= 0 || hCm <= 0 || age <= 0) return;
    const bmrVal = bmrMifflinStJeor({ sex, weightKg: wKg, heightCm: hCm, age });
    setResult({ bmr: bmrVal, tdee: calcTdee(bmrVal, activity) });
  }

  return (
    <div className="rounded-2xl border border-gray-200 p-5 md:p-7 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold mb-2">{labels.sex}</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setSex('male')} className={`flex-1 px-3 py-2 rounded-lg border text-sm ${sex === 'male' ? 'bg-primary-500 border-primary-500 text-gray-900 font-semibold' : 'border-gray-200 hover:bg-gray-100'}`}>{labels.male}</button>
            <button type="button" onClick={() => setSex('female')} className={`flex-1 px-3 py-2 rounded-lg border text-sm ${sex === 'female' ? 'bg-primary-500 border-primary-500 text-gray-900 font-semibold' : 'border-gray-200 hover:bg-gray-100'}`}>{labels.female}</button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">{labels.units}</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setUnit('metric')} className={`flex-1 px-3 py-2 rounded-lg border text-sm ${unit === 'metric' ? 'bg-primary-500 border-primary-500 text-gray-900 font-semibold' : 'border-gray-200 hover:bg-gray-100'}`}>{labels.metric}</button>
            <button type="button" onClick={() => setUnit('imperial')} className={`flex-1 px-3 py-2 rounded-lg border text-sm ${unit === 'imperial' ? 'bg-primary-500 border-primary-500 text-gray-900 font-semibold' : 'border-gray-200 hover:bg-gray-100'}`}>{labels.imperial}</button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">{labels.age}</label>
          <input type="number" min={1} max={120} value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">{labels.weight} ({unit === 'metric' ? 'kg' : 'lb'})</label>
          <input type="number" min={1} value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2">{labels.height}</label>
          {unit === 'metric' ? (
            <div className="flex items-center gap-2">
              <input type="number" min={1} value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white" />
              <span className="text-sm text-gray-500">cm</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <input type="number" min={0} value={heightFt} onChange={(e) => setHeightFt(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white" />
                <span className="text-sm text-gray-500">{labels.feet}</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" min={0} max={11} value={heightIn} onChange={(e) => setHeightIn(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white" />
                <span className="text-sm text-gray-500">{labels.inches}</span>
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2">{labels.activity}</label>
          <select value={activity} onChange={(e) => setActivity(e.target.value as ActivityLevel)} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white">
            {(Object.keys(ACTIVITY_MULTIPLIER) as ActivityLevel[]).map((lvl) => (
              <option key={lvl} value={lvl}>{labels.activityLevels[lvl]} (×{ACTIVITY_MULTIPLIER[lvl]})</option>
            ))}
          </select>
        </div>
      </div>

      <button type="button" onClick={compute} className="mt-6 w-full md:w-auto px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-gray-900 font-semibold text-base transition-colors">
        {labels.calculate}
      </button>

      {result && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
            <div className="text-xs uppercase tracking-wider text-gray-500 mb-1.5">{labels.bmrLabel}</div>
            <div className="text-3xl md:text-4xl font-bold text-primary-700">{result.bmr.toLocaleString()} <span className="text-base font-normal text-gray-500">kcal</span></div>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">{labels.bmrHelp}</p>
          </div>
          <div className="p-5 rounded-xl border-2 border-primary-500 bg-primary-50">
            <div className="text-xs uppercase tracking-wider text-primary-800 mb-1.5">{labels.tdeeLabel}</div>
            <div className="text-3xl md:text-4xl font-bold text-primary-700">{result.tdee.toLocaleString()} <span className="text-base font-normal text-gray-500">kcal</span></div>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">{labels.tdeeHelp}</p>
          </div>
        </div>
      )}
      {result && <AppCtaBanner lang={lang} tool="bmr" />}
    </div>
  );
}
