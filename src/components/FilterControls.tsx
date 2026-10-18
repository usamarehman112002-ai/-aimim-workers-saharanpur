import React from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  LayoutGrid,
  Table as TableIcon,
  CreditCard,
  RotateCcw,
} from 'lucide-react';
import { SAHARANPUR_ASSEMBLIES, SAHARANPUR_BLOCKS } from '../data/saharanpurData';

export type ViewMode = 'cards' | 'table' | 'idcards';

interface FilterControlsProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedAssembly: string;
  onAssemblyChange: (asm: string) => void;
  selectedBlock: string;
  onBlockChange: (blk: string) => void;
  onlyActive: boolean;
  onOnlyActiveToggle: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onResetFilters: () => void;
  filteredCount: number;
  totalSectionCount: number;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  searchQuery,
  onSearchChange,
  selectedAssembly,
  onAssemblyChange,
  selectedBlock,
  onBlockChange,
  onlyActive,
  onOnlyActiveToggle,
  viewMode,
  onViewModeChange,
  onResetFilters,
  filteredCount,
  totalSectionCount,
}) => {
  const isFiltered =
    searchQuery.trim() !== '' ||
    selectedAssembly !== 'all' ||
    selectedBlock !== 'all' ||
    onlyActive;

  return (
    <div className="bg-emerald-950/70 p-3 sm:p-4 rounded-2xl border border-emerald-800/60 shadow-sm space-y-3">
      {/* Top Search bar and View Mode */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Search Field */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="नाम, मोबाइल नंबर, पद, ग्राम/वार्ड या टिप्पणी खोजें..."
            className="w-full pl-9 pr-9 py-2 bg-emerald-900/40 text-white placeholder-emerald-400/70 border border-emerald-700/60 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-emerald-900/60 p-1 rounded-xl border border-emerald-700/50 self-end sm:self-auto">
          <button
            onClick={() => onViewModeChange('cards')}
            title="कार्ड दृश्य"
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              viewMode === 'cards'
                ? 'bg-amber-400 text-emerald-950 font-bold shadow-sm'
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden md:inline">कार्ड्स</span>
          </button>
          <button
            onClick={() => onViewModeChange('table')}
            title="तालिका दृश्य"
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              viewMode === 'table'
                ? 'bg-amber-400 text-emerald-950 font-bold shadow-sm'
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span className="hidden md:inline">तालिका</span>
          </button>
          <button
            onClick={() => onViewModeChange('idcards')}
            title="डिजिटल आई-कार्ड दृश्य"
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              viewMode === 'idcards'
                ? 'bg-amber-400 text-emerald-950 font-bold shadow-sm'
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span className="hidden md:inline">आई-कार्ड</span>
          </button>
        </div>
      </div>

      {/* Dropdown Filters Row */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-2 pt-1 border-t border-emerald-800/40 text-xs">
        {/* Assembly Constituency Select */}
        <div>
          <label className="block text-[11px] font-medium text-emerald-300 mb-1">
            विधानसभा क्षेत्र
          </label>
          <select
            value={selectedAssembly}
            onChange={(e) => onAssemblyChange(e.target.value)}
            className="w-full py-1.5 px-2.5 bg-emerald-900/50 text-white border border-emerald-700/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400"
          >
            <option value="all">सभी 7 विधानसभाएं (All)</option>
            {SAHARANPUR_ASSEMBLIES.map((asm) => (
              <option key={asm.code} value={asm.nameHi}>
                {asm.nameHi} ({asm.nameEn})
              </option>
            ))}
          </select>
        </div>

        {/* Block Select */}
        <div>
          <label className="block text-[11px] font-medium text-emerald-300 mb-1">
            ब्लॉक / नगरीय क्षेत्र
          </label>
          <select
            value={selectedBlock}
            onChange={(e) => onBlockChange(e.target.value)}
            className="w-full py-1.5 px-2.5 bg-emerald-900/50 text-white border border-emerald-700/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400"
          >
            <option value="all">सभी ब्लॉक (All)</option>
            {SAHARANPUR_BLOCKS.map((blk) => (
              <option key={blk} value={blk}>
                {blk}
              </option>
            ))}
          </select>
        </div>

        {/* Active status filter */}
        <div className="flex items-end">
          <label className="flex items-center gap-2 p-1.5 bg-emerald-900/40 border border-emerald-700/50 rounded-lg w-full cursor-pointer hover:bg-emerald-900/60">
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={onOnlyActiveToggle}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
            />
            <span className="text-emerald-200 select-none text-xs">केवल सक्रिय कार्यकर्ता</span>
          </label>
        </div>

        {/* Result count & Clear */}
        <div className="flex items-end justify-between gap-2">
          <div className="text-[11px] text-emerald-300 py-1.5">
            प्रदर्शित: <b className="text-white text-xs">{filteredCount}</b> / {totalSectionCount}
          </div>

          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 py-1.5 px-2 rounded-lg bg-emerald-900/50 border border-emerald-700/50"
            >
              <RotateCcw className="w-3 h-3" />
              फ़िल्टर हटाएं
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
