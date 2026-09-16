import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingView } from './components/LandingView';
import { TeacherAuth } from './components/TeacherAuth';
import { TicketStudio } from './components/TeacherDashboard/TicketStudio';
import { SavedLibrary } from './components/TeacherDashboard/SavedLibrary';
import { ClassroomRoster } from './components/TeacherDashboard/ClassroomRoster';
import { AnalyticsDashboard } from './components/TeacherDashboard/AnalyticsDashboard';
import { StudentTestView } from './components/StudentPortal/StudentTestView';
import { InterventionLoopView } from './components/StudentPortal/InterventionLoopView';
import { ReviewModal } from './components/ReviewModal';
import {
  ExitTicket,
  Student,
  StudentSubmission,
  TeacherProfile,
  StudentAnswers,
  TicketFeedback,
  InterventionAnswers,
  InterventionEvaluation,
  QuestionMC,
  QuestionEBSR,
  QuestionMS,
} from './types';
import {
  safeStorage,
  fetchInitialData,
  apiSaveTicket,
  apiSetActiveTicket,
  apiDeleteTicket,
  apiSaveRoster,
  apiDeleteStudent,
  apiSaveSubmission,
  apiOverrideScore,
  apiSaveIntervention,
  normalizeTicket,
} from './utils';
import { CURRICULUM_MAP } from './data/curriculum';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  delay: number;
  size: number;
}

export default function App() {
  // Navigation & Auth States
  const [portal, setPortal] = useState<'landing' | 'teacher-auth' | 'teacher' | 'student'>('landing');
  const [teacherTab, setTeacherTab] = useState<'tickets' | 'saved' | 'roster' | 'analytics'>('tickets');
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [loggedInStudent, setLoggedInStudent] = useState<Student | null>(null);

  // Core Data States
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [exitTickets, setExitTickets] = useState<ExitTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<ExitTicket | null>(null);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);

  // Studio Staged State
  const [subject, setSubject] = useState('ELA');
  const [grade, setGrade] = useState('Grade 3');
  const [module, setModule] = useState('Module 1: The Sea');
  const [lesson, setLesson] = useState('Lesson 1-5: Ocean Giant Discoveries & Amos and Boris');
  const [customObjective, setCustomObjective] = useState('');
  const [stagedTicket, setStagedTicket] = useState<ExitTicket | null>(null);
  const [customTicketName, setCustomTicketName] = useState('');
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Student Portal Test State
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswers>({
    q1: '',
    q2_partA: '',
    q2_partB: '',
    q3: [],
  });
  const [studentFeedback, setStudentFeedback] = useState<TicketFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Student Intervention Loop State
  const [activeIntervention, setActiveIntervention] = useState<{
    submissionId: string;
    studentId: string;
    studentName: string;
    ticketId: string;
    interventionQuestions: any;
  } | null>(null);
  const [interventionAnswers, setInterventionAnswers] = useState<InterventionAnswers>({
    q1Answer: '',
    q2Answer: '',
    q3Answer: '',
  });
  const [interventionSubmitted, setInterventionSubmitted] = useState(false);
  const [isGradingIntervention, setIsGradingIntervention] = useState(false);
  const [aiInterventionFeedback, setAiInterventionFeedback] = useState<InterventionEvaluation | null>(null);

  // Teacher Review Modal
  const [reviewSubmission, setReviewSubmission] = useState<StudentSubmission | null>(null);

  // UI Feedback & Confetti
  const [errorMessage, setErrorMessage] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [burstParticles, setBurstParticles] = useState<Particle[]>([]);

  const triggerConfetti = () => {
    const colors = ['#4f46e5', '#10b981', '#3b82f6', '#f59e0b', '#ec4899'];
    const particles = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 1.5,
      size: Math.random() * 8 + 6,
    }));
    setBurstParticles(particles);
    setTimeout(() => setBurstParticles([]), 4000);
  };

  // Initial Data Load
  useEffect(() => {
    const savedProf = safeStorage.getItem('teacher_profile');
    if (savedProf) {
      try {
        setTeacherProfile(JSON.parse(savedProf));
      } catch {
        safeStorage.removeItem('teacher_profile');
      }
    }

    async function loadData() {
      const data = await fetchInitialData();
      if (data.tickets && data.tickets.length > 0) {
        setExitTickets(data.tickets);
        const active = data.tickets.find((t) => t.isActive) || data.tickets[0];
        setActiveTicket(active);
      }
      if (data.roster && data.roster.length > 0) {
        setStudentsList(data.roster);
      }
      if (data.submissions && data.submissions.length > 0) {
        setSubmissions(data.submissions);
      }
    }

    loadData();
  }, []);

  // Update dynamic module & lesson selectors
  useEffect(() => {
    const modules = Object.keys(CURRICULUM_MAP[subject]?.grades[grade] || {});
    if (modules.length > 0 && !modules.includes(module)) {
      setModule(modules[0]);
    }
  }, [subject, grade]);

  useEffect(() => {
    const lessons = CURRICULUM_MAP[subject]?.grades[grade]?.[module]?.lessons || [];
    if (lessons.length > 0 && !lessons.includes(lesson)) {
      setLesson(lessons[0]);
    }
  }, [module, subject, grade]);

  // Synchronize staged ticket metadata
  useEffect(() => {
    setStagedTicket((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        subject,
        grade,
        module,
        lesson,
      };
    });
  }, [subject, grade, module, lesson]);

  // Dynamic suggestion for ticket names
  useEffect(() => {
    if (stagedTicket) {
      setCustomTicketName(
        stagedTicket.customName ||
          `${stagedTicket.subject} - ${stagedTicket.grade} - ${stagedTicket.lesson?.split(':')[0] || 'Custom'}`
      );
    } else {
      setCustomTicketName('');
    }
  }, [stagedTicket]);

  // Teacher Auth handlers
  const handleTeacherLogin = (profile: TeacherProfile) => {
    setTeacherProfile(profile);
    safeStorage.setItem('teacher_profile', JSON.stringify(profile));
    setPortal('teacher');
  };

  const handleSignOutTeacher = () => {
    safeStorage.removeItem('teacher_profile');
    setTeacherProfile(null);
    setPortal('landing');
  };

  // Student Auth handlers
  const handleStudentLogin = (idInput: string, pinInput: string) => {
    setErrorMessage('');
    const match = studentsList.find(
      (s) => s.id.toLowerCase() === idInput.trim().toLowerCase() && s.pin === pinInput.trim()
    );
    if (!match) {
      setErrorMessage('Invalid Student ID or 4-digit PIN. Please verify your credentials with your educator.');
      return;
    }
    setLoggedInStudent(match);
    setStudentAnswers({ q1: '', q2_partA: '', q2_partB: '', q3: [] });
    setStudentFeedback(null);
    setActiveIntervention(null);
    setInterventionSubmitted(false);
    setPortal('student');
  };

  // Publishing Ticket
  const handlePublishTicket = async () => {
    if (!stagedTicket) return;
    try {
      const ticketToSave: ExitTicket = {
        ...stagedTicket,
        customName: customTicketName || `${stagedTicket.subject} - ${stagedTicket.grade} - ${stagedTicket.lesson}`,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      const res = await apiSaveTicket(ticketToSave);
      setExitTickets(res.tickets);
      setActiveTicket(ticketToSave);
      setPublishSuccess(true);
      triggerConfetti();
      setSuccessMsg('Successfully published ticket! It is now active in the Student Portal.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMessage(`Failed to publish ticket: ${err.message}`);
    }
  };

  const handleToggleActiveTicket = async (id: string) => {
    try {
      const res = await apiSetActiveTicket(id);
      setExitTickets(res.tickets);
      const active = res.tickets.find((t) => t.id === id) || null;
      setActiveTicket(active);
      setSuccessMsg('Active exit ticket changed successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMessage(`Could not update active assignment: ${err.message}`);
    }
  };

  const handleDeleteTicket = async (id: string) => {
    try {
      const res = await apiDeleteTicket(id);
      setExitTickets(res.tickets);
      if (activeTicket?.id === id) {
        setActiveTicket(res.tickets[0] || null);
      }
      setSuccessMsg('Ticket removed from library.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMessage(`Delete failed: ${err.message}`);
    }
  };

  // Roster Actions
  const handleAddStudent = async (student: Student) => {
    try {
      const res = await apiSaveRoster(student);
      setStudentsList(res.roster);
      setSuccessMsg(`Student "${student.name}" added to classroom roster.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMessage(`Error saving student: ${err.message}`);
    }
  };

  const handleBulkImport = async (pastedText: string) => {
    const lines = pastedText.split('\n');
    const imported: Student[] = [];

    lines.forEach((line) => {
      const clean = line.trim();
      if (!clean) return;

      let cols = clean.split('\t');
      if (cols.length < 2) cols = clean.split(',');

      const firstLower = (cols[0] || '').toLowerCase().trim();
      if (firstLower.includes('student id') || firstLower === 'id' || firstLower.includes('name')) {
        return; // skip header
      }

      const id = cols[0]?.trim();
      const name = cols[1]?.trim();
      const pin = cols[2]?.trim().slice(0, 4) || '0000';

      if (id && name) {
        imported.push({ id, name, pin });
      }
    });

    if (imported.length === 0) {
      setErrorMessage('No valid student rows detected. Expected format: [Student ID], [Full Name], [PIN]');
      return;
    }

    try {
      const res = await apiSaveRoster(imported);
      setStudentsList(res.roster);
      setSuccessMsg(`Successfully imported ${imported.length} student(s) to roster!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMessage(`Bulk import error: ${err.message}`);
    }
  };

  const handleRemoveStudent = async (id: string) => {
    try {
      const res = await apiDeleteStudent(id);
      setStudentsList(res.roster);
      setSuccessMsg('Student removed from roster.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMessage(`Could not remove student: ${err.message}`);
    }
  };

  // Student Test Submission
  const handleSubmitTest = async () => {
    if (!loggedInStudent || !activeTicket) return;
    setIsSubmitting(true);

    const q1Obj = activeTicket.questions[0] as QuestionMC;
    const q2Obj = activeTicket.questions[1] as QuestionEBSR;
    const q3Obj = activeTicket.questions[2] as QuestionMS;

    const q1Correct = studentAnswers.q1 === q1Obj?.correctAnswer;
    const q2PartACorrect = studentAnswers.q2_partA === q2Obj?.partACorrect;
    const q2PartBCorrect = studentAnswers.q2_partB === q2Obj?.partBCorrect;

    let q3Correct = false;
    if (q3Obj && q3Obj.type === 'MS_ADV') {
      const selected = studentAnswers.q3 || [];
      const target = q3Obj.correctClaims || [];
      q3Correct = selected.length === target.length && selected.every((val) => target.includes(val));
    }

    let scorePoints = 0;
    if (q1Correct) scorePoints += 30;
    if (q2PartACorrect && q2PartBCorrect) scorePoints += 40;
    else if (q2PartACorrect || q2PartBCorrect) scorePoints += 15;
    if (q3Correct) scorePoints += 30;

    const percent = Math.min(scorePoints, 100);
    const feedbackSummary: TicketFeedback = {
      score: scorePoints,
      percentage: percent,
      q1Correct,
      q2PartACorrect,
      q2PartBCorrect,
      q3Correct,
      remediationRequired: percent < 75,
      timestamp: new Date().toISOString(),
    };

    setStudentFeedback(feedbackSummary);

    const subRecord: StudentSubmission = {
      id: `${loggedInStudent.id}-${activeTicket.id || 'ticket'}-${Date.now()}`,
      studentId: loggedInStudent.id,
      studentName: loggedInStudent.name,
      ticketId: activeTicket.id || 'ticket',
      ticketName: activeTicket.customName || 'General Exit Ticket',
      subject: activeTicket.subject,
      grade: activeTicket.grade,
      module: activeTicket.module,
      lesson: activeTicket.lesson,
      percentage: percent,
      score: scorePoints,
      remediationRequired: percent < 75,
      remediationSkill: activeTicket.remediationSkill || 'Key Core Concepts',
      answers: studentAnswers,
      feedback: feedbackSummary,
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await apiSaveSubmission(subRecord);
      setSubmissions(res.submissions);

      if (feedbackSummary.remediationRequired) {
        setActiveIntervention({
          submissionId: subRecord.id,
          studentId: loggedInStudent.id,
          studentName: loggedInStudent.name,
          ticketId: activeTicket.id || 'ticket',
          interventionQuestions: activeTicket.intervention,
        });
        setInterventionAnswers({ q1Answer: '', q2Answer: '', q3Answer: '' });
        setAiInterventionFeedback(null);
        setInterventionSubmitted(false);
      } else {
        triggerConfetti();
      }
    } catch (err: any) {
      setErrorMessage(`Error submitting test: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Student Intervention Submission
  const handleSubmitIntervention = async () => {
    if (!activeIntervention) return;
    setIsGradingIntervention(true);

    try {
      const resGrade = await fetch('/api/grade-intervention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: activeIntervention.interventionQuestions.q3Text,
          studentAnswer: interventionAnswers.q3Answer,
          skillFocus: activeIntervention.interventionQuestions.skillFocus,
        }),
      });

      const gradingResult: InterventionEvaluation = await resGrade.json();

      const q1Correct =
        interventionAnswers.q1Answer === activeIntervention.interventionQuestions.q1Correct;
      const q2Correct =
        interventionAnswers.q2Answer === activeIntervention.interventionQuestions.q2Correct;

      let intScore = 0;
      if (q1Correct) intScore += 40;
      if (q2Correct) intScore += 40;
      intScore += gradingResult.pointsAwarded ?? 0;

      setAiInterventionFeedback(gradingResult);
      setInterventionSubmitted(true);

      const resSub = await apiSaveIntervention(activeIntervention.submissionId, {
        interventionAnswers,
        interventionScore: intScore,
        aiInterventionEvaluation: gradingResult,
      });

      setSubmissions(resSub.submissions);
      triggerConfetti();
    } catch (err: any) {
      setErrorMessage(`Intervention error: ${err.message}`);
    } finally {
      setIsGradingIntervention(false);
    }
  };

  // Score Override handler
  const handleSaveScoreOverride = async (
    id: string,
    percentage: number,
    interventionScore?: number | null
  ) => {
    try {
      const res = await apiOverrideScore(id, percentage, interventionScore);
      setSubmissions(res.submissions);
      setSuccessMsg('Manual score override applied successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMessage(`Override failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      {/* Confetti Animation Layer */}
      {burstParticles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {burstParticles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full animate-bounce"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                transition: 'all 3.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                transform: `translateY(120vh) rotate(${p.id * 15}deg)`,
                opacity: 0.85,
              }}
            />
          ))}
        </div>
      )}

      {/* Universal Top Header */}
      <Navbar
        portal={portal}
        setPortal={setPortal}
        teacherProfile={teacherProfile}
        onSignOutTeacher={handleSignOutTeacher}
        loggedInStudent={loggedInStudent}
        onExitStudentExam={() => {
          setLoggedInStudent(null);
          setStudentFeedback(null);
          setPortal('landing');
        }}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Error Notification Banner */}
        {errorMessage && (
          <div
            id="banner-error-msg"
            className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-start space-x-3 shadow-xs"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-sm text-rose-900">System Alert</h4>
              <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="text-rose-400 hover:text-rose-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Success Notification Banner */}
        {successMsg && (
          <div
            id="banner-success-msg"
            className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs sm:text-sm font-bold">{successMsg}</span>
            </div>
            <button
              onClick={() => setSuccessMsg('')}
              className="text-emerald-500 hover:text-emerald-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* View 1: Landing Page */}
        {portal === 'landing' && (
          <LandingView
            teacherProfile={teacherProfile}
            onEnterTeacherPortal={() => setPortal('teacher')}
            onGoToTeacherAuth={() => setPortal('teacher-auth')}
            onStudentLogin={handleStudentLogin}
          />
        )}

        {/* View 2: Educator Security Login */}
        {portal === 'teacher-auth' && (
          <TeacherAuth
            onLogin={handleTeacherLogin}
            onCancel={() => setPortal('landing')}
          />
        )}

        {/* View 3: Educator Suite */}
        {portal === 'teacher' && (
          <div>
            {/* Dashboard Tabs Header */}
            <div className="flex border-b border-slate-200 mb-8 overflow-x-auto space-x-4">
              <button
                id="tab-ticket-studio"
                onClick={() => setTeacherTab('tickets')}
                className={`py-3 px-4 font-bold text-sm border-b-2 whitespace-nowrap transition-all ${
                  teacherTab === 'tickets'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                🛠️ Ticket Studio
              </button>
              <button
                id="tab-saved-library"
                onClick={() => setTeacherTab('saved')}
                className={`py-3 px-4 font-bold text-sm border-b-2 whitespace-nowrap transition-all ${
                  teacherTab === 'saved'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                📚 Saved Library ({exitTickets.length})
              </button>
              <button
                id="tab-classroom-roster"
                onClick={() => setTeacherTab('roster')}
                className={`py-3 px-4 font-bold text-sm border-b-2 whitespace-nowrap transition-all ${
                  teacherTab === 'roster'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                📋 Classroom Roster ({studentsList.length})
              </button>
              <button
                id="tab-leap-analytics"
                onClick={() => setTeacherTab('analytics')}
                className={`py-3 px-4 font-bold text-sm border-b-2 whitespace-nowrap transition-all ${
                  teacherTab === 'analytics'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                📈 LEAP Analytics &amp; Interventions
              </button>
            </div>

            {teacherTab === 'tickets' && (
              <TicketStudio
                subject={subject}
                setSubject={setSubject}
                grade={grade}
                setGrade={setGrade}
                module={module}
                setModule={setModule}
                lesson={lesson}
                setLesson={setLesson}
                customObjective={customObjective}
                setCustomObjective={setCustomObjective}
                stagedTicket={stagedTicket}
                setStagedTicket={setStagedTicket}
                customTicketName={customTicketName}
                setCustomTicketName={setCustomTicketName}
                onPublishTicket={handlePublishTicket}
                publishSuccess={publishSuccess}
                setErrorMessage={setErrorMessage}
                setSuccessMsg={setSuccessMsg}
              />
            )}

            {teacherTab === 'saved' && (
              <SavedLibrary
                exitTickets={exitTickets}
                onToggleActive={handleToggleActiveTicket}
                onDeleteTicket={handleDeleteTicket}
                onLoadInWorkspace={(t) => {
                  setStagedTicket(JSON.parse(JSON.stringify(t)));
                  setTeacherTab('tickets');
                }}
                onGoToStudio={() => setTeacherTab('tickets')}
              />
            )}

            {teacherTab === 'roster' && (
              <ClassroomRoster
                studentsList={studentsList}
                onAddStudent={handleAddStudent}
                onBulkImport={handleBulkImport}
                onRemoveStudent={handleRemoveStudent}
                setErrorMessage={setErrorMessage}
              />
            )}

            {teacherTab === 'analytics' && (
              <AnalyticsDashboard
                submissions={submissions}
                onOpenReview={(sub) => setReviewSubmission(sub)}
              />
            )}
          </div>
        )}

        {/* View 4: Student Portal */}
        {portal === 'student' && loggedInStudent && (
          <div className="max-w-3xl mx-auto py-6">
            {!activeTicket ? (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900">No Active Exit Ticket Assigned</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Your educator has not published an active exit ticket yet. Please check back shortly!
                </p>
                <button
                  onClick={() => {
                    setLoggedInStudent(null);
                    setPortal('landing');
                  }}
                  className="bg-slate-900 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-slate-800 text-sm transition"
                >
                  Return to Home
                </button>
              </div>
            ) : !studentFeedback ? (
              <StudentTestView
                activeTicket={activeTicket}
                loggedInStudent={loggedInStudent}
                studentAnswers={studentAnswers}
                setStudentAnswers={setStudentAnswers}
                onSubmit={handleSubmitTest}
                isSubmitting={isSubmitting}
              />
            ) : (
              <InterventionLoopView
                feedback={studentFeedback}
                intervention={{
                  studentName: loggedInStudent.name,
                  interventionQuestions: activeTicket.intervention,
                }}
                interventionAnswers={interventionAnswers}
                setInterventionAnswers={setInterventionAnswers}
                onSubmitIntervention={handleSubmitIntervention}
                isGradingIntervention={isGradingIntervention}
                interventionSubmitted={interventionSubmitted}
                aiInterventionFeedback={aiInterventionFeedback}
                onConcludeSession={() => {
                  setLoggedInStudent(null);
                  setStudentFeedback(null);
                  setActiveIntervention(null);
                  setPortal('landing');
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* Teacher Response Review Modal */}
      {reviewSubmission && (
        <ReviewModal
          submission={reviewSubmission}
          onClose={() => setReviewSubmission(null)}
          onSaveOverride={handleSaveScoreOverride}
          setErrorMessage={setErrorMessage}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <p>© 2026 LEAP Exit Ticket &amp; Intervention Generator. Built for classroom integration &amp; dynamic assessment alignment.</p>
      </footer>
    </div>
  );
}
