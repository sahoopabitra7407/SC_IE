import React from 'react';
import { X, Copy, Check } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

export const VivaGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const copyNotes = () => {
    navigator.clipboard.writeText(`
SOFT COMPUTING LAB · ROLL NOS 61–71
Topic: Mamdani Fuzzy Inference System for Food Freshness Evaluation

STAGE 1 — Fuzzification
Convert crisp inputs (colour, smell, storage) into membership degrees μ ∈ [0,1]
using triangular and left/right shoulder functions.
  μ_Poor = leftShoulder(colour, 2.5, 5.0)
  μ_Good = rightShoulder(colour, 6.0, 8.5)

STAGE 2 — Rule Evaluation
27 rules covering 3×3×3 input combinations.
AND = Min T-Norm: α_i = min(μ_colour, μ_smell, μ_storage)
Aggregation = Max S-Norm: μ_agg(y) = max_i(α_i clipped onto consequent set)

STAGE 3 — Defuzzification
Centroid (Center of Gravity): z* = Σ(z·μ_agg(z)) / Σ(μ_agg(z))  [discretised over 101 pts]

KEY VIVA ANSWERS
Q: Why Mamdani not Sugeno?  → Mamdani produces interpretable linguistic outputs (fuzzy sets), not crisp polynomials.
Q: What is α_i?             → Firing strength of rule i, the minimum membership across its antecedents.
Q: Why 27 rules?            → 3^3 = 27 covers the full input state space.
Q: Why is smell dominant?   → Pungent smell triggers Spoiled even if colour looks acceptable (pathogen growth smell precedes visible decay).
    `.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-2 py-5 border-b border-[#D8D4CB] dark:border-[#2E312E] last:border-0">
      <h3 className="font-serif text-lg text-[#1F2022] dark:text-[#E8E5DD]">{title}</h3>
      {children}
    </div>
  );

  const Q = ({ q, a }: { q: string; a: string }) => (
    <div className="space-y-0.5">
      <p className="text-sm font-semibold text-[#1F2022] dark:text-[#E8E5DD]">Q: {q}</p>
      <p className="text-sm text-[#4A4A4A] dark:text-[#A0A89E] leading-relaxed">A: {a}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F2022]/70 backdrop-blur-[2px] overflow-y-auto">
      <div className="w-full max-w-2xl my-8 bg-[#F6F3EC] dark:bg-[#1E201E] border border-[#D8D4CB] dark:border-[#2E312E] rounded shadow-lift">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D8D4CB] dark:border-[#2E312E]">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-[#2F6B4F] mb-0.5">Examination Aid</p>
            <h2 className="font-serif text-2xl text-[#1F2022] dark:text-[#E8E5DD]">Viva Preparation Sheet</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-[#D8D4CB]/60 dark:hover:bg-[#2E312E] transition-colors text-[#4A4A4A] dark:text-[#A0A89E]">
            <X size={18}/>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 overflow-y-auto max-h-[70vh]">
          {/* Topic */}
          <div className="py-4 border-b border-[#D8D4CB] dark:border-[#2E312E]">
            <p className="text-xs uppercase tracking-widest font-semibold text-[#4A4A4A] dark:text-[#A0A89E] mb-1">Assigned Topic</p>
            <p className="font-serif text-base italic text-[#1F2022] dark:text-[#E8E5DD] leading-snug">
              "Develop a fuzzy model to evaluate food freshness using uncertain parameters
              such as colour, smell, and storage duration."
            </p>
            <p className="text-[11px] text-[#4A4A4A] dark:text-[#A0A89E] mt-1">Roll Nos. 61–71 · Soft Computing Lab · Academic Year 2025–26</p>
          </div>

          <Section title="2-minute oral explanation">
            <div className="space-y-3 text-sm text-[#4A4A4A] dark:text-[#A0A89E] leading-relaxed">
              <p>
                <strong className="text-[#1F2022] dark:text-[#E8E5DD]">The problem.</strong> Crisp threshold rules (e.g. colour &lt; 5 → discard)
                produce hard decisions on a problem that is inherently gradual. A colour score of 4.99
                is treated the same as 0, and 5.01 the same as 10. Real spoilage is continuous.
              </p>
              <p>
                <strong className="text-[#1F2022] dark:text-[#E8E5DD]">Our solution.</strong> A complete Mamdani Fuzzy Inference System with
                three sensory inputs (colour 0–10, smell index 0–10, storage days 0–n),
                fuzzified through overlapping triangular/shoulder membership functions.
                27 expert IF-THEN rules cover the full 3×3×3 input space.
                Mamdani Min T-Norm fires the rules; Max S-Norm aggregates.
                Finally, centroid defuzzification converts the fuzzy output region
                back into a crisp freshness index between 0 and 100%.
              </p>
              <p>
                <strong className="text-[#1F2022] dark:text-[#E8E5DD]">Key insight.</strong> Smell dominates. A pungent odour
                triggers Spoiled even if the food still looks acceptable visually —
                matching real food microbiology where bacterial metabolites cause odour
                before visible discolouration.
              </p>
            </div>
          </Section>

          <Section title="Expected viva questions & answers">
            <div className="space-y-4">
              <Q
                q="Why choose Mamdani over Sugeno?"
                a="Mamdani produces fuzzy output sets with direct linguistic meaning (Spoiled / Moderate / Fresh),
                   making the system transparent and explainable to a food safety inspector. Sugeno outputs
                   crisp polynomial functions which are harder to interpret linguistically."
              />
              <Q
                q="What does α_i represent?"
                a="α_i is the firing strength of rule i — the minimum membership value across all antecedents
                   (AND combination using Min T-Norm). It determines how much the rule's consequent fuzzy set is clipped."
              />
              <Q
                q="Why exactly 27 rules?"
                a="We have 3 linguistic terms for each of 3 inputs → 3³ = 27 combinations.
                   This gives 100% coverage of the input state space with no gaps."
              />
              <Q
                q="What is the defuzzification formula?"
                a="z* = Σ(z_i · μ_agg(z_i)) / Σ(μ_agg(z_i)), discretised over 101 sample points from 0 to 100%.
                   This is the centroid (center of gravity) of the aggregated output region."
              />
              <Q
                q="What are the limitations of this model?"
                a="The membership function parameters are chosen heuristically, not learned from data.
                   In practice, sensor calibration and per-commodity calibration (milk vs. fish) would be needed.
                   We handle this partially via the food-profile switching feature."
              />
            </div>
          </Section>

          <Section title="Mathematical reference">
            <div className="space-y-2">
              {[
                ['Membership (left shoulder)', 'μ(x) = max(0, (b−x)/(b−a)) for x ≤ b'],
                ['Membership (triangular)',    'μ(x) = max(min((x−a)/(b−a), (c−x)/(c−b)), 0)'],
                ['AND (Min T-Norm)',           'α_i = min(μ_c, μ_s, μ_d)'],
                ['Aggregation (Max S-Norm)',   'μ_agg(y) = max over all fired rules of [min(α_i, μ_consequent(y))]'],
                ['Centroid defuzz',            'z* = Σ(z·μ_agg(z)) / Σ(μ_agg(z)),  z ∈ [0, 100]'],
              ].map(([label, formula]) => (
                <div key={label} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 text-sm">
                  <span className="text-[#4A4A4A] dark:text-[#A0A89E] text-[11px] w-40 shrink-0 italic">{label}</span>
                  <code className="mono text-[12px] text-[#2F6B4F] dark:text-[#5A9C7D] bg-[#EAF2ED]/50 dark:bg-[#1C2E24]/30 px-2 py-0.5 rounded">
                    {formula}
                  </code>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#D8D4CB] dark:border-[#2E312E] flex items-center justify-between gap-3">
          <button onClick={copyNotes}
            className="flex items-center gap-1.5 text-xs text-[#4A4A4A] dark:text-[#A0A89E] hover:text-[#2F6B4F] transition-colors">
            {copied ? <Check size={13}/> : <Copy size={13}/>}
            {copied ? 'Copied!' : 'Copy summary to clipboard'}
          </button>
          <button onClick={onClose} className="btn-primary text-sm py-1.5 px-4">Close</button>
        </div>
      </div>
    </div>
  );
};
