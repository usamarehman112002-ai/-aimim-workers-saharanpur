import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Printer,
  Copy,
  Check,
  Share2,
  Download,
} from 'lucide-react';
import { WorkerRecord } from '../types/worker';
import { COMMITTEE_SECTIONS } from '../data/saharanpurData';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  workers: WorkerRecord[];
  activeSectionName: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  workers,
  activeSectionName,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate WhatsApp summary text
  const generateWhatsAppSummary = () => {
    let text = `📢 *AIMIM जिला सहारनपुर — कार्यकर्ता एवं कमेटी सूची*\n`;
    text += `📋 *वर्ग:* ${activeSectionName}\n`;
    text += `👥 *कुल सदस्य:* ${workers.length}\n`;
    text += `📅 *दिनांक:* ${new Date().toLocaleDateString('hi-IN')}\n\n`;

    workers.forEach((w, idx) => {
      text += `${idx + 1}. *${w.name}* (${w.role})\n`;
      text += `   📍 ${w.assembly} | ${w.block} (${w.villageOrWard})\n`;
      text += `   📞 ${w.mobile}\n`;
      if (w.notes) text += `   📝 ${w.notes}\n`;
      text += `\n`;
    });

    text += `_ऑल इंडिया मजलिस-ए-इत्तेहादुल मुस्लिमीन (AIMIM) सहारनपुर, उत्तर प्रदेश_`;
    return text;
  };

  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppSummary();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsAppDirect = () => {
    const text = generateWhatsAppSummary();
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDownloadCSV = () => {
    const headers = [
      'क्रमांक',
      'कार्यकर्ता का नाम',
      'पिता का नाम',
      'मोबाइल नंबर',
      'वैकल्पिक मोबाइल',
      'विधानसभा क्षेत्र',
      'ब्लॉक',
      'ग्राम/वार्ड',
      'कमेटी वर्ग',
      'पद एवं दायित्व',
      'जुड़ने का वर्ष',
      'रक्त समूह',
      'सक्रिय स्थिति',
      'विशेष टिप्पणी',
    ];

    const rows = workers.map((w, idx) => {
      const sec = COMMITTEE_SECTIONS.find((s) => s.id === w.section);
      return [
        idx + 1,
        `"${(w.name || '').replace(/"/g, '""')}"`,
        `"${(w.fatherName || '').replace(/"/g, '""')}"`,
        `"${w.mobile || ''}"`,
        `"${w.altMobile || ''}"`,
        `"${w.assembly || ''}"`,
        `"${w.block || ''}"`,
        `"${(w.villageOrWard || '').replace(/"/g, '""')}"`,
        `"${sec?.nameHi || w.section}"`,
        `"${(w.role || '').replace(/"/g, '""')}"`,
        `"${w.joiningYear || ''}"`,
        `"${w.bloodGroup || ''}"`,
        w.isActive ? 'सक्रिय' : 'निष्क्रिय',
        `"${(w.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    // Add UTF-8 BOM so Hindi Devanagari renders properly in Microsoft Excel
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AIMIM_Saharanpur_Workers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-emerald-950 text-white rounded-2xl border border-emerald-700/80 w-full max-w-lg shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-emerald-900/90 px-4 sm:px-6 py-3.5 border-b border-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base sm:text-lg text-white">
              सूची शेयर, डाउनलोड एवं प्रिंट करें
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4 text-xs">
          <div className="bg-emerald-900/40 p-3 rounded-xl border border-emerald-800/60">
            <div className="text-amber-300 font-bold text-sm mb-1">
              चयनित वर्ग: {activeSectionName}
            </div>
            <div className="text-emerald-300">
              वर्तमान में इस सूची में <b>{workers.length}</b> कार्यकर्ता शामिल हैं।
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Download CSV */}
            <button
              onClick={handleDownloadCSV}
              className="p-3 rounded-xl bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-700/70 text-left flex flex-col justify-between group transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <FileSpreadsheet className="w-6 h-6 text-emerald-400 group-hover:text-amber-300 transition-colors" />
                <Download className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="font-bold text-white text-xs sm:text-sm">
                  एक्सेल / CSV डाउनलोड
                </div>
                <p className="text-[11px] text-emerald-300 mt-0.5">
                  हिन्दी फॉन्ट (UTF-8) समर्थित स्प्रेडशीट फ़ाइल
                </p>
              </div>
            </button>

            {/* Print View */}
            <button
              onClick={handlePrint}
              className="p-3 rounded-xl bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-700/70 text-left flex flex-col justify-between group transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <Printer className="w-6 h-6 text-amber-400 group-hover:text-amber-300 transition-colors" />
              </div>
              <div>
                <div className="font-bold text-white text-xs sm:text-sm">
                  प्रिंट आउट निकालें
                </div>
                <p className="text-[11px] text-emerald-300 mt-0.5">
                  बैठक एवं संगठन हेतु प्रिंट-रेडी लेआउट
                </p>
              </div>
            </button>
          </div>

          {/* WhatsApp Text Section */}
          <div className="space-y-2 pt-2 border-t border-emerald-800/40">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-200">
                व्हाट्सएप ग्रुप हेतु तैयार संदेश:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyWhatsApp}
                  className="px-2 py-1 rounded-lg bg-emerald-900 text-amber-300 hover:text-white border border-emerald-700 text-[11px] flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'कॉपी हो गया' : 'टेक्स्ट कॉपी'}</span>
                </button>
                <button
                  onClick={handleShareWhatsAppDirect}
                  className="px-2.5 py-1 rounded-lg bg-green-700 hover:bg-green-600 text-white font-semibold text-[11px] flex items-center gap-1"
                >
                  <Share2 className="w-3 h-3" />
                  <span>व्हाट्सएप खोलें</span>
                </button>
              </div>
            </div>

            <textarea
              readOnly
              rows={6}
              value={generateWhatsAppSummary()}
              className="w-full p-2.5 bg-black/50 border border-emerald-800 rounded-xl text-[11px] text-emerald-200 font-sans select-all focus:outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-emerald-900/60 border-t border-emerald-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold"
          >
            बंद करें
          </button>
        </div>

      </div>
    </div>
  );
};
