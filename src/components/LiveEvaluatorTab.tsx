import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Eye } from 'lucide-react';
import {
  evaluateFuzzyModel,
  FOOD_PROFILES,
  type FoodProfile,
  type FuzzyResult,
} from '../utils/fuzzyEngine';

interface Props {
  color: number; setColor: (v: number) => void;
  smell: number; setSmell: (v: number) => void;
  duration: number; setDuration: (v: number) => void;
  selectedProfile: FoodProfile; setSelectedProfile: (p: FoodProfile) => void;
  onExploreCurves: () => void;
}

/* ── Horizontal freshness gauge ── */
function FreshnessGauge({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="space-y-1 select-none">
      {/* Colour bands */}
      <div className="relative h-5 flex overflow-hidden" style={{ borderRadius: 3 }}>
        <div className="h-full" style={{ width: '40%', background: '#FDECEA' }} />
        <div className="h-full" style={{ width: '35%', background: '#FEF3C7' }} />
        <div className="h-full" style={{ width: '25%', background: '#EAF2ED' }} />
        {/* Needle */}
        <div
          className="absolute inset-y-0 w-0.5 bg-[#1F2022] dark:bg-[#E8E5DD] transition-all duration-200"
          style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
        />
      </div>
      {/* Band labels */}
      <div className="flex text-[10px] font-mono">
        <span className="w-[40%] text-[#9E2A2B] dark:text-[#E05252]">Spoiled 0–40</span>
        <span className="w-[35%] text-center text-[#B45309] dark:text-[#D97706]">Moderate 40–75</span>
        <span className="w-[25%] text-right text-[#2F6B4F] dark:text-[#5A9C7D]">Fresh 75–100</span>
      </div>
      {/* Big score */}
      <div className="flex items-baseline gap-2 pt-1">
        <span className="font-mono text-3xl font-bold text-[#1F2022] dark:text-[#E8E5DD]">
          {value.toFixed(1)}
        </span>
        <span className="text-xs text-[#4A4A4A] dark:text-[#A0A89E]">/ 100 (centroid)</span>
      </div>
    </div>
  );
}

/* ── Membership bars ── */
function MuBars({ label, values }: {
  label: string;
  values: { name: string; v: number; color: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-[#4A4A4A] dark:text-[#A0A89E]">{label}</p>
      {values.map(({ name, v, color }) => (
        <div key={name} className="flex items-center gap-2 text-xs">
          <span className="w-20 shrink-0 font-mono text-[#4A4A4A] dark:text-[#A0A89E]">{name}</span>
          <div className="flex-1 h-1.5 bg-[#D8D4CB] dark:bg-[#2E312E] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{ width: `${v * 100}%`, background: color }}
            />
          </div>
          <span className="w-10 text-right font-mono text-[#4A4A4A] dark:text-[#A0A89E]">{v.toFixed(3)}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Slider ── */
function Slider({
  id, label, unit, min, max, step, value, onChange, note,
}: {
  id: string; label: string; unit: string; min: number; max: number;
  step: number; value: number; onChange: (v: number) => void; note: string;
}) {
  return (
    <div className="py-4 border-b border-[#D8D4CB] dark:border-[#2E312E] last:border-0 space-y-2">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-[#1F2022] dark:text-[#E8E5DD]">{label}</label>
        <span className="font-mono text-lg font-bold text-[#2F6B4F] dark:text-[#5A9C7D]">
          {step < 1 ? value.toFixed(1) : value}
          <span className="text-sm font-normal text-[#4A4A4A] dark:text-[#A0A89E] ml-1">{unit}</span>
        </span>
      </div>
      <input
        id={id} type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-[10px] font-mono text-[#4A4A4A] dark:text-[#A0A89E]">
        <span>{min}</span>
        <span className="font-sans italic">{note}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

/* ── Status chip ── */
function StatusChip({ status }: { status: string }) {
  const cls =
    status === 'Fresh' ? 'chip-fresh' :
    status === 'Moderate' ? 'chip-moderate' : 'chip-spoiled';
  const text =
    status === 'Fresh' ? 'Fresh — safe to consume' :
    status === 'Moderate' ? 'Moderate — consume soon' : 'Spoiled — discard';
  return <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded ${cls}`}>{text}</span>;
}

const PRESETS = [
  { name: 'Fresh milk, Day 1',   c: 9.0, s: 0.8, d: 1 },
  { name: 'Apples, Day 7',       c: 7.5, s: 2.0, d: 7 },
  { name: 'Fish, Day 4',         c: 5.5, s: 6.8, d: 4 },
  { name: 'Chicken, Day 6',      c: 2.2, s: 8.9, d: 6 },
];

export const LiveEvaluatorTab: React.FC<Props> = ({
  color, setColor, smell, setSmell, duration, setDuration,
  selectedProfile, setSelectedProfile, onExploreCurves,
}) => {
  const [showMu, setShowMu] = useState(true);
  const [showRules, setShowRules] = useState(true);

  const result: FuzzyResult = evaluateFuzzyModel(color, smell, duration, selectedProfile);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">

      {/* Header */}
      <div className="pt-8">
        <h2 className="font-serif text-3xl text-[#1F2022] dark:text-[#E8E5DD] mb-1">Live Evaluator</h2>
        <p className="text-sm text-[#4A4A4A] dark:text-[#A0A89E]">
          Slide the inputs and watch how the output changes. All 27 rules fire in real time.
        </p>
      </div>

      {/* Profile selector */}
      <div>
        <p className="text-[10px] uppercase tracking-widest font-semibold text-[#4A4A4A] dark:text-[#A0A89E] mb-2">
          Food category
        </p>
        <div className="flex flex-wrap gap-2">
          {FOOD_PROFILES.map(p => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedProfile(p);
                if (duration > p.maxStorageDays) setDuration(p.maxStorageDays);
              }}
              className={`px-3 py-1.5 text-sm rounded border transition-colors duration-150 ${
                selectedProfile.id === p.id
                  ? 'bg-[#2F6B4F] text-[#F6F3EC] border-[#2F6B4F]'
                  : 'border-[#D8D4CB] dark:border-[#2E312E] text-[#4A4A4A] dark:text-[#A0A89E] hover:border-[#2F6B4F] hover:text-[#2F6B4F]'
              }`}
            >
              {p.name.split('/')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-t border-[#D8D4CB] dark:border-[#2E312E]"/>

      {/* 2-column: sliders | output */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">

        {/* LEFT */}
        <div>
          {/* Presets */}
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-widest font-semibold text-[#4A4A4A] dark:text-[#A0A89E] mb-2">
              Sample presets
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(p => (
                <button
                  key={p.name}
                  onClick={() => { setColor(p.c); setSmell(p.s); setDuration(p.d); }}
                  className="text-xs px-2.5 py-1 rounded border border-[#D8D4CB] dark:border-[#2E312E] text-[#4A4A4A] dark:text-[#A0A89E] hover:border-[#2F6B4F] hover:text-[#2F6B4F] transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <Slider id="sl-color" label="Colour score" unit="/ 10" min={0} max={10} step={0.1}
            value={color} onChange={setColor} note="0 = brown/mouldy · 10 = vibrant" />
          <Slider id="sl-smell" label="Smell index" unit="/ 10" min={0} max={10} step={0.1}
            value={smell} onChange={setSmell} note="0 = neutral · 10 = putrid" />
          <Slider id="sl-dur" label="Storage duration" unit="days"
            min={0} max={selectedProfile.maxStorageDays} step={1}
            value={duration} onChange={setDuration}
            note={`max ${selectedProfile.maxStorageDays}d for this category`} />

          {/* Fuzzification panel */}
          <div className="mt-5 border border-[#D8D4CB] dark:border-[#2E312E] rounded">
            <button
              onClick={() => setShowMu(v => !v)}
              className="w-full flex justify-between items-center px-4 py-3 text-sm font-semibold text-[#1F2022] dark:text-[#E8E5DD] hover:bg-[#D8D4CB]/30 dark:hover:bg-[#2E312E]/40 transition-colors"
            >
              <span>Step 1 — Fuzzification (μ values)</span>
              {showMu ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
            </button>
            {showMu && (
              <div className="px-4 pb-4 pt-2 space-y-4 border-t border-[#D8D4CB] dark:border-[#2E312E]">
                <MuBars label="Colour" values={[
                  { name: 'Poor',       v: result.fuzzified.color.poor,       color: '#9E2A2B' },
                  { name: 'Acceptable', v: result.fuzzified.color.acceptable, color: '#B45309' },
                  { name: 'Good',       v: result.fuzzified.color.good,       color: '#2F6B4F' },
                ]} />
                <MuBars label="Smell" values={[
                  { name: 'Fresh',    v: result.fuzzified.smell.fresh,    color: '#2F6B4F' },
                  { name: 'Moderate', v: result.fuzzified.smell.moderate, color: '#B45309' },
                  { name: 'Pungent',  v: result.fuzzified.smell.pungent,  color: '#9E2A2B' },
                ]} />
                <MuBars label="Storage" values={[
                  { name: 'Short',  v: result.fuzzified.duration.short,  color: '#2F6B4F' },
                  { name: 'Medium', v: result.fuzzified.duration.medium, color: '#B45309' },
                  { name: 'Long',   v: result.fuzzified.duration.long,   color: '#9E2A2B' },
                ]} />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: output */}
        <div className="space-y-5">
          {/* Score card */}
          <div className="border border-[#D8D4CB] dark:border-[#2E312E] rounded p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg text-[#1F2022] dark:text-[#E8E5DD]">Freshness score</h3>
              <button
                onClick={onExploreCurves}
                className="flex items-center gap-1 text-xs text-[#2F6B4F] dark:text-[#5A9C7D] hover:underline"
              >
                <Eye size={12}/> see curves
              </button>
            </div>

            <FreshnessGauge value={result.crispOutput} />

            <div className="border-t border-[#D8D4CB] dark:border-[#2E312E] pt-3 space-y-2">
              <StatusChip status={result.status} />
              <p className="text-xs text-[#4A4A4A] dark:text-[#A0A89E] leading-relaxed">
                {result.recommendation}
              </p>
              <p className="text-[11px] font-mono text-[#4A4A4A] dark:text-[#A0A89E]">
                Model confidence: <span className="text-[#2F6B4F] dark:text-[#5A9C7D] font-semibold">{result.safetyConfidence}%</span>
              </p>
            </div>
          </div>

          {/* Firing rules */}
          <div className="border border-[#D8D4CB] dark:border-[#2E312E] rounded overflow-hidden">
            <button
              onClick={() => setShowRules(v => !v)}
              className="w-full flex justify-between items-center px-4 py-3 text-sm font-semibold text-[#1F2022] dark:text-[#E8E5DD] hover:bg-[#D8D4CB]/30 dark:hover:bg-[#2E312E]/40 transition-colors"
            >
              <span>Firing rules ({result.activeRules.length} / 27)</span>
              {showRules ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
            </button>
            {showRules && (
              <div className="border-t border-[#D8D4CB] dark:border-[#2E312E] max-h-56 overflow-y-auto">
                {result.activeRules.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-[#4A4A4A] dark:text-[#A0A89E]">No rules currently firing.</p>
                ) : (
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-[#F6F3EC] dark:bg-[#1E201E] border-b border-[#D8D4CB] dark:border-[#2E312E]">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-[#1F2022] dark:text-[#E8E5DD]">#</th>
                        <th className="px-3 py-2 text-left font-semibold text-[#1F2022] dark:text-[#E8E5DD]">C / S / D → Out</th>
                        <th className="px-3 py-2 text-right font-semibold text-[#1F2022] dark:text-[#E8E5DD]">α</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.activeRules.map((rule, i) => (
                        <tr key={rule.id} className={i % 2 === 0 ? '' : 'bg-[#D8D4CB]/20 dark:bg-[#2E312E]/20'}>
                          <td className="px-3 py-1.5 font-mono text-[#4A4A4A] dark:text-[#A0A89E]">{rule.id}</td>
                          <td className="px-3 py-1.5 text-[#1F2022] dark:text-[#E8E5DD]">
                            {rule.color[0]}{rule.smell[0]}{rule.duration[0]} →{' '}
                            <span className={
                              rule.consequent === 'Fresh'    ? 'text-[#2F6B4F] dark:text-[#5A9C7D] font-semibold' :
                              rule.consequent === 'Moderate' ? 'text-[#B45309] dark:text-[#D97706] font-semibold' :
                                                               'text-[#9E2A2B] dark:text-[#E05252] font-semibold'
                            }>
                              {rule.consequent}
                            </span>
                          </td>
                          <td className="px-3 py-1.5 font-mono text-right text-[#2F6B4F] dark:text-[#5A9C7D]">
                            {rule.firingStrength.toFixed(3)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
