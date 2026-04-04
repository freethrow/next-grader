import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { JSON_SCHEMA_INSTRUCTION, TASK_TYPE_GUIDANCE } from './_shared.js'

// ---------------------------------------------------------------------------
// Guide loading — cached after first read
// ---------------------------------------------------------------------------

let _guides = null

function loadGuides() {
  const dir = join(process.cwd(), 'guides', 'c2')
  try {
    const files = readdirSync(dir).filter((f) => f.endsWith('.md'))
    return files.map((f) => readFileSync(join(dir, f), 'utf-8')).join('\n\n---\n\n')
  } catch {
    console.warn('No guides found for level c2')
    return ''
  }
}

function getGuides() {
  if (!_guides) _guides = loadGuides()
  return _guides
}

// ---------------------------------------------------------------------------
// Calibration anchors — official Cambridge samples with band commentary
// Gives the model concrete reference points before it scores the student essay.
// ---------------------------------------------------------------------------

const ANCHOR_SAMPLES = `
## Calibration Anchors

Compare the student essay against these anchors BEFORE assigning any bands.
They show what each performance level looks like in practice.

---

### Anchor LOW — Total 7/20 (Content 4 · CA 1 · Organisation 1 · Language 1)
Task: Part 1 Essay (Technology)

> First text suggest that nowadays the population is experiencing the new innovations and technologies with extremely fast tempo. This process has a massive impact on both: older and younger generations. Youngsters cope with the new technologies in different way in comparison to eldery people. They adapt new things rather quiet easily, because they do get used to things rather quickly. Often, older people require more time to accept changes in order to start feeling comfortable with them. Our respond and positive attitude is crucial if we are willing to progress and make changes for a future generations. If the society opens up for the new innovations we are going to face a bright future in front of us. Exploring things is the key to success.
>
> Second text on the other hand suggest that society should not feel rushed to use new technologies as every human being needs a decent amount of time for the essential practice and preparation, especially in workplaces. The proper training is highly important as it gives a chance to get familiar with the up-coming innovations before using them on the daily basis. As the result people will experience more effective ways of making tasks.
>
> Both text shows the importance of accepting the new technologies. It does come with a variety of different benefits for the entire population. To add up, the future lies in our hands.

**Why these scores:**
- CA 1: No introduction; essay conventions used but only at a basic level — organises by text ("First text… Second text") rather than by argument. Straightforward ideas only.
- Organisation 1: Coherent but limited range of cohesive devices. Devices used to generally good effect ("Second text on the other hand", "As the result") but no flexibility or variety.
- Language 1: Some less common lexis ("has a massive impact", "the future lies in our hands"). Repeated errors: "quiet easily", "Our respond", "Second text … suggest", "un-ordinary" — errors don't impede communication.

**Anchor signal:** If the student essay shows this level of argument development, genre handling, and language control, bands 1–2 across CA, Organisation, Language are appropriate.

---

### Anchor MID — Total 16/20 (Content 5 · CA 4 · Organisation 3 · Language 4)
Task: Part 1 Essay (Technology)

> It is an undeniable truth that technology has become a mainstay in our lives. From our personal lives to our public sphere tasks, there is a perpetual flow of gadgets and gizmos creeping into our environments to assist us with our activities. And what's not to like? For the most part, even the most monotonous of tasks have become more quicker and easier with the help of these inventions.
>
> However, Of course, there are those who are not yet completely comfortable with this notion. The sheer acceleration with which new technologies are brought to life is enough to make any tradition-oriented person run for the hills! In fact, it has been proven that an individual's ability to 'cope' with this phenomenon mirrors their character; people who hold tighter reins on the happenings in their lives tend to welcome the change, whereas those who are less confident see it as a threat to a certain degree.
>
> This leads to an impasse in the workplace; an employee probably cannot avoid working with new technology simply because they are less confident. Therefore, it is imperative that works are effectively and practically trained so that they can be in control, and thus have no qualms about new innovations.

**Why these scores:**
- CA 4: Essay conventions used naturally and flexibly. Informal tone engages reader consistently ("And what's not to like?", "run for the hills!"). Combines evaluation with writer's opinions convincingly.
- Organisation 3: Well-organised coherent whole. Cohesive devices used with flexibility ("whereas those who are less confident", "and thus", "as it paves the way"). Not quite Band 4 — limited variety of organisational patterns.
- Language 4: Less common lexis used with sophistication ("undeniable truth", "mainstay", "perpetual flow", "monotonous", "mirrors their character", "imperative", "no qualms"). Grammar natural; minimal errors ("more quicker" — slip).

**Anchor signal:** Solid control, good range, clear genre command. If the student essay matches this profile, expect bands 3–4 across most subscales.

---

### Anchor HIGH — Total 20/20 (Content 5 · CA 5 · Organisation 5 · Language 5)
Task: Part 1 Essay (Social Norms)

**Official commentary (no extract needed — use features as the standard):**
- CA 5: Complete command of essay conventions. Opening rhetorical question engages the reader. Complex, abstract ideas communicated convincingly throughout — not just in places.
- Organisation 5: Organised impressively and coherently. Paragraph divisions clearly support the argument. Opening question returned to in conclusion — architectural coherence. Wide range of cohesive devices used with complete flexibility ("Some people…, However, Similarly, The key…, In general").
- Language 5: Wide range including less common lexis with fluency, precision, sophistication ("social norms", "imaginative empathy", "unhealthily anxious"). Sophisticated, fully controlled, completely natural grammar. Inaccuracies only as slips — not errors.

**Anchor signal:** A single impressive sentence does not justify Band 5. The performance must be consistently sophisticated throughout the whole text. If the student essay shows this level of sustained control, Band 5 is warranted.
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
`

// ---------------------------------------------------------------------------
// C2 prompt builder — exported for use by the prompts registry
// ---------------------------------------------------------------------------

export function buildPrompt(taskType) {
  const guides = getGuides()
  const taskGuidance = TASK_TYPE_GUIDANCE[taskType] ?? ''

  return `You are an expert Cambridge C2 Proficiency examiner and writing teacher.

When an essay is provided, grade it immediately. Do not ask any questions. Produce the full structured grading report right away.
${taskGuidance}

${GRADING_PROTOCOL}

${ANCHOR_SAMPLES}

${JSON_SCHEMA_INSTRUCTION}

---

## Official Cambridge C2 Assessment Materials

${guides}`
}
