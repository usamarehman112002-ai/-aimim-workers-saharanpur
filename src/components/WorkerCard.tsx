import React from 'react';
import {
  Phone,
  MessageCircle,
  MapPin,
  Building,
  UserCheck,
  Edit2,
  Trash2,
  CreditCard,
  Share2,
  Calendar,
  AlertCircle,
  BadgeCheck,
} from 'lucide-react';
import { WorkerRecord } from '../types/worker';
import { COMMITTEE_SECTIONS } from '../data/saharanpurData';

interface WorkerCardProps {
  worker: WorkerRecord;
  onEdit: (worker: WorkerRecord) => void;
  onDelete: (id: string, name: string) => void;
  onViewIdCard: (worker: WorkerRecord) => void;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({
  worker,
  onEdit,
  onDelete,
  onViewIdCard,
}) => {
  const sectionMeta = COMMITTEE_SECTIONS.find((s) => s.id === worker.section);

  const cleanPhone = worker.mobile.replace(/\D/g, '');
  const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
    `सलाम वालेकुम / नमस्ते ${worker.name} भाई, AIMIM जिला सहारनपुर संगठन की ओर से संदेश।`
  )}`;

  const handleShareWorker = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `*AIMIM जिला सहारनपुर कार्यकर्ता विवरण*\n\n` +
      `👤 *नाम:* ${worker.name}\n` +
      (worker.fatherName ? `👨‍👦 *पिता का नाम:* ${worker.fatherName}\n` : '') +
      `🎖️ *दायित्व / पद:* ${worker.role}\n` +
      `🏛️ *कमेटी:* ${sectionMeta?.nameHi || worker.section}\n` +
      `📍 *विधानसभा:* ${worker.assembly}\n` +
      `🏢 *ब्लॉक:* ${worker.block}\n` +
      `🏡 *ग्राम/वार्ड:* ${worker.villageOrWard}\n` +
      `📞 *मोबाइल:* ${worker.mobile}\n` +
      (worker.notes ? `📝 *टिप्पणी:* ${worker.notes}\n` : '') +
      `\n_ऑल इंडिया मजलिस-ए-इत्तेहादुल मुस्लिमीन (AIMIM) सहारनपुर_`;

    if (navigator.share) {
      navigator.share({
        title: `${worker.name} - AIMIM Saharanpur`,
        text: shareText,
      }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  return (
    <div className="bg-gradient-to-b from-emerald-950 via-emerald-950/90 to-emerald-900/60 rounded-2xl p-4 border border-emerald-800/70 shadow-md hover:border-emerald-600/80 transition-all hover:shadow-xl flex flex-col justify-between group relative overflow-hidden">
      {/* Top Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500" />

      {/* Header Info */}
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          {/* Avatar & Name */}
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold text-base flex-shrink-0 shadow-inner">
              {worker.name.charAt(0) || 'क'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-base font-bold text-white leading-tight truncate">
                  {worker.name}
                </h3>
                {worker.isActive ? (
                  <span title="सक्रिय सदस्य" className="text-emerald-400">
                    <BadgeCheck className="w-4 h-4 fill-emerald-500/20" />
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.2 bg-red-950/70 text-red-300 border border-red-800 rounded">
                    निष्क्रिय
                  </span>
                )}
              </div>

              {worker.fatherName && (
                <p className="text-[11px] text-emerald-300/80 truncate">
                  सुपुत्र: {worker.fatherName}
                </p>
              )}

              {/* Committee Tag */}
              <div className="mt-1">
                <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-900/90 text-amber-300 border border-emerald-700/80">
                  {worker.role}
                </span>
              </div>
            </div>
          </div>

          {/* Demo Badge */}
          {worker.isDemo && (
            <span
              title="यह परीक्षण हेतु डेमो डेटा है"
              className="text-[9px] font-medium bg-amber-500/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded uppercase flex-shrink-0"
            >
              डेमो
            </span>
          )}
        </div>

        {/* Location & Details */}
        <div className="space-y-1 text-xs text-emerald-200/90 pt-1 border-t border-emerald-800/40">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="font-medium text-emerald-100">{worker.assembly}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-300">
            <Building className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>
              ब्लॉक: <b>{worker.block}</b> • ग्राम/वार्ड: <b>{worker.villageOrWard}</b>
            </span>
          </div>

          {worker.joiningYear && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
              <Calendar className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span>जुड़ने का वर्ष: {worker.joiningYear}</span>
            </div>
          )}

          {worker.notes && (
            <div className="text-[11px] bg-emerald-900/40 p-1.5 rounded-lg border border-emerald-800/50 text-emerald-200 mt-1 line-clamp-2">
              <span className="text-amber-400 font-semibold mr-1">दायित्व:</span>
              {worker.notes}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="mt-3.5 pt-3 border-t border-emerald-800/60 flex items-center justify-between gap-2">
        {/* Quick Communication: Call & WhatsApp */}
        <div className="flex items-center gap-1.5">
          <a
            href={`tel:${worker.mobile}`}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 border border-emerald-600/50"
            title={`${worker.name} को कॉल करें`}
          >
            <Phone className="w-3.5 h-3.5 text-emerald-300" />
            <span>कॉल</span>
          </a>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-700 hover:bg-green-600 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 border border-green-500/50"
            title="व्हाट्सएप पर संदेश भेजें"
          >
            <MessageCircle className="w-3.5 h-3.5 text-white" />
            <span>व्हाट्सएप</span>
          </a>
        </div>

        {/* Tools Menu: ID Card, Share, Edit, Delete */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onViewIdCard(worker)}
            title="डिजिटल आई-कार्ड देखें"
            className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-amber-300 hover:text-amber-200 border border-emerald-700/50 transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleShareWorker}
            title="कार्यकर्ता का विवरण शेयर करें"
            className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 hover:text-white border border-emerald-700/50 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onEdit(worker)}
            title="संशोधित करें"
            className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 hover:text-white border border-emerald-700/50 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDelete(worker.id, worker.name)}
            title="हटाएं"
            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/70 text-red-300 hover:text-red-200 border border-red-900/50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
