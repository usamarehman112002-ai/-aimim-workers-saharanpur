import React from 'react';
import {
  Users,
  ShieldCheck,
  CheckCircle,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { CommitteeSection, WorkerRecord } from '../types/worker';
import { COMMITTEE_SECTIONS, SAHARANPUR_ASSEMBLIES } from '../data/saharanpurData';

interface StatsCardsProps {
  workers: WorkerRecord[];
  activeSection: CommitteeSection;
  selectedAssembly: string;
  onSelectAssembly: (assembly: string) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  workers,
  activeSection,
  selectedAssembly,
  onSelectAssembly,
}) => {
  const currentSectionMeta = COMMITTEE_SECTIONS.find((s) => s.id === activeSection) || COMMITTEE_SECTIONS[0];

  // Count filtered workers in the current section
  const sectionWorkers =
    activeSection === 'all_workers'
      ? workers
      : workers.filter((w) => w.section === activeSection);

  const totalAll = workers.length;
  const activeCount = workers.filter((w) => w.isActive).length;
  const activePct = totalAll > 0 ? Math.round((activeCount / totalAll) * 100) : 0;

  // Count per assembly in current view
  const assemblyCounts = SAHARANPUR_ASSEMBLIES.map((asm) => {
    const count = sectionWorkers.filter((w) => w.assembly.includes(asm.nameEn) || w.assembly.includes(asm.nameHi)).length;
    return {
      ...asm,
      count,
    };
  });

  return (
    <div className="space-y-3">
      {/* Current Section Banner */}
      <div className="bg-gradient-to-r from-emerald-900/90 via-emerald-800/80 to-emerald-950 p-3.5 sm:p-4 rounded-2xl border border-emerald-700/50 shadow-md text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-amber-300">
              {currentSectionMeta.nameHi}
            </h2>
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-950/80 text-emerald-200 border border-emerald-600/50">
              {sectionWorkers.length} सदस्य
            </span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-200">
            {currentSectionMeta.desc}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs flex-wrap">
          <div className="bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-700/40 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-emerald-300">सहारनपुर कुल:</span>
            <span className="font-bold text-white">{totalAll}</span>
          </div>
          <div className="bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-700/40 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-300">सक्रिय:</span>
            <span className="font-bold text-emerald-300">{activePct}%</span>
          </div>
        </div>
      </div>

      {/* 7 Assembly Constituencies Mini Status Strip */}
      <div className="bg-emerald-950/40 p-2.5 sm:p-3 rounded-xl border border-emerald-800/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            सहारनपुर के सभी 7 विधानसभा क्षेत्र (क्लिक करके फ़िल्टर करें):
          </span>
          {selectedAssembly !== 'all' && (
            <button
              onClick={() => onSelectAssembly('all')}
              className="text-[11px] text-amber-300 hover:text-amber-200 underline"
            >
              सभी विधानसभाएं देखें
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
          {assemblyCounts.map((asm) => {
            const isSelected = selectedAssembly === asm.nameHi;
            return (
              <button
                key={asm.code}
                onClick={() => onSelectAssembly(isSelected ? 'all' : asm.nameHi)}
                className={`p-2 rounded-lg text-left transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-emerald-950 border-amber-300 font-bold shadow-sm'
                    : 'bg-emerald-900/40 hover:bg-emerald-900/70 text-emerald-100 border-emerald-800/60'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] leading-tight">
                  <span className="font-semibold truncate">
                    {asm.nameHi.replace(/^[0-9]+ - /, '')}
                  </span>
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      isSelected
                        ? 'bg-emerald-950 text-amber-300'
                        : 'bg-emerald-950/70 text-emerald-300'
                    }`}
                  >
                    {asm.count}
                  </span>
                </div>
                <div
                  className={`text-[9px] mt-0.5 ${
                    isSelected ? 'text-emerald-900' : 'text-emerald-400'
                  }`}
                >
                  AC-{asm.code} {asm.isReserved ? '(सु.)' : ''}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
