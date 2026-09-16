export interface QuestionMC {
  tier: string;
  type: 'MC';
  questionText: string;
  options: string[];
  correctAnswer: string;
}

export interface QuestionEBSR {
  tier: string;
  type: 'EBSR';
  partAQuestion: string;
  partAOptions: string[];
  partACorrect: string;
  partBQuestion: string;
  partBOptions: string[];
  partBCorrect: string;
}

export interface QuestionMS {
  tier: string;
  type: 'MS_ADV';
  questionText: string;
  claimOptions: string[];
  correctClaims: string[];
}

export type ExitTicketQuestion = QuestionMC | QuestionEBSR | QuestionMS;

export interface InterventionConfig {
  skillFocus: string;
  q1Text: string;
  q1Options: string[];
  q1Correct: string;
  q2Text: string;
  q2Options: string[];
  q2Correct: string;
  q3Text: string;
}

export interface ExitTicket {
  id?: string;
  customName?: string;
  subject: string;
  grade: string;
  module: string;
  lesson: string;
  objective?: string;
  remediationSkill?: string;
  isActive?: boolean;
  createdAt?: string;
  questions: ExitTicketQuestion[];
  intervention: InterventionConfig;
}

export interface Student {
  id: string;
  name: string;
  pin: string;
}

export interface StudentAnswers {
  q1: string;
  q2_partA: string;
  q2_partB: string;
  q3: string[];
}

export interface TicketFeedback {
  score: number;
  percentage: number;
  q1Correct: boolean;
  q2PartACorrect: boolean;
  q2PartBCorrect: boolean;
  q3Correct: boolean;
  remediationRequired: boolean;
  timestamp: string;
}

export interface InterventionAnswers {
  q1Answer: string;
  q2Answer: string;
  q3Answer: string;
}

export interface InterventionEvaluation {
  isCorrect: boolean;
  pointsAwarded: number;
  feedback: string;
}

export interface StudentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  ticketId: string;
  ticketName: string;
  subject: string;
  grade: string;
  module: string;
  lesson: string;
  percentage: number;
  score: number;
  remediationRequired: boolean;
  remediationSkill: string;
  answers: StudentAnswers;
  feedback: TicketFeedback;
  timestamp: string;
  isManuallyEdited?: boolean;
  manuallyOverriddenAt?: string;
  interventionCompleted?: boolean;
  interventionAnswers?: InterventionAnswers;
  interventionScore?: number | null;
  aiInterventionEvaluation?: InterventionEvaluation;
  interventionTimestamp?: string;
}

export interface TeacherProfile {
  name: string;
  email: string;
}
