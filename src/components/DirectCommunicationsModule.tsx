import React, { useState } from 'react';
import {
  PhoneCall,
  MessageCircle,
  Share2,
  Copy,
  Check,
  ArrowLeft,
  Users,
  ShieldCheck,
  Send,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { SAHARANPUR_ASSEMBLIES } from '../data/saharanpurData';
import { WorkerRecord } from '../types/worker';

interface DirectCommunicationsModuleProps {
  workers: WorkerRecord[];
  onBackToHome: () => void;
}

interface DistrictContact {
  id: string;
  name: string;
  role: string;
  category: 'district_core' | 'assembly_incharge' | 'media';
  phone: string;
  whatsapp: string;
  area: string;
}

const DISTRICT_KEY_CONTACTS: DistrictContact[] = [
  {
    id: 'c1',
    name: 'मो० कलीम (सहारनपुर)',
    role: 'जिला अध्यक्ष, AIMIM',
    category: 'district_core',
    phone: '9897001122',
    whatsapp: '9897001122',
    area: 'समग्र जिला सहारनपुर',
  },
  {
    id: 'c2',
    name: 'एडवोकेट मो० आरिफ',
    role: 'जिला महासचिव / विधिक सलाहकार',
    category: 'district_core',
    phone: '9897003344',
    whatsapp: '9897003344',
    area: 'जिला मुख्यालय',
  },
  {
    id: 'c3',
    name: 'इंजीनियर दानिश खान',
    role: 'जिला मीडिया प्रभारी एवं प्रवक्ता',
    category: 'media',
    phone: '9897005566',
    whatsapp: '9897005566',
    area: 'मीडिया एवं सोशल मीडिया विंग',
  },
  {
    id: 'c4',
    name: 'हाजी अहसान मलिक',
    role: 'विधानसभा अध्यक्ष (सहारनपुर नगर - 03)',
    category: 'assembly_incharge',
    phone: '9897007788',
    whatsapp: '9897007788',
    area: '03 - सहारनपुर नगर',
  },
  {
    id: 'c5',
    name: 'चौधरी इमरान मसूद समर्थक विंग',
    role: 'विधानसभा अध्यक्ष (सहारनपुर देहात - 04)',
    category: 'assembly_incharge',
    phone: '9897009900',
    whatsapp: '9897009900',
    area: '04 - सहारनपुर देहात',
  },
  {
    id: 'c6',
    name: 'कारी सलमान देवबंदी',
    role: 'विधानसभा अध्यक्ष (देवबंद - 05)',
    category: 'assembly_incharge',
    phone: '9897112233',
    whatsapp: '9897112233',
    area: '05 - देवबंद',
  },
  {
    id: 'c7',
    name: 'मास्टर रईस अहमद',
    role: 'विधानसभा अध्यक्ष (बेहट - 01)',
    category: 'assembly_incharge',
    phone: '9897223344',
    whatsapp: '9897223344',
    area: '01 - बेहट',
  },
  {
    id: 'c8',
    name: 'नासिर हुसैन प्रधान',
    role: 'विधानसभा अध्यक्ष (नकुड़ - 02)',
    category: 'assembly_incharge',
    phone: '9897334455',
    whatsapp: '9897334455',
    area: '02 - नकुड़',
  },
];

const PRESET_TEMPLATES = [
  {
    title: 'संगठन विस्तार व नई सदस्यता',
    text: `السلام علیکم / नमस्कार,\n\nAIMIM जिला सहारनपुर के सभी सम्मानित कार्यकर्ताओं से अनुरोध है कि अपने-अपने वार्ड और बूथ पर अधिक से अधिक युवाओं और कर्मठ साथियों को पार्टी की सदस्यता दिलाएं।\n\nपतंग का पैगाम — हर घर तक!\n\n— AIMIM जिला कमेटी सहारनपुर`,
  },
  {
    title: 'आपातकालीन बैठक सूचना',
    text: `अति-आवश्यक सूचना:\n\nAIMIM जिला कार्यालय, कोर्ट रोड सहारनपुर में आज सायं सभी पदाधिकारियों की एक आपात बैठक बुलाई गई है। सभी साथी समय पर पहुँचने का कष्ट करें।\n\n— आदेशानुसार, जिला अध्यक्ष`,
  },
  {
    title: 'बूथ सत्यापन एवं पन्ना प्रमुख',
    text: `महत्वपूर्ण दिशा-निर्देश:\n\nसभी विधानसभा व ब्लॉक अध्यक्ष अपने-अपने क्षेत्रों में पोलिंग बूथ कमेटियों का सत्यापन तत्काल पूर्ण करें एवं पन्ना प्रमुखों की सूची जिला कार्यालय को प्रेषित करें।\n\n— AIMIM जिला संगठन सहारनपुर`,
  },
];

export const DirectCommunicationsModule: React.FC<DirectCommunicationsModuleProps> = ({
  onBackToHome,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'district_core' | 'assembly_incharge' | 'media'>('all');
  const [broadcastMessage, setBroadcastMessage] = useState(PRESET_TEMPLATES[0].text);
  const [copied, setCopied] = useState(false);

  const filteredContacts = DISTRICT_KEY_CONTACTS.filter((c) => {
    if (selectedCategory === 'all') return true;
    return c.category === selectedCategory;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(broadcastMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSendBroadcast = () => {
    const encoded = encodeURIComponent(broadcastMessage);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleDirectWhatsApp = (phone: string, name: string) => {
    const text = encodeURIComponent(`السلام علیکم / आदाब ${name} साहब,\n\nAIMIM जिला सहारनपुर कार्यकर्ता पोर्टल के संदर्भ में...`);
    window.open(`https://wa.me/91${phone}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-5 pb-20 animate-fadeIn">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-xs sm:text-sm border border-emerald-300 dark:border-emerald-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>बैक टू होम (मुख्य मेन्यू)</span>
        </button>

        <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#128C7E] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5">
          <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
          सीधी कनेक्टिविटी हब
        </span>
      </div>

      {/* Title Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-950 p-5 text-white border border-emerald-600/60 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-md flex-shrink-0">
            <PhoneCall className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-devanagari">
              डायरेक्ट WhatsApp और कॉल हब
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/90 font-medium">
              जिला सहारनपुर के पदाधिकारियों से 1-क्लिक कॉल, सीधी चैट व व्हाट्सएप ब्रॉडकास्ट संदेश
            </p>
          </div>
        </div>
      </div>

      {/* Broadcast Message Generator Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#25D366]" />
            व्हाट्सएप ब्रॉडकास्ट संदेश तैयार करें (Quick WhatsApp Broadcast)
          </h2>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">1-क्लिक सेंड</span>
        </div>

        {/* Preset Template Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-slate-500">टेम्पलेट्स:</span>
          {PRESET_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              onClick={() => setBroadcastMessage(tmpl.text)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 transition-colors"
            >
              {tmpl.title}
            </button>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          rows={4}
          value={broadcastMessage}
          onChange={(e) => setBroadcastMessage(e.target.value)}
          className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />

        {/* Broadcast Action Buttons */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'कॉपी हो गया!' : 'टेक्स्ट कॉपी करें'}</span>
          </button>

          <button
            onClick={handleSendBroadcast}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>WhatsApp पर शेयर करें</span>
          </button>
        </div>
      </div>

      {/* Directory Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          सभी संपर्क ({DISTRICT_KEY_CONTACTS.length})
        </button>
        <button
          onClick={() => setSelectedCategory('district_core')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            selectedCategory === 'district_core'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          जिला कोर कमेटी
        </button>
        <button
          onClick={() => setSelectedCategory('assembly_incharge')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            selectedCategory === 'assembly_incharge'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          विधानसभा अध्यक्षगण
        </button>
        <button
          onClick={() => setSelectedCategory('media')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            selectedCategory === 'media'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          मीडिया विंग
        </button>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-3"
          >
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900 dark:text-white font-devanagari truncate">
                  {contact.name}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" title="सक्रिय" />
              </div>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 truncate">
                {contact.role}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                क्षेत्र: {contact.area}
              </p>
            </div>

            {/* Direct Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href={`tel:${contact.phone}`}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-emerald-950 text-slate-800 dark:text-slate-200 hover:text-emerald-700 border border-slate-300 dark:border-slate-700 flex items-center justify-center transition-all shadow-xs"
                title="कॉल करें"
              >
                <PhoneCall className="w-4 h-4 text-emerald-600" />
              </a>

              <button
                onClick={() => handleDirectWhatsApp(contact.whatsapp, contact.name)}
                className="px-3 h-10 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                title="WhatsApp चैट खोलें"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden xs:inline">चैट</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
