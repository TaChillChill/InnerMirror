# 07-sibling-shifts-en · muse-spark-1.3 @ medium · run 2

Synthetic. Siblings planning a birthday; several shifts (A, AC, CP, rebellion, self-disclosure, NP, FC). Tests shift detection and quoting a feeling the speaker named.

latency 25442 ms · $0.0270 · usage {"completion_tokens":5660,"prompt_tokens":2332,"total_tokens":7992,"completion_tokens_details":{"reasoning_tokens":4098},"prompt_tokens_details":{"cached_tokens":0}}

## Readings
| id | speaker | text | expr | conf | alt | cues | rationale | second layer | reflection Q |
|---|---|---|---|---|---|---|---|---|---|
| m1 | Person A | Mum's birthday is Sunday. Did you book the restaurant like you said? | A→A | high |  | Mum's birthday is Sunday. / Did you book the restaurant | The words state a fact and ask for information, which can read as Adult checking. |  |  |
| m2 | You (me) | Oh no. I completely forgot. I'm so sorry!! | AC→P | high |  | I completely forgot. / I'm so sorry!! | The words admit forgetting and apologize directly, which can read as Adapted Child. |  | When you read “Did you book the restaurant like you said?” what did you notice in yourself just before typing your reply? |
| m3 | Person A | Typical. You never follow through on anything. | CP→C | high |  | Typical. / You never follow through | The words judge with a general "never" statement, which can sound like Critical Parent. |  |  |
| m4 | You (me) | That's not fair. I organised the last three family things. | FC→P | medium | A: The mention of the last three family things could also read as giving factual information. | That's not fair. / I organised the last three family things. | The protest sounds direct and open, which can read as Free Child pushing back. |  | When you read “Typical. You never follow through on anything,” which part stayed with you most as you replied? |
| m5 | Person A | Okay, fair. I'm just stressed, work has been a lot. | FC→P | medium | A: Naming work as context could also read as Adult explaining the situation. | Okay, fair. / I'm just stressed | The words acknowledge and name stress openly, which can read as Free Child sharing. |  |  |
| m6 | You (me) | That sounds rough. Want me to call a few places tonight and send you options? | NP→C | medium | A: Calling places and sending options could also read as Adult problem-solving. | That sounds rough. / Want me to call a few places | The words offer comfort and practical help, which can read as Nurturing Parent. |  | As you offered to call places and send options, what did you hope would happen next? |
| m7 | Person A | Yes please, that would help a lot 🙏 | AC→P | medium |  | Yes please, / that would help a lot | The words accept help gratefully, which can read as Adapted Child going along. |  |  |
| m8 | You (me) | Haha deal. Let's make it the best birthday ever! | FC→C | medium |  | Haha deal. / best birthday ever! | The laugh and excited wish sound playful and open, which can read as Free Child. |  | Looking at “that would help a lot 🙏” again, what is another way those words could be read? |

## Shifts
- m5: The words move from blame and defence to acknowledgement and mention of stress. (Okay, fair. / I'm just stressed)
- m6: The words move from talking about what happened to offering a concrete next step. (Want me to call / send you options?)
- m8: The words move from practical arranging to a light, playful closing. (Haha deal. / best birthday ever!)

## Exchanges (experimental)
| pair | vectors | pattern | note |
|---|---|---|---|
| m1→m2 | A→A / C→P | crossed | A factual question is followed by an apology. |
| m2→m3 | C→P / P→C | complementary | An apology is followed by a general criticism. |
| m3→m4 | P→C / C→P | complementary | Criticism is followed by a pushback with counter-examples. |
| m4→m5 | C→P / C→P | crossed | A protest is followed by acknowledgement and mention of stress. |
| m5→m6 | C→P / P→C | complementary | Sharing stress is followed by an offer of help. |
| m6→m7 | P→C / C→P | complementary | An offer of help is followed by grateful acceptance. |
| m7→m8 | C→P / C→C | crossed | Grateful acceptance is followed by a playful closing. |

## Summary
The conversation opens with a check about the booking and an apology, then moves through criticism and pushback. It shifts toward acknowledgement of stress and a practical offer to call restaurants, ending on a warm, playful note about the birthday.

## Uncertainty
Text alone cannot show tone of voice, timing, or family history, so the same words could have sounded harsher or lighter in person.

## Safety
```json
{"categories":[],"flagged":false,"note":null}
```

## Our hypothesis (not ground truth)
```json
{"notes":"Our hypotheses only. A reading outside 'plausible' is a prompt to look closer, not an error.","plausible":{"m1":["A","CP"],"m2":["AC","FC"],"m3":["CP"],"m4":["AC","A","FC"],"m5":["A","FC","AC"],"m6":["NP","A"],"m7":["FC","A","AC"],"m8":["FC"]},"shifts":["m3","m5","m6"],"safetyFlagged":false}
```

## Automatic checks
```json
{
  "coverage": "8/8",
  "cueVerbatimRate": 1,
  "unclearCount": 0,
  "secondLayers": [],
  "shifts": [
    "m5",
    "m6",
    "m8"
  ],
  "repeatedOpeners": 0,
  "outsidePlausible": [],
  "exchanges": [
    {
      "pair": "m1->m2",
      "pattern": "crossed",
      "vectorsRule": "crossed"
    },
    {
      "pair": "m2->m3",
      "pattern": "complementary",
      "vectorsRule": "complementary"
    },
    {
      "pair": "m3->m4",
      "pattern": "complementary",
      "vectorsRule": "complementary"
    },
    {
      "pair": "m4->m5",
      "pattern": "crossed",
      "vectorsRule": "crossed"
    },
    {
      "pair": "m5->m6",
      "pattern": "complementary",
      "vectorsRule": "complementary"
    },
    {
      "pair": "m6->m7",
      "pattern": "complementary",
      "vectorsRule": "complementary"
    },
    {
      "pair": "m7->m8",
      "pattern": "crossed",
      "vectorsRule": "crossed"
    }
  ],
  "flags": {
    "unsupportedInference": [],
    "leadingQuestions": []
  },
  "issues": [
    "m7: no alternative despite medium confidence",
    "m8: no alternative despite medium confidence"
  ]
}
```
