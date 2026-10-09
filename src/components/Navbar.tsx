import React, { useState } from 'react';
import { Menu, X, Sun, Moon, GraduationCap } from 'lucide-react';

type Tab = 'overview' | 'evaluator' | 'visualizer' | 'batch';

interface NavbarProps {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  onOpenVivaGuide: () => void;
  onResetDefaults: () => void;
  darkMode: boolean;
  toggleDark: () => void;
}

const NAV_ITEMS: { id: Tab; label: string }[] = [
  { id: 'overview',   label: 'Overview' },
  { id: 'evaluator',  label: 'Live Evaluator' },
  { id: 'visualizer', label: 'Fuzzy Curves' },
  { id: 'batch',      label: 'Batch Analysis' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab, setActiveTab, onOpenVivaGuide, onResetDefaults, darkMode, toggleDark
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#F6F3EC] dark:bg-[#161716] border-b border-[#D8D4CB] dark:border-[#2E312E]">
      <div className="h-14 px-4 sm:px-6 flex items-center justify-between gap-4 max-w-screen-2xl mx-auto">

        {/* Left: logo only */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Mobile toggle */}
          <button
            className="md:hidden p-1.5 rounded hover:bg-[#D8D4CB]/60 dark:hover:bg-[#2E312E] transition-colors"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18}/> : <Menu size={18}/>}
          </button>

          <span className="w-7 h-7 rounded bg-[#2F6B4F] flex items-center justify-center text-[#F6F3EC] text-[11px] font-mono font-bold select-none">
            FS
          </span>
          <span className="text-[14px] font-semibold text-[#1F2022] dark:text-[#E8E5DD] leading-tight">
            FuzzySense
          </span>
        </div>

        {/* Center: tab nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors duration-150 ${
                activeTab === item.id
                  ? 'bg-[#2F6B4F] text-[#F6F3EC]'
                  : 'text-[#4A4A4A] dark:text-[#A0A89E] hover:bg-[#D8D4CB]/60 dark:hover:bg-[#2E312E]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleDark}
            className="p-1.5 rounded text-[#4A4A4A] dark:text-[#A0A89E] hover:bg-[#D8D4CB]/60 dark:hover:bg-[#2E312E] transition-colors"
            title={darkMode ? 'Switch to light' : 'Switch to dark'}
          >
            {darkMode ? <Sun size={16}/> : <Moon size={16}/>}
          </button>
          <button
            onClick={onOpenVivaGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#2F6B4F] text-[#2F6B4F] dark:text-[#5A9C7D] dark:border-[#5A9C7D] text-xs font-medium hover:bg-[#2F6B4F]/8 transition-colors"
          >
            <GraduationCap size={14}/>
            <span className="hidden sm:inline">Viva Prep</span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#D8D4CB] dark:border-[#2E312E] px-4 py-2 flex flex-col gap-0.5 bg-[#F6F3EC] dark:bg-[#161716]">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setMobileOpen(false); }}
              className={`text-left px-3 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-[#2F6B4F] text-[#F6F3EC]'
                  : 'text-[#4A4A4A] dark:text-[#A0A89E] hover:bg-[#D8D4CB]/60 dark:hover:bg-[#2E312E]'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-1 border-t border-[#D8D4CB] dark:border-[#2E312E] mt-1 flex gap-2">
            <button onClick={onOpenVivaGuide} className="text-xs text-[#2F6B4F] px-3 py-1.5 rounded border border-[#2F6B4F]">Viva Prep</button>
            <button onClick={onResetDefaults} className="text-xs text-[#4A4A4A] dark:text-[#A0A89E] px-3 py-1.5 rounded border border-[#D8D4CB] dark:border-[#2E312E]">Reset inputs</button>
          </div>
        </div>
      )}
    </header>
  );
};

/* Sidebar is exported separately so App.tsx can include it correctly in the layout */
export const Sidebar: React.FC<{
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  onOpenVivaGuide: () => void;
  onResetDefaults: () => void;
}> = ({ activeTab, setActiveTab, onOpenVivaGuide, onResetDefaults }) => (
  <aside className="hidden md:flex flex-col w-48 shrink-0 border-r border-[#D8D4CB] dark:border-[#2E312E] bg-[#F6F3EC] dark:bg-[#161716] sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto pt-6 pb-4 px-3">
    <p className="text-[10px] uppercase tracking-widest text-[#4A4A4A] dark:text-[#A0A89E] font-semibold px-2 mb-2">
      Sections
    </p>
    {NAV_ITEMS.map(item => (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className={`text-left px-3 py-2 rounded text-[13px] font-medium mb-0.5 transition-colors duration-150 ${
          activeTab === item.id
            ? 'bg-[#2F6B4F]/12 text-[#2F6B4F] dark:text-[#5A9C7D] font-semibold'
            : 'text-[#4A4A4A] dark:text-[#A0A89E] hover:bg-[#D8D4CB]/60 dark:hover:bg-[#2E312E] hover:text-[#2F6B4F] dark:hover:text-[#5A9C7D]'
        }`}
      >
        {item.label}
      </button>
    ))}

    <hr className="border-t border-[#D8D4CB] dark:border-[#2E312E] my-4"/>

    <p className="text-[10px] uppercase tracking-widest text-[#4A4A4A] dark:text-[#A0A89E] font-semibold px-2 mb-2">
      Tools
    </p>
    <button
      onClick={onOpenVivaGuide}
      className="text-left px-3 py-2 rounded text-[13px] font-medium text-[#4A4A4A] dark:text-[#A0A89E] hover:bg-[#D8D4CB]/60 dark:hover:bg-[#2E312E] hover:text-[#2F6B4F] dark:hover:text-[#5A9C7D] transition-colors mb-0.5"
    >
      Viva Prep Sheet
    </button>
    <button
      onClick={onResetDefaults}
      className="text-left px-3 py-2 rounded text-[13px] font-medium text-[#4A4A4A] dark:text-[#A0A89E] hover:bg-[#D8D4CB]/60 dark:hover:bg-[#2E312E] transition-colors"
    >
      Reset Inputs
    </button>

    <div className="mt-auto pt-4 px-2">
      <p className="text-[11px] text-[#4A4A4A] dark:text-[#A0A89E]">
        Last revised<br/>
        <span className="font-mono">05 Oct 2026</span>
      </p>
    </div>
  </aside>
);
