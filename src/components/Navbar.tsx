import React from 'react';
import { GraduationCap, LogOut, User } from 'lucide-react';
import { TeacherProfile, Student } from '../types';

interface NavbarProps {
  portal: string;
  setPortal: (p: string) => void;
  teacherProfile: TeacherProfile | null;
  onSignOutTeacher: () => void;
  loggedInStudent: Student | null;
  onExitStudentExam: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  portal,
  setPortal,
  teacherProfile,
  onSignOutTeacher,
  loggedInStudent,
  onExitStudentExam,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div
          id="nav-brand-logo"
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => setPortal('landing')}
        >
          <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-sm group-hover:bg-indigo-700 transition">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-indigo-800 to-indigo-600 bg-clip-text text-transparent">
              LEAP Exit Ticket &amp; Intervention Generator
            </h1>
            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
              Evaluate Understanding, Plan Effective Remediation
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {portal === 'teacher' && teacherProfile && (
            <div className="flex items-center space-x-3">
              <span className="hidden md:inline-block text-xs sm:text-sm text-slate-500">
                Welcome, <strong className="text-slate-800">{teacherProfile.name}</strong> (Educator)
              </span>
              <button
                id="btn-teacher-logout"
                onClick={onSignOutTeacher}
                className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-xs font-semibold transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}

          {portal === 'student' && loggedInStudent && (
            <div className="flex items-center space-x-3">
              <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1.5 border border-indigo-100">
                <User className="w-3.5 h-3.5" />
                <span>{loggedInStudent.name}</span>
              </span>
              <button
                id="btn-student-exit"
                onClick={onExitStudentExam}
                className="text-xs text-rose-500 font-semibold hover:text-rose-700 transition underline underline-offset-2"
              >
                Exit Exam
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
