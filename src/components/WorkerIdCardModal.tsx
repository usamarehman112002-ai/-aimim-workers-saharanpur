import React from 'react';
import {
  X,
  Printer,
  Share2,
  Phone,
  MapPin,
  Building,
  CheckCircle2,
  QrCode,
} from 'lucide-react';
import { WorkerRecord } from '../types/worker';
import { COMMITTEE_SECTIONS } from '../data/saharanpurData';

interface WorkerIdCardModalProps {
  worker: WorkerRecord | null;
  onClose: () => void;
}

export const WorkerIdCardModal: React.FC<WorkerIdCardModalProps> = ({
  worker,
  onClose,
}) => {
  if (!worker) return null;

  const sectionMeta = COMMITTEE_SECTIONS.find((s) => s.id === worker.section);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `*AIMIM जिला सहारनपुर डिजिटल पहचान पत्र*\n\n` +
      `नाम: ${worker.name}\n` +
      `पद: ${worker.role}\n` +
      `कमेटी: ${sectionMeta?.nameHi || worker.section}\n` +
      `विधानसभा: ${worker.assembly}\n` +
      `ब्लॉक: ${worker.block}\n` +
      `ग्राम/वार्ड: ${worker.villageOrWard}\n` +
      `मोबाइल: ${worker.mobile}\n` +
      `सहारनपुर इकाई`;

    if (navigator.share) {
      navigator.share({
        title: `AIMIM ID - ${worker.name}`,
        text,
      }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-emerald-950 text-white rounded-2xl border border-emerald-700 w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-emerald-900 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪁</span>
            <span className="font-bold text-sm text-white">डिजिटल कार्यकर्ता आई-कार्ड</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Card Area */}
        <div className="p-4 sm:p-5 flex justify-center">
          <div
            id="worker-id-card"
            className="w-full max-w-[340px] bg-gradient-to-b from-emerald-900 via-emerald-950 to-black rounded-2xl border-2 border-amber-400 p-4 shadow-xl text-white relative overflow-hidden"
          >
            {/* Top Badge */}
            <div className="text-center pb-2.5 border-b border-amber-400/40 relative">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">🪁</span>
                <div>
                  <h4 className="text-xs font-black tracking-widest text-amber-300 uppercase">
                    AIMIM
                  </h4>
                  <p className="text-[10px] text-emerald-200 font-semibold leading-tight">
                    ऑल इंडिया मजलिस-ए-इत्तेहादुल मुस्लिमीन
                  </p>
                  <p className="text-[10px] text-amber-400 font-bold">
                    जिला इकाई — सहारनपुर (उ.प्र.)
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Avatar & Name */}
            <div className="flex flex-col items-center text-center mt-3 mb-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-amber-400 p-0.5 shadow-lg">
                <div className="w-full h-full rounded-full bg-emerald-950 flex items-center justify-center text-2xl font-black text-amber-300">
                  {worker.name.charAt(0)}
                </div>
              </div>
              <h3 className="text-base font-black text-white mt-2 leading-tight">
                {worker.name}
              </h3>
              {worker.fatherName && (
                <p className="text-[10px] text-emerald-300">
                  सुपुत्र: {worker.fatherName}
                </p>
              )}
              <div className="mt-1 bg-amber-400 text-emerald-950 px-2.5 py-0.5 rounded-full text-xs font-black shadow-sm">
                {worker.role}
              </div>
            </div>

            {/* Info Grid */}
            <div className="bg-emerald-950/80 rounded-xl p-2.5 border border-emerald-800 text-[11px] space-y-1.5 text-emerald-200">
              <div className="flex justify-between">
                <span className="text-emerald-400">कमेटी वर्ग:</span>
                <span className="font-semibold text-white">{sectionMeta?.nameHi || worker.section}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-400">विधानसभा:</span>
                <span className="font-semibold text-white">{worker.assembly}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-400">ब्लॉक:</span>
                <span className="font-semibold text-white">{worker.block}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-400">ग्राम / वार्ड:</span>
                <span className="font-semibold text-white">{worker.villageOrWard}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-400">मोबाइल:</span>
                <span className="font-mono font-bold text-amber-300">{worker.mobile}</span>
              </div>
              {worker.joiningYear && (
                <div className="flex justify-between">
                  <span className="text-emerald-400">सदस्यता वर्ष:</span>
                  <span className="font-mono text-white">{worker.joiningYear}</span>
                </div>
              )}
            </div>

            {/* Bottom Footer with QR and Verification */}
            <div className="mt-3 pt-2.5 border-t border-emerald-800/80 flex items-center justify-between text-[9px] text-emerald-400">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1 text-emerald-300 font-semibold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  प्रमाणित AIMIM सहारनपुर
                </div>
                <div>आईडी: {worker.id.slice(0, 12)}</div>
              </div>

              {/* QR Code Graphic Placeholder */}
              <div className="w-10 h-10 bg-white p-0.5 rounded border border-amber-400 flex items-center justify-center">
                <QrCode className="w-full h-full text-emerald-950" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 bg-emerald-900/60 border-t border-emerald-800 flex items-center justify-between gap-2">
          <button
            onClick={handleShare}
            className="flex-1 py-2 px-3 rounded-xl bg-green-700 hover:bg-green-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>व्हाट्सएप शेयर</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>प्रिंट कार्ड</span>
          </button>
        </div>
      </div>
    </div>
  );
};
