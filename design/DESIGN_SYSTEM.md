# InnerMirror Design System — v0.2 (draft)

Status: **draft for Founder review**, 2026-10-30. Nothing here authorizes Phase 1 UI work.
Visual reference: `design/showcase/index.html` (offline). Token values: `design/showcase/tokens.css` (the file Phase 1 ports, not re-derives).
Decisions: `design/OPEN_DECISIONS.md`. Theory and terminology source of truth: `docs/THEORY_FOUNDATION.md`.

Labels: **[Approved]** = Founder decision or brand poster. **[Proposal]** = derived here; change freely.

**Changes from v0.1:** five-part functional model and names (D1), new transparent mascots with variants (D3), behavior-based descriptions (D4), light theme only (D5), VI terminology review (D6), interim logo usable (D2). Details at the end.

---

## 1. Brand foundations [Approved]

| | |
|---|---|
| Brand | InnerMirror |
| Tagline | Understand · Communicate · Be you (from the logo lockup) |
| Essence | "Meet your inner selves" |
| Philosophy | Reflective Playfulness |
| Personality | Empathetic, curious, wise, friendly, nonjudgmental, playful without being childish |

Design principles: reflection, not judgment · playful, not childish · calm, not clinical · AI observes, humans interpret · insights, not scores.

**In the UI [Proposal]:** the interface stays calm; the mascots carry the warmth. Play lives in characters and small moments, never in layout noise, gamification, or scores.

### Logo [Approved: Option A, octopus looking into a mirror]
- Variants (poster): horizontal (primary), stacked, app icon color / dark / mono, on-dark lockup.
- **Interim (D2):** `design/brand/logo-interim/` holds crops of the poster. They may be used in Phase 1 (app icon, header) until the source file arrives; they are low-resolution and carry the poster's near-white background, so place them only on light surfaces. Replace before the final submission if the file arrives.
- Never redraw, recolor, or re-typeset the wordmark. App header: app icon + "InnerMirror" as plain text.
- Clear space ≥ the mascot's eye height; minimum width 120px horizontal, 24px icon **[Proposal]**.

## 2. Ego-state model and mascots

### Model [Approved, D1]
- Foundation: Eric Berne, *Games People Play* (1964): three ego states, **Parent, Adult, Child**, and transactions between them.
- Product vocabulary: the **five-part functional model** from later Transactional Analysis (Dusay's egogram, Stewart & Joines). **Not Berne's own split; never attribute it to him.**
- Every label is a **hypothesis about a message**, never a diagnosis and never a property of a person. No state is better or worse; each has helpful and less helpful forms.

| Code | English | Vietnamese ¹ | Structural | Mascot | Description (EN) |
|---|---|---|---|---|---|
| `CP` | Critical Parent | Cha mẹ Phê phán | Parent | red, pointing | Sets standards, rules and limits. Can come across as firm or critical. |
| `NP` | Nurturing Parent | Cha mẹ Nuôi dưỡng | Parent | purple, holding a heart | Offers care, comfort and protection. Can slide into over-helping. |
| `A` | Adult | Người trưởng thành | Adult | blue, magnifier | Gathers facts and weighs options. Can come across as detached. |
| `FC` | Free Child | Trẻ em Tự do | Child | yellow, arms up | Expresses feelings and wants openly. Can be impulsive. |
| `AC` | Adapted Child | Trẻ em Thích nghi | Child | green, hands to mouth | Adjusts to others and to expectations. Can hold back own needs. |
| `UNCLEAR` | — | — | — | neutral "?" badge, not a mascot | Too short or ambiguous to read. |

¹ Approved terminology, pending linguistic review (D6). VI descriptions: `design/showcase/i18n.vi.js` (`ex.*.desc`).

Descriptions (D4) follow one pattern: *observable behavior* + *how it can come across*. Every state, Adult included, gets a less helpful side, so none reads as the goal.

Codes are language-neutral: data, prompts, schemas, CSS (`data-ex="cp"`), and asset filenames use them. Names appear only as UI text.

### Mascot assets [Approved artwork; variants Proposal]
```
design/brand/mascots/
  source/<code>.png        Founder's 1024² transparent PNGs, byte-identical. Never edit.
  full/<code>-512.png      Full body, square, shared scale (cards, onboarding)
  full/<code>-256.png      Same, for mobile and small cards
  badge/<code>-128.png     Head + identifying prop, for circular badges 28–64px
  build_variants.py        Regenerates full/ and badge/ from source/ (Pillow + numpy)
```
- One set for EN and VI. **No text in images**; names are UI text.
- Transparent backgrounds; sit directly on any light surface (bg, surface, sunken, lavender).
- `full/` uses one shared crop for all five, so relative scale is preserved: the Parent and Adult mascots read taller; the Child mascots smaller and rounder.
- `badge/` crops keep each mascot's identifying prop (NP's heart, A's magnifier, FC's stars, AC's hands) so they stay distinct at 28px.
- Variant cleanup only: four detached export specks (< 200px each: thin arcs above FC and AC, slivers beside A and below CP) are transparent in `full/` and `badge/`. Sources keep them. Founder may want clean re-exports (OPEN_DECISIONS D3).
- Phase 1 copies `full/` and `badge/` to `public/mascots/`.

### Usage rules
- Use as provided: never redraw, recolor, regenerate, restyle, or add effects.
- A mascot describes **one message**, never a person; a participant's mascot can change between messages. No "your type" results.
- Same slot size, same order (CP, NP, A, FC, AC), same treatment and baseline everywhere: no staggering, no spotlight on one mascot. The artwork keeps its shared scale, so the Child mascots look smaller and rounder by design (D12). Never present Adult as the target state.
- Always pair a mascot with its name (color and character are aids, not the only signal). Alt text = name in the UI language; decorative duplicates are `aria-hidden`.
- Not in safety notices, errors, legal or privacy text.
- Never alongside Meta's names, marks, or mascots (Meta ToS §7).

## 3. Color [Brand Approved; semantic Proposal]

### Brand palette
| Token | Hex | Role |
|---|---|---|
| `--im-brand-purple` | `#635BCE` | Primary: actions, links, focus, selection |
| `--im-brand-lavender` | `#EDE8FF` | Secondary: what belongs to the user (my bubbles, my selections, My Mirror) |
| `--im-brand-blue` | `#82B9F8` | Accent: highlights, illustration. **Never text** (2.0:1) |
| `--im-brand-bg` | `#FAFAFE` | Page background |
| `--im-brand-ink` | `#252344` | All text (14.4:1 on bg) |

### Semantic tokens (light theme only, D5)
| Token | Value | Use |
|---|---|---|
| `--im-bg` | `#FAFAFE` | Page |
| `--im-surface` | `#FFFFFF` | Cards, inputs, My interpretation |
| `--im-surface-sunken` | `#F4F2FB` | AI observation, info notices |
| `--im-surface-tint` | `#EDE8FF` | User-owned content only |
| `--im-border` / `-strong` | `#E3DFF3` / `#8D88AD` | Dividers / control boundaries (3.4:1) |
| `--im-text` / `-muted` | `#252344` / `#5E5A7E` | Text (≥ 5.4:1 on every surface) |
| `--im-primary` / `-strong` | `#635BCE` / `#4F47B8` | Button fill / hover (white text 5.4:1) |
| `--im-primary-ink` | `#4F47B8` | Purple text and links (`#635BCE` on lavender is only 4.49:1) |
| `--im-focus` | `#635BCE` | Focus ring |
| `--im-error-ink` | `#B42339` | Errors: border + icon + text on surface, never a rose fill |
| `--im-success-ink` / `-tint` | `#0E7462` / `#E2F6F2` | Saved, done |

### Ego-state colors
Identification aids, **not** rankings. Fill = mascot color [Approved]; tint and ink [Proposal].

| Code | Fill | Tint | Ink (≥ 4.8:1 on tint and white) |
|---|---|---|---|
| `cp` | `#FF5B6B` | `#FFE5E7` | `#C1283C` |
| `np` | `#C9A8FF` | `#F3ECFF` | `#7442C8` |
| `a` | `#82B9F8` | `#E4F0FD` | `#1F5FAE` |
| `fc` | `#FFC34D` | `#FFF1D4` | `#8A5600` |
| `ac` | `#60D6C0` | `#DCF6F1` | `#0E7462` |

Tokens: `--im-ex-<code>`, `--im-ex-<code>-tint`, `--im-ex-<code>-ink`. Components set `data-ex="<code>"` on `.im-ex` and read `--ex-fill / --ex-tint / --ex-ink`.
- Fills never carry text (all < 3:1 on white). Coral is not an error color.

## 4. Typography [Nunito Approved]
Nunito, weights 400/600/700/800, full Vietnamese coverage. Fallback `ui-rounded, system-ui, sans-serif`. Phase 1: `next/font/google`, `subsets: ["latin", "vietnamese"]`.

| Style | Size/line | Weight | Status | Use |
|---|---|---|---|---|
| Display | 40/48 | 800 | Proposal (D7) | Welcome headline, ≥ 640px |
| H1 | 32/40 | 700 | Approved | Page title |
| H2 | 24/32 | 700 | Approved | Screen title |
| H3 | 20/28 | 600 | Approved | Card titles, questions, insights |
| Body | 16/24 | 400 | Approved | Everything else; never below 16px for reading |
| Label | 14/20 | 600 | Proposal (D7) | Buttons (16px), labels, chips |
| Caption | 14/20 | 400 | Approved | Hints, metadata |

Measure 60–72ch. Hierarchy from size and weight, not color. No all-caps eyebrows above headings.

## 5. Spacing, layout, radius, elevation [Proposal]
- Spacing: 4px base, `4 8 12 16 24 32 48 64`. Tight inside groups, generous between, more space above headings than below.
- Layout: content max 1120px; gutter 16px (32px ≥ 768). Breakpoints: < 640 single column · 640–959 wider padding · ≥ 960 conversation + side panel. Use container queries for components shown at several widths.
- Touch targets ≥ 44px. Grid children get `min-width: 0` so long VI labels wrap instead of widening the page.
- Radius: 8 / 12 / 16 / 24 / pill; no sharp corners.
- Elevation: mostly surface color. `--im-shadow-1` (raised: My interpretation) and `--im-shadow-2` (sheets) only; neutral, offset, blurred.

## 6. Components [Proposal]
All live in the showcase.

- **Buttons:** pill, ≥ 44px, label 16/600, text wraps (never truncates). Primary (one per view), secondary, ghost. Disabled 45%; loading = spinner + verb in progress. Labels name the action.
- **Inputs:** 1.5px `border-strong`, radius 12, label above, hint below; error = border + icon + message naming the fix. Native checkbox with `accent-color`. Segmented "Which one is you?".
- **Chips:** dot (fill) + name (ink) on tint, 14px, wrap when long. "I'm not sure" chip is neutral.
- **Mascot badge:** white circle + `badge/` image + 2px ring in the state's style (§7). Sizes 28 (conversation), 40 (choices, lists), 56 (cards). The badge sits inside a ≥ 44px tap target together with its name chip.
- **Mascot card:** `full/` image, name, code + hex, description, badges.
- **Navigation:** 4-step stepper (Conversation → Observation → Interpretation → Mirror), 4px bar per step, step names always visible (they wrap, never truncate), `aria-current="step"`. A progress indicator, not links. Header: icon + name + language switch.
- **Notices:** info (`surface-sunken`), success (mint), error (surface + rose border + icon). **Safety:** plain surface, strong border, no mascot, support resources as the primary button (list pending, Q10); in the real flow it replaces the analysis.
- **Conversation:** others left with initial avatar, me right on lavender. Under each bubble: badge + chip as one button. Turning point = thin rule with label.
- **Interpretation choices:** radio cards with a 3:1 border (40px badge + name + 14px description). The AI's suggestion is labeled inside its own card ("The AI suggested"). Selected = expression ink border + tint + check mark. "I'm not sure" always last, neutral. One tab stop; arrow keys move and select.
- **Destructive actions** (delete reflection): confirm or short undo. Not in the showcase.

## 7. Three layers: AI Observation → My Interpretation → My Mirror [Approved principle; styling Proposal]
**The AI is not the final authority.** The user can agree, disagree, or stay unsure; the product supports reflection, never enforces a label.

| Layer | Look | Meaning |
|---|---|---|
| AI Observation | `surface-sunken`, **1.5px dashed** border, eye icon, muted header | A hypothesis on the table, not decided |
| My Interpretation | `surface`, **1.5px solid purple**, `shadow-1`, person icon | Mine: raised, owned, editable |
| My Mirror | `surface-tint`, no border, saved icon, insight in H3 | Kept. Preserves both perspectives: the AI's reading stays in a dashed provenance row next to my choice and my words |

Rules:
- AI copy is hedged: "might sound a bit like", "one possible reading", "another reading". Never "you are", "diagnosis", or verdicts.
- Each AI reading shows quoted cues (highlighted in the expression tint), a reading, an alternative when confidence isn't high, and **confidence in words only**. No dots, bars, numbers, or opacity.
- Readings of other people's messages stay on observable cues: no guesses at their feelings or motives. The flow opens on the user's own message first.
- The AI suggestion stays visible after the user chooses; the choice never overwrites it. When the user disagrees, the UI says that's expected ("You know what was going on").
- Badge buttons announce provenance: "AI suggestion: Adapted Child, high confidence".

**Badge states** (dashed → solid is the one signature motion: a hypothesis becoming owned):
| State | Look |
|---|---|
| AI suggestion | dashed ring in the expression **ink** (fills are too faint to carry the signal) |
| I agreed | solid ring + purple check |
| I chose differently | solid ring in my chosen expression + purple dot |
| I'm not sure | neutral circle with "?", always available |

## 8. Responsive [Proposal]
- Mobile first (390 baseline, works at 320). Observation details below the thread on narrow screens, sticky side panel ≥ 960.
- Mascot cards: 2 columns mobile, 3 tablet, 5 desktop. Choice cards: 1 column mobile, up to 4 desktop.
- Verified: no horizontal scroll at 320 and 390px in EN and VI.

## 9. Accessibility [Proposal, WCAG 2.2 AA]
- Text ≥ 4.5:1, control borders ≥ 3:1; fills never carry text.
- 2px focus ring, 2px offset, on every interactive element; defined in `components.css` so it ports with the components.
- No text under 14px; touch targets ≥ 44px.
- Radiogroup with roving focus; focus kept after selection.
- Color never alone: names with every mascot and color, confidence in words, errors with icon and text.
- `lang` follows UI language; alt text in UI language; `prefers-reduced-motion` removes transitions.

## 10. EN/VI localization
- Identical keys in `en`/`vi` dictionaries (showcase: 190/190). Codes stay language-neutral.
- Voice: "mình" for the user's own reflections ("Mình chưa chắc", "Cách mình hiểu"), "bạn" when the product addresses the user. Hedged like EN ("nghe có thể hơi giống").
- VI is 15–30% longer: buttons and chips wrap; no fixed-width text.
- Dates: `30 Oct` / `30/10`.
- Terminology under review: see OPEN_DECISIONS D6.

## 11. Motion [Proposal]
140ms hover/press, 220ms state, 360ms badge settle; ease-out `cubic-bezier(0.2, 0.8, 0.2, 1)`. One signature moment (badge dashed → solid). No scroll entrances, confetti, streaks, or celebrations. `prefers-reduced-motion` removes transitions.

## 12. Voice [Approved direction, docs/UX_DESIGN.md]
Gentle, short, second person. Never "you are", "diagnosis", "toxic", "narcissist". Every expression has a helpful and a less helpful side.

---

## Appendix A — Parked dark theme (D5, not maintained)
Not shipped in the MVP and removed from `tokens.css`. Starting values if dark mode returns: bg `#17152B`, surface `#211E3B`, sunken `#1B1932`, tint `#2E2A55`, border `#353159` / `#7D78A6`, text `#EEEBFF` / `#ABA6D2`, primary `#6A62D8` (white 4.8:1), primary-ink and focus `#A9A3FF`. Expression inks: cp `#FF8A95`, np `#D4BBFF`, a `#9CC8FA`, fc `#FFCF6E`, ac `#7EE0CD`. Re-verify contrast before use.

## Appendix B — Changes from v0.1
| Area | v0.1 | v0.2 |
|---|---|---|
| Model | Berne GPP forms (Direct/Indirect Parent, Natural/Adapted Child) on the stickers | Five-part functional model CP/NP/A/FC/AC (D1), Berne kept as foundation |
| VI names | From stickers | Cha mẹ Phê phán, Cha mẹ Nuôi dưỡng, Người trưởng thành, Trẻ em Tự do, Trẻ em Thích nghi |
| Mascots | Opaque white PNGs, labels baked in, EN + VI sets, CSS face crop | Transparent, text-free, one set; `full/` + `badge/` variants; NP = purple with heart |
| Descriptions | Poster copy ("balanced" Adult) | Behavior + how it can come across, for all five (D4) |
| Tokens | `dp/ip/a/nc/ac`; light + dark | `cp/np/a/fc/ac`; light only, dark parked (D5) |
| Showcase | Theme toggle, dark previews | Language switch only; mascot cards with badges at 3 sizes; disagreement example |
| Logo | "Never ship crops" | Crops allowed temporarily (D2) |
| Fixes | — | Long-label overflow at 320–390px; error/info notices off lavender |
