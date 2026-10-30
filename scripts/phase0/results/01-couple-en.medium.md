# 01-couple-en

Synthetic. Romantic partners, last-minute dinner cancellation. Tests crossed and ulterior transactions.

effort=medium latency=28554ms cost=$0.0285 usage={"completion_tokens":6186,"prompt_tokens":1734,"total_tokens":7920,"completion_tokens_details":{"reasoning_tokens":5059},"prompt_tokens_details":{"cached_tokens":0}}

## Readings
| id | speaker | text | expr | src→tgt | conf | alt | cues | rationale | reflection Q |
|---|---|---|---|---|---|---|---|---|---|
| m1 | Sam | Hey, I'm so sorry, work blew up. Can we move dinner to tomorrow? | AC | C→P | medium | A | I'm so sorry / Can we move dinner to tomorrow? | The apology and request for change may read as Adapted Child seeking understanding, which could invite a Parent response, though the proposal part could also read as Adult. |  |
| m2 | Alex (me) | Seriously? This is the third time this month. You always do this. | CP | P→C | high |  | Seriously? / You always do this. | The words counting occurrences and using 'always' could read as Critical Parent criticism addressing the Child. | What were you noticing in yourself as you wrote this? |
| m3 | Sam | I know, I'm really sorry. I feel awful about it. | AC | C→P | medium | FC | I'm really sorry / I feel awful | The wording may read as apologizing and acknowledging fault, which could invite a Parent response. |  |
| m4 | Alex (me) | Fine. Do whatever you want. | AC | C→P | low | CP | Fine. / Do whatever you want. | The brief wording could read as withdrawing or complying on the surface while closing down discussion, which might invite a Parent response. | What might have been going on for you in the moment you sent this? |
| m5 | Sam | Can we talk about it properly when I get home? I want to understand what's going on for you. | A | A→A | medium | NP | Can we talk about it properly / I want to understand | The suggestion of a time to talk and to understand may read as Adult problem-solving inviting an Adult discussion. |  |
| m6 | Alex (me) | ok | UNCLEAR | UNCLEAR→UNCLEAR | low | AC | ok | A single word on its own could read in several ways and is too brief to interpret with confidence. | What was it like for you to respond with just this word here? |

## Transactions
| pair | type | hidden | conf | explanation |
|---|---|---|---|---|
| m1→m2 | crossed |  | medium | The first message appears to invite a Parent response of understanding, while the reply comes from Critical Parent to Child, which is a different direction than invited. |
| m2→m3 | complementary |  | high | Criticism addressing the Child is met with an apology from the Child back to the Parent, matching the invited states on both sides. |
| m3→m4 | ulterior | I am not actually fine with this. | medium | The words say agreement on the surface, but 'Fine.' in this context plausibly carries a second message of not being fine. |
| m4→m5 | crossed |  | medium | The withdrawing message appears to invite a Parent response, while the next message comes from Adult and invites Adult discussion instead. |
| m5→m6 | unclear |  | low | The invitation to talk in an Adult way is met with a single word that is too brief to read clearly, so the pairing cannot be determined. |

## Turning points
- m2: The tone shifts from a request to reschedule to protest and criticism.
- m4: The brief 'Fine. Do whatever you want.' shifts toward withdrawal and possible distance.
- m5: The invitation to talk properly later attempts to shift toward calmer discussion.

## Summary
The exchange starts with an apology and request to reschedule, followed by protest about repeated changes. An apology is then met with brief withdrawal, followed by an invitation to talk later about what happened, ending with a minimal reply that leaves the conversation paused.

## Uncertainty
Text alone cannot show tone of voice, facial expression, past history, or what these words meant in the relationship.

## Safety
```json
{
  "categories": [],
  "flagged": false,
  "note": null
}
```

## Expected (our hypothesis)
```json
{
  "notes": "Founder/Claude hypothesis, not ground truth.",
  "readings": {
    "m1": "AC or A, addresses P/A",
    "m2": "CP -> C (crossed vs m1's request to Adult)",
    "m3": "AC -> P (complementary to m2)",
    "m4": "AC/FC sulk; ulterior: 'not fine'",
    "m5": "A (maybe NP) -> A; crossed vs m4",
    "m6": "UNCLEAR"
  },
  "turningPoints": [
    "m2",
    "m4 or m5"
  ],
  "safetyFlagged": false
}
```

## Automatic checks
```json
{
  "coverage": "6/6",
  "cueVerbatimRate": 1,
  "txConsistency": [
    {
      "pair": "m1->m2",
      "model": "crossed",
      "rule": "complementary",
      "consistent": false
    },
    {
      "pair": "m2->m3",
      "model": "complementary",
      "rule": "complementary",
      "consistent": true
    },
    {
      "pair": "m3->m4",
      "model": "ulterior",
      "rule": "crossed",
      "consistent": true
    },
    {
      "pair": "m4->m5",
      "model": "crossed",
      "rule": "crossed",
      "consistent": true
    },
    {
      "pair": "m5->m6",
      "model": "unclear",
      "rule": "unclear",
      "consistent": true
    }
  ],
  "forbiddenHits": [],
  "issues": [
    "m1->m2: model says crossed, source/target rule says complementary"
  ]
}
```
