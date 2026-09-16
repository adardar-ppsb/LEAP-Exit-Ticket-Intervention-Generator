import React, { useState } from 'react';
import { BookOpen, Edit3, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { TeacherProfile } from '../types';

interface LandingViewProps {
  teacherProfile: TeacherProfile | null;
  onEnterTeacherPortal: () => void;
  onGoToTeacherAuth: () => void;
  onStudentLogin: (studentId: string, pin: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  teacherProfile,
  onEnterTeacherPortal,
  onGoToTeacherAuth,
  onStudentLogin,
}) => {
  const [studentId, setStudentId] = useState('');
  const [studentPin, setStudentPin] = useState('');

  const handleSubmitStudent = (e: React.FormEvent) => {
    e.preventDefault();
    onStudentLogin(studentId, studentPin);
  };

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="text-center mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-200/60 inline-flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>LEAP Exit Ticket &amp; Intervention Generator</span>
        </span>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-6 sm:text-5xl leading-tight">
          Evaluate Understanding, Plan Effective Remediation
        </h2>
        <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Unlock real-time classroom diagnostic evaluation, multi-tier Wit &amp; Wisdom, Eureka Math², and Amplify Science assessments, and student-level adaptive intervention loops.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Teacher Portal Card */}
        <div id="card-teacher-portal" className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-lg transition-all flex flex-col justify-between">
          <div>
            <div className="bg-indigo-50 text-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6 border border-indigo-100">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Educator Portal</h3>
            <p className="mt-2 text-slate-600 text-sm leading-relaxed">
              Design and edit exit tickets with AI assist (Wit &amp; Wisdom, Eureka Math², Amplify Science), track classroom metrics, export LDOE alignment summaries, and review targeted interventions.
            </p>
          </div>
          <div className="mt-8">
            {teacherProfile ? (
              <button
                id="btn-enter-teacher-suite"
                onClick={onEnterTeacherPortal}
                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 transition shadow-sm flex items-center justify-center space-x-2"
              >
                <span>Enter Teacher Suite</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="btn-teacher-login-register"
                onClick={onGoToTeacherAuth}
                className="w-full bg-slate-900 text-white font-bold py-3 px-4 rounded-xl hover:bg-slate-800 transition flex items-center justify-center space-x-2"
              >
                <span>Educator Login / Register</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Student Portal Card */}
        <div id="card-student-portal" className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-lg transition-all flex flex-col justify-between">
          <div>
            <div className="bg-emerald-50 text-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6 border border-emerald-100">
              <Edit3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Student Portal</h3>
            <p className="mt-2 text-slate-600 text-sm leading-relaxed">
              Complete your daily 3-tiered exit ticket assigned by your teacher. Access instant, private remediation modules if additional support is needed.
            </p>
          </div>
          <div className="mt-8">
            <form onSubmit={handleSubmitStudent} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="student-id-input" className="sr-only">Student ID</label>
                  <input
                    id="student-id-input"
                    type="text"
                    placeholder="Student ID"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 focus:bg-white transition"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="student-pin-input" className="sr-only">Security PIN</label>
                  <input
                    id="student-pin-input"
                    type="password"
                    placeholder="Security PIN"
                    value={studentPin}
                    onChange={(e) => setStudentPin(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 focus:bg-white transition"
                    required
                  />
                </div>
              </div>
              <button
                id="btn-student-access-exam"
                type="submit"
                className="w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-emerald-700 transition shadow-sm flex items-center justify-center space-x-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Access Assigned Exit Ticket</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
