import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Share2,
  CheckCircle2,
  ArrowLeft,
  Flame,
  AlertCircle,
  Building2,
  Send,
} from 'lucide-react';
import { SAHARANPUR_ASSEMBLIES } from '../data/saharanpurData';

interface EventsModuleProps {
  onBackToHome: () => void;
  onOpenAddWorker: () => void;
}

export interface PartyEvent {
  id: string;
  title: string;
  type: 'जिला बैठक' | 'कार्यकर्ता सम्मेलन' | 'रैली / जनसभा' | 'बूथ समीक्षा' | 'प्रेस वार्ता';
  assemblyId?: string;
  date: string;
  time: string;
  venue: string;
  chiefGuest: string;
  agenda: string;
  expectedAttendees: number;
  confirmedCount: number;
  isUrgent?: boolean;
}

const INITIAL_EVENTS: PartyEvent[] = [
  {
    id: 'e1',
    title: 'सहारनपुर जिला संगठन विस्तार एवं समीक्षा बैठक',
    type: 'जिला बैठक',
    assemblyId: 'saharanpur_nagar',
    date: '24 अक्टूबर 2026',
    time: 'दोपहर 02:30 बजे',
    venue: 'AIMIM जिला कार्यालय, कोर्ट रोड, निकट घंटाघर, सहारनपुर',
    chiefGuest: 'माननीय प्रदेश अध्यक्ष / पश्चिमी यूपी प्रभारी',
    agenda: 'सभी 7 विधानसभा कमेटियों की समीक्षा, नए बूथ अध्यक्षों की नियुक्ति एवं आगामी निकाय/विधानसभा चुनाव रणनीति।',
    expectedAttendees: 150,
    confirmedCount: 112,
    isUrgent: true,
  },
  {
    id: 'e2',
    title: 'देवबंद विधानसभा विशाल कार्यकर्ता सम्मेलन',
    type: 'कार्यकर्ता सम्मेलन',
    assemblyId: 'deoband',
    date: '02 नवंबर 2026',
    time: 'सुबह 11:00 बजे',
    venue: 'मदीना बैंक्वेट हॉल, रेलवे रोड, देवबंद',
    chiefGuest: 'जिला अध्यक्ष मो० कलीम एवं जिला कोर कमेटी',
    agenda: 'देवबंद विधानसभा के 300+ बूथों पर कमेटी गठन और युवा कार्यकर्ताओं को पहचान पत्र वितरण।',
    expectedAttendees: 300,
    confirmedCount: 220,
  },
  {
    id: 'e3',
    title: 'सहारनपुर देहात एवं गागलहेड़ी बूथ संवाद बैठक',
    type: 'बूथ समीक्षा',
    assemblyId: 'saharanpur_dehat',
    date: '08 नवंबर 2026',
    time: 'सायं 04:00 बजे',
    venue: 'गागलहेड़ी बस स्टैंड निकट कम्युनिटी हॉल',
    chiefGuest: 'विधानसभा अध्यक्ष एवं महासचिव',
    agenda: 'ग्राम पंचायत स्तर पर वोटर लिस्ट सत्यापन और पन्ना प्रमुखों की जिम्मेदारी तय करना।',
    expectedAttendees: 100,
    confirmedCount: 78,
  },
];

export const EventsModule: React.FC<EventsModuleProps> = ({ onBackToHome }) => {
  const [events, setEvents] = useState<PartyEvent[]>(INITIAL_EVENTS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [confirmedMap, setConfirmedMap] = useState<Record<string, boolean>>({});

  // New Event form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<PartyEvent['type']>('जिला बैठक');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newVenue, setNewVenue] = useState('');
  const [newAgenda, setNewAgenda] = useState('');

  const handleShareOnWhatsApp = (event: PartyEvent) => {
    const text = `📢 *AIMIM जिला सहारनपुर — महत्वपूर्ण बैठक सूचना*\n\n` +
      `📌 *विषय:* ${event.title}\n` +
      `🏷️ *प्रकार:* ${event.type}\n` +
      `📅 *तारीख:* ${event.date}\n` +
      `⏰ *समय:* ${event.time}\n` +
      `📍 *स्थान:* ${event.venue}\n` +
      `👤 *मुख्य अतिथि / अध्यक्षता:* ${event.chiefGuest}\n\n` +
      `📝 *एजेंडा:* ${event.agenda}\n\n` +
      `_सभी सम्मानित पदाधिकारी व कार्यकर्ता समय पर अनिवार्य रूप से उपस्थित हों।_\n\n` +
      `*एआईएमआईएम जिला सहारनपुर (पतंग निशान)*`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const toggleConfirmAttendance = (id: string) => {
    setConfirmedMap((prev) => {
      const nextVal = !prev[id];
      setEvents((evList) =>
        evList.map((e) =>
          e.id === id
            ? { ...e, confirmedCount: e.confirmedCount + (nextVal ? 1 : -1) }
            : e
        )
      );
      return { ...prev, [id]: nextVal };
    });
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate.trim() || !newVenue.trim()) return;

    const created: PartyEvent = {
      id: `e_${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      date: newDate.trim(),
      time: newTime.trim() || 'समय तय नहीं',
      venue: newVenue.trim(),
      chiefGuest: 'जिला कोर कमेटी सहारनपुर',
      agenda: newAgenda.trim() || 'संगठन विस्तार एवं क्षेत्रीय मुद्दे।',
      expectedAttendees: 50,
      confirmedCount: 1,
    };

    setEvents((prev) => [created, ...prev]);
    setIsAddModalOpen(false);
    // Reset form
    setNewTitle('');
    setNewDate('');
    setNewTime('');
    setNewVenue('');
    setNewAgenda('');
  };

  return (
    <div className="space-y-5 pb-20 animate-fadeIn">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-xs sm:text-sm border border-emerald-300 dark:border-emerald-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>बैक टू होम (मुख्य मेन्यू)</span>
        </button>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>नई बैठक जोड़ें</span>
        </button>
      </div>

      {/* Title Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-900 via-stone-900 to-slate-950 p-5 text-white border border-amber-700/60 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-600 border border-amber-400 text-white flex items-center justify-center shadow-md flex-shrink-0">
            <Calendar className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-devanagari">
              कार्यक्रम एवं मीटिंग्स कैलेंडर
            </h1>
            <p className="text-xs sm:text-sm text-amber-200/90 font-medium">
              जिला व विधानसभा स्तर की संगठनात्मक बैठकें, जनसभा व व्हाट्सएप आमंत्रण प्रसारण
            </p>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {events.map((event) => {
          const isAttending = Boolean(confirmedMap[event.id]);
          return (
            <div
              key={event.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      {event.type}
                    </span>
                    {event.isUrgent && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700 border border-red-300 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-red-600" /> महत्वपूर्ण
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white font-devanagari">
                    {event.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleShareOnWhatsApp(event)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-bold shadow-sm transition-all active:scale-95"
                    title="व्हाट्सएप पर आमंत्रण भेजें"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp आमंत्रण</span>
                  </button>
                </div>
              </div>

              {/* Event Metadata Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <Calendar className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">तारीख एवं समय</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {event.date} • {event.time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block font-medium">स्थान (Venue)</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                      {event.venue}
                    </span>
                  </div>
                </div>
              </div>

              {/* Agenda description */}
              <div className="bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">बैठक का मुख्य एजेंडा:</span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {event.agenda}
                </p>
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500">
                  अध्यक्षता / विशिष्ट अतिथि: <b className="text-slate-700 dark:text-slate-300">{event.chiefGuest}</b>
                </div>
              </div>

              {/* RSVP & Attendance */}
              <div className="flex items-center justify-between pt-1">
                <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>
                    पुष्टि उपस्थिति: <b className="text-emerald-600 dark:text-emerald-400 font-bold">{event.confirmedCount}</b> / {event.expectedAttendees} कार्यकर्ता
                  </span>
                </div>

                <button
                  onClick={() => toggleConfirmAttendance(event.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isAttending
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isAttending ? 'text-white' : 'text-slate-400'}`} />
                  <span>{isAttending ? 'उपस्थिति दर्ज है' : 'मेरी उपस्थिति दर्ज करें'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= ADD EVENT MODAL ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-700 shadow-2xl p-6 text-slate-900 dark:text-white space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                नई बैठक / कार्यक्रम जोड़ें
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  कार्यक्रम / बैठक का नाम *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. सहारनपुर नगर वार्ड बैठक"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    प्रकार
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                  >
                    <option value="जिला बैठक">जिला बैठक</option>
                    <option value="कार्यकर्ता सम्मेलन">कार्यकर्ता सम्मेलन</option>
                    <option value="बूथ समीक्षा">बूथ समीक्षा</option>
                    <option value="रैली / जनसभा">रैली / जनसभा</option>
                    <option value="प्रेस वार्ता">प्रेस वार्ता</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    तारीख *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. 28 अक्टूबर 2026"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    समय
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. सायं 04:00 बजे"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    स्थान (Venue) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. जिला कार्यालय, कोर्ट रोड"
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  बैठक का एजेंडा / विवरण
                </label>
                <textarea
                  rows={3}
                  placeholder="बैठक में कौन-कौन से मुख्य मुद्दों पर चर्चा होगी..."
                  value={newAgenda}
                  onChange={(e) => setNewAgenda(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold shadow-sm"
                >
                  कार्यक्रम सुरक्षित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
