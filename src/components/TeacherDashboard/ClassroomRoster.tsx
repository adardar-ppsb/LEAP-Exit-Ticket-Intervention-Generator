import React, { useState } from 'react';
import { Users, UserPlus, Upload, Trash2, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { Student } from '../../types';

interface ClassroomRosterProps {
  studentsList: Student[];
  onAddStudent: (student: Student) => Promise<void>;
  onBulkImport: (pastedText: string) => Promise<void>;
  onRemoveStudent: (id: string) => Promise<void>;
  setErrorMessage: (msg: string) => void;
}

export const ClassroomRoster: React.FC<ClassroomRosterProps> = ({
  studentsList,
  onAddStudent,
  onBulkImport,
  onRemoveStudent,
  setErrorMessage,
}) => {
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentID, setNewStudentID] = useState('');
  const [newStudentPIN, setNewStudentPIN] = useState('');

  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [bulkPasteText, setBulkPasteText] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentID.trim()) {
      setErrorMessage('Please provide both student name and ID.');
      return;
    }
    await onAddStudent({
      id: newStudentID.trim(),
      name: newStudentName.trim(),
      pin: newStudentPIN.trim() || '0000',
    });
    setNewStudentName('');
    setNewStudentID('');
    setNewStudentPIN('');
  };

  const handleBulkSubmit = async () => {
    if (!bulkPasteText.trim()) {
      setErrorMessage('Please paste spreadsheet text or upload a CSV file.');
      return;
    }
    await onBulkImport(bulkPasteText);
    setBulkPasteText('');
    setBulkImportOpen(false);
  };

  const handleCsvFileSelector = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setBulkPasteText((event.target?.result as string) || '');
    };
    reader.readAsText(file);
  };

  const filteredRoster = studentsList.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Form & Bulk Import */}
      <div className="lg:col-span-4 space-y-6">
        {/* Single Student Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h3 className="text-base font-black text-slate-900 mb-4 flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            <span>Add Individual Student</span>
          </h3>
          <form onSubmit={handleSingleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                id="input-new-student-name"
                type="text"
                placeholder="e.g. Amelia Boudreaux"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Student ID
              </label>
              <input
                id="input-new-student-id"
                type="text"
                placeholder="e.g. AMB889"
                value={newStudentID}
                onChange={(e) => setNewStudentID(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Security PIN (4 Digits)
              </label>
              <input
                id="input-new-student-pin"
                type="text"
                maxLength={4}
                placeholder="e.g. 1234 (defaults to 0000)"
                value={newStudentPIN}
                onChange={(e) => setNewStudentPIN(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition font-mono"
              />
            </div>
            <button
              id="btn-save-student"
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition text-sm shadow-xs"
            >
              Save Student
            </button>
          </form>
        </div>

        {/* Bulk Importer Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <span>Spreadsheet Importer</span>
            </h3>
            <button
              id="btn-toggle-bulk-importer"
              onClick={() => setBulkImportOpen(!bulkImportOpen)}
              className="text-xs text-indigo-600 font-bold hover:underline"
            >
              {bulkImportOpen ? 'Hide' : 'Show'}
            </button>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Import student rosters directly from Google Sheets or standard CSV files in one click.
          </p>

          {bulkImportOpen && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 text-[11px] text-indigo-950 space-y-1">
                <strong className="block uppercase text-[10px] text-indigo-900 tracking-wider">
                  Copy Format Guideline:
                </strong>
                <p>Copy columns in this sequence (Tab or Comma separated):</p>
                <p className="font-mono bg-white/80 p-1.5 rounded-md font-bold border border-indigo-200/60">
                  [Student ID] [Tab/Comma] [Full Name] [Tab/Comma] [PIN]
                </p>
                <p className="text-[10px] text-slate-500 italic">PIN defaults to &quot;0000&quot; if left empty.</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Upload CSV File
                </label>
                <input
                  type="file"
                  accept=".csv, .txt"
                  onChange={handleCsvFileSelector}
                  className="text-xs text-slate-600 block w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Paste Spreadsheet Rows
                </label>
                <textarea
                  id="textarea-bulk-paste"
                  rows={4}
                  placeholder="Paste rows directly from Google Sheets or Excel here..."
                  value={bulkPasteText}
                  onChange={(e) => setBulkPasteText(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
                />
              </div>

              <button
                id="btn-execute-bulk-import"
                onClick={handleBulkSubmit}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center space-x-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Execute Bulk Roster Import</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Roster Table */}
      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs h-fit">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-black text-slate-900">Current Classroom Members</h3>
            <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {studentsList.length}
            </span>
          </div>

          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 max-w-xs"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-200/60">
                <th className="px-6 py-3">Student Name</th>
                <th className="px-6 py-3">Student ID (Login)</th>
                <th className="px-6 py-3">Secure PIN</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredRoster.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                    {studentsList.length === 0
                      ? 'No students are currently enrolled in your roster. Add students on the left or use the spreadsheet importer.'
                      : 'No students match your search criteria.'}
                  </td>
                </tr>
              ) : (
                filteredRoster.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-3.5 font-bold text-slate-900">{s.name}</td>
                    <td className="px-6 py-3.5 font-mono text-xs text-slate-600">{s.id}</td>
                    <td className="px-6 py-3.5 font-mono text-xs text-slate-500">{s.pin}</td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => onRemoveStudent(s.id)}
                        className="text-rose-500 hover:text-rose-700 text-xs font-semibold flex items-center space-x-1 ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
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
