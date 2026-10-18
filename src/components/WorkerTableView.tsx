import React from 'react';
import {
  Phone,
  MessageCircle,
  CreditCard,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { WorkerRecord } from '../types/worker';
import { COMMITTEE_SECTIONS } from '../data/saharanpurData';

interface WorkerTableViewProps {
  workers: WorkerRecord[];
  onEdit: (worker: WorkerRecord) => void;
  onDelete: (id: string, name: string) => void;
  onViewIdCard: (worker: WorkerRecord) => void;
}

export const WorkerTableView: React.FC<WorkerTableViewProps> = ({
  workers,
  onEdit,
  onDelete,
  onViewIdCard,
}) => {
  if (workers.length === 0) {
    return (
      <div className="bg-emerald-950/40 rounded-2xl p-8 border border-emerald-800/50 text-center text-emerald-300">
        कोई कार्यकर्ता रिकॉर्ड नहीं मिला।
      </div>
    );
  }

  return (
    <div className="bg-emerald-950/70 rounded-2xl border border-emerald-800/60 overflow-hidden shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-emerald-100">
          <thead className="bg-emerald-900/70 text-emerald-300 font-semibold uppercase text-[11px] border-b border-emerald-800/60">
            <tr>
              <th className="py-3 px-3">क्र.</th>
              <th className="py-3 px-3">नाम / पिता</th>
              <th className="py-3 px-3">पद एवं दायित्व</th>
              <th className="py-3 px-3">कमेटी वर्ग</th>
              <th className="py-3 px-3">विधानसभा</th>
              <th className="py-3 px-3">ब्लॉक / ग्राम</th>
              <th className="py-3 px-3">संपर्क</th>
              <th className="py-3 px-3">स्थिति</th>
              <th className="py-3 px-3 text-right">कार्रवाई</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-800/40">
            {workers.map((worker, idx) => {
              const cleanPhone = worker.mobile.replace(/\D/g, '');
              const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                `सलाम वालेकुम / नमस्ते ${worker.name} भाई, AIMIM जिला सहारनपुर।`
              )}`;
              const sec = COMMITTEE_SECTIONS.find((s) => s.id === worker.section);

              return (
                <tr
                  key={worker.id}
                  className="hover:bg-emerald-900/40 transition-colors"
                >
                  <td className="py-2.5 px-3 text-emerald-400 font-mono">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-white text-xs">{worker.name}</div>
                    {worker.fatherName && (
                      <div className="text-[10px] text-emerald-300">
                        {worker.fatherName}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-amber-300">
                      {worker.role}
                    </span>
                    {worker.notes && (
                      <div className="text-[10px] text-emerald-300 max-w-xs truncate">
                        {worker.notes}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-emerald-200">
                    <span className="bg-emerald-900/80 px-2 py-0.5 rounded text-[11px] border border-emerald-700/60">
                      {sec?.shortName || worker.section}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-emerald-200">
                    <div className="font-medium">{worker.assembly}</div>
                  </td>
                  <td className="py-2.5 px-3 text-emerald-300">
                    <div>{worker.block}</div>
                    <div className="text-[10px] text-emerald-400">{worker.villageOrWard}</div>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="font-mono text-white text-[11px] mb-1">
                      {worker.mobile}
                    </div>
                    <div className="flex items-center gap-1">
                      <a
                        href={`tel:${worker.mobile}`}
                        className="p-1 rounded bg-emerald-800 hover:bg-emerald-700 text-white"
                        title="कॉल करें"
                      >
                        <Phone className="w-3 h-3" />
                      </a>
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded bg-green-700 hover:bg-green-600 text-white"
                        title="व्हाट्सएप"
                      >
                        <MessageCircle className="w-3 h-3" />
                      </a>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    {worker.isActive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> सक्रिय
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-red-400">
                        <XCircle className="w-3 h-3" /> निष्क्रिय
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onViewIdCard(worker)}
                        className="p-1.5 rounded text-amber-300 hover:bg-emerald-800"
                        title="डिजिटल आई-कार्ड"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEdit(worker)}
                        className="p-1.5 rounded text-emerald-300 hover:bg-emerald-800"
                        title="एडिट"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(worker.id, worker.name)}
                        className="p-1.5 rounded text-red-300 hover:bg-red-950"
                        title="हटाएं"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
