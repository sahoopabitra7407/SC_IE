import React, { useState } from 'react';
import {
  fuzzifyColor, fuzzifySmell, fuzzifyDuration, freshnessMembership,
  evaluateFuzzyModel, type FoodProfile,
} from '../utils/fuzzyEngine';

interface Props {
  color: number; setColor: (v: number) => void;
  smell: number; setSmell: (v: number) => void;
  duration: number; setDuration: (v: number) => void;
  selectedProfile: FoodProfile;
}

/* ── SVG Membership Function Chart ── */
interface ChartProps {
  title: string;
  figNum: string;
  xLabel: string;
  xMin: number;
  xMax: number;
  markerX: number;
  curves: { label: string; color: string; fn: (x: number) => number }[];
  markerValues: { label: string; value: number; color: string }[];
}

function MfChart({ title, figNum, xLabel, xMin, xMax, markerX, curves, markerValues }: ChartProps) {
  const W = 480; const H = 160;
  const PAD = { top: 16, right: 20, bottom: 32, left: 36 };
  const pw = W - PAD.left - PAD.right;
  const ph = H - PAD.top - PAD.bottom;

  const sx = (x: number) => PAD.left + ((x - xMin) / (xMax - xMin)) * pw;
  const sy = (mu: number) => PAD.top + (1 - mu) * ph;

  const makePath = (fn: (x: number) => number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 100; i++) {
      const x = xMin + (i / 100) * (xMax - xMin);
      const mu = fn(x);
      pts.push(`${i === 0 ? 'M' : 'L'} ${sx(x).toFixed(1)} ${sy(mu).toFixed(1)}`);
    }
    return pts.join(' ');
  };

  const ticks = 5;
  const mx = sx(markerX);

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <h4 className="font-serif text-[15px] text-[#1F2022] dark:text-[#E8E5DD]">{title}</h4>
        <span className="mono text-[11px] text-[#4A4A4A] dark:text-[#A0A89E]">
          input = {typeof markerX === 'number' && (xMax - xMin) >= 10 && (markerX % 1 === 0) ? markerX : markerX.toFixed(1)}
          {' '}{xLabel.split('(')[1]?.replace(')', '') ?? ''}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-36 select-none">
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map(mu => (
          <line key={mu}
            x1={PAD.left} y1={sy(mu)} x2={W - PAD.right} y2={sy(mu)}
            stroke="#D8D4CB" strokeWidth={mu === 0 || mu === 1 ? '1.5' : '0.75'}
            className="dark:stroke-[#2E312E]"
          />
        ))}
        {/* Axis */}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H - PAD.bottom}
          stroke="#4A4A4A" strokeWidth="1" className="dark:stroke-[#A0A89E]" />
        <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom}
          stroke="#4A4A4A" strokeWidth="1" className="dark:stroke-[#A0A89E]" />

        {/* Y ticks */}
        {[0, 0.5, 1].map(mu => (
          <text key={mu} x={PAD.left - 5} y={sy(mu) + 3.5}
            textAnchor="end" fontSize="9" fill="#4A4A4A" className="dark:fill-[#A0A89E] font-mono">
            {mu.toFixed(1)}
          </text>
        ))}

        {/* X ticks */}
        {Array.from({ length: ticks + 1 }, (_, i) => {
          const x = xMin + (i / ticks) * (xMax - xMin);
          return (
            <g key={i}>
              <line x1={sx(x)} y1={H - PAD.bottom} x2={sx(x)} y2={H - PAD.bottom + 3}
                stroke="#4A4A4A" strokeWidth="1" className="dark:stroke-[#A0A89E]" />
              <text x={sx(x)} y={H - PAD.bottom + 13}
                textAnchor="middle" fontSize="9" fill="#4A4A4A" className="dark:fill-[#A0A89E] font-mono">
                {Number.isInteger(x) ? x : x.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Membership curves */}
        {curves.map(c => (
          <path key={c.label} d={makePath(c.fn)}
            fill="none" stroke={c.color} strokeWidth="1.75" strokeLinejoin="round" />
        ))}

        {/* Marker line */}
        <line x1={mx} y1={PAD.top} x2={mx} y2={H - PAD.bottom}
          stroke="#1F2022" strokeWidth="1.5" strokeDasharray="3 2"
          className="dark:stroke-[#E8E5DD]" />

        {/* Intersection dots */}
        {markerValues.map(({ label, value, color }) =>
          value > 0.001 ? (
            <circle key={label}
              cx={mx} cy={sy(value)} r="3.5"
              fill={color} stroke="#F6F3EC" strokeWidth="1.5"
              className="dark:stroke-[#161716]" />
          ) : null
        )}

        {/* Axis label */}
        <text x={W / 2} y={H} textAnchor="middle" fontSize="9" fill="#4A4A4A" className="dark:fill-[#A0A89E]">
          {xLabel}
        </text>
        <text x={PAD.left - 26} y={H / 2} textAnchor="middle" fontSize="9" fill="#4A4A4A"
          className="dark:fill-[#A0A89E]" transform={`rotate(-90, ${PAD.left - 26}, ${H / 2})`}>
          μ(x)
        </text>
      </svg>

      {/* Legend + current values */}
      <div className="flex flex-wrap gap-3 text-[11px]">
        {markerValues.map(({ label, value, color }) => (
          <span key={label} className="flex items-center gap-1 font-mono text-[#4A4A4A] dark:text-[#A0A89E]">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: color }} />
            {label}: {value.toFixed(3)}
          </span>
        ))}
      </div>
      <p className="fig-label">{figNum}: Membership functions for {title.toLowerCase()}</p>
    </div>
  );
}

/* ── Defuzzification chart ── */
function DefuzzChart({ result }: { result: ReturnType<typeof evaluateFuzzyModel> }) {
  const W = 480; const H = 160;
  const PAD = { top: 16, right: 20, bottom: 32, left: 36 };
  const pw = W - PAD.left - PAD.right;
  const ph = H - PAD.top - PAD.bottom;

  const sx = (y: number) => PAD.left + (y / 100) * pw;
  const sy = (mu: number) => PAD.top + (1 - mu) * ph;

  const makePath = (fn: (y: number) => number) => {
    const pts: string[] = [];
    for (let y = 0; y <= 100; y++) {
      const mu = fn(y);
      pts.push(`${y === 0 ? 'M' : 'L'} ${sx(y).toFixed(1)} ${sy(mu).toFixed(1)}`);
    }
    return pts.join(' ');
  };

  // Aggregated polygon
  const aggPoly = [
    `${sx(0).toFixed(1)},${sy(0).toFixed(1)}`,
    ...result.aggregatedCurve.map(pt => `${sx(pt.y).toFixed(1)},${sy(pt.mu).toFixed(1)}`),
    `${sx(100).toFixed(1)},${sy(0).toFixed(1)}`,
  ].join(' ');

  const cx = sx(result.crispOutput);

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <h4 className="font-serif text-[15px] text-[#1F2022] dark:text-[#E8E5DD]">Output — Aggregated region & centroid</h4>
        <span className="mono text-[11px] text-[#4A4A4A] dark:text-[#A0A89E]">z* = {result.crispOutput.toFixed(1)}%</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-36 select-none">
        {[0, 0.25, 0.5, 0.75, 1].map(mu => (
          <line key={mu} x1={PAD.left} y1={sy(mu)} x2={W - PAD.right} y2={sy(mu)}
            stroke="#D8D4CB" strokeWidth={mu === 0 || mu === 1 ? '1.5' : '0.75'}
            className="dark:stroke-[#2E312E]" />
        ))}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H - PAD.bottom}
          stroke="#4A4A4A" strokeWidth="1" className="dark:stroke-[#A0A89E]" />
        <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom}
          stroke="#4A4A4A" strokeWidth="1" className="dark:stroke-[#A0A89E]" />

        {[0, 0.5, 1].map(mu => (
          <text key={mu} x={PAD.left - 5} y={sy(mu) + 3.5}
            textAnchor="end" fontSize="9" fill="#4A4A4A" className="dark:fill-[#A0A89E] font-mono">
            {mu.toFixed(1)}
          </text>
        ))}

        {[0, 25, 50, 75, 100].map(v => (
          <g key={v}>
            <line x1={sx(v)} y1={H - PAD.bottom} x2={sx(v)} y2={H - PAD.bottom + 3}
              stroke="#4A4A4A" strokeWidth="1" className="dark:stroke-[#A0A89E]" />
            <text x={sx(v)} y={H - PAD.bottom + 13}
              textAnchor="middle" fontSize="9" fill="#4A4A4A" className="dark:fill-[#A0A89E] font-mono">
              {v}
            </text>
          </g>
        ))}

        {/* Background output curves (faded) */}
        <path d={makePath(y => freshnessMembership(y).spoiled)}
          fill="none" stroke="#9E2A2B" strokeWidth="0.75" strokeOpacity="0.4" />
        <path d={makePath(y => freshnessMembership(y).moderate)}
          fill="none" stroke="#B45309" strokeWidth="0.75" strokeOpacity="0.4" />
        <path d={makePath(y => freshnessMembership(y).fresh)}
          fill="none" stroke="#2F6B4F" strokeWidth="0.75" strokeOpacity="0.4" />

        {/* Shaded aggregated area */}
        <polygon points={aggPoly} fill="#2F6B4F" fillOpacity="0.15" stroke="#2F6B4F" strokeWidth="1.5" />

        {/* Centroid line */}
        <line x1={cx} y1={PAD.top} x2={cx} y2={H - PAD.bottom}
          stroke="#1F2022" strokeWidth="2" strokeDasharray="4 2"
          className="dark:stroke-[#E8E5DD]" />
        <circle cx={cx} cy={H - PAD.bottom} r="3.5" fill="#1F2022" className="dark:fill-[#E8E5DD]" />
        <text x={cx + 4} y={PAD.top + 12} fontSize="9" fill="#1F2022" className="dark:fill-[#E8E5DD] font-mono">
          z*={result.crispOutput.toFixed(0)}
        </text>

        <text x={W / 2} y={H} textAnchor="middle" fontSize="9" fill="#4A4A4A" className="dark:fill-[#A0A89E]">
          Freshness index (0–100%)
        </text>
        <text x={PAD.left - 26} y={H / 2} textAnchor="middle" fontSize="9" fill="#4A4A4A"
          className="dark:fill-[#A0A89E]" transform={`rotate(-90, ${PAD.left - 26}, ${H / 2})`}>
          μ_agg
        </text>
      </svg>
      <div className="flex flex-wrap gap-3 text-[11px] mono text-[#4A4A4A] dark:text-[#A0A89E]">
        <span className="flex items-center gap-1"><span className="w-2.5 h-1.5 bg-[#9E2A2B] opacity-40 inline-block"/>Spoiled</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-1.5 bg-[#B45309] opacity-40 inline-block"/>Moderate</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-1.5 bg-[#2F6B4F] opacity-40 inline-block"/>Fresh</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-1.5 bg-[#2F6B4F] opacity-70 inline-block"/>Aggregated μ_agg(z)</span>
      </div>
      <p className="fig-label">Fig. 4: Mamdani aggregated output region. Dashed line = centroid z*.</p>
    </div>
  );
}

/* ── Rule Filter ── */
type Filter = 'all' | 'active' | 'Fresh' | 'Moderate' | 'Spoiled';

export const VisualizerTab: React.FC<Props> = ({
  color, setColor, smell, setSmell, duration, setDuration, selectedProfile
}) => {
  const [ruleFilter, setRuleFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const result = evaluateFuzzyModel(color, smell, duration, selectedProfile);
  const maxD = selectedProfile.maxStorageDays;



  const filteredRules = result.rules.filter(r => {
    if (ruleFilter === 'active' && r.firingStrength <= 0.001) return false;
    if (ruleFilter === 'Fresh' || ruleFilter === 'Moderate' || ruleFilter === 'Spoiled') {
      if (r.consequent !== ruleFilter) return false;
    }
    if (search) {
      const t = search.toLowerCase();
      return r.color.toLowerCase().includes(t)
        || r.smell.toLowerCase().includes(t)
        || r.duration.toLowerCase().includes(t)
        || r.consequent.toLowerCase().includes(t)
        || `${r.id}`.includes(t);
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-16">
      <div className="pt-8">
        <h2 className="font-serif text-3xl text-[#1F2022] dark:text-[#E8E5DD] mb-2">Fuzzy Curves</h2>
        <p className="text-sm text-[#4A4A4A] dark:text-[#A0A89E]">
          These charts show how each crisp input maps to linguistic degrees of membership.
          The dashed vertical line marks your current input value.
          Adjust input values on the Evaluator page; charts update in real time.
        </p>
      </div>

      {/* Inline mini-controls */}
      <div className="flex flex-wrap gap-4 items-center text-xs font-mono text-[#4A4A4A] dark:text-[#A0A89E] p-3 border border-[#D8D4CB] dark:border-[#2E312E] rounded bg-[#F6F3EC] dark:bg-[#1E201E]">
        <span className="font-sans font-semibold text-[#1F2022] dark:text-[#E8E5DD] text-[11px] mr-1">Live input controls:</span>
        {[
          { id: 'vc-c', label: 'Colour (0–10)', min: 0, max: 10, step: 0.1, val: color, set: setColor },
          { id: 'vc-s', label: 'Smell (0–10)',  min: 0, max: 10, step: 0.1, val: smell, set: setSmell },
          { id: 'vc-d', label: `Storage (0–${maxD}d)`, min: 0, max: maxD, step: 1, val: duration, set: setDuration },
        ].map(ctrl => (
          <label key={ctrl.id} className="flex items-center gap-2">
            <span>{ctrl.label}:</span>
            <input type="number" min={ctrl.min} max={ctrl.max} step={ctrl.step} value={ctrl.val}
              onChange={e => ctrl.set(ctrl.step < 1 ? parseFloat(e.target.value) || 0 : parseInt(e.target.value) || 0)}
              className="w-16 px-1.5 py-0.5 border border-[#D8D4CB] dark:border-[#2E312E] rounded bg-white dark:bg-[#161716] text-[#1F2022] dark:text-[#E8E5DD] font-mono text-xs focus-visible:outline-[#2F6B4F]"
            />
          </label>
        ))}
      </div>

      <hr className="divider"/>

      {/* Fig 1 & 2 side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <MfChart
          title="Colour score"
          figNum="Fig. 1"
          xLabel="Colour score (0–10)"
          xMin={0} xMax={10} markerX={color}
          curves={[
            { label: 'Poor',       color: '#9E2A2B', fn: x => fuzzifyColor(x).poor },
            { label: 'Acceptable', color: '#B45309', fn: x => fuzzifyColor(x).acceptable },
            { label: 'Good',       color: '#2F6B4F', fn: x => fuzzifyColor(x).good },
          ]}
          markerValues={[
            { label: 'Poor',       value: result.fuzzified.color.poor,       color: '#9E2A2B' },
            { label: 'Acceptable', value: result.fuzzified.color.acceptable, color: '#B45309' },
            { label: 'Good',       value: result.fuzzified.color.good,       color: '#2F6B4F' },
          ]}
        />
        <MfChart
          title="Smell index"
          figNum="Fig. 2"
          xLabel="Smell index (0–10)"
          xMin={0} xMax={10} markerX={smell}
          curves={[
            { label: 'Fresh',    color: '#2F6B4F', fn: x => fuzzifySmell(x).fresh },
            { label: 'Moderate', color: '#B45309', fn: x => fuzzifySmell(x).moderate },
            { label: 'Pungent',  color: '#9E2A2B', fn: x => fuzzifySmell(x).pungent },
          ]}
          markerValues={[
            { label: 'Fresh',    value: result.fuzzified.smell.fresh,    color: '#2F6B4F' },
            { label: 'Moderate', value: result.fuzzified.smell.moderate, color: '#B45309' },
            { label: 'Pungent',  value: result.fuzzified.smell.pungent,  color: '#9E2A2B' },
          ]}
        />
      </div>

      <hr className="divider"/>

      {/* Fig 3 & 4 side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <MfChart
          title="Storage duration"
          figNum="Fig. 3"
          xLabel={`Storage duration (0–${maxD} days)`}
          xMin={0} xMax={maxD} markerX={duration}
          curves={[
            { label: 'Short',  color: '#2F6B4F', fn: x => fuzzifyDuration(x, selectedProfile).short },
            { label: 'Medium', color: '#B45309', fn: x => fuzzifyDuration(x, selectedProfile).medium },
            { label: 'Long',   color: '#9E2A2B', fn: x => fuzzifyDuration(x, selectedProfile).long },
          ]}
          markerValues={[
            { label: 'Short',  value: result.fuzzified.duration.short,  color: '#2F6B4F' },
            { label: 'Medium', value: result.fuzzified.duration.medium, color: '#B45309' },
            { label: 'Long',   value: result.fuzzified.duration.long,   color: '#9E2A2B' },
          ]}
        />
        <DefuzzChart result={result} />
      </div>

      <hr className="divider"/>

      {/* Full rule base table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl text-[#1F2022] dark:text-[#E8E5DD]">Rule base (27 rules)</h3>
            <p className="text-xs text-[#4A4A4A] dark:text-[#A0A89E] mt-0.5">
              Every combination of 3 colour × 3 smell × 3 storage levels.
              Rows with α &gt; 0 are highlighted.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {(['all', 'active', 'Fresh', 'Moderate', 'Spoiled'] as Filter[]).map(f => (
              <button
                key={f}
                onClick={() => setRuleFilter(f)}
                className={`px-2.5 py-1 rounded border text-xs transition-colors ${
                  ruleFilter === f
                    ? 'bg-[#2F6B4F] text-[#F6F3EC] border-[#2F6B4F]'
                    : 'border-[#D8D4CB] dark:border-[#2E312E] text-[#4A4A4A] dark:text-[#A0A89E] hover:border-[#2F6B4F]'
                }`}
              >
                {f === 'all' ? `All (27)` : f === 'active' ? `Active (${result.activeRules.length})` : f}
              </button>
            ))}
            <input
              type="text" placeholder="Search…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-2.5 py-1 rounded border border-[#D8D4CB] dark:border-[#2E312E] bg-white dark:bg-[#161716] text-[#1F2022] dark:text-[#E8E5DD] text-xs focus-visible:outline-[#2F6B4F] w-28"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-[#D8D4CB] dark:border-[#2E312E] rounded">
          <table className="w-full text-xs table-zebra">
            <thead className="bg-[#F6F3EC] dark:bg-[#1E201E] sticky top-0 z-10">
              <tr className="border-b border-[#D8D4CB] dark:border-[#2E312E]">
                {['#', 'Colour', 'Smell', 'Storage', 'Consequent', 'α (firing)', 'Status'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left font-semibold text-[#1F2022] dark:text-[#E8E5DD] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D4CB]/50 dark:divide-[#2E312E]/50">
              {filteredRules.map(rule => {
                const active = rule.firingStrength > 0.001;
                return (
                  <tr key={rule.id} className={active ? 'bg-[#EAF2ED]/40 dark:bg-[#1C2E24]/30' : ''}>
                    <td className="px-3 py-2 mono text-[#4A4A4A] dark:text-[#A0A89E]">{rule.id}</td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[11px] ${
                        rule.color === 'Good' ? 'chip-fresh' : rule.color === 'Acceptable' ? 'chip-moderate' : 'chip-spoiled'
                      }`}>{rule.color}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[11px] ${
                        rule.smell === 'Fresh' ? 'chip-fresh' : rule.smell === 'Moderate' ? 'chip-moderate' : 'chip-spoiled'
                      }`}>{rule.smell}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[11px] ${
                        rule.duration === 'Short' ? 'chip-fresh' : rule.duration === 'Medium' ? 'chip-moderate' : 'chip-spoiled'
                      }`}>{rule.duration}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`font-semibold ${
                        rule.consequent === 'Fresh' ? 'text-[#2F6B4F] dark:text-[#5A9C7D]' :
                        rule.consequent === 'Moderate' ? 'text-[#B45309] dark:text-[#D97706]' :
                        'text-[#9E2A2B] dark:text-[#E05252]'
                      }`}>{rule.consequent}</span>
                    </td>
                    <td className="px-3 py-2 mono">
                      <div className="flex items-center gap-2">
                        <span className={active ? 'text-[#2F6B4F] dark:text-[#5A9C7D] font-semibold' : 'text-[#4A4A4A] dark:text-[#A0A89E]'}>
                          {rule.firingStrength.toFixed(3)}
                        </span>
                        <div className="w-12 h-1.5 bg-[#D8D4CB] dark:bg-[#2E312E] rounded overflow-hidden">
                          <div className="h-full bg-[#2F6B4F] rounded" style={{ width: `${rule.firingStrength * 100}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {active
                        ? <span className="flex items-center gap-1 text-[11px] text-[#2F6B4F] dark:text-[#5A9C7D] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2F6B4F] dark:bg-[#5A9C7D]"/>Firing
                          </span>
                        : <span className="text-[11px] text-[#4A4A4A] dark:text-[#A0A89E]">—</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
