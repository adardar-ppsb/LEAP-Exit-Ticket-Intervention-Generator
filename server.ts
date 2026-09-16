import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Helper for Gemini AI client with lazy initialization
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Data Store Path
const DATA_STORE_FILE = path.join(process.cwd(), "app_data_store.json");

interface DataStore {
  tickets: any[];
  roster: any[];
  submissions: any[];
}

function loadDataStore(): DataStore {
  try {
    if (fs.existsSync(DATA_STORE_FILE)) {
      const raw = fs.readFileSync(DATA_STORE_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to load local data store:", err);
  }
  return {
    tickets: [],
    roster: [],
    submissions: [],
  };
}

function saveDataStore(data: DataStore) {
  try {
    fs.writeFileSync(DATA_STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist data store:", err);
  }
}

let store = loadDataStore();

// --- API Routes ---

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Full data retrieval
app.get("/api/data", (_req, res) => {
  res.json(store);
});

// Tickets Management
app.post("/api/tickets", (req, res) => {
  const ticket = req.body;
  if (!ticket) return res.status(400).json({ error: "Ticket payload is required." });

  if (ticket.isActive) {
    store.tickets = store.tickets.map((t) => ({ ...t, isActive: false }));
  }

  const newTicket = {
    ...ticket,
    id: ticket.id || `ticket-${Date.now()}`,
    createdAt: ticket.createdAt || new Date().toISOString(),
  };

  const existingIdx = store.tickets.findIndex((t) => t.id === newTicket.id);
  if (existingIdx >= 0) {
    store.tickets[existingIdx] = newTicket;
  } else {
    store.tickets.unshift(newTicket);
  }

  saveDataStore(store);
  res.json({ success: true, ticket: newTicket, tickets: store.tickets });
});

app.post("/api/tickets/active/:id", (req, res) => {
  const { id } = req.params;
  store.tickets = store.tickets.map((t) => ({
    ...t,
    isActive: t.id === id,
  }));
  saveDataStore(store);
  res.json({ success: true, tickets: store.tickets });
});

app.delete("/api/tickets/:id", (req, res) => {
  const { id } = req.params;
  store.tickets = store.tickets.filter((t) => t.id !== id);
  saveDataStore(store);
  res.json({ success: true, tickets: store.tickets });
});

// Roster Management
app.post("/api/roster", (req, res) => {
  const { students } = req.body; // array or single object
  if (!students) return res.status(400).json({ error: "Students array is required." });

  const list = Array.isArray(students) ? students : [students];
  const map = new Map(store.roster.map((s) => [s.id.toLowerCase(), s]));

  for (const s of list) {
    if (s && s.id && s.name) {
      map.set(s.id.toLowerCase(), {
        id: s.id.trim(),
        name: s.name.trim(),
        pin: s.pin ? s.pin.trim() : "0000",
      });
    }
  }

  store.roster = Array.from(map.values());
  saveDataStore(store);
  res.json({ success: true, roster: store.roster });
});

app.delete("/api/roster/:id", (req, res) => {
  const { id } = req.params;
  store.roster = store.roster.filter((s) => s.id.toLowerCase() !== id.toLowerCase());
  saveDataStore(store);
  res.json({ success: true, roster: store.roster });
});

// Submissions Management
app.post("/api/submissions", (req, res) => {
  const sub = req.body;
  if (!sub) return res.status(400).json({ error: "Submission payload required." });

  const subRecord = {
    ...sub,
    id: sub.id || `sub-${Date.now()}`,
    timestamp: sub.timestamp || new Date().toISOString(),
  };

  const existingIdx = store.submissions.findIndex((s) => s.id === subRecord.id);
  if (existingIdx >= 0) {
    store.submissions[existingIdx] = subRecord;
  } else {
    store.submissions.unshift(subRecord);
  }

  saveDataStore(store);
  res.json({ success: true, submission: subRecord, submissions: store.submissions });
});

app.put("/api/submissions/:id/override", (req, res) => {
  const { id } = req.params;
  const { percentage, interventionScore } = req.body;

  const sub = store.submissions.find((s) => s.id === id);
  if (!sub) return res.status(404).json({ error: "Submission not found." });

  sub.percentage = Number(percentage);
  if (interventionScore !== null && interventionScore !== undefined && interventionScore !== "") {
    sub.interventionScore = Number(interventionScore);
  }
  sub.isManuallyEdited = true;
  sub.manuallyOverriddenAt = new Date().toISOString();

  saveDataStore(store);
  res.json({ success: true, submission: sub, submissions: store.submissions });
});

app.put("/api/submissions/:id/intervention", (req, res) => {
  const { id } = req.params;
  const { interventionAnswers, interventionScore, aiInterventionEvaluation } = req.body;

  const sub = store.submissions.find((s) => s.id === id);
  if (!sub) return res.status(404).json({ error: "Submission not found." });

  sub.interventionCompleted = true;
  sub.interventionAnswers = interventionAnswers;
  sub.interventionScore = interventionScore;
  sub.aiInterventionEvaluation = aiInterventionEvaluation;
  sub.interventionTimestamp = new Date().toISOString();

  saveDataStore(store);
  res.json({ success: true, submission: sub, submissions: store.submissions });
});

// --- AI Ticket Generation API ---
app.post("/api/generate-ticket", async (req, res) => {
  try {
    const { subject, grade, module, lesson, customObjective } = req.body;
    const ai = getGeminiClient();

    const systemInstruction = `You are an expert curriculum designer and psychometrician specializing in Louisiana Student Standards (LDOE), Wit & Wisdom ELA, Eureka Math², and Amplify Science. 
Your objective is to generate a comprehensive, highly rigorous, 3-tiered Exit Ticket matching the provided Subject, Grade, Module, Lesson, and Objective.

Additionally, you must generate a highly structured, on-level, mixed-format Intervention targeting the exact same skill/standard (not necessarily identical topic context). The intervention MUST consist of:
- Step 1: Standard Concept Check (Multiple Choice question evaluating base standard concepts on-level).
- Step 2: Strategy / Misconception Check (Multiple Choice question evaluating base strategy steps or common math/science/reading fallacies).
- Step 3: Brief Application Reflection (Short sentence prompt asking the student to state a rule or reason).

Output MUST be returned in raw JSON format strictly adhering to this schema:
{
  "subject": "String matching input",
  "grade": "String matching input",
  "module": "String matching input",
  "lesson": "String matching input",
  "objective": "Clear alignment objective",
  "remediationSkill": "Specific remediation skill label (e.g. Evidentiary reasoning, Multi-step comparison)",
  "questions": [
    {
      "tier": "Basic (Tier I)",
      "type": "MC",
      "questionText": "Direct multiple-choice question testing baseline concept.",
      "options": ["Correct choice", "Highly plausible distractor 1", "Highly plausible distractor 2", "Distractor 3"],
      "correctAnswer": "Correct choice"
    },
    {
      "tier": "Mastery (Tier II)",
      "type": "EBSR",
      "partAQuestion": "Part A conceptually challenging selection.",
      "partAOptions": ["Correct claim choice", "Incorrect alternative A", "Incorrect alternative B", "Incorrect alternative C"],
      "partACorrect": "Correct claim choice",
      "partBQuestion": "Part B evidentiary identification directly validating Part A.",
      "partBOptions": ["True evidentiary citation/proof", "Weak evidence distractor", "Unrelated standard detail", "Incorrect context text"],
      "partBCorrect": "True evidentiary citation/proof"
    },
    {
      "tier": "Advanced (Tier III)",
      "type": "MS_ADV",
      "questionText": "Multi-select question testing deep multi-step synthesis or transfer.",
      "claimOptions": ["Valid proof statement A", "Valid proof statement B", "Invalid distraction claim C", "Invalid distraction claim D"],
      "correctClaims": ["Valid proof statement A", "Valid proof statement B"]
    }
  ],
  "intervention": {
    "skillFocus": "Direct skill label for remediation focus standard",
    "q1Text": "Standard Concept practice question targeting foundational understanding of this skill standard.",
    "q1Options": ["Correct Baseline Answer Choice", "Incorrect choice 1", "Incorrect choice 2", "Incorrect choice 3"],
    "q1Correct": "Correct Baseline Answer Choice",
    "q2Text": "Identify the proper strategic action step or detect a misconception related to this standard.",
    "q2Options": ["Correct strategic practice step choice", "Flawed strategy choice 1", "Flawed strategy choice 2"],
    "q2Correct": "Correct strategic practice step choice",
    "q3Text": "Written prompt: Explain why this strategy works or write one guideline to remember."
  }
}
Ensure high academic rigor. No conversational meta-text. Return only valid, parsing-safe JSON.`;

    const userPrompt = `Generate a Louisiana LEAP-aligned Exit Ticket and its structured mixed-format Intervention targeting standard/skill:
Subject: ${subject}
Grade: ${grade}
Module: ${module}
Lesson: ${lesson}
Custom Objective focus: ${customObjective || "Synthesize primary lesson competencies"}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim() || "{}";
    const data = JSON.parse(text);
    res.json(data);
  } catch (err: any) {
    console.error("AI Ticket Generation Error:", err);
    res.status(500).json({ error: err.message || "Failed to generate ticket." });
  }
});

// --- AI Single Question Regeneration API ---
app.post("/api/regenerate-question", async (req, res) => {
  try {
    const { idx, ticket } = req.body;
    const ai = getGeminiClient();

    const targetTier = idx === 0 ? "Basic (Tier I)" : idx === 1 ? "Mastery (Tier II)" : "Advanced (Tier III)";
    const systemInstruction = `You are an elite Louisiana assessment designer. 
Generate exactly ONE exit ticket question of tier: "${targetTier}".
Subject: ${ticket.subject}, Grade: ${ticket.grade}, Module: ${ticket.module}, Lesson: ${ticket.lesson}
Objective: ${ticket.objective || "Core lesson criteria"}

Return strictly a JSON object matching this schema:
${
  idx === 0
    ? `{
  "tier": "Basic (Tier I)",
  "type": "MC",
  "questionText": "Direct multiple-choice baseline challenge.",
  "options": ["Correct Answer", "Option B", "Option C", "Option D"],
  "correctAnswer": "Correct Answer"
}`
    : idx === 1
    ? `{
  "tier": "Mastery (Tier II)",
  "type": "EBSR",
  "partAQuestion": "Part A claim.",
  "partAOptions": ["Correct A", "Distractor B", "Distractor C", "Distractor D"],
  "partACorrect": "Correct A",
  "partBQuestion": "Part B evidence.",
  "partBOptions": ["Correct quote", "Distractor quote Y", "Distractor quote Z"],
  "partBCorrect": "Correct quote"
}`
    : `{
  "tier": "Advanced (Tier III)",
  "type": "MS_ADV",
  "questionText": "Multi-select rigorous prompt.",
  "claimOptions": ["Correct Option 1", "Correct Option 2", "Distractor Option 3", "Distractor Option 4"],
  "correctClaims": ["Correct Option 1", "Correct Option 2"]
}`
}
Ensure absolute rigor. No extra wrapper tags. Return raw parseable JSON object.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: "Regenerate single question now.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim() || "{}";
    const data = JSON.parse(text);
    res.json(data);
  } catch (err: any) {
    console.error("Single Question Regeneration Error:", err);
    res.status(500).json({ error: err.message || "Failed to regenerate question." });
  }
});

// --- AI Intervention Reflection Grading API ---
app.post("/api/grade-intervention", async (req, res) => {
  try {
    const { prompt, studentAnswer, skillFocus } = req.body;
    const clean = (studentAnswer || "").trim();

    // Fast check for trivial input
    if (clean.length < 5) {
      return res.json({
        isCorrect: false,
        pointsAwarded: 0,
        feedback: "Your reflection is too brief. Please provide a complete sentence explaining your strategic approach.",
      });
    }

    const ai = getGeminiClient();
    const systemInstruction = `You are an automated curriculum grading assistant specializing in Louisiana Student Standards (LDOE) and LEAP assessments.
Evaluate the correctness and conceptual depth of a student's brief reflection answering a standard-focused intervention prompt.

Standard Focus/Skill: "${skillFocus}"
Question Prompt: "${prompt}"
Student's Written Answer: "${studentAnswer}"

Evaluate if the student provided a meaningful, logical answer to the prompt.
Do NOT reward low-effort responses, single words (e.g. "yes", "nice"), repeating letters ("asdfasdf"), placeholder statements (e.g. "idk", "nothing"), or totally unrelated off-topic claims. They must earn 0 points.
If the answer is a genuine, coherent attempt that makes sense in the context of the standard/skill, mark it as correct and award 20 points.

Output strictly a JSON object with this schema:
{
  "isCorrect": true or false,
  "pointsAwarded": 20 or 0,
  "feedback": "A very brief, supportive, 1-sentence diagnostic response explaining why their standard reflection is correct or how they can improve."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: "Evaluate reflection answer now.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim() || "{}";
    const data = JSON.parse(text);
    res.json(data);
  } catch (err: any) {
    console.error("Grading API Error:", err);
    // Fallback heuristic evaluation if Gemini fails
    const clean = (req.body.studentAnswer || "").trim();
    if (clean.length >= 15 && clean.split(/\s+/).length >= 4) {
      res.json({
        isCorrect: true,
        pointsAwarded: 20,
        feedback: `Reflection validated! Your response thoughtfully addresses standard "${req.body.skillFocus}".`,
      });
    } else {
      res.json({
        isCorrect: false,
        pointsAwarded: 0,
        feedback: "Please write a full explanation of the strategy in complete sentences.",
      });
    }
  }
});

// --- Vite Middleware / Static Server ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
