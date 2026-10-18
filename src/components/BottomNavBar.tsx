import React from 'react';
import {
  LayoutDashboard,
  Users,
  PlusCircle,
  Vote,
  Calendar,
  PhoneCall,
} from 'lucide-react';

export type AppView = 'dashboard' | 'workers' | 'voter_list' | 'events' | 'communications';

interface BottomNavBarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenAddModal: () => void;
  totalWorkers: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentView,
  onNavigate,
  onOpenAddModal,
  totalWorkers,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-emerald-950/95 backdrop-blur-md border-t border-emerald-800/80 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] pb-safe">
      <div className="max-w-xl mx-auto px-2 flex items-center justify-around py-1.5">
        
        {/* 1. होम (Home Dashboard) */}
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            currentView === 'dashboard'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-emerald-300/80 hover:text-white'
          }`}
        >
          <div className="relative">
            <LayoutDashboard className="w-5 h-5 stroke-[2.2]" />
            {currentView === 'dashboard' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-0.5">होम</span>
        </button>

        {/* 2. कार्यकर्ता (Workers) */}
        <button
          onClick={() => onNavigate('workers')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
            currentView === 'workers'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-emerald-300/80 hover:text-white'
          }`}
        >
          <div className="relative">
            <Users className="w-5 h-5 stroke-[2.2]" />
            {currentView === 'workers' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-0.5">कार्यकर्ता</span>
        </button>

        {/* 3. नया जोड़ें (+ Central Button) */}
        <button
          onClick={onOpenAddModal}
          className="flex flex-col items-center justify-center -mt-4 group active:scale-95 transition-transform"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 text-emerald-950 flex items-center justify-center shadow-lg shadow-black/40 border-2 border-emerald-950 ring-2 ring-amber-400 group-hover:scale-105 transition-transform">
            <PlusCircle className="w-7 h-7 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-extrabold text-amber-300 mt-0.5">जोड़ें</span>
        </button>

        {/* 4. वोटर लिस्ट (Voter List) */}
        <button
          onClick={() => onNavigate('voter_list')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            currentView === 'voter_list'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-emerald-300/80 hover:text-white'
          }`}
        >
          <div className="relative">
            <Vote className="w-5 h-5 stroke-[2.2]" />
            {currentView === 'voter_list' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-0.5">वोटर लिस्ट</span>
        </button>

        {/* 5. कार्यक्रम (Events) */}
        <button
          onClick={() => onNavigate('events')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            currentView === 'events'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-emerald-300/80 hover:text-white'
          }`}
        >
          <div className="relative">
            <Calendar className="w-5 h-5 stroke-[2.2]" />
            {currentView === 'events' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-0.5">मीटिंग्स</span>
        </button>

        {/* 6. संपर्क (Contact / Call) */}
        <button
          onClick={() => onNavigate('communications')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            currentView === 'communications'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-emerald-300/80 hover:text-white'
          }`}
        >
          <div className="relative">
            <PhoneCall className="w-5 h-5 stroke-[2.2]" />
            {currentView === 'communications' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-0.5">संपर्क</span>
        </button>

      </div>
    </nav>
  );
};
