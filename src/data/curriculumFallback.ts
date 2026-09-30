export interface CurriculumTemplate {
  objective: string;
  remediationSkill: string;
  tier1: {
    questionText: string;
    options: string[];
    correctAnswer: string;
  };
  tier2: {
    partAQuestion: string;
    partAOptions: string[];
    partACorrect: string;
    partBQuestion: string;
    partBOptions: string[];
    partBCorrect: string;
  };
  tier3: {
    questionText: string;
    claimOptions: string[];
    correctClaims: string[];
  };
  intervention: {
    skillFocus: string;
    q1Text: string;
    q1Options: string[];
    q1Correct: string;
    q2Text: string;
    q2Options: string[];
    q2Correct: string;
    q3Text: string;
  };
}

export function generateCurriculumTicket(params: {
  subject: string;
  grade: string;
  module: string;
  lesson: string;
  customObjective?: string;
}) {
  const { subject, grade, module, lesson, customObjective } = params;
  const isMath = subject.toLowerCase().includes("math") || subject.toLowerCase().includes("eureka");
  const isScience = subject.toLowerCase().includes("science") || subject.toLowerCase().includes("amplify");
  const isELA = !isMath && !isScience;

  const cleanLesson = lesson || "Lesson Review";
  const cleanModule = module || "Foundational Standards";

  if (isELA) {
    const objective = customObjective || `Analyze character development, theme, and determine textual evidence in alignment with Louisiana Student Standards (RL/RI).`;
    return {
      subject,
      grade,
      module,
      lesson,
      objective,
      remediationSkill: "Evidence-Based Textual Analysis & Key Ideas",
      questions: [
        {
          tier: "Basic (Tier I)",
          type: "MC",
          questionText: `Based on the lesson focus in "${cleanLesson}", which statement best describes the primary central message or central theme demonstrated by the characters?`,
          options: [
            "True strength and courage come from facing challenges to protect or help others.",
            "Success is only achieved through individual physical ability and speed.",
            "Avoiding difficult decisions always leads to the safest outcome for the group.",
            "Characters must change their external appearance to earn the trust of their peers."
          ],
          correctAnswer: "True strength and courage come from facing challenges to protect or help others."
        },
        {
          tier: "Mastery (Tier II)",
          type: "EBSR",
          partAQuestion: `Part A: How does the narrator or author develop the perspective of the main character throughout this selection?`,
          partAOptions: [
            "By showing how their internal reflections and actions shift when faced with an unexpected obstacle.",
            "By directly listing factual character traits through third-person descriptions only.",
            "By contrasting their decisions against a completely unrelated background setting.",
            "By emphasizing only their external dialogue without revealing their motives."
          ],
          partACorrect: "By showing how their internal reflections and actions shift when faced with an unexpected obstacle.",
          partBQuestion: `Part B: Which quote or detail provides the strongest textual evidence supporting your answer to Part A?`,
          partBOptions: [
            "\"Though uncertain of the outcome, he stepped forward, knowing that staying behind was no longer an option.\"",
            "\"The weather had grown cooler as evening approached across the valley.\"",
            "\"Other villagers gathered at the town square as they did every morning.\"",
            "\"He turned to glance at the path winding backward toward the hills.\""
          ],
          partBCorrect: "\"Though uncertain of the outcome, he stepped forward, knowing that staying behind was no longer an option.\""
        },
        {
          tier: "Advanced (Tier III)",
          type: "MS_ADV",
          questionText: `Which TWO statements accurately evaluate how the author's structure and word choice contribute to the overall meaning? (Select TWO)`,
          claimOptions: [
            "The author uses descriptive sensory imagery to build tension before the climax.",
            "The sequence of events highlights the character's internal growth over time.",
            "The narrator ignores the perspective of other key figures in the story.",
            "The author relies exclusively on technical jargon to describe emotional moments."
          ],
          correctClaims: [
            "The author uses descriptive sensory imagery to build tension before the climax.",
            "The sequence of events highlights the character's internal growth over time."
          ]
        }
      ],
      intervention: {
        skillFocus: "Identifying Central Ideas & Supporting Quotes",
        q1Text: "Concept Check: When asked to identify the central idea or theme of a text, what should you look for?",
        q1Options: [
          "The recurring life lesson or message revealed through how characters respond to problems.",
          "A minor factual detail mentioned only once in the first sentence.",
          "The exact dictionary definition of the title.",
          "The total number of paragraphs in the passage."
        ],
        q1Correct: "The recurring life lesson or message revealed through how characters respond to problems.",
        q2Text: "Strategy Check: In an Evidence-Based Selected Response (EBSR) item, what is the best strategy for answering Part B?",
        q2Options: [
          "Choose the quote that directly proves the exact claim selected in Part A, not just an interesting detail.",
          "Pick the longest quote available in the answer options.",
          "Select the first quote you find in the passage regardless of Part A."
        ],
        q2Correct: "Choose the quote that directly proves the exact claim selected in Part A, not just an interesting detail.",
        q3Text: "Reflection: In one complete sentence, explain how you will use textual evidence to justify your answers on tomorrow's assessment."
      }
    };
  }

  if (isMath) {
    const objective = customObjective || `Apply conceptual understanding, visual models, and multi-step reasoning to solve mathematical problems (${cleanModule}).`;
    return {
      subject,
      grade,
      module,
      lesson,
      objective,
      remediationSkill: "Multi-Step Modeling & Mathematical Precision",
      questions: [
        {
          tier: "Basic (Tier I)",
          type: "MC",
          questionText: `For the skills addressed in "${cleanLesson}", which mathematical equation or representation correctly models the problem?`,
          options: [
            "Representing the relationship using equal groups/units: total = unit_size × number_of_units.",
            "Adding all numbers in the problem without considering their units or operations.",
            "Multiplying the smallest number by 10 and ignoring the remainder.",
            "Subtracting the unit count from the total regardless of the context."
          ],
          correctAnswer: "Representing the relationship using equal groups/units: total = unit_size × number_of_units."
        },
        {
          tier: "Mastery (Tier II)",
          type: "EBSR",
          partAQuestion: `Part A: A student is solving a multi-step problem modeled in this lesson. What is the correct value of the unknown quantity?`,
          partAOptions: [
            "The exact calculated value derived by decomposing into known units or partial products.",
            "An estimate obtained by rounding all factors to the nearest hundred before computing.",
            "A value found by executing only the first operation and stopping.",
            "A number twice as large because unit conversion was inverted."
          ],
          partACorrect: "The exact calculated value derived by decomposing into known units or partial products.",
          partBQuestion: `Part B: Which mathematical justification correctly verifies why your answer to Part A is correct?`,
          partBOptions: [
            "Using the inverse operation or an area/tape model shows that the units compose back to the original total.",
            "The result is an even number, so it must be mathematically sound.",
            "Adding the digits of the result equals 9, which proves the answer.",
            "Estimation always yields identical values to the standard algorithm."
          ],
          partBCorrect: "Using the inverse operation or an area/tape model shows that the units compose back to the original total."
        },
        {
          tier: "Advanced (Tier III)",
          type: "MS_ADV",
          questionText: `Select TWO statements that represent mathematically sound strategies or properties that can be used to solve or verify this problem:`,
          claimOptions: [
            "The Distributive Property allows decomposing a complex factor into friendlier addends.",
            "Checking reasonableness by rounding verifies that the solution is in the appropriate magnitude range.",
            "The Commutative Property can be applied to subtraction and division operations without changing values.",
            "Disregarding the fractional part of a remainder produces an exact solution in all contexts."
          ],
          correctClaims: [
            "The Distributive Property allows decomposing a complex factor into friendlier addends.",
            "Checking reasonableness by rounding verifies that the solution is in the appropriate magnitude range."
          ]
        }
      ],
      intervention: {
        skillFocus: "Visual Representations & Multi-Step Decomposition",
        q1Text: "Concept Check: When solving a word problem with multiple steps, what is the crucial first step?",
        q1Options: [
          "Identify what the question is asking and sketch a model (tape diagram or number bond) of the known quantities.",
          "Immediately multiply the two largest numbers together.",
          "Write down the answer you guess before calculating.",
          "Ignore units of measurement until the very end."
        ],
        q1Correct: "Identify what the question is asking and sketch a model (tape diagram or number bond) of the known quantities.",
        q2Text: "Strategy Check: What is the most effective way to check your work on multi-digit computation?",
        q2Options: [
          "Use the inverse operation or a secondary visual model to check for calculation accuracy.",
          "Re-read the question quickly without recalculating.",
          "Check whether the final digit ends in zero."
        ],
        q2Correct: "Use the inverse operation or a secondary visual model to check for calculation accuracy.",
        q3Text: "Reflection: Describe the specific strategy or visual model you find most helpful when tackling multi-step math problems."
      }
    };
  }

  // Science
  const objective = customObjective || `Investigate phenomenon-based scientific questions using evidence, models, and reasoning (${cleanLesson}).`;
  return {
    subject,
    grade,
    module,
    lesson,
    objective,
    remediationSkill: "Scientific Claims, Evidence & Systems Thinking",
    questions: [
      {
        tier: "Basic (Tier I)",
        type: "MC",
        questionText: `In the context of "${cleanLesson}", which statement best describes the cause-and-effect relationship observed in the system?`,
        options: [
          "A change in one part of the system directly affects the transfer of energy or forces to the other parts.",
          "Components in a scientific system operate independently without any energy or material exchanges.",
          "Forces only act when two objects are in direct physical contact with one another.",
          "Environmental conditions never influence the survival or traits of an organism."
        ],
        correctAnswer: "A change in one part of the system directly affects the transfer of energy or forces to the other parts."
      },
      {
        tier: "Mastery (Tier II)",
        type: "EBSR",
        partAQuestion: `Part A: Based on data gathered in this investigation, which scientific claim is best supported?`,
        partAOptions: [
          "The observed change in the system is directly caused by the unbalanced forces or energy inputs.",
          "The system will return to equilibrium without any external force or energy transfer.",
          "The data collected indicates that environmental variables had no measurable effect.",
          "The initial observations were random and show no consistent scientific pattern."
        ],
        partACorrect: "The observed change in the system is directly caused by the unbalanced forces or energy inputs.",
        partBQuestion: `Part B: Which piece of observational or empirical data provides the strongest evidence supporting Part A?`,
        partBOptions: [
          "Controlled trial measurements showed a consistent increase in motion or conversion whenever the input was applied.",
          "An untested opinion stated by an observer during initial brainstorming.",
          "Data recorded under completely different temperature and pressure conditions.",
          "A single outlier measurement taken before calibration of the instruments."
        ],
        partBCorrect: "Controlled trial measurements showed a consistent increase in motion or conversion whenever the input was applied."
      },
      {
        tier: "Advanced (Tier III)",
        type: "MS_ADV",
        questionText: `Which TWO conclusions can be scientifically justified based on system models and empirical evidence? (Select TWO)`,
        claimOptions: [
          "Energy cannot be created or destroyed; it can only be converted from one form to another.",
          "Repeated trials and controlled variables increase the reliability of scientific explanations.",
          "A single experimental trial is sufficient to establish a universal scientific law.",
          "Models are always 100% exact replicas of real-world phenomena without simplifications."
        ],
        claimOptionsValid: [
          "Energy cannot be created or destroyed; it can only be converted from one form to another.",
          "Repeated trials and controlled variables increase the reliability of scientific explanations."
        ],
        correctClaims: [
          "Energy cannot be created or destroyed; it can only be converted from one form to another.",
          "Repeated trials and controlled variables increase the reliability of scientific explanations."
        ]
      }
    ],
    intervention: {
      skillFocus: "Connecting Evidence to Scientific Explanations",
      q1Text: "Concept Check: What makes evidence scientifically strong when supporting a claim?",
      q1Options: [
        "It comes from measurable, repeatable observations and controlled data collection.",
        "It is based on personal feelings or an untested hypothesis.",
        "It includes only observations that agree with the initial guess while ignoring others.",
        "It is the quickest answer suggested during group discussion."
      ],
      q1Correct: "It comes from measurable, repeatable observations and controlled data collection.",
      q2Text: "Strategy Check: When constructing an argument (Claim, Evidence, Reasoning), what does Reasoning do?",
      q2Options: [
        "It explains the scientific principle that connects the evidence directly to the claim.",
        "It restates the claim using different words without referencing data.",
        "It lists all the materials used in the laboratory experiment."
      ],
      q2Correct: "It explains the scientific principle that connects the evidence directly to the claim.",
      q3Text: "Reflection: Write one scientific principle or concept from this lesson that you will apply when analyzing models in the future."
    }
  };
}
