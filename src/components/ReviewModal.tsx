import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Edit2, User, BookOpen, Sparkles } from 'lucide-react';
import { StudentSubmission } from '../types';
import { getLevelColor, getLevelOfUnderstanding } from '../utils';

interface ReviewModalProps {
  submission: StudentSubmission | null;
  onClose: () => void;
  onSaveOverride: (id: string, percentage: number, interventionScore?: number | null) => Promise<void>;
  setErrorMessage: (msg: string) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  submission,
  onClose,
  onSaveOverride,
  setErrorMessage,
}) => {
  const [overridePercentage, setOverridePercentage] = useState<string>('');
  const [overrideInterventionScore, setOverrideInterventionScore] = useState<string>('');

  useEffect(() => {
    if (submission) {
      setOverridePercentage(submission.percentage !== undefined ? String(submission.percentage) : '');
      setOverrideInterventionScore(
        submission.interventionScore !== undefined && submission.interventionScore !== null
          ? String(submission.interventionScore)
          : ''
      );
    }
  }, [submission]);

  if (!submission) return null;

  const handleSave = async () => {
    const parsedPct = parseInt(overridePercentage, 10);
    const parsedInt = overrideInterventionScore !== '' ? parseInt(overrideInterventionScore, 10) : null;

    if (isNaN(parsedPct) || parsedPct < 0 || parsedPct > 100) {
      setErrorMessage('Please provide a valid score between 0% and 100%.');
      return;
    }

    if (parsedInt !== null && (isNaN(parsedInt) || parsedInt < 0 || parsedInt > 100)) {
      setErrorMessage('Please provide a valid intervention score between 0% and 100%.');
      return;
    }

    await onSaveOverride(submission.id, parsedPct, parsedInt);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-black text-slate-900">Student Response Diagnostic Review</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect student answers, review standards analysis, or override scores.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs border border-slate-100">
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Student</span>
            <strong className="text-sm text-slate-900 block mt-0.5">{submission.studentName}</strong>
            <span className="text-slate-500 font-mono text-[10px]">ID: {submission.studentId}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Accuracy Score</span>
            <strong className="text-sm text-indigo-600 block mt-0.5">
              {submission.percentage}% {submission.isManuallyEdited && '(Adjusted)'}
            </strong>
            <span className="text-slate-500 font-medium text-[10px] block">
              Level: {getLevelOfUnderstanding(submission.percentage)}
            </span>
          </div>
        </div>

        {/* Curriculum Metadata */}
        <div className="border border-slate-100 rounded-xl p-3.5 text-xs space-y-1 bg-slate-50/50">
          <p>
            <strong>Assignment:</strong> {submission.ticketName}
          </p>
          <p>
            <strong>Curriculum Scope:</strong> {submission.subject} • {submission.grade} • {submission.module}
          </p>
          <p>
            <strong>Remediation Target Skill:</strong> {submission.remediationSkill}
          </p>
        </div>

        {/* Score Override Tool */}
        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
            <Edit2 className="w-3.5 h-3.5" />
            <span>Manual Score Override (Teacher Adjustment)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Exit Ticket Score (%)
              </label>
              <input
                id="input-override-pct"
                type="number"
                min="0"
                max="100"
                value={overridePercentage}
                onChange={(e) => setOverridePercentage(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-amber-500 bg-white"
                placeholder="e.g. 85"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Intervention Loop Score (%)
              </label>
              <input
                id="input-override-int"
                type="number"
                min="0"
                max="100"
                value={overrideInterventionScore}
                onChange={(e) => setOverrideInterventionScore(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-amber-500 bg-white"
                placeholder="e.g. 100 (Optional)"
              />
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <button
              id="btn-save-score-override"
              onClick={handleSave}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-xs"
            >
              Save Override Changes
            </button>
          </div>
        </div>

        {/* Answers Breakdown */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h4 className="text-sm font-black text-slate-900">Assessment Answers Breakdown</h4>

          {/* Part 1 */}
          <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 border border-slate-100">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">Part 1 Response</span>
            <p className="text-slate-800">
              Selected: <strong>{submission.answers?.q1 || 'Not Answered'}</strong>
            </p>
            <p
              className={`font-semibold flex items-center space-x-1 ${
                submission.feedback?.q1Correct ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {submission.feedback?.q1Correct ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Correct Answer Credit (30 Pts)</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Incorrect choice</span>
                </>
              )}
            </p>
          </div>

          {/* Part 2 */}
          <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-2 border border-slate-100">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">
              Part 2 Response (EBSR)
            </span>
            <div>
              <p className="text-slate-800">
                Part A Claim: <strong>{submission.answers?.q2_partA || 'Not Answered'}</strong>
              </p>
              <p
                className={`font-semibold flex items-center space-x-1 ${
                  submission.feedback?.q2PartACorrect ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {submission.feedback?.q2PartACorrect ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Correct Part A</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Incorrect Part A</span>
                  </>
                )}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200/60">
              <p className="text-slate-800">
                Part B Evidence: <strong>{submission.answers?.q2_partB || 'Not Answered'}</strong>
              </p>
              <p
                className={`font-semibold flex items-center space-x-1 ${
                  submission.feedback?.q2PartBCorrect ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {submission.feedback?.q2PartBCorrect ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Correct Part B Evidence</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Incorrect Part B</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Part 3 */}
          <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 border border-slate-100">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">
              Part 3 Response (Multi-Select)
            </span>
            <p className="text-slate-800">
              Selections: <strong>{submission.answers?.q3?.join(', ') || 'None Checked'}</strong>
            </p>
            <p
              className={`font-semibold flex items-center space-x-1 ${
                submission.feedback?.q3Correct ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {submission.feedback?.q3Correct ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Correct Multi-Select Credit (30 Pts)</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Missing or invalid selections</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Student Intervention Outcomes */}
        {submission.remediationRequired && (
          <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 text-xs space-y-3">
            <div className="flex justify-between items-center border-b border-amber-100 pb-2">
              <h4 className="text-xs font-bold text-amber-900 uppercase">
                Scaffolded Standard Intervention Outcomes
              </h4>
              {submission.interventionCompleted && (
                <span className="bg-indigo-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full font-mono">
                  Score: {submission.interventionScore ?? 0}%
                </span>
              )}
            </div>
            {submission.interventionCompleted ? (
              <div className="space-y-2.5">
                <div>
                  <span className="font-semibold text-slate-500 block uppercase text-[9px]">
                    Step 1 Concept Answer:
                  </span>
                  <p className="text-slate-900 font-medium">
                    &quot;{submission.interventionAnswers?.q1Answer || 'No Selection'}&quot;
                  </p>
                </div>
                <div className="pt-1.5 border-t border-amber-100">
                  <span className="font-semibold text-slate-500 block uppercase text-[9px]">
                    Step 2 Strategy Answer:
                  </span>
                  <p className="text-slate-900 font-medium">
                    &quot;{submission.interventionAnswers?.q2Answer || 'No Selection'}&quot;
                  </p>
                </div>
                <div className="pt-1.5 border-t border-amber-100">
                  <span className="font-semibold text-slate-500 block uppercase text-[9px]">
                    Step 3 Reflection:
                  </span>
                  <p className="text-slate-800 italic mt-0.5">
                    &quot;{submission.interventionAnswers?.q3Answer || 'Not answered'}&quot;
                  </p>
                  {submission.aiInterventionEvaluation?.feedback && (
                    <div className="mt-1.5 p-2 bg-white border border-amber-100 rounded-lg text-[11px] text-amber-900">
                      <strong>AI Rubric Comment:</strong> {submission.aiInterventionEvaluation.feedback}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-amber-800 italic">This student has not yet completed their assigned support drill.</p>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-900 text-white font-bold py-2 px-6 rounded-xl hover:bg-slate-800 text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
