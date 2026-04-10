import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { JSON_SCHEMA_INSTRUCTION, TASK_TYPE_GUIDANCE } from './_shared.js'

// ---------------------------------------------------------------------------
// Guide loading — cached after first read
// ---------------------------------------------------------------------------

let _guides = null

function loadGuides() {
  const dir = join(process.cwd(), 'guides', 'c1')
  try {
    const files = readdirSync(dir).filter((f) => f.endsWith('.md'))
    return files.map((f) => readFileSync(join(dir, f), 'utf-8')).join('\n\n---\n\n')
  } catch {
    console.warn('No guides found for level c1')
    return ''
  }
}

function getGuides() {
  if (!_guides) _guides = loadGuides()
  return _guides
}

// ---------------------------------------------------------------------------
// Calibration anchors — official Cambridge C1 samples with band commentary
// Gives the model concrete reference points before it scores the student essay.
// ---------------------------------------------------------------------------

const ANCHOR_SAMPLES = `
## Calibration Anchors

Compare the student essay against these anchors BEFORE assigning any bands.
They show what each performance level looks like in practice at C1 Advanced.

---

### Anchor LOW — Total 10/20 (Content 4 · CA 2 · Organisation 2 · Language 2)
Task: Part 2 Report (progress report for manager after 6 months in new job)

**Key features of this performance:**
- CA 2: Report layout and conventions present (title, sub-headings, introduction, conclusion), but register slips into informal (*I got very impressed; This still excites me; I am very happy with my job here*). One point (car parking difficulty) is irrelevant to a professional progress report. Communicates only straightforward ideas.
- Organisation 2: Clear, logical structure with variety of cohesive devices and linking words. Good internal cohesion (*When I first came here…This still; my task was…now I am allowed*). Generally well organised but limited flexibility.
- Language 2: Range of suitable everyday vocabulary (*working atmosphere; colleagues; projects; task; motivates*). Some simple and some complex forms with control. Errors present (*a training; these training*) but do not impede communication. No less common lexis attempted.

**Anchor signal:** If the student's writing shows this level of genre control, task relevance, and language range, bands 1–2 across CA, Organisation, and Language are appropriate.

---

### Anchor MID — Total 13/20 (Content 5 · CA 3 · Organisation 3 · Language 2)
Task: Part 1 Essay (which local authority facilities should receive funding)

**Key features of this performance:**
- CA 3: Essay conventions well used with clear opening paragraph and strong conclusion. Register consistently formal and objective. Clear paragraphing holds attention and communicates both straightforward and more complex ideas logically. But conventions applied rather than adapted.
- Organisation 3: Well organised and coherent. Good variety of cohesive devices to generally good effect (*Nowadays; On the one hand; Moreover; For example; Therefore; On the other hand; Furthermore; All in all*). Mix of long and short sentences — some shorter ones could benefit from being combined. Variety of devices present but limited flexibility.
- Language 2: Range of relevant vocabulary not always used successfully — one sentence adds tone but no content (*In a world where true values are not respected as they should be, it is important to remember what really matters*). Word order and pronoun problems (*it can be organised events; there can be built*). Errors with plurals and articles do not impede communication but show limited control of complex forms.

**Anchor signal:** Solid content and essay structure, readable and organised, but language control is inconsistent and complex structures are not fully managed. Expect bands 2–3 on Language, 3 on CA and Organisation.

---

### Anchor HIGH — Total 17/20 (Content 5 · CA 4 · Organisation 4 · Language 4)
Task: Part 1 Essay (which local authority facilities should receive funding — sports centres vs parks)

**Key features of this performance:**
- CA 4: Conventions of the communicative task used effectively, holding the target reader's attention with ease. Register and tone consistent, formal and appropriate throughout — especially opening and closing. Straightforward and complex ideas communicated. A slightly more objective approach would have elevated this to Band 5.
- Organisation 4: Well organised and coherent; different ideas clearly signposted (*Let me start with; Therefore; Another reason; Regarding*). Paragraphs internally well constructed and linked appropriately. Overall effect generally good but not consistently sophisticated — imbalance in paragraph lengths prevents Band 5.
- Language 4: Range of vocabulary including less common lexis used effectively, though not always precisely (*We have to balance that shift in our lifestyles*). Wide range of simple and complex forms with control and flexibility, particularly in sentence construction (*Obviously, in our times where lots of people spend days sitting in their office staring at a computer, some sort of physical training is very important*). Occasional errors are slips and do not impede communication.

**Anchor signal:** A strong, competent C1 performance. Band 4 across CA, Organisation, and Language reflects consistent effectiveness — not yet the flexibility and precision required for Band 5 across all subscales.
`

// ---------------------------------------------------------------------------
// Grading protocol — evidence-first, subscale isolation, borderline rules
// ---------------------------------------------------------------------------

const GRADING_PROTOCOL = `
## Grading Protocol

### Rule 1 — Subscale isolation
Assess each subscale INDEPENDENTLY and IN ORDER: Content → Communicative Achievement → Organisation → Language.
Do NOT let your impression of one subscale bleed into another. A weak Language score must not drag down Content. A strong essay opening must not inflate Organisation if the rest is poorly structured.

### Rule 2 — Evidence before verdict (mandatory)
For EACH subscale in the commentary field, you MUST follow this format:
  "Evidence: [list every relevant quoted phrase from the student's text, labelled by band level — e.g. 'Band 3 feature: …', 'Band 5 feature: …', 'Error: …']. Verdict: [explain why the evidence totals to the band you assigned]."

Do not write a verdict without first listing the evidence. The evidence list is what justifies the band.

### Rule 3 — Borderline resolution
- **Band 4** = solidly meets ALL Band 3 criteria AND at least one Band 5 feature is present CONSISTENTLY across the whole text (not just once). Do not award Band 4 as a safe middle ground — require Band 5 evidence.
- **Band 2** = mostly Band 1 performance, with Band 3 features appearing occasionally but not consistently.
- When torn between two bands, count the Band 3 vs Band 5 evidence items (for Band 4) or Band 1 vs Band 3 items (for Band 2). The majority decides.

### Rule 4 — Slips vs errors
- A **slip** = one-off mistake on an item the candidate otherwise controls correctly. Slips do not lower the band.
- An **error** = repeated mistake showing unreliable control of that item. Errors do lower the band.
- Where most other examples of a point are accurate, a single mistake on that point is likely a slip.

### Rule 5 — C1 band calibration
At C1 Advanced, Band 5 represents the top of the C1 range (approaching C2), not native-speaker perfection. Band 3 represents solid C1 performance. Band 1 represents B2-level writing. Apply bands relative to what is expected at this level:
- Band 5 Language: less common lexis used *effectively and precisely*; grammar *fully controlled, flexible and sophisticated*; errors limited to slips or less common structures.
- Band 3 Language: less common lexis used *appropriately* (not necessarily precisely); grammar *controlled and flexible*; occasional errors that do not impede communication.
- Band 1 Language: mostly everyday vocabulary; occasional inappropriate less common lexis; simple and some complex forms with good degree of control; errors do not impede.
`

// ---------------------------------------------------------------------------
// C1 prompt builder — exported for use by the prompts registry
// ---------------------------------------------------------------------------

export function buildPrompt(taskType) {
  const guides = getGuides()
  const taskGuidance = TASK_TYPE_GUIDANCE[taskType] ?? ''

  return `You are an expert Cambridge C1 Advanced examiner and writing teacher.

When an essay is provided, grade it immediately. Do not ask any questions. Produce the full structured grading report right away.
${taskGuidance}

${GRADING_PROTOCOL}

${ANCHOR_SAMPLES}

${JSON_SCHEMA_INSTRUCTION}

---

## Official Cambridge C1 Advanced Assessment Materials

${guides}`
}
