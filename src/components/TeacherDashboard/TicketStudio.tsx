import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Edit3,
  Rocket,
  Check,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { ExitTicket, QuestionMC, QuestionEBSR, QuestionMS } from '../../types';
import { CURRICULUM_MAP } from '../../data/curriculum';
import { getSubjectClasses, normalizeTicket } from '../../utils';

interface TicketStudioProps {
  subject: string;
  setSubject: (s: string) => void;
  grade: string;
  setGrade: (g: string) => void;
  module: string;
  setModule: (m: string) => void;
  lesson: string;
  setLesson: (l: string) => void;
  customObjective: string;
  setCustomObjective: (o: string) => void;
  stagedTicket: ExitTicket | null;
  setStagedTicket: React.Dispatch<React.SetStateAction<ExitTicket | null>>;
  customTicketName: string;
  setCustomTicketName: (n: string) => void;
  onPublishTicket: () => Promise<void>;
  publishSuccess: boolean;
  setErrorMessage: (msg: string) => void;
  setSuccessMsg: (msg: string) => void;
}

export const TicketStudio: React.FC<TicketStudioProps> = ({
  subject,
  setSubject,
  grade,
  setGrade,
  module,
  setModule,
  lesson,
  setLesson,
  customObjective,
  setCustomObjective,
  stagedTicket,
  setStagedTicket,
  customTicketName,
  setCustomTicketName,
  onPublishTicket,
  publishSuccess,
  setErrorMessage,
  setSuccessMsg,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingIdx, setRegeneratingIdx] = useState<number | null>(null);

  // Question editing state
  const [editingIndex, setEditingIndex] = useState<number | string | null>(null);
  const [editState, setEditState] = useState<any>(null);

  const availableModules = Object.keys(CURRICULUM_MAP[subject]?.grades[grade] || {});
  const availableLessons = CURRICULUM_MAP[subject]?.grades[grade]?.[module]?.lessons || [];

  const handleGenerateTicket = async () => {
    setIsGenerating(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/generate-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          grade,
          module,
          lesson,
          customObjective,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${res.status}`);
      }

      const rawData = await res.json();
      const validated = normalizeTicket(rawData);
      setStagedTicket(validated);
      setSuccessMsg('Successfully generated 3-tier assessment using Gemini 3.8 Flash!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMessage(`Ticket generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateQuestion = async (idx: number) => {
    if (!stagedTicket) return;
    setRegeneratingIdx(idx);
    try {
      const res = await fetch('/api/regenerate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idx,
          ticket: {
            subject: stagedTicket.subject,
            grade: stagedTicket.grade,
            module: stagedTicket.module,
            lesson: stagedTicket.lesson,
            objective: stagedTicket.objective,
          },
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${res.status}`);
      }

      const parsedQ = await res.json();
      setStagedTicket((prev) => {
        if (!prev) return null;
        const nextQs = [...prev.questions];
        nextQs[idx] = parsedQ;
        return { ...prev, questions: nextQs };
      });
      setSuccessMsg(`Tier ${idx === 0 ? 'I' : idx === 1 ? 'II' : 'III'} question regenerated successfully.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMessage(`Could not regenerate question: ${err.message}`);
    } finally {
      setRegeneratingIdx(null);
    }
  };

  const handleOpenEditor = (tierIdx: number | string) => {
    if (!stagedTicket) return;
    setEditingIndex(tierIdx);

    if (tierIdx === 0) {
      const q = stagedTicket.questions[0] as QuestionMC;
      setEditState({
        questionText: q.questionText || '',
        options: q.options ? [...q.options] : ['', '', '', ''],
        correctAnswer: q.correctAnswer || '',
      });
    } else if (tierIdx === 1) {
      const q = stagedTicket.questions[1] as QuestionEBSR;
      setEditState({
        partAQuestion: q.partAQuestion || '',
        partAOptions: q.partAOptions ? [...q.partAOptions] : ['', '', '', ''],
        partACorrect: q.partACorrect || '',
        partBQuestion: q.partBQuestion || '',
        partBOptions: q.partBOptions ? [...q.partBOptions] : ['', '', '', ''],
        partBCorrect: q.partBCorrect || '',
      });
    } else if (tierIdx === 2) {
      const q = stagedTicket.questions[2] as QuestionMS;
      setEditState({
        questionText: q.questionText || '',
        claimOptions: q.claimOptions ? [...q.claimOptions] : ['', '', '', ''],
        correctClaims: q.correctClaims ? [...q.correctClaims] : [],
      });
    } else if (tierIdx === 'int1') {
      const int = stagedTicket.intervention;
      setEditState({
        q1Text: int.q1Text || '',
        q1Options: int.q1Options ? [...int.q1Options] : ['', '', '', ''],
        q1Correct: int.q1Correct || '',
      });
    } else if (tierIdx === 'int2') {
      const int = stagedTicket.intervention;
      setEditState({
        q2Text: int.q2Text || '',
        q2Options: int.q2Options ? [...int.q2Options] : ['', '', '', ''],
        q2Correct: int.q2Correct || '',
      });
    } else if (tierIdx === 'int3') {
      const int = stagedTicket.intervention;
      setEditState({
        q3Text: int.q3Text || '',
      });
    }
  };

  const handleSaveEditor = () => {
    if (!stagedTicket || editingIndex === null || !editState) return;

    setStagedTicket((prev) => {
      if (!prev) return null;
      const nextTicket = { ...prev };
      const nextQs = [...nextTicket.questions];

      if (editingIndex === 0) {
        nextQs[0] = {
          tier: 'Basic (Tier I)',
          type: 'MC',
          questionText: editState.questionText,
          options: editState.options,
          correctAnswer: editState.correctAnswer,
        };
      } else if (editingIndex === 1) {
        nextQs[1] = {
          tier: 'Mastery (Tier II)',
          type: 'EBSR',
          partAQuestion: editState.partAQuestion,
          partAOptions: editState.partAOptions,
          partACorrect: editState.partACorrect,
          partBQuestion: editState.partBQuestion,
          partBOptions: editState.partBOptions,
          partBCorrect: editState.partBCorrect,
        };
      } else if (editingIndex === 2) {
        nextQs[2] = {
          tier: 'Advanced (Tier III)',
          type: 'MS_ADV',
          questionText: editState.questionText,
          claimOptions: editState.claimOptions,
          correctClaims: editState.correctClaims,
        };
      } else if (editingIndex === 'int1') {
        nextTicket.intervention = {
          ...nextTicket.intervention,
          q1Text: editState.q1Text,
          q1Options: editState.q1Options,
          q1Correct: editState.q1Correct,
        };
      } else if (editingIndex === 'int2') {
        nextTicket.intervention = {
          ...nextTicket.intervention,
          q2Text: editState.q2Text,
          q2Options: editState.q2Options,
          q2Correct: editState.q2Correct,
        };
      } else if (editingIndex === 'int3') {
        nextTicket.intervention = {
          ...nextTicket.intervention,
          q3Text: editState.q3Text,
        };
      }

      nextTicket.questions = nextQs;
      return nextTicket;
    });

    setEditingIndex(null);
    setEditState(null);
    setSuccessMsg('Question edits applied successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleUpdateOption = (field: string, index: number, value: string, correctField?: string) => {
    setEditState((prev: any) => {
      const nextOptions = [...prev[field]];
      const oldVal = nextOptions[index];
      nextOptions[index] = value;

      let nextCorrect = correctField ? prev[correctField] : undefined;
      if (correctField && prev[correctField] === oldVal) {
        nextCorrect = value;
      }

      return {
        ...prev,
        [field]: nextOptions,
        ...(correctField ? { [correctField]: nextCorrect } : {}),
      };
    });
  };

  const handleToggleMSClaim = (claim: string) => {
    setEditState((prev: any) => {
      const current: string[] = prev.correctClaims || [];
      const next = current.includes(claim)
        ? current.filter((c) => c !== claim)
        : [...current, claim];
      return {
        ...prev,
        correctClaims: next,
      };
    });
  };

  const q1 = stagedTicket?.questions[0] as QuestionMC | undefined;
  const q2 = stagedTicket?.questions[1] as QuestionEBSR | undefined;
  const q3 = stagedTicket?.questions[2] as QuestionMS | undefined;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Curriculum Filter Panel */}
      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs h-fit">
        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center space-x-2">
          <span>Curriculum Framework</span>
        </h3>
        <div className="space-y-4">
          {/* Subject Area */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Subject Area
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['ELA', 'Math', 'Science'] as const).map((s) => (
                <button
                  key={s}
                  id={`btn-subject-${s.toLowerCase()}`}
                  onClick={() => {
                    setSubject(s);
                    const nextGrades = Object.keys(CURRICULUM_MAP[s].grades);
                    setGrade(nextGrades[0]);
                  }}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                    subject === s
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {s === 'ELA' ? '📚 ELA' : s === 'Math' ? '📐 Math' : '🔬 Science'}
                </button>
              ))}
            </div>
          </div>

          {/* Grade Level */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Grade Level
            </label>
            <select
              id="select-grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500"
            >
              {Object.keys(CURRICULUM_MAP[subject]?.grades || {}).map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Curriculum Module */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Curriculum Module
            </label>
            <select
              id="select-module"
              value={module}
              onChange={(e) => setModule(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500"
            >
              {availableModules.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Lesson Scope */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Target Lesson Scope
            </label>
            <select
              id="select-lesson"
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500"
            >
              {availableLessons.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Objective Prompt */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Custom Skill Objective Focus
            </label>
            <textarea
              id="textarea-custom-objective"
              value={customObjective}
              onChange={(e) => setCustomObjective(e.target.value)}
              placeholder="Identify specific key focus standards or custom learning standards..."
              rows={3}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition"
            />
          </div>

          {/* Generate Button */}
          <button
            id="btn-generate-ticket"
            onClick={handleGenerateTicket}
            disabled={isGenerating}
            className={`w-full py-3 px-4 rounded-xl font-bold text-white transition flex items-center justify-center space-x-2 ${
              isGenerating
                ? 'bg-indigo-400 cursor-not-allowed animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Assembling Questions with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate 3-Tier Ticket</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Staged Ticket Preview & Live Workspace */}
      <div className="lg:col-span-8 space-y-6">
        {stagedTicket ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            {/* Header Card */}
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1 w-full sm:w-auto">
                <div className="flex flex-wrap gap-2">
                  <span className="bg-slate-100 text-slate-800 border border-slate-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Staged Workspace
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getSubjectClasses(
                      stagedTicket.subject
                    )}`}
                  >
                    {stagedTicket.subject} - {stagedTicket.grade}
                  </span>
                </div>

                <div className="pt-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">
                    Interactive Display Name
                  </label>
                  <input
                    id="input-ticket-display-name"
                    type="text"
                    value={customTicketName}
                    onChange={(e) => setCustomTicketName(e.target.value)}
                    className="text-lg font-black text-slate-900 border-b border-slate-200 hover:border-slate-400 focus:border-indigo-600 focus:outline-none w-full bg-transparent py-0.5"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  id="btn-reset-staged"
                  onClick={() => setStagedTicket(null)}
                  className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-slate-200 transition flex items-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Assessment Focus Objective */}
            <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-4">
              <h4 className="text-xs font-bold text-indigo-900 uppercase">Assessment Focus Objective</h4>
              <p className="text-sm text-indigo-950 mt-1">
                {stagedTicket.objective || 'Focus on foundational standard achievements.'}
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <span className="bg-indigo-200 text-indigo-900 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                  LDOE Standards Focus: {stagedTicket.remediationSkill || 'Evidence Synthesis'}
                </span>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {/* Q1: TIER I BASIC MC */}
              {q1 && (
                <div className="border border-slate-200 rounded-xl p-5 space-y-4 hover:border-slate-300 transition">
                  <div className="flex justify-between items-center">
                    <span className="bg-indigo-50 text-indigo-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-indigo-100">
                      Tier I - Foundational (MC)
                    </span>
                    <div className="flex space-x-1.5">
                      <button
                        id="btn-edit-q1"
                        onClick={() => handleOpenEditor(0)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-bold px-2 py-1 rounded-md border border-indigo-100 hover:bg-indigo-50 flex items-center space-x-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{editingIndex === 0 ? 'Editing...' : 'Edit'}</span>
                      </button>
                      <button
                        id="btn-regen-q1"
                        onClick={() => handleRegenerateQuestion(0)}
                        disabled={regeneratingIdx === 0}
                        className="text-xs text-slate-500 hover:text-indigo-600 px-2 py-1 rounded-md border border-slate-200 hover:border-indigo-100 flex items-center space-x-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${regeneratingIdx === 0 ? 'animate-spin' : ''}`} />
                        <span>Regen</span>
                      </button>
                    </div>
                  </div>

                  {editingIndex === 0 && editState ? (
                    <div className="bg-slate-50 p-4 rounded-xl border border-indigo-200 space-y-4 text-xs">
                      <div>
                        <label className="block font-bold text-slate-500 mb-1 uppercase tracking-wider text-[10px]">
                          Question Text
                        </label>
                        <textarea
                          value={editState.questionText}
                          onChange={(e) => setEditState({ ...editState, questionText: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg p-2 font-medium bg-white"
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                          Edit Choices &amp; Select Correct Target
                        </label>
                        {editState.options.map((opt: string, oIdx: number) => (
                          <div key={oIdx} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="tier1CorrectRadio"
                              checked={opt === editState.correctAnswer && opt !== ''}
                              onChange={() => setEditState({ ...editState, correctAnswer: opt })}
                              className="text-indigo-600 focus:ring-indigo-500"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleUpdateOption('options', oIdx, e.target.value, 'correctAnswer')}
                              className="flex-1 border border-slate-200 rounded px-2.5 py-1.5 text-xs bg-white font-medium"
                              placeholder={`Option ${oIdx + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex space-x-2 pt-2 border-t border-slate-200">
                        <button
                          onClick={handleSaveEditor}
                          className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold"
                        >
                          Apply Changes
                        </button>
                        <button
                          onClick={() => {
                            setEditingIndex(null);
                            setEditState(null);
                          }}
                          className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-semibold border border-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-slate-900">{q1.questionText}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                        {q1.options?.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`text-xs p-2.5 rounded-xl border flex items-center justify-between ${
                              opt === q1.correctAnswer
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span>{opt}</span>
                            {opt === q1.correctAnswer && (
                              <span className="text-emerald-600 font-bold flex items-center space-x-1">
                                <Check className="w-3.5 h-3.5" />
                                <span>Target</span>
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Q2: TIER II MASTERY EBSR */}
              {q2 && (
                <div className="border border-slate-200 rounded-xl p-5 space-y-4 hover:border-slate-300 transition">
                  <div className="flex justify-between items-center">
                    <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-100">
                      Tier II - Mastery (EBSR Two-Part)
                    </span>
                    <div className="flex space-x-1.5">
                      <button
                        id="btn-edit-q2"
                        onClick={() => handleOpenEditor(1)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-bold px-2 py-1 rounded-md border border-indigo-100 hover:bg-indigo-50 flex items-center space-x-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{editingIndex === 1 ? 'Editing...' : 'Edit'}</span>
                      </button>
                      <button
                        id="btn-regen-q2"
                        onClick={() => handleRegenerateQuestion(1)}
                        disabled={regeneratingIdx === 1}
                        className="text-xs text-slate-500 hover:text-indigo-600 px-2 py-1 rounded-md border border-slate-200 hover:border-indigo-100 flex items-center space-x-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${regeneratingIdx === 1 ? 'animate-spin' : ''}`} />
                        <span>Regen</span>
                      </button>
                    </div>
                  </div>

                  {editingIndex === 1 && editState ? (
                    <div className="space-y-4 border border-indigo-200 rounded-xl p-4 bg-slate-50 text-xs">
                      {/* Part A Form */}
                      <div className="space-y-2">
                        <label className="block font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                          Part A Question
                        </label>
                        <textarea
                          value={editState.partAQuestion}
                          onChange={(e) => setEditState({ ...editState, partAQuestion: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg p-2 font-medium bg-white"
                          rows={2}
                        />
                        <div className="space-y-1.5 pl-2">
                          {editState.partAOptions.map((opt: string, oIdx: number) => (
                            <div key={oIdx} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="partACorrectRadio"
                                checked={opt === editState.partACorrect && opt !== ''}
                                onChange={() => setEditState({ ...editState, partACorrect: opt })}
                              />
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) =>
                                  handleUpdateOption('partAOptions', oIdx, e.target.value, 'partACorrect')
                                }
                                className="flex-1 border rounded px-2.5 py-1 text-xs bg-white font-medium"
                                placeholder={`Part A Option ${oIdx + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Part B Form */}
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <label className="block font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                          Part B Evidence Question
                        </label>
                        <textarea
                          value={editState.partBQuestion}
                          onChange={(e) => setEditState({ ...editState, partBQuestion: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg p-2 font-medium bg-white"
                          rows={2}
                        />
                        <div className="space-y-1.5 pl-2">
                          {editState.partBOptions.map((opt: string, oIdx: number) => (
                            <div key={oIdx} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="partBCorrectRadio"
                                checked={opt === editState.partBCorrect && opt !== ''}
                                onChange={() => setEditState({ ...editState, partBCorrect: opt })}
                              />
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) =>
                                  handleUpdateOption('partBOptions', oIdx, e.target.value, 'partBCorrect')
                                }
                                className="flex-1 border rounded px-2.5 py-1 text-xs bg-white font-medium"
                                placeholder={`Part B Option ${oIdx + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-2 border-t border-slate-200">
                        <button
                          onClick={handleSaveEditor}
                          className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold"
                        >
                          Apply EBSR Edits
                        </button>
                        <button
                          onClick={() => {
                            setEditingIndex(null);
                            setEditState(null);
                          }}
                          className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-semibold border border-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Part A Section */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                          Part A Concept Claim
                        </span>
                        <p className="text-sm font-bold text-slate-900 mt-1">{q2.partAQuestion}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-3">
                          {q2.partAOptions?.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`text-xs p-2.5 rounded-lg border ${
                                opt === q2.partACorrect
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                                  : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Part B Section */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                          Part B Evidentiary Proof
                        </span>
                        <p className="text-sm font-bold text-slate-900 mt-1">{q2.partBQuestion}</p>
                        <div className="grid grid-cols-1 gap-2 pt-3">
                          {q2.partBOptions?.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`text-xs p-2.5 rounded-lg border ${
                                opt === q2.partBCorrect
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                                  : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Q3: TIER III ADVANCED MS_ADV */}
              {q3 && (
                <div className="border border-slate-200 rounded-xl p-5 space-y-4 hover:border-slate-300 transition">
                  <div className="flex justify-between items-center">
                    <span className="bg-purple-50 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-purple-100">
                      Tier III - Deep Transfer Mastery (Multi-Select)
                    </span>
                    <div className="flex space-x-1.5">
                      <button
                        id="btn-edit-q3"
                        onClick={() => handleOpenEditor(2)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-bold px-2 py-1 rounded-md border border-indigo-100 hover:bg-indigo-50 flex items-center space-x-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{editingIndex === 2 ? 'Editing...' : 'Edit'}</span>
                      </button>
                      <button
                        id="btn-regen-q3"
                        onClick={() => handleRegenerateQuestion(2)}
                        disabled={regeneratingIdx === 2}
                        className="text-xs text-slate-500 hover:text-indigo-600 px-2 py-1 rounded-md border border-slate-200 hover:border-indigo-100 flex items-center space-x-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${regeneratingIdx === 2 ? 'animate-spin' : ''}`} />
                        <span>Regen</span>
                      </button>
                    </div>
                  </div>

                  {editingIndex === 2 && editState ? (
                    <div className="bg-slate-50 p-4 rounded-xl border border-purple-200 space-y-4 text-xs">
                      <div>
                        <label className="block font-bold text-slate-500 mb-1 uppercase tracking-wider text-[10px]">
                          Multi-Select Question Text
                        </label>
                        <textarea
                          value={editState.questionText}
                          onChange={(e) => setEditState({ ...editState, questionText: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg p-2 font-medium bg-white"
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                          Edit Options &amp; Mark Correct Targets (Check all that apply)
                        </label>
                        {editState.claimOptions.map((opt: string, oIdx: number) => (
                          <div key={oIdx} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={editState.correctClaims?.includes(opt) && opt !== ''}
                              onChange={() => handleToggleMSClaim(opt)}
                              className="text-purple-600 focus:ring-purple-500 rounded"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleUpdateOption('claimOptions', oIdx, e.target.value)}
                              className="flex-1 border rounded px-2.5 py-1 text-xs bg-white font-medium"
                              placeholder={`Option ${oIdx + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex space-x-2 pt-2 border-t border-slate-200">
                        <button
                          onClick={handleSaveEditor}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-bold"
                        >
                          Apply Multi-Select Edits
                        </button>
                        <button
                          onClick={() => {
                            setEditingIndex(null);
                            setEditState(null);
                          }}
                          className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-semibold border border-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-slate-900">{q3.questionText}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                        {q3.claimOptions?.map((opt, oIdx) => {
                          const isTarget = q3.correctClaims?.includes(opt);
                          return (
                            <div
                              key={oIdx}
                              className={`text-xs p-2.5 rounded-xl border flex items-center justify-between ${
                                isTarget
                                  ? 'bg-purple-50 border-purple-200 text-purple-900 font-semibold'
                                  : 'bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              <span>{opt}</span>
                              {isTarget && (
                                <span className="text-purple-600 font-bold flex items-center space-x-1">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Selection</span>
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Mixed Format Standard Intervention Loop Preview */}
              <div className="border border-amber-200 bg-amber-50/70 rounded-xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-amber-900 flex items-center space-x-2">
                  <span>🛡️ Mixed-Format Standard Intervention Loop</span>
                </h4>
                <p className="text-xs text-amber-800">
                  Auto-assigned to students scoring below 75% to evaluate strategy and rules on the target skill focus:{' '}
                  <strong className="text-amber-950 font-bold">
                    {stagedTicket.intervention?.skillFocus || stagedTicket.remediationSkill}
                  </strong>
                  .
                </p>

                <div className="space-y-4 mt-3 pt-3 border-t border-amber-200/50 text-xs text-slate-800">
                  {/* Step 1 */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black uppercase text-amber-700 block">
                        Step 1: Foundational Standard Concept Check (MC)
                      </span>
                      <button
                        onClick={() => handleOpenEditor('int1')}
                        className="text-[10px] text-amber-800 font-bold hover:underline flex items-center space-x-0.5"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{editingIndex === 'int1' ? 'Editing...' : 'Edit Step 1'}</span>
                      </button>
                    </div>

                    {editingIndex === 'int1' && editState ? (
                      <div className="bg-white p-3.5 rounded-xl border border-amber-300 space-y-3">
                        <textarea
                          value={editState.q1Text}
                          onChange={(e) => setEditState({ ...editState, q1Text: e.target.value })}
                          className="w-full border rounded-lg p-2 text-xs bg-slate-50"
                          rows={2}
                        />
                        <div className="space-y-1.5 pl-2">
                          {editState.q1Options.map((opt: string, oIdx: number) => (
                            <div key={oIdx} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="int1RadioCorrect"
                                checked={opt === editState.q1Correct && opt !== ''}
                                onChange={() => setEditState({ ...editState, q1Correct: opt })}
                              />
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => handleUpdateOption('q1Options', oIdx, e.target.value, 'q1Correct')}
                                className="flex-1 border rounded px-2.5 py-1 text-xs bg-white font-medium"
                                placeholder={`Option ${oIdx + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex space-x-2 pt-1 border-t border-slate-200">
                          <button
                            onClick={handleSaveEditor}
                            className="bg-amber-600 text-white px-3 py-1 rounded-md font-bold text-[11px]"
                          >
                            Apply
                          </button>
                          <button
                            onClick={() => {
                              setEditingIndex(null);
                              setEditState(null);
                            }}
                            className="text-slate-500 font-semibold px-2 py-1 text-[11px]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="font-semibold text-slate-900">{stagedTicket.intervention?.q1Text}</p>
                        <div className="grid grid-cols-1 gap-1.5 mt-1.5 pl-2">
                          {stagedTicket.intervention?.q1Options?.map((opt, idx) => (
                            <div
                              key={idx}
                              className={`p-2 rounded-lg border border-amber-200/60 text-xs ${
                                opt === stagedTicket.intervention?.q1Correct
                                  ? 'bg-emerald-100/70 font-semibold text-emerald-950'
                                  : 'bg-white'
                              }`}
                            >
                              {opt} {opt === stagedTicket.intervention?.q1Correct && '✓ (Key)'}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Step 2 */}
                  <div className="pt-2 border-t border-amber-200/40">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black uppercase text-amber-700 block">
                        Step 2: Strategy &amp; Error Analysis Check (MC)
                      </span>
                      <button
                        onClick={() => handleOpenEditor('int2')}
                        className="text-[10px] text-amber-800 font-bold hover:underline flex items-center space-x-0.5"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{editingIndex === 'int2' ? 'Editing...' : 'Edit Step 2'}</span>
                      </button>
                    </div>

                    {editingIndex === 'int2' && editState ? (
                      <div className="bg-white p-3.5 rounded-xl border border-amber-300 space-y-3">
                        <textarea
                          value={editState.q2Text}
                          onChange={(e) => setEditState({ ...editState, q2Text: e.target.value })}
                          className="w-full border rounded-lg p-2 text-xs bg-slate-50"
                          rows={2}
                        />
                        <div className="space-y-1.5 pl-2">
                          {editState.q2Options.map((opt: string, oIdx: number) => (
                            <div key={oIdx} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="int2RadioCorrect"
                                checked={opt === editState.q2Correct && opt !== ''}
                                onChange={() => setEditState({ ...editState, q2Correct: opt })}
                              />
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => handleUpdateOption('q2Options', oIdx, e.target.value, 'q2Correct')}
                                className="flex-1 border rounded px-2.5 py-1 text-xs bg-white font-medium"
                                placeholder={`Option ${oIdx + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex space-x-2 pt-1 border-t border-slate-200">
                          <button
                            onClick={handleSaveEditor}
                            className="bg-amber-600 text-white px-3 py-1 rounded-md font-bold text-[11px]"
                          >
                            Apply
                          </button>
                          <button
                            onClick={() => {
                              setEditingIndex(null);
                              setEditState(null);
                            }}
                            className="text-slate-500 font-semibold px-2 py-1 text-[11px]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="font-semibold text-slate-900">{stagedTicket.intervention?.q2Text}</p>
                        <div className="grid grid-cols-1 gap-1.5 mt-1.5 pl-2">
                          {stagedTicket.intervention?.q2Options?.map((opt, idx) => (
                            <div
                              key={idx}
                              className={`p-2 rounded-lg border border-amber-200/60 text-xs ${
                                opt === stagedTicket.intervention?.q2Correct
                                  ? 'bg-emerald-100/70 font-semibold text-emerald-950'
                                  : 'bg-white'
                              }`}
                            >
                              {opt} {opt === stagedTicket.intervention?.q2Correct && '✓ (Key)'}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Step 3 */}
                  <div className="pt-2 border-t border-amber-200/40">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black uppercase text-amber-700 block">
                        Step 3: Application Written Reflection
                      </span>
                      <button
                        onClick={() => handleOpenEditor('int3')}
                        className="text-[10px] text-amber-800 font-bold hover:underline flex items-center space-x-0.5"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{editingIndex === 'int3' ? 'Editing...' : 'Edit Step 3'}</span>
                      </button>
                    </div>

                    {editingIndex === 'int3' && editState ? (
                      <div className="bg-white p-3.5 rounded-xl border border-amber-300 space-y-3">
                        <textarea
                          value={editState.q3Text}
                          onChange={(e) => setEditState({ ...editState, q3Text: e.target.value })}
                          className="w-full border rounded-lg p-2 text-xs bg-slate-50"
                          rows={2}
                        />
                        <div className="flex space-x-2 pt-1 border-t border-slate-200">
                          <button
                            onClick={handleSaveEditor}
                            className="bg-amber-600 text-white px-3 py-1 rounded-md font-bold text-[11px]"
                          >
                            Apply
                          </button>
                          <button
                            onClick={() => {
                              setEditingIndex(null);
                              setEditState(null);
                            }}
                            className="text-slate-500 font-semibold px-2 py-1 text-[11px]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="font-semibold text-slate-900">{stagedTicket.intervention?.q3Text}</p>
                        <div className="bg-white p-2.5 rounded-lg italic border border-amber-200/60 mt-1 text-[11px] text-slate-500">
                          [ Student brief synthesis reflection input goes here ]
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Publishing Row */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-slate-500">
                Publishing activates this assessment in the Student Portal for immediate classroom completion.
              </p>
              <button
                id="btn-publish-ticket"
                onClick={onPublishTicket}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white transition flex items-center justify-center space-x-2 ${
                  publishSuccess ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm'
                }`}
              >
                {publishSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✓ Assigned &amp; Published!</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    <span>Publish Active Ticket</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center text-slate-400">
            <div className="bg-slate-50 text-slate-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-slate-800">No Assessment Staged</h4>
            <p className="text-sm mt-1 max-w-sm mx-auto text-slate-500">
              Select your curriculum scope in the left panel and click <strong>Generate 3-Tier Ticket</strong> to design.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
