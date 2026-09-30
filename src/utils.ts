import { ExitTicket, Student, StudentSubmission } from './types';

// Safe Storage Helper
export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {}
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {}
  },
};

export const getSubjectColor = (subj?: string): string => {
  const s = (subj || '').toUpperCase();
  if (s === 'ELA' || s.includes('WIT') || s.includes('ENGLISH')) return 'indigo';
  if (s === 'MATH' || s.includes('EUREKA')) return 'emerald';
  if (s === 'SCIENCE' || s.includes('AMPLIFY')) return 'sky';
  return 'slate';
};

export const getSubjectClasses = (subj?: string): string => {
  const s = (subj || '').toUpperCase();
  if (s === 'ELA' || s.includes('WIT') || s.includes('ENGLISH')) {
    return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }
  if (s === 'MATH' || s.includes('EUREKA')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (s === 'SCIENCE' || s.includes('AMPLIFY')) {
    return 'bg-sky-50 text-sky-700 border-sky-200';
  }
  return 'bg-slate-50 text-slate-700 border-slate-200';
};

export const getLevelOfUnderstanding = (percentage: number): string => {
  if (percentage < 60) return 'Unsatisfactory';
  if (percentage < 70) return 'Approaching Basic';
  if (percentage < 80) return 'Basic';
  if (percentage < 90) return 'Mastery';
  return 'Advanced';
};

export const getLevelColor = (level: string): string => {
  switch (level) {
    case 'Advanced':
      return 'bg-indigo-100 text-indigo-900 border-indigo-200';
    case 'Mastery':
      return 'bg-emerald-100 text-emerald-900 border-emerald-200';
    case 'Basic':
      return 'bg-green-50 text-green-800 border-green-200';
    case 'Approaching Basic':
      return 'bg-amber-100 text-amber-900 border-amber-200';
    case 'Unsatisfactory':
      return 'bg-rose-100 text-rose-900 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-900 border-slate-200';
  }
};

export const matchSubject = (ticketSubject?: string, filterVal?: string): boolean => {
  if (!filterVal || filterVal === 'All') return true;
  const tSub = (ticketSubject || '').toUpperCase();
  const fVal = filterVal.toUpperCase();
  if (fVal === 'ELA') return tSub === 'ELA' || tSub.includes('WIT') || tSub.includes('ENGLISH');
  if (fVal === 'MATH') return tSub === 'MATH' || tSub.includes('EUREKA') || tSub.includes('MATH');
  if (fVal === 'SCIENCE') return tSub === 'SCIENCE' || tSub.includes('AMPLIFY');
  return tSub === fVal;
};

export const normalizeTicket = (ticket: any): ExitTicket => {
  if (!ticket) return ticket;
  const questions = Array.isArray(ticket.questions) ? ticket.questions : [];

  const normalizedQs = questions.map((q: any, idx: number) => {
    if (idx === 0) {
      return {
        tier: q.tier || 'Basic (Tier I)',
        type: 'MC' as const,
        questionText: q.questionText || 'Answer the following question:',
        options: q.options || ['Correct answer', 'Distractor 1', 'Distractor 2', 'Distractor 3'],
        correctAnswer: q.correctAnswer || (q.options ? q.options[0] : 'Correct answer'),
      };
    } else if (idx === 1) {
      return {
        tier: q.tier || 'Mastery (Tier II)',
        type: 'EBSR' as const,
        partAQuestion: q.partAQuestion || q.questionText || 'Answer Part A:',
        partAOptions: q.partAOptions || q.options || ['Core claim choice A', 'Incorrect alternative B', 'Incorrect alternative C', 'Incorrect alternative D'],
        partACorrect: q.partACorrect || q.correctAnswer || (q.partAOptions ? q.partAOptions[0] : 'Core claim choice A'),
        partBQuestion: q.partBQuestion || 'Part B: Which piece of textual evidence supports your answer in Part A?',
        partBOptions: q.partBOptions || ['Supporting quote evidence 1', 'Unrelated textual quote 2', 'Irrelevant context block 3', 'Misaligned evidence statement 4'],
        partBCorrect: q.partBCorrect || (q.partBOptions ? q.partBOptions[0] : 'Supporting quote evidence 1'),
      };
    } else {
      return {
        tier: q.tier || 'Advanced (Tier III)',
        type: 'MS_ADV' as const,
        questionText: q.questionText || 'Select all that apply:',
        claimOptions: q.claimOptions || q.options || ['Valid claim argument 1', 'Valid claim argument 2', 'Invalid choice 3', 'Invalid choice 4'],
        correctClaims: q.correctClaims || (q.claimOptions ? [q.claimOptions[0], q.claimOptions[1]] : ['Valid claim argument 1']),
      };
    }
  });

  const intervention = ticket.intervention && ticket.intervention.q1Text
    ? ticket.intervention
    : {
        skillFocus: ticket.remediationSkill || 'Foundational Standard Review',
        q1Text: 'Baseline Concept: Which option represents the most appropriate strategy when tackling this target standard?',
        q1Options: [
          'Applying direct systematic steps and verification.',
          'Guessing immediately to complete the task.',
          'Ignoring baseline rules.',
          'Skipping standard directions.',
        ],
        q1Correct: 'Applying direct systematic steps and verification.',
        q2Text: 'Strategy Concept: What is the most common pitfall to watch out for when processing this specific skill?',
        q2Options: [
          'Rushing through reading prompts without isolating variables.',
          'Focusing strictly on accurate evidence details.',
          'Verifying key answers carefully.',
        ],
        q2Correct: 'Rushing through reading prompts without isolating variables.',
        q3Text: 'Briefly write down one rule of thumb you will keep in mind next time.',
      };

  return {
    ...ticket,
    questions: normalizedQs,
    intervention,
  };
};

// API Client Functions with Local Storage Resilience
export async function fetchInitialData(): Promise<{ tickets: ExitTicket[]; roster: Student[]; submissions: StudentSubmission[] }> {
  try {
    const res = await fetch('/api/data');
    if (res.ok) {
      const data = await res.json();
      safeStorage.setItem('cached_tickets', JSON.stringify(data.tickets || []));
      safeStorage.setItem('cached_roster', JSON.stringify(data.roster || []));
      safeStorage.setItem('cached_submissions', JSON.stringify(data.submissions || []));
      return {
        tickets: data.tickets || [],
        roster: data.roster || [],
        submissions: data.submissions || [],
      };
    }
  } catch (err) {
    console.warn('Could not fetch server data, falling back to local cache:', err);
  }

  try {
    const tickets = JSON.parse(safeStorage.getItem('cached_tickets') || '[]');
    const roster = JSON.parse(safeStorage.getItem('cached_roster') || '[]');
    const submissions = JSON.parse(safeStorage.getItem('cached_submissions') || '[]');
    return { tickets, roster, submissions };
  } catch {
    return { tickets: [], roster: [], submissions: [] };
  }
}

export async function apiSaveTicket(ticket: ExitTicket): Promise<{ success: boolean; ticket: ExitTicket; tickets: ExitTicket[] }> {
  // Update local cache first
  const localTickets: ExitTicket[] = (() => {
    try {
      return JSON.parse(safeStorage.getItem('cached_tickets') || '[]');
    } catch {
      return [];
    }
  })();

  const newTicket: ExitTicket = {
    ...ticket,
    id: ticket.id || `ticket-${Date.now()}`,
    createdAt: ticket.createdAt || new Date().toISOString(),
  };

  let updatedList = localTickets;
  if (newTicket.isActive) {
    updatedList = updatedList.map((t) => ({ ...t, isActive: false }));
  }

  const existingIdx = updatedList.findIndex((t) => t.id === newTicket.id);
  if (existingIdx >= 0) {
    updatedList[existingIdx] = newTicket;
  } else {
    updatedList.unshift(newTicket);
  }
  safeStorage.setItem('cached_tickets', JSON.stringify(updatedList));

  // Sync to server
  try {
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTicket),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.tickets) {
        safeStorage.setItem('cached_tickets', JSON.stringify(data.tickets));
        return data;
      }
    }
  } catch (err) {
    console.warn('Server sync error for /api/tickets, using local store:', err);
  }

  return { success: true, ticket: newTicket, tickets: updatedList };
}

export async function apiSetActiveTicket(id: string): Promise<{ success: boolean; tickets: ExitTicket[] }> {
  const localTickets: ExitTicket[] = (() => {
    try {
      return JSON.parse(safeStorage.getItem('cached_tickets') || '[]');
    } catch {
      return [];
    }
  })();

  const updatedList = localTickets.map((t) => ({
    ...t,
    isActive: t.id === id,
  }));
  safeStorage.setItem('cached_tickets', JSON.stringify(updatedList));

  try {
    const res = await fetch(`/api/tickets/active/${id}`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.tickets) {
        safeStorage.setItem('cached_tickets', JSON.stringify(data.tickets));
        return data;
      }
    }
  } catch (err) {
    console.warn('Server sync error for active ticket:', err);
  }

  return { success: true, tickets: updatedList };
}

export async function apiDeleteTicket(id: string): Promise<{ success: boolean; tickets: ExitTicket[] }> {
  const localTickets: ExitTicket[] = (() => {
    try {
      return JSON.parse(safeStorage.getItem('cached_tickets') || '[]');
    } catch {
      return [];
    }
  })();

  const updatedList = localTickets.filter((t) => t.id !== id);
  safeStorage.setItem('cached_tickets', JSON.stringify(updatedList));

  try {
    const res = await fetch(`/api/tickets/${id}`, { method: 'DELETE' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.tickets) {
        safeStorage.setItem('cached_tickets', JSON.stringify(data.tickets));
        return data;
      }
    }
  } catch (err) {
    console.warn('Server sync error deleting ticket:', err);
  }

  return { success: true, tickets: updatedList };
}

export async function apiSaveRoster(students: Student | Student[]): Promise<{ success: boolean; roster: Student[] }> {
  const list = Array.isArray(students) ? students : [students];
  const localRoster: Student[] = (() => {
    try {
      return JSON.parse(safeStorage.getItem('cached_roster') || '[]');
    } catch {
      return [];
    }
  })();

  const map = new Map(localRoster.map((s) => [s.id.toLowerCase(), s]));
  for (const s of list) {
    if (s && s.id && s.name) {
      map.set(s.id.toLowerCase(), {
        id: s.id.trim(),
        name: s.name.trim(),
        pin: s.pin ? s.pin.trim() : '0000',
      });
    }
  }

  const updatedRoster = Array.from(map.values());
  safeStorage.setItem('cached_roster', JSON.stringify(updatedRoster));

  try {
    const res = await fetch('/api/roster', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students: list }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.roster) {
        safeStorage.setItem('cached_roster', JSON.stringify(data.roster));
        return data;
      }
    }
  } catch (err) {
    console.warn('Server sync error saving roster:', err);
  }

  return { success: true, roster: updatedRoster };
}

export async function apiDeleteStudent(id: string): Promise<{ success: boolean; roster: Student[] }> {
  const localRoster: Student[] = (() => {
    try {
      return JSON.parse(safeStorage.getItem('cached_roster') || '[]');
    } catch {
      return [];
    }
  })();

  const updatedRoster = localRoster.filter((s) => s.id.toLowerCase() !== id.toLowerCase());
  safeStorage.setItem('cached_roster', JSON.stringify(updatedRoster));

  try {
    const res = await fetch(`/api/roster/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.roster) {
        safeStorage.setItem('cached_roster', JSON.stringify(data.roster));
        return data;
      }
    }
  } catch (err) {
    console.warn('Server sync error deleting student:', err);
  }

  return { success: true, roster: updatedRoster };
}

export async function apiSaveSubmission(submission: StudentSubmission): Promise<{ success: boolean; submission: StudentSubmission; submissions: StudentSubmission[] }> {
  const localSubs: StudentSubmission[] = (() => {
    try {
      return JSON.parse(safeStorage.getItem('cached_submissions') || '[]');
    } catch {
      return [];
    }
  })();

  const subRecord: StudentSubmission = {
    ...submission,
    id: submission.id || `sub-${Date.now()}`,
    timestamp: submission.timestamp || new Date().toISOString(),
  };

  const existingIdx = localSubs.findIndex((s) => s.id === subRecord.id);
  let updatedSubs = [...localSubs];
  if (existingIdx >= 0) {
    updatedSubs[existingIdx] = subRecord;
  } else {
    updatedSubs.unshift(subRecord);
  }
  safeStorage.setItem('cached_submissions', JSON.stringify(updatedSubs));

  try {
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subRecord),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.submissions) {
        safeStorage.setItem('cached_submissions', JSON.stringify(data.submissions));
        return data;
      }
    }
  } catch (err) {
    console.warn('Server sync error saving submission:', err);
  }

  return { success: true, submission: subRecord, submissions: updatedSubs };
}

export async function apiOverrideScore(id: string, percentage: number, interventionScore?: number | null): Promise<{ success: boolean; submission: StudentSubmission; submissions: StudentSubmission[] }> {
  const localSubs: StudentSubmission[] = (() => {
    try {
      return JSON.parse(safeStorage.getItem('cached_submissions') || '[]');
    } catch {
      return [];
    }
  })();

  const sub = localSubs.find((s) => s.id === id);
  if (sub) {
    sub.percentage = Number(percentage);
    if (interventionScore !== null && interventionScore !== undefined && !Number.isNaN(Number(interventionScore))) {
      sub.interventionScore = Number(interventionScore);
    }
    sub.isManuallyEdited = true;
    sub.manuallyOverriddenAt = new Date().toISOString();
    safeStorage.setItem('cached_submissions', JSON.stringify(localSubs));
  }

  try {
    const res = await fetch(`/api/submissions/${encodeURIComponent(id)}/override`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ percentage, interventionScore }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.submissions) {
        safeStorage.setItem('cached_submissions', JSON.stringify(data.submissions));
        return data;
      }
    }
  } catch (err) {
    console.warn('Server sync error overriding score:', err);
  }

  return { success: true, submission: sub!, submissions: localSubs };
}

export async function apiSaveIntervention(id: string, payload: { interventionAnswers: any; interventionScore: number; aiInterventionEvaluation: any }): Promise<{ success: boolean; submission: StudentSubmission; submissions: StudentSubmission[] }> {
  const localSubs: StudentSubmission[] = (() => {
    try {
      return JSON.parse(safeStorage.getItem('cached_submissions') || '[]');
    } catch {
      return [];
    }
  })();

  const sub = localSubs.find((s) => s.id === id);
  if (sub) {
    sub.interventionCompleted = true;
    sub.interventionAnswers = payload.interventionAnswers;
    sub.interventionScore = payload.interventionScore;
    sub.aiInterventionEvaluation = payload.aiInterventionEvaluation;
    sub.interventionTimestamp = new Date().toISOString();
    safeStorage.setItem('cached_submissions', JSON.stringify(localSubs));
  }

  try {
    const res = await fetch(`/api/submissions/${encodeURIComponent(id)}/intervention`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.submissions) {
        safeStorage.setItem('cached_submissions', JSON.stringify(data.submissions));
        return data;
      }
    }
  } catch (err) {
    console.warn('Server sync error updating intervention:', err);
  }

  return { success: true, submission: sub!, submissions: localSubs };
}
