# Design System — Decision log

Updated for v0.2, 2026-10-30. Durable outcomes live in `DESIGN_SYSTEM.md`; project-level questions in `docs/OPEN_QUESTIONS.md` (Q10, Q11 still open).

## Resolved

| # | Decision | Outcome (Founder, 2026-10-30) | Applied in |
|---|---|---|---|
| D1 | Ego-state model and names | **Five-part functional model**: CP Critical Parent, NP Nurturing Parent, A Adult, FC Free Child, AC Adapted Child. Berne's GPP stays the foundation for the three ego states; the five-part split is not attributed to him. | `DESIGN_SYSTEM.md` §2, `docs/THEORY_FOUNDATION.md`, `docs/UX_DESIGN.md`, `docs/OPEN_QUESTIONS.md` (Q9), Phase 0 prompt, checks and rubric, showcase |
| D2 | Logo source files | Keep the Option A poster crops temporarily; don't block Phase 1. | `DESIGN_SYSTEM.md` §1 |
| D3 | Mascot exports | New transparent, text-free 1024² PNGs (NP = purple with heart). One set for EN/VI. `full/` and `badge/` variants generated. | `design/brand/mascots/`, Q14 closed |
| D4 | Mascot descriptions | Neutral, behavior-based; every state, Adult included, has a less helpful side. | `DESIGN_SYSTEM.md` §2, i18n |
| D12 | Mascot relative scale | **Superseded 2026-10-30 (Founder):** standardize sizing across the system while keeping Child vs Parent/Adult differences. Measured: NP's source art is ~40% larger in area than CP/A. Proposed rule (P/A forms same height, Child forms 0.8×, one baseline) in `PROTOTYPE_V2_PROPOSAL.md` item 1; not applied yet. | — |
| D13 | Prototype review round 1 | **Founder decisions:** secondary CTA "See how it works" → demo directly; input = Upload screenshots / Paste or type (sample removed from input); review as chat bubbles with on-demand editing; What if? inline in Replay (no separate screen); My Mirror + My Reflections merged into one sticker-collection experience with patterns and a future-self note; privacy-first local storage, no silent text retention; desktop + mobile together. Proposal and open items F1–F6: `PROTOTYPE_V2_PROPOSAL.md`. | — |
| D5 | Dark mode | Deferred. Light only; dark tokens removed from `tokens.css`, values parked in `DESIGN_SYSTEM.md` appendix A. | tokens, showcase |

## Needs Founder review

| # | Decision | Recommendation |
|---|---|---|
| D6 | **Vietnamese terminology.** Uncertain items, ranked by impact: | |
| | a. Casing of state names. Approved: "Cha mẹ Phê phán", with the qualifier capitalized like a term. Vietnamese UI text usually uses sentence case ("Cha mẹ phê phán"). | Keep the approved casing (it marks a technical term), but apply it everywhere, including running text. Confirm. |
| | b. "Trẻ em Tự do / Thích nghi" vs the shorter "Trẻ Tự do / Thích nghi" (Vietnamese TA sources vary; I could not verify which is established). | Keep the approved names; have a VI TA reader check. |
| | c. The name of TA itself. The showcase uses "Phân tích Giao tiếp"; the literal "Phân tích Giao dịch" also appears in Vietnamese sources. | Choose one and use it in the UI, prompt and pitch. |
| | d. "Trạng thái bản ngã" for *ego state*. | Common rendering. Confirm. |
| | e. Product labels: "Quan sát của AI", "Cách mình hiểu", "Tấm gương của mình". "Mình" is the user's own voice, "bạn" is the product speaking. | Keep. |
| | f. Brand philosophy "Reflective Playfulness" rendered as "Suy ngẫm vui tươi". | Keep the English term as a brand phrase, with the VI line only as an explanation. |
| D7 | Type additions not on the poster: Display 40/48 ExtraBold (welcome only), Label 14/20 SemiBold (buttons, chips). | Approve both. |
| D8 | Per-message confidence. | Show it only inside the opened observation and in the accessible name. Badges show "AI suggestion vs mine", not certainty. |
| D9 | Should the AI pre-label other people's messages? | Yes, badges on all messages (transactions need them), but the flow opens on the user's own message, and readings of others stay on observable cues. |
| D10 | Safety-state layout. | The notice replaces the analysis; resources are the primary action; no mascots, no simulation. The resource list is still pending (Q10). |
| D11 | Export specks in the new mascot sources: thin arcs above FC and AC, slivers beside A and below CP, each < 200px. They are hidden in the variants; the source files keep them. | Optional: re-export clean sources, then run `build_variants.py`. Not blocking. |

## Prototype UX questions (from `design/prototype/`, 2026-10-30)
| # | Question | Recommendation |
|---|---|---|
| UX-1 | Screenshot path: pre-select the right-hand speaker as "you" (still confirmable) or always ask? | Pre-select with a visible "Is this you?" confirmation; fewer taps, still the user's call |
| UX-2 | What if? only at shifts or on any of my messages? | **Resolved (Founder, D13):** beside each of my messages + "Your turn" for the next message |
| UX-3 | Can a Mirror be saved without a written insight? | **Resolved (Founder, D13/F3):** one optional note only |
| UX-4 | Mobile detail view | **Applied in prototype v2:** bottom sheet (matches `docs/UX_DESIGN.md`; `DESIGN_SYSTEM.md` §8 to update on approval) |
| UX-5 | Plain-language pattern names ("Flowing", "Changing direction", "Possibly a second layer") with the TA term only inside "Show the diagram"? | Yes (pairs with Q19) |

## Known limitations (not decisions)
- Product screens in the showcase are illustrative, with a synthetic conversation. They are not approved requirements.
- Nunito loads from Google Fonts; offline, the page falls back to a system rounded font.
- The Impeccable detector reports "flat type hierarchy". This is a false positive: sizes are set through `font:` shorthand custom properties, which the detector does not resolve, and the rendered sizes are 40/32/24/20/16.

## Prototype v2 UX questions (Impeccable critique, 2026-10-30)
| # | Question | Recommendation |
|---|---|---|
| UX-6 | Sheet order | **Resolved (Founder):** my choices first, AI reading collapsed below (chip + confidence, details one tap away), desktop and mobile. Applied in prototype v2. |
| UX-7 | Per-message notes | **Resolved (Founder):** field dropped; only the future-self note in My Mirror. Applied. |
| UX-8 | Phone flow | **Resolved (Founder):** keep thread + sheet for MVP; guided pass post-MVP. |

## Prototype v2 round 2 (Founder feedback 2026-10-30)
**Founder decisions applied:** unreviewed AI suggestions appear as stickers (marked "AI suggested"); one sticker per message with a per-character tally, in the current collection and saved cards; compact in-context selector (AI observation + my interpretation together) instead of the large panel; desktop right panel reserved for What if?; populated Patterns preview (illustrative, nice-to-have).

| # | Question | Recommendation |
|---|---|---|
| UX-9 | Patterns counts only my choices (F2) by default; "Include AI suggestions I haven't reviewed" is an opt-in, shown striped. Keep F2 as default, or count AI suggestions by default? | Keep F2 default (off): a pattern of the AI's guesses about me isn't self-awareness |
| UX-10 | Saved stickers can't be reopened or changed, because the conversation text isn't stored (F3). Acceptable, or allow changing a saved label without its message? | Accept: changing a label you can no longer read would be guesswork |
| UX-11 | Unreviewed stickers are muted by the tile (recessed, dashed, "AI suggested"), not by dimming the mascot, which would alter the artwork (brand rule). OK? | Yes |
| UX-12 | Desktop selector is an inline card under the message (not a floating popover: a ~400px popover would cover the thread and clip at edges). OK? | Yes |

## Founder decisions, 2026-10-30 (Phase 1 go-ahead)
| # | Decision status | Implementation status |
|---|---|---|
| UX-9…UX-12 | Approved as recommended | UX-10/11/12 in the app (M2); UX-9 applies to Patterns (nice-to-have, not built) |
| D6 | Approved: proposed VI terminology, English TA terms kept for reference | Used in `src/lib/i18n/vi.ts` and the analysis prompt |
| D7–D9 | Approved | D8/D9 in the app: confidence only inside the selector, badges on all messages |
| D10 | Layout approved; resource content still needs review (Q10) | Safety screen in the app with a "list under review" placeholder, no readings, no reflection questions |
| D11 | Deferred (cosmetic) | — |
| D12 | Approved: one mascot size rule across components | Applied in app CSS (`src/styles/app.css`); baking into `build_variants.py` still open |
