import React, { useState, useMemo } from 'react';
import {
  Vote,
  Search,
  Filter,
  MapPin,
  Users,
  Printer,
  Share2,
  CheckCircle2,
  ArrowLeft,
  ChevronDown,
  Building2,
  Phone,
  MessageSquare,
  FileText,
  Download,
} from 'lucide-react';
import { SAHARANPUR_ASSEMBLIES } from '../data/saharanpurData';
import { WorkerRecord } from '../types/worker';

interface VoterListModuleProps {
  workers: WorkerRecord[];
  onBackToHome: () => void;
  onOpenAddWorker: () => void;
}

export interface VoterRecord {
  id: string;
  epicNumber: string;
  name: string;
  relativeName: string;
  relationType: 'Father' | 'Husband';
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  assemblyId: string;
  boothNumber: number;
  boothName: string;
  wardOrVillage: string;
  serialNumber: number;
  phone?: string;
  status: 'verified' | 'unverified';
}

const INITIAL_VOTERS: VoterRecord[] = [
  {
    id: 'v1',
    epicNumber: 'UP/03/001/458291',
    name: 'मुहम्मद उस्मान अंसारी',
    relativeName: 'अब्दुल रहमान',
    relationType: 'Father',
    age: 42,
    gender: 'Male',
    assemblyId: '03',
    boothNumber: 104,
    boothName: 'इस्लामिया इंटर कॉलेज, कमरा नं. 2, सहारनपुर',
    wardOrVillage: 'वार्ड 12, सराय',
    serialNumber: 142,
    phone: '9897100001',
    status: 'verified',
  },
  {
    id: 'v2',
    epicNumber: 'UP/03/001/458292',
    name: 'शबाना परवीन',
    relativeName: 'मुहम्मद उस्मान',
    relationType: 'Husband',
    age: 38,
    gender: 'Female',
    assemblyId: '03',
    boothNumber: 104,
    boothName: 'इस्लामिया इंटर कॉलेज, कमरा नं. 2, सहारनपुर',
    wardOrVillage: 'वार्ड 12, सराय',
    serialNumber: 143,
    phone: '9897100002',
    status: 'verified',
  },
  {
    id: 'v3',
    epicNumber: 'UP/05/002/112458',
    name: 'कारी सलमान अहमद',
    relativeName: 'मौलवी इदरीस',
    relationType: 'Father',
    age: 34,
    gender: 'Male',
    assemblyId: '05',
    boothNumber: 45,
    boothName: 'प्राथमिक विद्यालय, कमरा नं. 1, देवबंद',
    wardOrVillage: 'खानकाह रोड, देवबंद',
    serialNumber: 88,
    phone: '9897200001',
    status: 'verified',
  },
  {
    id: 'v4',
    epicNumber: 'UP/04/001/309182',
    name: 'चौधरी इमरान अली',
    relativeName: 'अख्तर अली',
    relationType: 'Father',
    age: 29,
    gender: 'Male',
    assemblyId: '04',
    boothNumber: 72,
    boothName: 'पंचायत भवन, ग्राम गागलहेड़ी',
    wardOrVillage: 'गागलहेड़ी देहात',
    serialNumber: 210,
    phone: '9897300001',
    status: 'verified',
  },
  {
    id: 'v5',
    epicNumber: 'UP/01/001/556712',
    name: 'रईस अहमद खान',
    relativeName: 'शमशाद खान',
    relationType: 'Father',
    age: 51,
    gender: 'Male',
    assemblyId: '01',
    boothNumber: 19,
    boothName: 'जूनियर हाई स्कूल, बेहट कस्बा',
    wardOrVillage: 'वार्ड 04, बेहट',
    serialNumber: 65,
    phone: '9897400001',
    status: 'verified',
  },
  {
    id: 'v6',
    epicNumber: 'UP/02/001/887123',
    name: 'नासिर हुसैन',
    relativeName: 'शब्बीर हुसैन',
    relationType: 'Father',
    age: 46,
    gender: 'Male',
    assemblyId: '02',
    boothNumber: 88,
    boothName: 'कन्या विद्यालय, नकुड़',
    wardOrVillage: 'मोहल्ला पीरजादगान, नकुड़',
    serialNumber: 104,
    phone: '9897500001',
    status: 'verified',
  },
  {
    id: 'v7',
    epicNumber: 'UP/07/001/778129',
    name: 'साजिद मलिक',
    relativeName: 'हाजी जमील',
    relationType: 'Father',
    age: 39,
    gender: 'Male',
    assemblyId: '07',
    boothNumber: 52,
    boothName: 'इस्लामिया स्कूल, गंगोह',
    wardOrVillage: 'कस्बा गंगोह',
    serialNumber: 119,
    phone: '9897600001',
    status: 'verified',
  },
  {
    id: 'v8',
    epicNumber: 'UP/06/001/992341',
    name: 'गुलफाम प्रधान',
    relativeName: 'अब्दुल लतीफ',
    relationType: 'Father',
    age: 48,
    gender: 'Male',
    assemblyId: '06',
    boothNumber: 31,
    boothName: 'प्राथमिक विद्यालय, रामपुर मनिहारान',
    wardOrVillage: 'वार्ड 08, रामपुर मनिहारान',
    serialNumber: 77,
    phone: '9897700001',
    status: 'verified',
  },
];

export const VoterListModule: React.FC<VoterListModuleProps> = ({
  workers,
  onBackToHome,
}) => {
  const [selectedAssembly, setSelectedAssembly] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [voters, setVoters] = useState<VoterRecord[]>(INITIAL_VOTERS);
  const [selectedSlipVoter, setSelectedSlipVoter] = useState<VoterRecord | null>(null);

  const filteredVoters = useMemo(() => {
    return voters.filter((voter) => {
      if (selectedAssembly !== 'all' && voter.assemblyId !== selectedAssembly) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        voter.name.toLowerCase().includes(q) ||
        voter.epicNumber.toLowerCase().includes(q) ||
        voter.relativeName.toLowerCase().includes(q) ||
        voter.wardOrVillage.toLowerCase().includes(q) ||
        voter.boothName.toLowerCase().includes(q) ||
        voter.boothNumber.toString().includes(q)
      );
    });
  }, [voters, selectedAssembly, searchQuery]);

  const assemblyName = (codeOrName: string) => {
    const a = SAHARANPUR_ASSEMBLIES.find(
      (item) => item.code === codeOrName || item.nameHi.includes(codeOrName) || item.nameEn.toLowerCase() === codeOrName.toLowerCase()
    );
    return a ? a.nameHi : codeOrName;
  };

  const handleShareVoterSlip = (v: VoterRecord) => {
    const text = `*AIMIM जिला सहारनपुर — मतदाता पर्ची*\n\n` +
      `👤 *मतदाता:* ${v.name}\n` +
      `👨‍👦 *पिता/पति:* ${v.relativeName}\n` +
      `🆔 *EPIC No:* ${v.epicNumber}\n` +
      `📍 *विधानसभा:* ${assemblyName(v.assemblyId)}\n` +
      `🗳️ *बूथ नं:* ${v.boothNumber}\n` +
      `🏫 *मतदान केंद्र:* ${v.boothName}\n` +
      `🔢 *क्रम संख्या:* ${v.serialNumber}\n` +
      `🏡 *मोहल्ला/वार्ड:* ${v.wardOrVillage}\n\n` +
      `_ऑल इंडिया मजलिस-ए-इत्तेहादुल मुस्लिमीन (पतंग निशान)_`;

    const encoded = encodeURIComponent(text);
    if (v.phone) {
      window.open(`https://wa.me/91${v.phone}?text=${encoded}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    }
  };

  return (
    <div className="space-y-5 pb-20 animate-fadeIn">
      {/* Top Breadcrumb & Back to Home */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-xs sm:text-sm border border-emerald-300 dark:border-emerald-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>बैक टू होम (मुख्य मेन्यू)</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 text-xs font-bold">
            सहारनपुर 7 विधानसभा क्षेत्र
          </span>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
            {filteredVoters.length} वोटर्स प्रदर्शित
          </span>
        </div>
      </div>

      {/* Module Title Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 p-5 text-white border border-indigo-700/60 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 border border-indigo-400 text-white flex items-center justify-center shadow-md flex-shrink-0">
              <Vote className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white font-devanagari">
                वोटर लिस्ट एवं बूथ प्रबंधन
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200/90 font-medium">
                विधानसभा-वार बूथ मतदाता सूची, पर्ची शेयरिंग एवं बूथ प्रभारी रिपोर्ट
              </p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold border border-indigo-500 shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>लिस्ट प्रिंट करें</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Assembly Select */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              विधानसभा क्षेत्र चुनें:
            </label>
            <select
              value={selectedAssembly}
              onChange={(e) => setSelectedAssembly(e.target.value)}
              className="w-full text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">सभी 7 विधानसभा क्षेत्र</option>
              {SAHARANPUR_ASSEMBLIES.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.nameHi} ({a.nameEn})
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              वोटर नाम, EPIC नंबर, बूथ या मोहल्ला खोजें:
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="उदा. उस्मान, UP/03/..., इस्लामिया, देवबंद..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white pl-9 pr-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Voter List Table / Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-600" />
            मतदाता सूची रिकॉर्ड्स ({filteredVoters.length})
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            1-क्लिक व्हाट्सएप वोटर पर्ची
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredVoters.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Vote className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-50" />
              <p className="text-sm font-medium">कोई वोटर रिकॉर्ड नहीं मिला।</p>
              <p className="text-xs text-slate-400 mt-1">खोज शब्द बदलें या विधानसभा फ़िल्टर साफ़ करें।</p>
            </div>
          ) : (
            filteredVoters.map((voter) => (
              <div
                key={voter.id}
                className="p-3.5 sm:p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-white font-devanagari">
                      {voter.name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {voter.epicNumber}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      क्रम: #{voter.serialNumber}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {voter.relationType === 'Father' ? 'पिता:' : 'पति:'} <b className="text-slate-800 dark:text-slate-200">{voter.relativeName}</b> • उम्र: {voter.age} वर्ष • {voter.gender === 'Male' ? 'पुरुष' : 'महिला'}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap pt-0.5">
                    <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold">
                      <Building2 className="w-3 h-3" />
                      {assemblyName(voter.assemblyId)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      बूथ {voter.boothNumber}: {voter.boothName}
                    </span>
                    <span>• {voter.wardOrVillage}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                  <button
                    onClick={() => setSelectedSlipVoter(voter)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>पर्ची देखें</span>
                  </button>

                  <button
                    onClick={() => handleShareVoterSlip(voter)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-bold shadow-sm transition-all active:scale-95"
                    title="व्हाट्सएप पर वोटर पर्ची भेजें"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp पर्ची</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ================= VOTER SLIP MODAL ================= */}
      {selectedSlipVoter && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border-2 border-emerald-600 shadow-2xl p-5 text-slate-900 dark:text-white space-y-4">
            {/* Slip Header */}
            <div className="text-center border-b pb-3 border-emerald-600/30">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">🪁</span>
                <span className="font-extrabold text-emerald-800 dark:text-emerald-400 text-sm">
                  AIMIM जिला सहारनपुर
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                मतदाता सूचना पर्ची (Voter Slip)
              </h3>
              <p className="text-[10px] text-slate-500">
                {assemblyName(selectedSlipVoter.assemblyId)}
              </p>
            </div>

            {/* Slip Details Grid */}
            <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">मतदाता का नाम:</span>
                <span className="font-bold">{selectedSlipVoter.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">पिता/पति:</span>
                <span className="font-bold">{selectedSlipVoter.relativeName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">पहचान पत्र (EPIC):</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{selectedSlipVoter.epicNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">उम्र / लिंग:</span>
                <span className="font-bold">{selectedSlipVoter.age} वर्ष / {selectedSlipVoter.gender === 'Male' ? 'पुरुष' : 'महिला'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">बूथ संख्या:</span>
                <span className="font-black text-emerald-700 dark:text-emerald-400">बूथ #{selectedSlipVoter.boothNumber} (क्रम #{selectedSlipVoter.serialNumber})</span>
              </div>
              <div className="py-1">
                <span className="text-slate-500 block mb-0.5">मतदान केंद्र:</span>
                <span className="font-semibold text-[11px] leading-tight block">{selectedSlipVoter.boothName}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => handleShareVoterSlip(selectedSlipVoter)}
                className="flex-1 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                WhatsApp पर भेजें
              </button>
              <button
                onClick={() => setSelectedSlipVoter(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
