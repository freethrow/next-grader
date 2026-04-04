// ---------------------------------------------------------------------------
// JSON output schema instruction (shared across all levels)
// ---------------------------------------------------------------------------

export const JSON_SCHEMA_INSTRUCTION = `
You MUST respond with ONLY a valid JSON object — no markdown, no code fences, no explanation, no text before or after the JSON.
The JSON must exactly match this structure:

{
  "inferred_title": "<5–10 word title inferred from essay content>",
  "band_scores": {
    "content": <integer 0–5>,
    "communicative_achievement": <integer 0–5>,
    "organisation": <integer 0–5>,
    "language": <integer 0–5>
  },
  "cefr_indication": "<e.g. C2 (borderline) — brief justification>",
  "commentary": {
    "content": "<evidence list then verdict — see grading protocol>",
    "communicative_achievement": "<evidence list then verdict>",
    "organisation": "<evidence list then verdict>",
    "language": "<evidence list then verdict>"
  },
  "strengths": [
    "<strength with quoted text reference>",
    "<strength>",
    "<strength>"
  ],
  "areas_for_development": [
    "<area → concrete suggested revision>",
    "<area → concrete suggested revision>"
  ],
  "key_errors": {
    "grammar": ["<quoted error example>"],
    "word_choice": ["<quoted error example>"],
    "collocation": ["<quoted error example>"]
  }
}

Rules:
- Only include error categories where errors were actually found.
- All keys must be exactly as shown — snake_case, lowercase.
- Commentary fields must follow the evidence-first format described in the grading protocol.
`

// ---------------------------------------------------------------------------
// Task-type genre guidance (shared across levels)
// ---------------------------------------------------------------------------

export const TASK_TYPE_GUIDANCE = {
  essay: `
**Genre: Essay**
- Discursive or argumentative prose addressed to a teacher or educated audience.
- Requires a clear thesis, developed arguments with supporting evidence, and a conclusion.
- Communicative Achievement: assess whether the register is appropriately formal/semi-formal, ideas are developed rather than listed, and the writing engages the reader intellectually.
- Organisation: look for an introduction, logically sequenced body paragraphs, and a conclusion. Transitions between ideas are essential.`,

  article: `
**Genre: Article**
- Written for a magazine, website, or newsletter. Audience may be general or specialised.
- Requires an engaging title/heading, a hook opening, and often a direct address to the reader.
- Communicative Achievement: assess whether the tone is engaging and appropriate for the target publication, not overly formal. Personal anecdotes or rhetorical questions are characteristic features.
- Organisation: expect a punchy title, varied paragraph lengths, and a memorable closing.`,

  letter: `
**Genre: Formal or semi-formal letter**
- May be a letter of application, complaint, recommendation, or reference.
- Requires appropriate salutation and sign-off (Dear Sir/Madam → Yours faithfully; Dear [Name] → Yours sincerely).
- Communicative Achievement: assess whether conventions (opening/closing formulae, formal register, clear purpose statement) are correctly applied.
- Organisation: introduction stating purpose, body developing points in separate paragraphs, conclusion with call to action or closing remark.`,

  email: `
**Genre: Formal or semi-formal email**
- Similar to a letter but may be slightly less formal. Subject line expected.
- Communicative Achievement: assess appropriate register for the recipient (colleague vs. stranger), clear subject line, and professional tone.
- Organisation: brief greeting, clear purpose in opening, organised body, polite close.`,

  report: `
**Genre: Report**
- Factual, structured document for a specific reader (manager, committee, etc.).
- Requires section headings (Introduction, Findings, Recommendations, Conclusion).
- Communicative Achievement: assess whether the report conventions are followed — impersonal register, use of headings, factual and objective tone. No personal narrative.
- Organisation: rigid structure with labelled sections is expected and rewarded.`,

  review: `
**Genre: Review**
- Critical evaluation of a book, film, restaurant, product, event, etc.
- Requires a clear recommendation and a balance of description and evaluation.
- Communicative Achievement: assess whether the review informs AND evaluates, uses an appropriate register for the target publication, and ends with a clear recommendation.
- Organisation: brief description → evaluation of key aspects → overall recommendation.`,

  story: `
**Genre: Story**
- Narrative writing, often with a given opening or closing sentence.
- Requires a clear narrative arc: setting, build-up, climax, resolution.
- Communicative Achievement: assess narrative technique — use of descriptive language, varied sentence rhythm, dialogue if appropriate, and engagement of the reader.
- Organisation: chronological or non-linear structure should be controlled and purposeful.`,
}
