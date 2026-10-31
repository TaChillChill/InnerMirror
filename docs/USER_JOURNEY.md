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

## 4. Scenario Explorer: "What if?" (state-only; UX revised after Founder UAT 2026-10-31)
Each message opens one **message panel** (desktop: sticky right column beside the conversation; phones: bottom sheet) with two tabs: **Your reading** (Mirror's observation, dashed, vs my choice, solid; one fixed question "Does this feel right to you?" with a one-tap "Yes, that's me") and, on my own messages, **What if?** (the ⇄ pill beside the message opens it directly).
What if? leads with a comparison card: **What happened** (my character → their next reply's character, solid) above **What if** (picked character ⇢ up to two receiver characters, dashed, with "Possibilities, not predictions." on the row). Pick one of five characters (name + one-line meaning) → **Explore** (explicit tap, data note naming Meta's model) → results labelled "Like [name]'s earlier messages" (pattern) or "Another possibility" (general idea, shown lighter). Tap a result for the character's meaning, why, and quoted words. "Tried so far" switches between explored characters without new calls. No generated dialogue, no probabilities, no reflection question; evidence only from messages before the explored one; results only in memory while Replay is open; off for safety-flagged conversations. "Your Turn" is deferred.

## 5. My Mirror
Explicit **Save to this device**. Sections: *What the AI noticed* / *What I chose* / *My context* / *My insight* (user-written, prompted by "What do I notice about myself?") / *What I might try next time*. Transcript stored only if the user opts in. List + delete on this device.
