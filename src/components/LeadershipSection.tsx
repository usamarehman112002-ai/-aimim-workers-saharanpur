import React, { useState, useRef } from 'react';
import {
  Users,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  Edit2,
  Sparkles,
  MapPin,
  Building2,
  Award,
  Settings,
} from 'lucide-react';
import { LeaderProfile, LeadershipCategory } from '../types/leadership';

interface LeadershipSectionProps {
  leaders: LeaderProfile[];
  onOpenAdminModal: () => void;
  onEditSingleLeader: (leader: LeaderProfile) => void;
}

export const LeadershipSection: React.FC<LeadershipSectionProps> = ({
  leaders,
  onOpenAdminModal,
  onEditSingleLeader,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'national_state' | 'district' | 'assembly'>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filterLeaders = () => {
    switch (selectedFilter) {
      case 'national_state':
        return leaders.filter((l) => l.category === 'national' || l.category === 'state' || l.category === 'west_up');
      case 'district':
        return leaders.filter((l) => l.category === 'district');
      case 'assembly':
        return leaders.filter((l) => l.category === 'assembly');
      default:
        return leaders;
    }
  };

  const filtered = filterLeaders();

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-white via-slate-50 to-emerald-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
      
      {/* Section Header with Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[11px] font-bold mb-1">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            पार्टी शीर्ष नेतृत्व एवं पदाधिकारी
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-devanagari flex items-center gap-2">
            नेतृत्व एवं पदाधिकारी (Leadership Gallery)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            राष्ट्रीय अध्यक्ष, प्रदेश, पश्चिम यूपी, जिला सहारनपुर एवं 7 विधानसभा अध्यक्ष
          </p>
        </div>

        {/* Action Controls & Admin Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={onOpenAdminModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-sm transition-all"
            title="पदाधिकारियों के फोटो और नाम बदलें या नए जोड़ें"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>एडमिन: फोटो व नाम बदलें</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleScroll('left')}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="पीछे स्क्रॉल करें"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="आगे स्क्रॉल करें"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-3 no-scrollbar text-xs">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
            selectedFilter === 'all'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          सभी पदाधिकारी ({leaders.length})
        </button>
        <button
          onClick={() => setSelectedFilter('national_state')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
            selectedFilter === 'national_state'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          राष्ट्रीय व प्रदेश नेतृत्व
        </button>
        <button
          onClick={() => setSelectedFilter('district')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
            selectedFilter === 'district'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          जिला नेतृत्व (सहारनपुर)
        </button>
        <button
          onClick={() => setSelectedFilter('assembly')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
            selectedFilter === 'assembly'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          7 विधानसभा अध्यक्ष
        </button>
      </div>

      {/* Leadership Slider / Scrollable Cards */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-2 pt-1 scroll-smooth no-scrollbar snap-x snap-mandatory"
      >
        {filtered.map((leader) => {
          const isNational = leader.category === 'national';
          const isState = leader.category === 'state' || leader.category === 'west_up';

          return (
            <div
              key={leader.id}
              className={`snap-start flex-shrink-0 w-[270px] sm:w-[290px] rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between ${
                isNational
                  ? 'bg-gradient-to-b from-emerald-950 via-emerald-900 to-green-950 border-amber-400 text-white shadow-lg'
                  : isState
                  ? 'bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 border-emerald-600/70 text-white shadow-md'
                  : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-xs'
              }`}
            >
              {/* Card Header & Badge */}
              <div className="p-4 pb-2">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isNational
                        ? 'bg-amber-400 text-emerald-950 shadow-xs'
                        : isState
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                    }`}
                  >
                    {leader.categoryLabel}
                  </span>

                  <button
                    onClick={() => onEditSingleLeader(leader)}
                    className="p-1 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-white/10 transition-colors"
                    title="यह फोटो या नाम बदलें"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Portrait with Badge */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative group/avatar mb-3">
                    <div
                      className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden p-1 shadow-xl ${
                        isNational
                          ? 'ring-4 ring-amber-400 bg-amber-400/20'
                          : isState
                          ? 'ring-3 ring-emerald-500 bg-emerald-500/20'
                          : 'ring-2 ring-emerald-600/60 bg-emerald-50'
                      }`}
                    >
                      <img
                        src={leader.photoUrl}
                        alt={leader.name}
                        className="w-full h-full object-cover object-top rounded-full transition-transform duration-300 group-hover/avatar:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/leaders/district_president.jpg';
                        }}
                      />
                    </div>
                    {isNational && (
                      <span className="absolute -bottom-1 -right-1 p-1 bg-amber-400 text-emerald-950 rounded-full shadow-md" title="AIMIM राष्ट्रीय प्रमुख">
                        <Sparkles className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-black tracking-tight leading-tight font-devanagari">
                    {leader.name}
                  </h3>
                  <p
                    className={`text-xs font-bold mt-0.5 line-clamp-1 ${
                      isNational ? 'text-amber-300' : isState ? 'text-emerald-300' : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {leader.role}
                  </p>
                  {leader.roleSubtitle && (
                    <p className="text-[11px] opacity-80 mt-0.5 line-clamp-1">
                      {leader.roleSubtitle}
                    </p>
                  )}
                </div>

                {/* Quote / Thought */}
                {leader.quote && (
                  <div
                    className={`mt-3 p-2 rounded-xl text-[11px] leading-snug italic text-center ${
                      isNational || isState
                        ? 'bg-black/30 border border-white/10 text-emerald-100'
                        : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    "{leader.quote}"
                  </div>
                )}
              </div>

              {/* Card Footer: 1-Click Call & WhatsApp Actions */}
              <div
                className={`p-3 border-t mt-3 flex items-center justify-between gap-2 text-xs font-bold ${
                  isNational || isState
                    ? 'border-white/10 bg-black/20'
                    : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                }`}
              >
                {leader.phone ? (
                  <a
                    href={`tel:${leader.phone}`}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>कॉल</span>
                  </a>
                ) : (
                  <span className="flex-1 text-[11px] text-center opacity-60">सम्पर्क कार्यालय</span>
                )}

                {leader.whatsapp ? (
                  <a
                    href={`https://wa.me/${leader.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `आदाब ${leader.name} साहब, मजलिस कार्यकर्ता सहारनपुर पोर्टल से संपर्क किया जा रहा है।`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 px-2 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                ) : null}

                <button
                  onClick={() => onEditSingleLeader(leader)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isNational || isState
                      ? 'border-white/20 hover:bg-white/10 text-amber-300'
                      : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                  title="विवरण संपादित करें"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
