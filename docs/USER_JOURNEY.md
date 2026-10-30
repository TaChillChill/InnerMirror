# User Journey

One linear flow, one screen per step, a progress indicator at top. State is kept client-side throughout.

## 0. Landing
- One-sentence promise, "How it works" (5 steps), privacy note: *"Your screenshot is read once and never stored. Remove or blur names and private details if you can."*
- Language toggle EN / VI.
- CTA: "Try with your conversation" / "Try a sample" (sample = synthetic conversation, no API call needed for demo safety).

## 1. Upload
- User picks or drops one screenshot (PNG/JPG/WebP). MVP: one image; multiple images is a stretch goal.
- Checkbox before upload: *"This is a conversation I'm part of, and I'll use the result for my own reflection."*
- Client resizes/compresses the image, then sends it to `/api/extract`.
- **AI extraction result** shown as an editable transcript:
  - participants (auto-named "Person A/B/…" or names as read; user can rename),
  - messages in order (speaker, text), low-confidence lines highlighted.
- User can: change a message's speaker, edit text, delete, reorder, merge participants.
- User selects **"This is me"** (required to continue).
- The screenshot is dropped from memory after extraction.

## 2. Observe (AI Observation)
- **Ego-State Timeline:** one lane per participant, one node per message, node = character icon + confidence ring. Turning points marked.
- Tap a node → evidence card: quoted text, possible label, why, confidence, alternative reading.
- Summary card: 2–3 sentence neutral overview + explicit uncertainty note.
- If safety flag: replace playful summary with a calm support message and resources; analysis remains optional behind "Continue anyway".

## 3. Reflect
- For each of **the user's** messages at turning points (max 3–5 to keep it light):
  - Show the AI reading, then ask: *"Which character feels closest to what was happening for you?"*
  - Options: 5 characters, "I'm not sure". AI choice is pre-shown but **not pre-selected**.
  - Optional free text: "What was going on for you?"
- Closing prompt: *"What do you notice about yourself in this conversation?"* (optional).

## 4. Explore (Scenario Explorer)
- User picks one turning point (default: the main one).
- Picks a character or approach to try (e.g. "Adult: ask a question", "Nurturing Parent: acknowledge feelings").
- AI returns: alternative message, 1–2 plausible reactions from others (marked "one possibility"), short explanation of how the transaction might change.
- Framed as *"one way it might go"*, never a prediction. One regeneration allowed.

## 5. Save (Personal Mirror)
- A Mirror card with clearly separated sections:
  - **What the AI noticed** (AI observations),
  - **What I chose** (user-selected states),
  - **My context** (optional notes),
  - **My insight** (key reflection, user-written),
  - **What I might try next time** (from Explore).
- Requires an explicit "Save to this device" click. Stored in browser localStorage only.
- "My Mirrors" list on this device; delete anytime. Export: download as image/PDF via print (stretch).
- The saved Mirror stores the corrected transcript only if the user ticks "Keep the conversation text" (default off: store only the user's own quoted lines needed for context).
