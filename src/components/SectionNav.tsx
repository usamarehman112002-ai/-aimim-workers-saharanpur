import React from 'react';
import {
  ShieldCheck,
  Building2,
  Landmark,
  Layers,
  MapPin,
  Home,
  Users,
} from 'lucide-react';
import { CommitteeSection, WorkerRecord } from '../types/worker';
import { COMMITTEE_SECTIONS } from '../data/saharanpurData';

interface SectionNavProps {
  activeSection: CommitteeSection;
  onSelectSection: (section: CommitteeSection) => void;
  workers: WorkerRecord[];
}

const SECTION_ICONS: Record<CommitteeSection, React.FC<{ className?: string }>> = {
  district_core: ShieldCheck,
  district_committee: Building2,
  assembly_core: Landmark,
  assembly_committee: Layers,
  block_committee: MapPin,
  village_committee: Home,
  all_workers: Users,
};

export const SectionNav: React.FC<SectionNavProps> = ({
  activeSection,
  onSelectSection,
  workers,
}) => {
  // Calculate counts for each section
  const countMap: Record<CommitteeSection, number> = {
    district_core: workers.filter((w) => w.section === 'district_core').length,
    district_committee: workers.filter((w) => w.section === 'district_committee').length,
    assembly_core: workers.filter((w) => w.section === 'assembly_core').length,
    assembly_committee: workers.filter((w) => w.section === 'assembly_committee').length,
    block_committee: workers.filter((w) => w.section === 'block_committee').length,
    village_committee: workers.filter((w) => w.section === 'village_committee').length,
    all_workers: workers.length,
  };

  return (
    <div className="bg-emerald-900/30 border-b border-emerald-800/40 sticky top-[73px] sm:top-[78px] z-20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        {/* Horizontal scroll container for mobile tabs */}
        <nav
          className="flex items-center gap-1.5 py-2 overflow-x-auto scrollbar-thin scrollbar-thumb-emerald-700/50 scrollbar-track-transparent no-scrollbar"
          aria-label="कमेटी वर्ग चयन"
        >
          {COMMITTEE_SECTIONS.map((sec, idx) => {
            const Icon = SECTION_ICONS[sec.id] || Users;
            const isActive = activeSection === sec.id;
            const count = countMap[sec.id] || 0;

            return (
              <button
                key={sec.id}
                onClick={() => onSelectSection(sec.id)}
                className={`group flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-950/40 border border-emerald-400/50 ring-1 ring-amber-400/50'
                    : 'bg-emerald-950/60 text-emerald-200/90 hover:bg-emerald-900/80 hover:text-white border border-emerald-800/50'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold ${
                    isActive
                      ? 'bg-amber-400 text-emerald-950'
                      : 'bg-emerald-800/70 text-emerald-300 group-hover:bg-emerald-700'
                  }`}
                >
                  {idx + 1}
                </span>

                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? 'text-amber-300' : 'text-emerald-400 group-hover:text-amber-300'
                  }`}
                />

                <span>{sec.nameHi}</span>

                <span
                  className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-emerald-950 text-amber-300 border border-amber-400/30'
                      : 'bg-emerald-800/60 text-emerald-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
