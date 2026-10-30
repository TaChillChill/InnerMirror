# 07-sibling-shifts-en · muse-spark-1.3 @ low · run 2

Synthetic. Siblings planning a birthday; several shifts (A, AC, CP, rebellion, self-disclosure, NP, FC). Tests shift detection and quoting a feeling the speaker named.

latency 18986 ms · $0.0159 · usage {"completion_tokens":3645,"prompt_tokens":2332,"total_tokens":5977,"completion_tokens_details":{"reasoning_tokens":2053},"prompt_tokens_details":{"cached_tokens":2289}}

## Readings
| id | speaker | text | expr | conf | alt | cues | rationale | second layer | reflection Q |
|---|---|---|---|---|---|---|---|---|---|
| m1 | Person A | Mum's birthday is Sunday. Did you book the restaurant like you said? | A→A | medium | CP: The phrase "like you said" can sound like a check on accountability, which may carry a judging edge. | Did you book the restaurant / Mum's birthday is Sunday | The words mostly ask for information about a plan, which can read as Adult. |  |  |
| m2 | You (me) | Oh no. I completely forgot. I'm so sorry!! | AC→P | high |  | I completely forgot / I'm so sorry!! | The words directly admit forgetting and apologize, which can read as Adapted Child. |  | When you read "Did you book the restaurant like you said?" what stood out to you as you wrote this reply? |
| m3 | Person A | Typical. You never follow through on anything. | CP→C | high |  | Typical. / You never follow through | The words use a general judgement with "never", which can sound like Critical Parent. |  |  |
| m4 | You (me) | That's not fair. I organised the last three family things. | FC→P | medium | A: Listing "the last three family things" can also read as giving factual counter-information. | That's not fair. / I organised the last three | The protest sounds direct and open, which can read as Free Child. |  | Just before you wrote "That's not fair," what did you notice in your body or thoughts? |
| m5 | Person A | Okay, fair. I'm just stressed, work has been a lot. | FC→P | medium | AC: "Okay, fair" can also read as backing down to ease tension. | I'm just stressed / work has been a lot | The words openly name stress, which can read as Free Child sharing feelings. |  |  |
| m6 | You (me) | That sounds rough. Want me to call a few places tonight and send you options? | NP→A | medium | A: Proposing to call places and send options can also read as Adult problem-solving. | That sounds rough. / Want me to call | The words offer care and practical help, which can sound like Nurturing Parent. |  | When Person A wrote about being stressed with work, what other way did you consider reading that message? |
| m7 | Person A | Yes please, that would help a lot 🙏 | A→P | medium | AC: The grateful tone can also read as pleased acceptance of care. | Yes please / that would help a lot | The words confirm the plan and give information about it helping, which can read as Adult. |  |  |
| m8 | You (me) | Haha deal. Let's make it the best birthday ever! | FC→C | high |  | Haha / best birthday ever! | The laughter and excited wording can read as Free Child playfulness. |  | As you wrote about making it "the best birthday ever," what did you hope would happen next between you two? |

## Shifts
- m3: The words shift from checking a specific booking to a general judgement. (Typical. / You never follow through)
- m5: The words shift from blame and defence to naming stress. (Okay, fair. / I'm just stressed)
- m6: The words shift from talking about stress to proposing a next plan. (Want me to call a few places tonight)

## Exchanges (experimental)
| pair | vectors | pattern | note |
|---|---|---|---|
| m1→m2 | A→A / C→P | crossed | A factual question was followed by an apology that asks for understanding rather than information. |
| m2→m3 | C→P / P→C | complementary | An apology inviting understanding was followed by a general criticism back to the other person. |
| m3→m4 | P→C / C→P | complementary | Criticism was followed by direct protest that refers back to past efforts. |
| m4→m5 | C→P / C→P | crossed | Protest was followed by acknowledgement of stress rather than discussion of the facts raised. |
| m5→m6 | C→P / P→A | crossed | Sharing stress was followed by care and a practical proposal rather than only comfort. |
| m6→m7 | P→A / A→P | complementary | An offer of help was followed by grateful acceptance. |
| m7→m8 | A→P / C→C | crossed | Thanks was followed by playful excitement about the birthday. |

## Summary
The conversation starts with a missed plan and moves through criticism and protest. It then softens when stress is named and a practical offer is made, ending with agreement and playful excitement about the birthday.

## Uncertainty
Text alone cannot show tone of voice, facial expression, or history between you, so these readings are only hypotheses about how the words could sound.

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
    "m3",
    "m5",
    "m6"
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
      "pattern": "crossed",
      "vectorsRule": "crossed"
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
  "issues": []
}
```
