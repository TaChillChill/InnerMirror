# Conversation Replay

Status: **Proposed, 2026-10-30. Not approved.** Nothing here changes an approved decision until the Founder approves it (open items: `OPEN_QUESTIONS.md` Q18–Q22).
Related: `USER_JOURNEY.md` §2, `UX_DESIGN.md` (Conversation View, Transaction Map), `THEORY_FOUNDATION.md` (transaction model), `MVP_SCOPE.md`.

## Purpose
Help users *see* how a conversation unfolded: which possible ego states the messages came from and spoke to, and where the dynamic shifted. Inspired by Berne's complementary, crossed and ulterior transactions.

## Relationship to the approved core
Conversation Replay is **not a new step and not a replacement**. It is the AI Observation step's Conversation View, made more visual. The core loop stays **Conversation → AI Observation → My Interpretation → My Mirror**, optional Scenario Explorer.

| Replay element | Already approved as | What is new (proposed) |
|---|---|---|
| Conversation Timeline | Conversation View (chat layout, mascot badge per message) | Nothing structural |
| "Conversation Shift" markers | Turning points (thin divider with label) | UI label "Conversation shift" instead of "turning point" (Q19). Data key stays `turningPoints`. |
| Simplified Transaction Visualization | Transaction Map (two columns × P/A/C, Phase 2) | A simpler per-turn **transaction card** as the default; the full P/A/C map becomes optional (Q20) |
| User Reflection | My Interpretation (agree / choose another / not sure / note) | Optional correction of the *addressed* state (P1) |
| Alternative Response Exploration | Scenario Explorer (one alternative at one turning point) | Entry point from a shift or a transaction card. "Scenario Simulator" in the brief = Scenario Explorer; name unchanged. |

## Confirmed constraints (from approved docs, apply unchanged)
- Labels attach to **messages**, never people. Transactions are read **source → target**, never by pairing two labels.
- Every AI reading is a hypothesis: quoted cues, confidence in words, alternative when not high. "I'm not sure" always available.
- AI suggestion stays visible; the user's choice never overwrites it (three layers separate in UI and data).
- Other participants: observable expression only; no feelings, motives or intentions stated.
- Safety-flagged conversations: the safety notice replaces the analysis; no mascots, no Replay, no simulation (D10).
- Group chats (> 2 people): Transaction Map hidden with a note.
- Simulations are "one possibility, not a prediction", visually separate from the real conversation.

## Design principles (from the brief)
Simplicity over theoretical completeness; visual understanding before explanation; no ranking of ego states; complementary is not "healthy" and crossed is not "unhealthy"; no claims about unconscious motives; the user's interpretation outranks the AI's.

## Proposed MVP experience

### 1. Timeline
The existing Conversation View. Up to 3 shift markers (from `turningPoints`). Optional "Next shift" button jumps between them (P1). No animated playback in MVP.

### 2. Transaction card (selecting a reply)
Selecting a message that answers another opens a small card, not a diagram:

```
Mai  [CP badge]  "Why are you ALWAYS late?"
     seems to come from Parent  →  seems to speak to Child
You  [AC badge]  "Sorry, traffic was bad…"
     seems to come from Child   →  seems to speak to Parent
Pattern: Complementary · AI suggestion · medium confidence
"The reply answers from the place the message spoke to. Exchanges like this
 tend to keep flowing, in a helpful or an unhelpful direction."
[Show the diagram]  [Explore a different reply]
```

- Plain HTML/CSS (mascot badge + P/A/C chip + arrow glyph). No SVG needed.
- "Show the diagram" expands the approved P/A/C Transaction Map (only if built, see Q20).
- Pattern copy is neutral (draft, needs Founder approval and VI copy):
  - Complementary: *"The reply answers from the place the message spoke to. Exchanges like this tend to keep flowing, in a helpful or an unhelpful direction."*
  - Crossed: *"The reply comes from a different place than the one invited. The conversation often changes direction here. Sometimes that is a useful reset."*
  - Possibly ulterior: *"The words may carry a second layer. Only the people involved know whether that fits."*
  - Unclear: *"Hard to tell from text alone."*

### 3. Corrections
- Changing a message's expression (existing interpretation sheet) changes its **source** (P/A/C follows from the expression in code). The card then recomputes complementary / crossed from the user's choices and shows *"Based on your reading"*; the AI's original pattern stays visible.
- P1: let the user change the **addressed** state ("speaks to P / A / C / not sure") and mark "a second layer doesn't fit".

### 4. Alternative response
"Explore a different reply" on the user's **own** messages only → Scenario Explorer as already specified. Disabled when safety-flagged.

## Proposed implementation details (not approved)
- **No extra AI call.** Replay uses the existing `Analysis` (`readings`, `transactions`, `turningPoints`).
- **Pattern rule in code.** `source` = structural state of the expression (`SOURCE_OF` in `scripts/phase0/schema.mjs`). Complementary iff `response.source == stimulus.target` and `response.target == stimulus.source`; otherwise crossed; any `UNCLEAR` → unclear. The model's `ulterior` flag is kept as an overlay (it cannot be derived). If code and model disagree on complementary/crossed, code wins and the explanation falls back to the neutral template above.
- **Client-side view model** (derived, not stored):
  ```ts
  interface ReplayTurn {
    stimulusId: string; responseId: string;
    ai: { type: TransactionType; explanation: string; confidence: Confidence; secondLayer: string | null };
    derived: { stimulus: { source: Structural; target: Structural }; response: { source: Structural; target: Structural }; type: TransactionType };
    basedOnUser: boolean;   // true when any user choice changed the derived type
  }
  ```
- **Mirror:** stores the turns the user opened or corrected next to the AI's version (P1 field `user.transactionNotes`). AI and user fields stay separate.

## Dependencies and risks
- **Depends on Phase 0:** target quality and transaction consistency (rubric: ≥ 90% consistent pairs). If targets are unreliable, Replay falls back to expression badges + shift markers only, with no pattern label.
- `hiddenMessage` for other participants' messages borders on stating motives (Q21).
- Copy must not imply crossed = bad (current `UX_DESIGN.md` caption "often where conversations get stuck" needs neutral wording, Q19).
