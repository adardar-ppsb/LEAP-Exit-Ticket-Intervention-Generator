import React, { useState } from 'react';
import { BookOpen, CheckCircle, Trash2, ArrowUpRight, Check } from 'lucide-react';
import { ExitTicket } from '../../types';
import { getSubjectClasses, matchSubject } from '../../utils';

interface SavedLibraryProps {
  exitTickets: ExitTicket[];
  onToggleActive: (id: string) => Promise<void>;
  onDeleteTicket: (id: string) => Promise<void>;
  onLoadInWorkspace: (ticket: ExitTicket) => void;
  onGoToStudio: () => void;
}

export const SavedLibrary: React.FC<SavedLibraryProps> = ({
  exitTickets,
  onToggleActive,
  onDeleteTicket,
  onLoadInWorkspace,
  onGoToStudio,
}) => {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');

  const displayedTickets = exitTickets.filter((t) => matchSubject(t.subject, selectedSubjectFilter));

  return (
    <div className="space-y-6">
      {/* Subject Filter Bar */}
      <div className="flex items-center space-x-2 bg-white border border-slate-200 p-2 rounded-2xl w-fit shadow-xs">
        <span className="text-xs text-slate-400 font-bold px-2 uppercase tracking-wider">Subject Focus:</span>
        {(['All', 'ELA', 'Math', 'Science'] as const).map((f) => (
          <button
            key={f}
            id={`filter-lib-${f.toLowerCase()}`}
            onClick={() => setSelectedSubjectFilter(f)}
            className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition ${
              selectedSubjectFilter === f ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedTickets.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center text-slate-400">
            <div className="bg-slate-50 text-slate-400 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-slate-100">
              <BookOpen className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-black text-slate-800">No Saved Tickets Found</h4>
            <p className="text-sm mt-1 max-w-sm mx-auto text-slate-500">
              You have not generated or saved any exit tickets in this subject. Head to the{' '}
              <button
                onClick={onGoToStudio}
                className="text-indigo-600 font-bold hover:underline"
              >
                Ticket Studio
              </button>{' '}
              to design an assessment.
            </p>
          </div>
        ) : (
          displayedTickets.map((t) => (
            <div
              key={t.id || 'ticket'}
              id={`card-saved-ticket-${t.id}`}
              className={`bg-white border rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all ${
                t.isActive ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getSubjectClasses(
                      t.subject
                    )}`}
                  >
                    {t.subject}
                  </span>
                  {t.isActive ? (
                    <span className="bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Active Assignment</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => t.id && onToggleActive(t.id)}
                      className="text-[10px] font-bold text-slate-600 hover:text-indigo-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
                    >
                      Assign Active
                    </button>
                  )}
                </div>

                <h3 className="font-extrabold text-slate-900 text-base line-clamp-2">
                  {t.customName || 'General Exit Ticket'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {t.grade} • {t.module}
                </p>
                <p className="text-xs text-slate-500 line-clamp-2 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {t.objective || 'Core lesson competencies'}
                </p>
                <p className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center space-x-1">
                  <span className="text-slate-400">Target Skill:</span>
                  <strong className="text-slate-800">{t.remediationSkill || 'Evidence Synthesis'}</strong>
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onLoadInWorkspace(t)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1"
                >
                  <span>Load in Workspace</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => t.id && onDeleteTicket(t.id)}
                  className="text-xs text-rose-500 hover:text-rose-700 font-medium flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
