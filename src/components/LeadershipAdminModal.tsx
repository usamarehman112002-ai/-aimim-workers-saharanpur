import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  Phone,
  MessageCircle,
  Building2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { LeaderProfile, LeadershipCategory } from '../types/leadership';
import { SAHARANPUR_ASSEMBLIES } from '../data/saharanpurData';

interface LeadershipAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaders: LeaderProfile[];
  onSaveLeaders: (updated: LeaderProfile[]) => void;
  onResetDefaults: () => void;
}

export const LeadershipAdminModal: React.FC<LeadershipAdminModalProps> = ({
  isOpen,
  onClose,
  leaders,
  onSaveLeaders,
  onResetDefaults,
}) => {
  const [editingLeader, setEditingLeader] = useState<LeaderProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'edit'>('list');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleEditClick = (leader: LeaderProfile) => {
    setEditingLeader({ ...leader });
    setActiveTab('edit');
  };

  const handleAddNewClick = () => {
    const newLeader: LeaderProfile = {
      id: `leader-custom-${Date.now()}`,
      category: 'assembly',
      categoryLabel: 'विधानसभा अध्यक्ष',
      name: '',
      role: '',
      roleSubtitle: '',
      photoUrl: '/leaders/district_president.jpg',
      phone: '',
      whatsapp: '',
      quote: '',
      order: leaders.length + 1,
    };
    setEditingLeader(newLeader);
    setActiveTab('edit');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingLeader) {
      if (file.size > 3 * 1024 * 1024) {
        alert('कृपया 3MB से छोटी फोटो चुनें।');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditingLeader({
            ...editingLeader,
            photoUrl: event.target.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCurrentLeader = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLeader) return;

    if (!editingLeader.name.trim() || !editingLeader.role.trim()) {
      alert('कृपया नाम और पद अवश्य भरें।');
      return;
    }

    const existingIndex = leaders.findIndex((l) => l.id === editingLeader.id);
    let updatedList: LeaderProfile[];

    if (existingIndex >= 0) {
      updatedList = [...leaders];
      updatedList[existingIndex] = editingLeader;
    } else {
      updatedList = [...leaders, editingLeader];
    }

    onSaveLeaders(updatedList);
    setSuccessMessage(`'${editingLeader.name}' का विवरण और फोटो सफलतापूर्वक अपडेट हो गया!`);
    setTimeout(() => setSuccessMessage(null), 3000);
    setActiveTab('list');
    setEditingLeader(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`क्या आप '${name}' को नेतृत्व सूची से हटाना चाहते हैं?`)) {
      const updated = leaders.filter((l) => l.id !== id);
      onSaveLeaders(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-devanagari">
                नेतृत्व एवं पदाधिकारी प्रबंधन (Admin Panel)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                राष्ट्रीय, प्रदेश, जिला व 7 विधानसभा अध्यक्षों के फोटो व नाम अपडेट करें
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="bg-emerald-50 dark:bg-emerald-950/50 border-b border-emerald-200 dark:border-emerald-800 px-5 py-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            {successMessage}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'list' ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  कुल पदाधिकारी: <strong className="text-emerald-600">{leaders.length}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onResetDefaults}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                    title="पार्टी के आधिकारिक डिफ़ॉल्ट नामों व फोटो पर रीसेट करें"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    डिफ़ॉल्ट रीसेट
                  </button>
                  <button
                    onClick={handleAddNewClick}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    नया पदाधिकारी जोड़ें
                  </button>
                </div>
              </div>

              {/* Leader List Table / Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {leaders.map((leader) => (
                  <div
                    key={leader.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 transition-all gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 border-2 border-emerald-500/50 flex-shrink-0 shadow-xs">
                        <img
                          src={leader.photoUrl}
                          alt={leader.name}
                          className="w-full h-full object-cover object-center"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/leaders/district_president.jpg';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block truncate">
                          {leader.role}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {leader.name}
                        </h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                          {leader.city || leader.assemblyName || 'पदाधिकारी'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleEditClick(leader)}
                        className="p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1 transition-colors"
                        title="फोटो व नाम बदलें"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">बदलें</span>
                      </button>
                      <button
                        onClick={() => handleDelete(leader.id, leader.name)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="हटाएं"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Edit Form Tab */
            editingLeader && (
              <form onSubmit={handleSaveCurrentLeader} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-emerald-600" />
                    पदाधिकारी विवरण एवं फोटो संपादन
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('list');
                      setEditingLeader(null);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  >
                    ← सूची पर वापस
                  </button>
                </div>

                {/* Photo Upload Section */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    पदाधिकारी की फोटो (Photo)
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-600 shadow-md bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                      <img
                        src={editingLeader.photoUrl}
                        alt="Leader Preview"
                        className="w-full h-full object-cover object-center"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/leaders/district_president.jpg';
                        }}
                      />
                    </div>

                    <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all"
                        >
                          <Upload className="w-4 h-4" />
                          फ़ोन/कंप्यूटर से नई फोटो अपलोड करें
                        </button>
                      </div>

                      <div className="mt-2">
                        <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                          या सीधे फोटो लिंक (Image URL) दर्ज करें:
                        </label>
                        <input
                          type="text"
                          value={editingLeader.photoUrl}
                          onChange={(e) =>
                            setEditingLeader({ ...editingLeader, photoUrl: e.target.value })
                          }
                          placeholder="https://example.com/photo.jpg"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      पदाधिकारी का नाम (Full Name) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingLeader.name}
                      onChange={(e) =>
                        setEditingLeader({ ...editingLeader, name: e.target.value })
                      }
                      placeholder="उदा० बैरिस्टर असदुद्दीन ओवैसी / मो० कलीम"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      श्रेणी (Category)
                    </label>
                    <select
                      value={editingLeader.category}
                      onChange={(e) => {
                        const cat = e.target.value as LeadershipCategory;
                        const labelMap: Record<LeadershipCategory, string> = {
                          national: 'राष्ट्रीय नेतृत्व',
                          state: 'प्रदेश नेतृत्व',
                          west_up: 'पश्चिम प्रदेश नेतृत्व',
                          district: 'जिला नेतृत्व (सहारनपुर)',
                          assembly: 'विधानसभा अध्यक्ष',
                        };
                        setEditingLeader({
                          ...editingLeader,
                          category: cat,
                          categoryLabel: labelMap[cat],
                        });
                      }}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="national">राष्ट्रीय अध्यक्ष (National President)</option>
                      <option value="state">प्रदेश अध्यक्ष (State President)</option>
                      <option value="west_up">पश्चिम प्रदेश अध्यक्ष (Western UP)</option>
                      <option value="district">जिला अध्यक्ष (District President - सहारनपुर)</option>
                      <option value="assembly">संबंधित विधानसभा अध्यक्ष (Assembly President)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      पद का नाम (Role / Designation) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingLeader.role}
                      onChange={(e) =>
                        setEditingLeader({ ...editingLeader, role: e.target.value })
                      }
                      placeholder="उदा० राष्ट्रीय अध्यक्ष / विधानसभा अध्यक्ष — देवबंद"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      संबंधित विधानसभा क्षेत्र (यदि लागू हो)
                    </label>
                    <select
                      value={editingLeader.assemblyName || ''}
                      onChange={(e) => {
                        const name = e.target.value;
                        const matched = SAHARANPUR_ASSEMBLIES.find((a) => a.nameHi === name);
                        setEditingLeader({
                          ...editingLeader,
                          assemblyName: name,
                          assemblyCode: matched?.code,
                        });
                      }}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">कोई नहीं / सामान्य</option>
                      {SAHARANPUR_ASSEMBLIES.map((a) => (
                        <option key={a.code} value={a.nameHi}>
                          {a.code} - {a.nameHi}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      मोबाइल नंबर (Call)
                    </label>
                    <input
                      type="text"
                      value={editingLeader.phone || ''}
                      onChange={(e) =>
                        setEditingLeader({ ...editingLeader, phone: e.target.value })
                      }
                      placeholder="+919837123456"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      व्हाट्सएप नंबर (WhatsApp)
                    </label>
                    <input
                      type="text"
                      value={editingLeader.whatsapp || ''}
                      onChange={(e) =>
                        setEditingLeader({ ...editingLeader, whatsapp: e.target.value })
                      }
                      placeholder="919837123456"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    संदेश / प्रेरणादायक विचार (Quote / Note)
                  </label>
                  <input
                    type="text"
                    value={editingLeader.quote || ''}
                    onChange={(e) =>
                      setEditingLeader({ ...editingLeader, quote: e.target.value })
                    }
                    placeholder="उदा० हक़, इंसाफ़ और संविधान की हिफ़ाज़त के लिए एकजुट होकर काम करें।"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('list');
                      setEditingLeader(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    परिवर्तन सुरक्षित करें
                  </button>
                </div>
              </form>
            )
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs text-slate-500">
          <span>ऑल इंडिया मजलिस-ए-इत्तेहादुल मुस्लिमीन (सहारनपुर)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold transition-colors"
          >
            बंद करें
          </button>
        </div>

      </div>
    </div>
  );
};
