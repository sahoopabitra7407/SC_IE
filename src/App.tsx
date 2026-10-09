import { useState, useEffect } from 'react';
import { Navbar, Sidebar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { LiveEvaluatorTab } from './components/LiveEvaluatorTab';
import { VisualizerTab } from './components/VisualizerTab';
import { BatchDashboardTab } from './components/BatchDashboardTab';
import { VivaGuideModal } from './components/VivaGuideModal';
import { FOOD_PROFILES, type FoodProfile } from './utils/fuzzyEngine';

type Tab = 'overview' | 'evaluator' | 'visualizer' | 'batch';

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('evaluator');
  const [vivaOpen, setVivaOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Shared evaluator + visualizer state (lifted so both tabs stay in sync)
  const [color, setColor] = useState(8.4);
  const [smell, setSmell] = useState(1.6);
  const [duration, setDuration] = useState(3);
  const [profile, setProfile] = useState<FoodProfile>(FOOD_PROFILES[0]);

  const resetDefaults = () => {
    setColor(8.4);
    setSmell(1.6);
    setDuration(3);
    setProfile(FOOD_PROFILES[0]);
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-[#F6F3EC] dark:bg-[#161716] text-[#1F2022] dark:text-[#E8E5DD]">

      {/* Sticky top bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenVivaGuide={() => setVivaOpen(true)}
        onResetDefaults={resetDefaults}
        darkMode={darkMode}
        toggleDark={() => setDarkMode(v => !v)}
      />

      {/* Body row: sidebar + scrollable main */}
      <div className="flex min-h-[calc(100vh-3.5rem)]">

        {/* Sidebar — sticky, inside flex row so it sits flush left */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenVivaGuide={() => setVivaOpen(true)}
          onResetDefaults={resetDefaults}
        />

        {/* Main scrollable content */}
        <main className="flex-1 min-w-0 px-5 sm:px-10 lg:px-14 overflow-y-auto">

          {activeTab === 'overview' && (
            <LandingHero
              onStartEvaluating={() => setActiveTab('evaluator')}
              onExploreVisualizer={() => setActiveTab('visualizer')}
              onOpenVivaGuide={() => setVivaOpen(true)}
            />
          )}

          {activeTab === 'evaluator' && (
            <LiveEvaluatorTab
              color={color}           setColor={setColor}
              smell={smell}           setSmell={setSmell}
              duration={duration}     setDuration={setDuration}
              selectedProfile={profile} setSelectedProfile={setProfile}
              onExploreCurves={() => setActiveTab('visualizer')}
            />
          )}

          {activeTab === 'visualizer' && (
            <VisualizerTab
              color={color}           setColor={setColor}
              smell={smell}           setSmell={setSmell}
              duration={duration}     setDuration={setDuration}
              selectedProfile={profile}
            />
          )}

          {activeTab === 'batch' && <BatchDashboardTab />}

          {/* Footer */}
          <footer className="border-t border-[#D8D4CB] dark:border-[#2E312E] mt-16">
            <div className="max-w-4xl py-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                <div className="space-y-1">
                  <p className="font-semibold text-[#1F2022] dark:text-[#E8E5DD]">FuzzySense</p>
                  <p className="text-[#4A4A4A] dark:text-[#A0A89E] text-xs leading-relaxed">
                    Soft Computing Lab Assignment<br/>
                    Mamdani FIS · Food Freshness Evaluation
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-[#1F2022] dark:text-[#E8E5DD]">Method</p>
                  <p className="text-[#4A4A4A] dark:text-[#A0A89E] text-xs leading-relaxed">
                    Triangular &amp; shoulder MFs · Min T-Norm<br/>
                    Max S-Norm · Centroid defuzzification
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-[#1F2022] dark:text-[#E8E5DD]">References</p>
                  <ol className="list-decimal list-inside text-[#4A4A4A] dark:text-[#A0A89E] text-[11px] space-y-0.5">
                    <li>Zadeh (1965). Fuzzy sets. <em>Inf. &amp; Control</em>.</li>
                    <li>Mamdani &amp; Assilian (1975). <em>Int. J. Man-Machine Studies</em>.</li>
                    <li>Ross (2010). <em>Fuzzy Logic with Engineering Applications</em>.</li>
                  </ol>
                </div>
              </div>
              <p className="text-[11px] text-[#4A4A4A] dark:text-[#A0A89E]">
                All computations run client-side. No data leaves the browser. · Last revised: <span className="font-mono">05 Oct 2026</span>
              </p>
            </div>
          </footer>
        </main>
      </div>

      <VivaGuideModal isOpen={vivaOpen} onClose={() => setVivaOpen(false)} />
    </div>
  );
}

export default App;
