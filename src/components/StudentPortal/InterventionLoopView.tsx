import React from 'react';
import { CheckCircle2, AlertTriangle, Sparkles, Send, Award, RotateCcw } from 'lucide-react';
import { TicketFeedback, InterventionAnswers, InterventionEvaluation, InterventionConfig } from '../../types';

interface InterventionLoopViewProps {
  feedback: TicketFeedback;
  intervention: {
    studentName: string;
    interventionQuestions: InterventionConfig;
  };
  interventionAnswers: InterventionAnswers;
  setInterventionAnswers: React.Dispatch<React.SetStateAction<InterventionAnswers>>;
  onSubmitIntervention: () => Promise<void>;
  isGradingIntervention: boolean;
  interventionSubmitted: boolean;
  aiInterventionFeedback: InterventionEvaluation | null;
  onConcludeSession: () => void;
}

export const InterventionLoopView: React.FC<InterventionLoopViewProps> = ({
  feedback,
  intervention,
  interventionAnswers,
  setInterventionAnswers,
  onSubmitIntervention,
  isGradingIntervention,
  interventionSubmitted,
  aiInterventionFeedback,
  onConcludeSession,
}) => {
  const intQ = intervention.interventionQuestions;

  return (
    <div className="space-y-6">
      {/* Primary Score & Submission Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-xs">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 border border-indigo-100">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h3 className="text-2xl font-black text-slate-900">Exit Ticket Submitted!</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Your responses have been recorded and sent to your educator.
          </p>
        </div>

        {feedback.remediationRequired ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 max-w-lg mx-auto text-amber-900 text-xs font-semibold leading-relaxed space-y-1 text-left">
            <div className="flex items-center space-x-2 text-amber-800 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Targeted Standard Review Initiated (Score: {feedback.percentage}%)</span>
            </div>
            <p className="text-amber-800 font-normal">
              To reinforce this standard, please complete the quick 3-step support drill below.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-4 max-w-md mx-auto text-xs font-semibold space-y-1">
              <div className="flex items-center justify-center space-x-1.5 text-emerald-800 font-bold">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Outstanding Achievement!</span>
              </div>
              <p className="text-emerald-700 font-normal">
                You met the Louisiana LEAP accuracy target ({feedback.percentage}%) for this lesson standard.
              </p>
            </div>
            <button
              id="btn-student-return-hub"
              onClick={onConcludeSession}
              className="bg-slate-900 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-slate-800 text-sm transition"
            >
              Return to Hub
            </button>
          </div>
        )}
      </div>

      {/* Structured Active Intervention Loop Card */}
      {feedback.remediationRequired && (
        <div className="bg-white border border-amber-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-amber-100 pb-4">
            <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
              On-Level Skill Support Loop
            </span>
            <h4 className="text-lg font-black text-slate-900 mt-2">
              Active Intervention: {intQ?.skillFocus || 'Focus Standard Practice'}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Let&apos;s review the foundational concept and strategy step-by-step.
            </p>
          </div>

          {!interventionSubmitted ? (
            <div className="space-y-6">
              {/* Step 1 MCQ */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-amber-800 uppercase tracking-wide">
                  Step 1: Standard Concept Check (Multiple Choice)
                </label>
                <p className="text-sm font-bold text-slate-900">{intQ?.q1Text}</p>
                <div className="grid grid-cols-1 gap-2 pl-1">
                  {intQ?.q1Options?.map((opt, idx) => {
                    const isSelected = interventionAnswers.q1Answer === opt;
                    return (
                      <button
                        key={idx}
                        disabled={isGradingIntervention}
                        onClick={() => setInterventionAnswers((prev) => ({ ...prev, q1Answer: opt }))}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-xs font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2 MCQ */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-amber-800 uppercase tracking-wide">
                  Step 2: Strategy / Misconception Check (Multiple Choice)
                </label>
                <p className="text-sm font-bold text-slate-900">{intQ?.q2Text}</p>
                <div className="grid grid-cols-1 gap-2 pl-1">
                  {intQ?.q2Options?.map((opt, idx) => {
                    const isSelected = interventionAnswers.q2Answer === opt;
                    return (
                      <button
                        key={idx}
                        disabled={isGradingIntervention}
                        onClick={() => setInterventionAnswers((prev) => ({ ...prev, q2Answer: opt }))}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-xs font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3 Short Reflection */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-amber-800 uppercase tracking-wide">
                  Step 3: Synthesis Written Application
                </label>
                <p className="text-sm font-bold text-slate-900">{intQ?.q3Text}</p>
                <textarea
                  id="textarea-intervention-step3"
                  value={interventionAnswers.q3Answer}
                  disabled={isGradingIntervention}
                  onChange={(e) => setInterventionAnswers((prev) => ({ ...prev, q3Answer: e.target.value }))}
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-slate-50 focus:bg-white transition"
                  placeholder="Write your brief thought or rule of thumb here in complete sentences..."
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  id="btn-submit-intervention-loop"
                  onClick={onSubmitIntervention}
                  disabled={
                    isGradingIntervention ||
                    !interventionAnswers.q1Answer ||
                    !interventionAnswers.q2Answer ||
                    !interventionAnswers.q3Answer.trim()
                  }
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-white transition flex items-center justify-center space-x-2 ${
                    isGradingIntervention ||
                    !interventionAnswers.q1Answer ||
                    !interventionAnswers.q2Answer ||
                    !interventionAnswers.q3Answer.trim()
                      ? 'bg-amber-300 cursor-not-allowed'
                      : 'bg-amber-600 hover:bg-amber-700 shadow-sm'
                  }`}
                >
                  {isGradingIntervention ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Evaluating reflection with AI...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Intervention Loop</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div
                className={`rounded-2xl p-5 border text-xs text-left space-y-3 ${
                  aiInterventionFeedback?.isCorrect
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-center justify-between border-b pb-2 border-slate-200/60">
                  <strong className="text-sm font-black uppercase tracking-wide flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {aiInterventionFeedback?.isCorrect ? 'Standard Criteria Met' : 'Standard Reflection Feedback'}
                    </span>
                  </strong>
                  <span className="bg-slate-900 text-white px-2.5 py-0.5 rounded-md font-black font-mono">
                    Step 3: {aiInterventionFeedback?.pointsAwarded ?? 0}/20 Pts
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    AI Diagnostic Evaluation:
                  </span>
                  <p className="italic text-xs font-medium">
                    &quot;{aiInterventionFeedback?.feedback || 'Standard reflection response evaluated.'}&quot;
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex justify-between text-[11px] font-semibold text-slate-600">
                  <span>
                    Step 1 Concept:{' '}
                    {interventionAnswers.q1Answer === intQ?.q1Correct ? 'Correct (40 pts)' : 'Incorrect (0 pts)'}
                  </span>
                  <span>
                    Step 2 Strategy:{' '}
                    {interventionAnswers.q2Answer === intQ?.q2Correct ? 'Correct (40 pts)' : 'Incorrect (0 pts)'}
                  </span>
                </div>
              </div>

              <button
                id="btn-student-conclude"
                onClick={onConcludeSession}
                className="bg-slate-900 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-slate-800 text-sm transition w-full sm:w-auto"
              >
                Conclude Session
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
