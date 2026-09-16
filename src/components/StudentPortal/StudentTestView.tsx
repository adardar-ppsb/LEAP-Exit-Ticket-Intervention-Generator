import React from 'react';
import { Check, Send, AlertCircle, Sparkles } from 'lucide-react';
import { ExitTicket, QuestionMC, QuestionEBSR, QuestionMS, Student, StudentAnswers } from '../../types';

interface StudentTestViewProps {
  activeTicket: ExitTicket;
  loggedInStudent: Student;
  studentAnswers: StudentAnswers;
  setStudentAnswers: React.Dispatch<React.SetStateAction<StudentAnswers>>;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

export const StudentTestView: React.FC<StudentTestViewProps> = ({
  activeTicket,
  loggedInStudent,
  studentAnswers,
  setStudentAnswers,
  onSubmit,
  isSubmitting,
}) => {
  const q1 = activeTicket.questions[0] as QuestionMC | undefined;
  const q2 = activeTicket.questions[1] as QuestionEBSR | undefined;
  const q3 = activeTicket.questions[2] as QuestionMS | undefined;

  const handleCheckboxToggle = (option: string) => {
    setStudentAnswers((prev) => {
      const current = prev.q3 || [];
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, q3: next };
    });
  };

  const isFormComplete =
    Boolean(studentAnswers.q1) &&
    Boolean(studentAnswers.q2_partA) &&
    Boolean(studentAnswers.q2_partB) &&
    (studentAnswers.q3?.length || 0) > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 sm:p-8 space-y-8">
      {/* Student Header */}
      <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-100">
            Louisiana LEAP Assessment
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-2">
            {activeTicket.customName || `${activeTicket.subject} Exit Ticket`}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeTicket.grade} • {activeTicket.module}
          </p>
        </div>
        <div className="text-left sm:text-right bg-slate-50 p-3 rounded-xl border border-slate-100">
          <span className="text-xs text-slate-400 block font-medium">Session Student:</span>
          <strong className="text-sm text-slate-800">{loggedInStudent.name}</strong>
          <span className="text-[10px] text-slate-400 font-mono block">ID: {loggedInStudent.id}</span>
        </div>
      </div>

      {/* Target Goal Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-1">
        <strong className="text-slate-900 block font-bold">Assessment Target Objective:</strong>
        <p>{activeTicket.objective || 'Demonstrate mastery of lesson competencies.'}</p>
      </div>

      {/* Questions Stack */}
      <div className="space-y-8">
        {/* Q1: Tier I Basic MC */}
        {q1 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="bg-slate-900 text-white text-xs font-black px-2.5 py-0.5 rounded-lg">Part 1</span>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Foundational Skill Challenge
              </span>
            </div>
            <p className="text-base font-extrabold text-slate-900">{q1.questionText}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
              {q1.options?.map((opt, idx) => {
                const isSelected = studentAnswers.q1 === opt;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setStudentAnswers((prev) => ({ ...prev, q1: opt }))}
                    className={`p-3.5 rounded-xl border text-left text-sm font-semibold transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Q2: Tier II EBSR Two-Part */}
        {q2 && (
          <div className="space-y-6 pt-6 border-t border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="bg-slate-900 text-white text-xs font-black px-2.5 py-0.5 rounded-lg">Part 2</span>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Mastery Focus (Evidence Synthesis)
              </span>
            </div>

            {/* Part A */}
            <div className="space-y-3">
              <p className="text-sm font-black text-slate-900">{q2.partAQuestion}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {q2.partAOptions?.map((opt, idx) => {
                  const isSelected = studentAnswers.q2_partA === opt;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setStudentAnswers((prev) => ({ ...prev, q2_partA: opt }))}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold transition ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Part B */}
            <div className="space-y-3 pt-2">
              <p className="text-sm font-black text-slate-900">{q2.partBQuestion}</p>
              <div className="grid grid-cols-1 gap-2">
                {q2.partBOptions?.map((opt, idx) => {
                  const isSelected = studentAnswers.q2_partB === opt;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setStudentAnswers((prev) => ({ ...prev, q2_partB: opt }))}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold transition ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Q3: Tier III Advanced Multi-Select */}
        {q3 && (
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="bg-slate-900 text-white text-xs font-black px-2.5 py-0.5 rounded-lg">Part 3</span>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Advanced Evaluation (Select all that apply)
              </span>
            </div>
            <p className="text-sm font-black text-slate-900">{q3.questionText}</p>
            <div className="grid grid-cols-1 gap-2 pt-2">
              {q3.claimOptions?.map((opt, idx) => {
                const isSelected = studentAnswers.q3?.includes(opt);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCheckboxToggle(opt)}
                    className={`p-3.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-purple-50 border-purple-400 text-purple-950 font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{opt}</span>
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                        isSelected ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Submission Footer */}
      <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {!isFormComplete && (
          <p className="text-xs text-amber-700 flex items-center space-x-1.5 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Please answer Part 1, Part 2 (both parts), and select at least one option in Part 3.</span>
          </p>
        )}
        <div className="sm:ml-auto">
          <button
            id="btn-student-submit-final"
            onClick={onSubmit}
            disabled={isSubmitting || !isFormComplete}
            className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-white transition flex items-center justify-center space-x-2 ${
              isSubmitting || !isFormComplete
                ? 'bg-indigo-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting Answers...' : 'Submit Final Answers'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
