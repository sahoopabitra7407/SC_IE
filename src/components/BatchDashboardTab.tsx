import React, { useState } from 'react';
import { evaluateFuzzyModel, FOOD_PROFILES } from '../utils/fuzzyEngine';
import { Plus, Download, Trash2, Search } from 'lucide-react';

export interface BatchItem {
  id: string; name: string; category: string;
  color: number; smell: number; duration: number; profileId: string;
}

const DEFAULT_ITEMS: BatchItem[] = [
  { id: '1', name: 'Fresh whole milk (1 L)',        category: 'Dairy',   color: 9.0, smell: 1.0, duration: 2,  profileId: 'milk'    },
  { id: '2', name: 'Free-range chicken breast',     category: 'Poultry', color: 8.5, smell: 2.0, duration: 2,  profileId: 'meat'    },
  { id: '3', name: 'Organic Royal Gala apples (1 kg)', category: 'Fruit', color: 8.8, smell: 0.5, duration: 6, profileId: 'fruits'  },
  { id: '4', name: 'Atlantic salmon fillet (200 g)', category: 'Fish',   color: 5.5, smell: 6.8, duration: 4,  profileId: 'fish'    },
  { id: '5', name: 'Greek yogurt (450 g)',           category: 'Dairy',  color: 7.2, smell: 4.5, duration: 7,  profileId: 'milk'    },
  { id: '6', name: 'Artisan sourdough loaf',        category: 'Bakery',  color: 4.0, smell: 5.0, duration: 9,  profileId: 'bread'   },
  { id: '7', name: 'Strawberries punnet (250 g)',   category: 'Fruit',   color: 3.5, smell: 7.2, duration: 14, profileId: 'fruits'  },
  { id: '8', name: 'Minced beef (500 g)',           category: 'Meat',    color: 2.2, smell: 8.9, duration: 6,  profileId: 'meat'    },
  { id: '9', name: 'Baby spinach leaves (100 g)',   category: 'Produce', color: 9.2, smell: 0.8, duration: 3,  profileId: 'generic' },
];

export const BatchDashboardTab: React.FC = () => {
  const [items, setItems] = useState<BatchItem[]>(DEFAULT_ITEMS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [sortCol, setSortCol] = useState<'name' | 'score'>('score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // New item form
  const [nm, setNm] = useState(''); const [pid, setPid] = useState('generic');
  const [nc, setNc] = useState(8.0); const [ns, setNs] = useState(2.0); const [nd, setNd] = useState(3);

  const evaluated = items.map(item => {
    const profile = FOOD_PROFILES.find(p => p.id === item.profileId) || FOOD_PROFILES[0];
    const result = evaluateFuzzyModel(item.color, item.smell, item.duration, profile);
    return { ...item, profile, result };
  });

  const totalFresh    = evaluated.filter(e => e.result.status === 'Fresh').length;
  const totalModerate = evaluated.filter(e => e.result.status === 'Moderate').length;
  const totalSpoiled  = evaluated.filter(e => e.result.status === 'Spoiled').length;
  const avgScore      = evaluated.length
    ? (evaluated.reduce((a, e) => a + e.result.crispOutput, 0) / evaluated.length).toFixed(1)
    : '—';

  let filtered = evaluated
    .filter(e => filterStatus === 'all' || e.result.status === filterStatus)
    .filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase()));

  filtered = [...filtered].sort((a, b) => {
    const aVal = sortCol === 'name' ? a.name : a.result.crispOutput;
    const bVal = sortCol === 'name' ? b.name : b.result.crispOutput;
    if (typeof aVal === 'string' && typeof bVal === 'string')
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const toggleSort = (col: 'name' | 'score') => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nm.trim()) return;
    const profile = FOOD_PROFILES.find(p => p.id === pid) || FOOD_PROFILES[0];
    setItems(prev => [{
      id: Date.now().toString(), name: nm.trim(),
      category: profile.category, color: nc, smell: ns, duration: nd, profileId: pid,
    }, ...prev]);
    setNm(''); setNc(8); setNs(2); setNd(3); setShowAdd(false);
  };

  const handleExport = () => {
    const rows = evaluated.map(e =>
      `"${e.name}","${e.category}",${e.color},${e.smell},${e.duration},${e.result.crispOutput.toFixed(1)},${e.result.status}`
    );
    const csv = ['Name,Category,Colour,Smell,Storage (d),Score (%),Status', ...rows].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `freshness_audit_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const SortBtn = ({ col, label }: { col: 'name' | 'score'; label: string }) => (
    <button onClick={() => toggleSort(col)} className="flex items-center gap-0.5 hover:text-[#2F6B4F] dark:hover:text-[#5A9C7D] transition-colors">
      {label}
      {sortCol === col && <span className="text-[9px]">{sortDir === 'asc' ? '▲' : '▼'}</span>}
    </button>
  );

  const statusChip = (status: string) => {
    const cls = status === 'Fresh' ? 'chip-fresh' : status === 'Moderate' ? 'chip-moderate' : 'chip-spoiled';
    return <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${cls}`}>{status}</span>;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">

      {/* Header */}
      <div className="pt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-[#1F2022] dark:text-[#E8E5DD]">Batch Analysis</h2>
          <p className="text-sm text-[#4A4A4A] dark:text-[#A0A89E] mt-1">
            Each item is evaluated independently through the same Mamdani FIS.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAdd(v => !v)} className="btn-primary text-sm py-1.5 px-3">
            <Plus size={14}/> Add item
          </button>
          <button onClick={handleExport} className="btn-ghost text-sm py-1.5 px-3">
            <Download size={14}/> Export CSV
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Items scanned',       val: evaluated.length.toString(), sub: 'total batch' },
          { label: 'Fresh & safe',        val: `${totalFresh}`,   sub: `${Math.round(totalFresh / evaluated.length * 100)}% of batch`, cls: 'text-[#2F6B4F] dark:text-[#5A9C7D]' },
          { label: 'Consume soon',        val: `${totalModerate}`, sub: 'moderate quality', cls: 'text-[#B45309] dark:text-[#D97706]' },
          { label: 'Discard immediately', val: `${totalSpoiled}`,  sub: 'spoiled / unsafe',  cls: 'text-[#9E2A2B] dark:text-[#E05252]' },
        ].map(kpi => (
          <div key={kpi.label} className="border border-[#D8D4CB] dark:border-[#2E312E] rounded p-4">
            <p className={`font-mono text-2xl font-bold ${kpi.cls ?? 'text-[#1F2022] dark:text-[#E8E5DD]'}`}>{kpi.val}</p>
            <p className="text-[11px] font-semibold text-[#1F2022] dark:text-[#E8E5DD] mt-0.5">{kpi.label}</p>
            <p className="text-[11px] text-[#4A4A4A] dark:text-[#A0A89E]">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Add item form (inline collapsible) */}
      {showAdd && (
        <form onSubmit={addItem} className="border border-[#D8D4CB] dark:border-[#2E312E] rounded p-5 bg-[#F6F3EC] dark:bg-[#1E201E] space-y-4">
          <h4 className="font-semibold text-[#1F2022] dark:text-[#E8E5DD]">Add a food item</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-[#4A4A4A] dark:text-[#A0A89E] uppercase tracking-wide">Item name</span>
              <input required value={nm} onChange={e => setNm(e.target.value)} placeholder="e.g. Feta cheese (200 g)"
                className="border border-[#D8D4CB] dark:border-[#2E312E] rounded px-3 py-1.5 bg-white dark:bg-[#161716] text-[#1F2022] dark:text-[#E8E5DD] text-sm focus-visible:outline-[#2F6B4F]"/>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-[#4A4A4A] dark:text-[#A0A89E] uppercase tracking-wide">Category profile</span>
              <select value={pid} onChange={e => setPid(e.target.value)}
                className="border border-[#D8D4CB] dark:border-[#2E312E] rounded px-3 py-1.5 bg-white dark:bg-[#161716] text-[#1F2022] dark:text-[#E8E5DD] text-sm focus-visible:outline-[#2F6B4F]">
                {FOOD_PROFILES.map(p => <option key={p.id} value={p.id}>{p.name} ({p.category})</option>)}
              </select>
            </label>
            {[
              { label: 'Colour score (0–10)', min: 0, max: 10, step: 0.5, val: nc, set: setNc },
              { label: 'Smell index (0–10)',  min: 0, max: 10, step: 0.5, val: ns, set: setNs },
              { label: 'Storage (days)',       min: 0, max: 30, step: 1,   val: nd, set: setNd },
            ].map(ctrl => (
              <label key={ctrl.label} className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-[#4A4A4A] dark:text-[#A0A89E] uppercase tracking-wide">{ctrl.label}</span>
                <div className="flex items-center gap-2">
                  <input type="range" min={ctrl.min} max={ctrl.max} step={ctrl.step} value={ctrl.val}
                    onChange={e => ctrl.set(ctrl.step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value))}
                    className="flex-1"/>
                  <span className="mono text-sm w-8 text-right text-[#2F6B4F] dark:text-[#5A9C7D] font-semibold">{ctrl.val}</span>
                </div>
              </label>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn-primary text-sm py-1.5 px-4">Add & evaluate</button>
            <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost text-sm py-1.5 px-4">Cancel</button>
          </div>
        </form>
      )}

      <hr className="divider"/>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#4A4A4A] dark:text-[#A0A89E]"/>
          <input type="text" placeholder="Search items…" value={search} onChange={e => setSearch(e.target.value)}
            className="pl-7 pr-3 py-1.5 text-xs border border-[#D8D4CB] dark:border-[#2E312E] rounded bg-white dark:bg-[#161716] text-[#1F2022] dark:text-[#E8E5DD] focus-visible:outline-[#2F6B4F] w-44"/>
        </div>
        {['all', 'Fresh', 'Moderate', 'Spoiled'].map(f => (
          <button key={f} onClick={() => setFilterStatus(f)}
            className={`text-xs px-2.5 py-1 rounded border transition-colors ${
              filterStatus === f
                ? 'bg-[#2F6B4F] text-[#F6F3EC] border-[#2F6B4F]'
                : 'border-[#D8D4CB] dark:border-[#2E312E] text-[#4A4A4A] dark:text-[#A0A89E] hover:border-[#2F6B4F]'
            }`}>
            {f === 'all' ? 'All statuses' : f}
          </button>
        ))}
        <span className="text-xs text-[#4A4A4A] dark:text-[#A0A89E] ml-auto mono">
          Avg score: {avgScore}%
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-[#D8D4CB] dark:border-[#2E312E] rounded">
        <table className="w-full text-xs table-zebra">
          <thead className="sticky top-0 bg-[#F6F3EC] dark:bg-[#1E201E] z-10 border-b border-[#D8D4CB] dark:border-[#2E312E]">
            <tr>
              <th className="px-3 py-2.5 text-left">
                <SortBtn col="name" label="Item"/>
              </th>
              <th className="px-3 py-2.5 text-left font-semibold text-[#1F2022] dark:text-[#E8E5DD]">Category</th>
              <th className="px-3 py-2.5 text-right font-semibold text-[#1F2022] dark:text-[#E8E5DD]">Colour</th>
              <th className="px-3 py-2.5 text-right font-semibold text-[#1F2022] dark:text-[#E8E5DD]">Smell</th>
              <th className="px-3 py-2.5 text-right font-semibold text-[#1F2022] dark:text-[#E8E5DD]">Days</th>
              <th className="px-3 py-2.5 text-right">
                <SortBtn col="score" label="Score %"/>
              </th>
              <th className="px-3 py-2.5 text-left font-semibold text-[#1F2022] dark:text-[#E8E5DD]">Status</th>
              <th className="px-3 py-2.5"/>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D8D4CB]/50 dark:divide-[#2E312E]/50">
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-6 text-center text-[#4A4A4A] dark:text-[#A0A89E]">No items match.</td></tr>
            ) : filtered.map(item => (
              <tr key={item.id} className="hover:bg-[#D8D4CB]/20 dark:hover:bg-[#2E312E]/20 transition-colors">
                <td className="px-3 py-2.5 font-medium text-[#1F2022] dark:text-[#E8E5DD] max-w-[200px] truncate">{item.name}</td>
                <td className="px-3 py-2.5 text-[#4A4A4A] dark:text-[#A0A89E]">{item.category}</td>
                <td className="px-3 py-2.5 text-right mono text-[#4A4A4A] dark:text-[#A0A89E]">{item.color.toFixed(1)}</td>
                <td className="px-3 py-2.5 text-right mono text-[#4A4A4A] dark:text-[#A0A89E]">{item.smell.toFixed(1)}</td>
                <td className="px-3 py-2.5 text-right mono text-[#4A4A4A] dark:text-[#A0A89E]">{item.duration}</td>
                <td className="px-3 py-2.5 text-right">
                  <span className={`mono font-bold ${
                    item.result.status === 'Fresh' ? 'text-[#2F6B4F] dark:text-[#5A9C7D]' :
                    item.result.status === 'Moderate' ? 'text-[#B45309] dark:text-[#D97706]' :
                    'text-[#9E2A2B] dark:text-[#E05252]'
                  }`}>{item.result.crispOutput.toFixed(1)}</span>
                </td>
                <td className="px-3 py-2.5">{statusChip(item.result.status)}</td>
                <td className="px-3 py-2.5">
                  <button onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))}
                    className="p-1 text-[#4A4A4A] dark:text-[#A0A89E] hover:text-[#9E2A2B] transition-colors" title="Remove item">
                    <Trash2 size={13}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="footnote text-right">
        Scores computed via centroid defuzzification over 101 sample points. Last audit: 05 Oct 2026.
      </p>
    </div>
  );
};
