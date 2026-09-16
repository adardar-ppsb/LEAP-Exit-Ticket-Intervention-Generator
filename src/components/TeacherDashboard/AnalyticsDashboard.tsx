import React, { useState } from 'react';
import {
  BarChart3,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Award,
  Users,
  Eye,
  FileCheck,
} from 'lucide-react';
import { StudentSubmission } from '../../types';
import { getLevelColor, getLevelOfUnderstanding, matchSubject } from '../../utils';

interface AnalyticsDashboardProps {
  submissions: StudentSubmission[];
  onOpenReview: (submission: StudentSubmission) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  submissions,
  onOpenReview,
}) => {
  const [analyticsSubjectFilter, setAnalyticsSubjectFilter] = useState('All');
  const [analyticsTicketFilter, setAnalyticsTicketFilter] = useState('All');

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSubject = matchSubject(sub.subject, analyticsSubjectFilter);
    const matchesTicket = analyticsTicketFilter === 'All' || sub.ticketId === analyticsTicketFilter;
    return matchesSubject && matchesTicket;
  });

  const uniqueTicketsForFilter = Array.from(
    new Map<string, { id: string; name: string }>(
      submissions
        .filter((sub) => matchSubject(sub.subject, analyticsSubjectFilter))
        .map((sub) => [sub.ticketId, { id: sub.ticketId, name: sub.ticketName }])
    ).values()
  );

  const remediationGroups: { [skill: string]: StudentSubmission[] } = {};
  filteredSubmissions.forEach((sub) => {
    if (sub.percentage < 75) {
      const skillName = sub.remediationSkill || 'Focus Standard Review';
      if (!remediationGroups[skillName]) {
        remediationGroups[skillName] = [];
      }
      remediationGroups[skillName].push(sub);
    }
  });

  const getTicketSnapshotStats = () => {
    if (analyticsTicketFilter === 'All' || filteredSubmissions.length === 0) return null;
    const total = filteredSubmissions.length;
    let q1CorrectCount = 0;
    let q2CompleteCorrectCount = 0;
    let q3CompleteCorrectCount = 0;

    filteredSubmissions.forEach((sub) => {
      if (sub.feedback?.q1Correct) q1CorrectCount++;
      if (sub.feedback?.q2PartACorrect && sub.feedback?.q2PartBCorrect) q2CompleteCorrectCount++;
      if (sub.feedback?.q3Correct) q3CompleteCorrectCount++;
    });

    return {
      q1Accuracy: Math.round((q1CorrectCount / total) * 100),
      q2Accuracy: Math.round((q2CompleteCorrectCount / total) * 100),
      q3Accuracy: Math.round((q3CompleteCorrectCount / total) * 100),
    };
  };

  const ticketStats = getTicketSnapshotStats();

  const totalFiltered = filteredSubmissions.length;
  const avgAccuracy =
    totalFiltered > 0
      ? Math.round(
          filteredSubmissions.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / totalFiltered
        )
      : 0;

  const requiringIntervention = filteredSubmissions.filter((s) => s.percentage < 75);
  const completedIntervention = requiringIntervention.filter((s) => s.interventionCompleted);
  const closeoutRate =
    requiringIntervention.length > 0
      ? Math.round((completedIntervention.length / requiringIntervention.length) * 100)
      : 100;

  return (
    <div className="space-y-8">
      {/* Filter Workspace Header */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-ping"></div>
          <span className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>Analytics Query Filter Engine</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Subject Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Filter by Subject
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['All', 'ELA', 'Math', 'Science'] as const).map((f) => (
                <button
                  key={f}
                  id={`btn-filter-analytics-${f.toLowerCase()}`}
                  onClick={() => {
                    setAnalyticsSubjectFilter(f);
                    setAnalyticsTicketFilter('All');
                  }}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition ${
                    analyticsSubjectFilter === f
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Filter by Individual Exit Ticket
            </label>
            <select
              id="select-analytics-ticket"
              value={analyticsTicketFilter}
              onChange={(e) => setAnalyticsTicketFilter(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Exit Tickets (Cumulative Classroom)</option>
              {uniqueTicketsForFilter.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
            Filtered Submissions
          </span>
          <strong className="text-3xl font-black text-slate-900 mt-2 block">{totalFiltered}</strong>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
            Average Accuracy
          </span>
          <strong className="text-3xl font-black text-indigo-600 mt-2 block">{avgAccuracy}%</strong>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
            Active Interventions
          </span>
          <strong className="text-3xl font-black text-amber-500 mt-2 block">
            {requiringIntervention.length} Required
          </strong>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
            Intervention Closeout
          </span>
          <strong className="text-3xl font-black text-emerald-600 mt-2 block">{closeoutRate}%</strong>
        </div>
      </div>

      {/* Individual Exit Ticket Snapshot */}
      {ticketStats && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 px-2.5 py-1 rounded-lg">
              Individual Exit Ticket Tier Diagnostics
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Tier I */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
              <span className="text-[10px] font-black uppercase text-indigo-300">
                Tier I - Foundational Accuracy
              </span>
              <div className="flex items-baseline space-x-2 pt-1">
                <strong className="text-2xl font-black">{ticketStats.q1Accuracy}%</strong>
                <span className="text-[11px] text-slate-400">Class accuracy</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${ticketStats.q1Accuracy}%` }}></div>
              </div>
            </div>

            {/* Tier II */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-300">
                Tier II - Mastery (EBSR Two-Part)
              </span>
              <div className="flex items-baseline space-x-2 pt-1">
                <strong className="text-2xl font-black">{ticketStats.q2Accuracy}%</strong>
                <span className="text-[11px] text-slate-400">Complete parts correct</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${ticketStats.q2Accuracy}%` }}></div>
              </div>
            </div>

            {/* Tier III */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
              <span className="text-[10px] font-black uppercase text-purple-300">
                Tier III - Advanced Multi-Select
              </span>
              <div className="flex items-baseline space-x-2 pt-1">
                <strong className="text-2xl font-black">{ticketStats.q3Accuracy}%</strong>
                <span className="text-[11px] text-slate-400">Class accuracy</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-purple-400 h-full rounded-full" style={{ width: `${ticketStats.q3Accuracy}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remediation Workgroups */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
              <Users className="w-5 h-5 text-amber-600" />
              <span>Adaptive Remediation Workgroups</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Students auto-clustered by standards gap derived from real-time scores below 75%.
            </p>
          </div>
        </div>

        {Object.keys(remediationGroups).length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm italic">
            No active remediation workgroups required for this query filter selection. 🎉
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(remediationGroups).map((skill) => (
              <div key={skill} className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-slate-900 block">{skill} Focus</span>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {remediationGroups[skill].length} Students Active
                  </span>
                </div>

                <div className="space-y-2">
                  {remediationGroups[skill].map((sub) => (
                    <div
                      key={sub.id}
                      className="bg-white border border-slate-200 p-3 rounded-xl flex justify-between items-center text-xs shadow-xs"
                    >
                      <div>
                        <strong className="text-slate-800 block text-sm">{sub.studentName}</strong>
                        <span className="text-slate-500 font-medium">
                          Score: {sub.percentage}% • {getLevelOfUnderstanding(sub.percentage)}
                        </span>
                      </div>
                      <div>
                        {sub.interventionCompleted ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Loop: {sub.interventionScore ?? 0}%</span>
                          </span>
                        ) : (
                          <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Pending Loop</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submissions Registry Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-indigo-600" />
            <span>Submission Registry ({filteredSubmissions.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-200/60">
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">Assigned Assessment</th>
                <th className="px-6 py-3">Standard Focus</th>
                <th className="px-6 py-3">Accuracy</th>
                <th className="px-6 py-3">LDOE Level</th>
                <th className="px-6 py-3">Intervention Status / Score</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400 italic">
                    No student submissions have been recorded yet for the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-3.5">
                      <strong className="text-slate-900 block">{sub.studentName}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {sub.studentId}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-slate-800 block font-medium">{sub.ticketName}</span>
                      <span className="text-[10px] text-slate-400 block">
                        {sub.grade} • {sub.subject}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-600 font-medium">{sub.remediationSkill}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-900">
                      <div>
                        <span>{sub.percentage}%</span>
                        {sub.isManuallyEdited && (
                          <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 ml-1.5 font-bold">
                            Override
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getLevelColor(
                          getLevelOfUnderstanding(sub.percentage)
                        )}`}
                      >
                        {getLevelOfUnderstanding(sub.percentage)}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs">
                      {sub.percentage >= 75 ? (
                        <span className="text-slate-400 font-medium">—</span>
                      ) : sub.interventionCompleted ? (
                        <div className="flex flex-col">
                          <span className="text-emerald-600 font-bold">✓ Completed</span>
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 w-fit mt-0.5 font-mono">
                            Loop Score: {sub.interventionScore ?? 0}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-amber-600 font-semibold animate-pulse">⚠️ Incomplete</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => onOpenReview(sub)}
                        className="text-indigo-600 hover:text-indigo-800 font-bold text-xs flex items-center space-x-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Review</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
