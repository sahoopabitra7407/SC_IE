import React from 'react';
import { ArrowRight, HelpCircle } from 'lucide-react';

interface LandingHeroProps {
  onStartEvaluating: () => void;
  onExploreVisualizer: () => void;
  onOpenVivaGuide: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartEvaluating,
  onExploreVisualizer,
  onOpenVivaGuide,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-16 pb-20">

      {/* ── Hero ── */}
      <section className="pt-10 pb-4">
        <p className="text-[11px] uppercase tracking-widest font-semibold text-[#2F6B4F] mb-4">
          Soft Computing Lab — Practical Assignment
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#1F2022] dark:text-[#E8E5DD] leading-tight mb-5">
          Evaluating{' '}
          <span className="underline-hand text-[#2F6B4F]">food freshness</span>
          {' '}under sensory uncertainty
        </h1>
        <p className="text-[17px] text-[#4A4A4A] dark:text-[#A0A89E] max-w-2xl leading-relaxed mb-7">
          A binary yes/no test cannot capture how a fruit slowly moves from fresh
          to stale. This project builds a complete Mamdani Fuzzy Inference System
          that gives food quality a <em>continuous score</em> based on three sensory
          inputs: colour, smell, and storage duration.
        </p>
        <div className="flex flex-wrap gap-3">
          <button onClick={onStartEvaluating} className="btn-primary">
            Open the evaluator <ArrowRight size={15}/>
          </button>
          <button onClick={onExploreVisualizer} className="btn-ghost">
            See the membership curves
          </button>
          <button
            onClick={onOpenVivaGuide}
            className="flex items-center gap-1.5 text-sm text-[#4A4A4A] dark:text-[#A0A89E] hover:text-[#2F6B4F] transition-colors underline underline-offset-2"
          >
            <HelpCircle size={14}/> Viva prep
          </button>
        </div>
      </section>

      <hr className="divider"/>

      {/* ── Problem Statement ── */}
      <section>
        <h2 className="font-serif text-2xl mb-4 text-[#1F2022] dark:text-[#E8E5DD]">Problem Statement</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3 text-[15px] text-[#4A4A4A] dark:text-[#A0A89E] leading-relaxed">
            <p>
              Determining food freshness is a subjective, multi-factor problem.
              A machine vision system might report a colour score of 6.3 on a
              0–10 scale. A nose-equivalent sensor might report an odour index
              of 4.1. Storage records show 8 days elapsed.
            </p>
            <p>
              Conventional rule-based systems handle this with hard cut-offs —
              <span className="font-semibold text-[#9E2A2B] dark:text-[#E05252]"> colour &lt; 5 → discard</span>.
              That threshold treats a score of 4.99 identically to 1.0,
              and 5.01 identically to 9.9. The result is both wasteful and
              sometimes dangerous.
            </p>
          </div>
          <div className="space-y-3">
            {/* Crisp vs Fuzzy concrete numbers */}
            <h4 className="text-[13px] font-semibold uppercase tracking-wider text-[#4A4A4A] dark:text-[#A0A89E]">
              Crisp vs. Fuzzy — a concrete case
            </h4>
            <table className="w-full text-sm border border-[#D8D4CB] dark:border-[#2E312E] table-zebra">
              <thead className="bg-[#D8D4CB]/50 dark:bg-[#2E312E]/60 text-[#1F2022] dark:text-[#E8E5DD]">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold text-xs">Sample</th>
                  <th className="text-right px-3 py-2 font-semibold text-xs">Colour</th>
                  <th className="text-right px-3 py-2 font-semibold text-xs">Smell</th>
                  <th className="text-right px-3 py-2 font-semibold text-xs">Days</th>
                  <th className="text-right px-3 py-2 font-semibold text-xs">Crisp</th>
                  <th className="text-right px-3 py-2 font-semibold text-xs">Mamdani</th>
                </tr>
              </thead>
              <tbody className="text-[#4A4A4A] dark:text-[#A0A89E]">
                {[
                  ['Apple A', '8.2', '1.0', '3', 'FRESH', '91%'],
                  ['Milk B',  '7.1', '4.9', '6', 'FRESH', '54%'],
                  ['Fish C',  '5.1', '8.5', '5', 'FRESH', '11%'],
                  ['Bread D', '3.8', '5.5', '9', 'SPOIL', '18%'],
                ].map(([name, c, s, d, crisp, mamdani]) => (
                  <tr key={name}>
                    <td className="px-3 py-2 font-medium text-[#1F2022] dark:text-[#E8E5DD]">{name}</td>
                    <td className="px-3 py-2 text-right mono">{c}</td>
                    <td className="px-3 py-2 text-right mono">{s}</td>
                    <td className="px-3 py-2 text-right mono">{d}</td>
                    <td className={`px-3 py-2 text-right text-xs font-bold ${crisp === 'FRESH' ? 'text-[#2F6B4F]' : 'text-[#9E2A2B] dark:text-[#E05252]'}`}>
                      {crisp}
                    </td>
                    <td className="px-3 py-2 text-right mono font-semibold text-[#1F2022] dark:text-[#E8E5DD]">{mamdani}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="footnote">
              Fish C has colour = 5.1, which passes the crisp threshold (&gt;5), but
              a smell index of 8.5 places it firmly in "Pungent" — the Mamdani system
              correctly scores it as nearly spoiled.
            </p>
          </div>
        </div>
      </section>

      <hr className="divider"/>

      {/* ── Methodology ── */}
      <section>
        <h2 className="font-serif text-2xl mb-2 text-[#1F2022] dark:text-[#E8E5DD]">Methodology</h2>
        <p className="text-sm text-[#4A4A4A] dark:text-[#A0A89E] mb-8 max-w-2xl">
          The system follows the three-stage Mamdani pipeline, running entirely
          in-browser without any server.
        </p>
        <div className="space-y-0">
          {[
            {
              num: '1',
              title: 'Fuzzification',
              body: `Crisp sensor readings are converted to degrees of membership across
                     overlapping linguistic sets using triangular (trimf) and left/right
                     shoulder functions. For example, a colour score of 6.0 belongs to
                     "Acceptable" with μ = 0.48 and to "Good" with μ = 0.0.`,
              formula: 'μ(x) ∈ [0, 1]',
              sub: 'Membership degree, not probability.'
            },
            {
              num: '2',
              title: 'Rule Evaluation (Mamdani)',
              body: `A 3×3×3 rule matrix (27 rules total) covers every combination of
                     colour, smell, and storage. Rules fire using Min T-Norm for the
                     AND connective, then Max S-Norm aggregates the clipped consequent
                     fuzzy sets.`,
              formula: 'α_i = min(μ_colour, μ_smell, μ_storage)',
              sub: 'Firing strength of rule i.'
            },
            {
              num: '3',
              title: 'Defuzzification — Centroid Method',
              body: `The aggregated output shape (a fuzzy set over 0–100%) is collapsed
                     to a single crisp freshness index using the Center of Gravity
                     formula, discretised over 101 sample points.`,
              formula: 'z* = Σ(z_i · μ_agg(z_i)) / Σ(μ_agg(z_i))',
              sub: 'Centroid of the output fuzzy set.'
            },
          ].map((step, idx, arr) => (
            <div key={step.num} className={`flex gap-6 py-6 ${idx < arr.length - 1 ? 'border-b border-[#D8D4CB] dark:border-[#2E312E]' : ''}`}>
              <div className="shrink-0 w-8 h-8 rounded border border-[#2F6B4F] flex items-center justify-center text-[#2F6B4F] font-serif font-bold text-base">
                {step.num}
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-serif text-lg text-[#1F2022] dark:text-[#E8E5DD]">{step.title}</h3>
                <p className="text-sm text-[#4A4A4A] dark:text-[#A0A89E] leading-relaxed">{step.body}</p>
                <div className="mt-1 px-3 py-2 bg-[#F6F3EC] dark:bg-[#1E201E] border border-[#D8D4CB] dark:border-[#2E312E] rounded inline-block">
                  <code className="mono text-[13px] text-[#2F6B4F] dark:text-[#5A9C7D]">{step.formula}</code>
                  <span className="text-[11px] text-[#4A4A4A] dark:text-[#A0A89E] ml-3 italic">{step.sub}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider"/>

      {/* ── Quick-start CTA ── */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        <div>
          <p className="font-serif text-xl text-[#1F2022] dark:text-[#E8E5DD]">
            Slide the inputs and watch how the output changes.
          </p>
          <p className="text-sm text-[#4A4A4A] dark:text-[#A0A89E] mt-1">
            All 27 rules fire in real time — no server, no delay.
          </p>
        </div>
        <button onClick={onStartEvaluating} className="btn-primary shrink-0">
          Try it now <ArrowRight size={14}/>
        </button>
      </section>
    </div>
  );
};
