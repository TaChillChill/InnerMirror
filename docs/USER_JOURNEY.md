# User Journey

**Conversation → AI Observation → My Interpretation → My Mirror**, optional **Scenario Explorer**.
All state is client-side. Nothing about the conversation is stored on the server.

## 0. Landing
Promise, 4-step "how it works", privacy note (*"Processed once, not stored. Remove names and private details of others if you can."*), EN/VI toggle, "Try a sample" (no API call).

## 1. Conversation
- Three choices (Founder decision 2026-10-30): **Upload screenshot(s)**, **Paste text** (`Name: message` per line), **Try a sample**. Screenshot import is conditional P0: in Phase 1 only if the feasibility test passes (`PHASE0_REPORT.md` §8); otherwise Paste Text is the Phase 1 input.
- Screenshot and paste both produce the **same editable transcript**; for screenshots, low-legibility lines are highlighted and the image is shown beside the editor (browser memory only, discarded after confirmation).
- Editable transcript: rename participants, reassign speaker, edit/delete lines.
- User marks **"This is me"** (required).
- Consent checkbox: *"This is a conversation I'm part of; I'm using this for my own reflection."*

## 2. AI Observation (Conversation View)
- Familiar chat layout. Each message: avatar/initial, bubble, **mascot badge** (possible functional expression of *that message*), small label.
- Badge style shows confidence; unclear = neutral "?" badge.
- Turning points marked between bubbles.
- Summary card: neutral overview + explicit uncertainty note.
- **Secondary view: Transaction Map** (Phase 2, two-person chats). Select a message pair → map highlights source → target arrows.
- Safety-flagged: calm support message first; playful framing and Scenario Explorer off.
- *Proposed (not approved):* **Conversation Replay** makes this step more visual: "Conversation shift" markers and a simple per-turn transaction card, with the full map optional. See `CONVERSATION_REPLAY.md`.

## 3. My Interpretation
Tap a mascot badge → sheet with:
- What in the text suggests this (quoted cues) and why (hedged rationale)
- Alternative reading
- Actions: **Agree**, **Choose another** (5 mascots), **I'm not sure**, optional note *"What was going on for me?"*
- The user's own messages are prompted first (gentle reflection questions); others' messages can be challenged too.
- After a change, the badge shows the user's choice with a "you chose" marker; the AI suggestion stays viewable, never overwritten.

## 4. Scenario Explorer (optional, Phase 2)
Pick one turning point (user's own message) → pick a mascot/approach → AI returns an alternative message, one possible reaction, and how the transaction might change. Shown as a **dashed, branched "what if" path**, clearly separate from the real conversation. "One possibility, not a prediction."

## 5. My Mirror
Explicit **Save to this device**. Sections: *What the AI noticed* / *What I chose* / *My context* / *My insight* (user-written, prompted by "What do I notice about myself?") / *What I might try next time*. Transcript stored only if the user opts in. List + delete on this device.
