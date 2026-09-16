import React, { useState } from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { TeacherProfile } from '../types';

interface TeacherAuthProps {
  onLogin: (profile: TeacherProfile) => void;
  onCancel: () => void;
}

export const TeacherAuth: React.FC<TeacherAuthProps> = ({ onLogin, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    onLogin({
      name: name.trim() || email.split('@')[0],
      email: email.trim(),
    });
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6 border border-indigo-100">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">Educator Security Portal</h3>
        <p className="text-xs text-slate-500 mb-6">
          Authenticate to manage Louisiana curriculum standards, assign exit tickets, and analyze student diagnostics.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Educator Full Name
            </label>
            <input
              id="teacher-name-input"
              type="text"
              placeholder="e.g. Mrs. Landry"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 focus:bg-white transition"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Louisiana Educator Email <span className="text-rose-500">*</span>
            </label>
            <input
              id="teacher-email-input"
              type="email"
              placeholder="name@ppsb.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 focus:bg-white transition"
            />
          </div>
          <button
            id="btn-teacher-authorize"
            type="submit"
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition shadow-sm text-sm"
          >
            Authorize Entry
          </button>
          <button
            id="btn-teacher-back"
            type="button"
            onClick={onCancel}
            className="w-full text-center text-xs text-slate-500 hover:text-slate-700 flex items-center justify-center space-x-1 py-2 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </button>
        </form>
      </div>
    </div>
  );
};
