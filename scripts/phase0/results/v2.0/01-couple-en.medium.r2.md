# 01-couple-en · muse-spark-1.3 @ medium · run 2

Synthetic. Romantic partners, last-minute dinner cancellation. Tests crossed and ulterior transactions.

latency 19319 ms · $0.0194 · usage {"completion_tokens":3906,"prompt_tokens":2277,"total_tokens":6183,"completion_tokens_details":{"reasoning_tokens":2634},"prompt_tokens_details":{"cached_tokens":0}}

## Readings
| id | speaker | text | expr | conf | alt | cues | rationale | second layer | reflection Q |
|---|---|---|---|---|---|---|---|---|---|
| m1 | Person A | Hey, I'm so sorry, work blew up. Can we move dinner to tomorrow? | AC→P | medium | A: Proposing tomorrow can also read as Adult problem-solving around a schedule. | I'm so sorry / Can we move dinner to tomorrow? | The apology can read as Adapted Child, softening the request to reschedule. |  |  |
| m2 | You (me) | Seriously? This is the third time this month. You always do this. | CP→C | high |  | Seriously? / You always do this. | Counting past times and saying "always" can sound like Critical Parent blame. |  | When you read about work blowing up just before this, what stood out to you most in those words? |
| m3 | Person A | I know, I'm really sorry. I feel awful about it. | AC→P | medium | FC: "I feel awful" states hurt openly, which can also read as Free Child. | I'm really sorry / I feel awful about it. | Repeating the apology can read as Adapted Child asking for reassurance. |  |  |
| m4 | You (me) | Fine. Do whatever you want. | AC→UNCLEAR | low | CP: "Do whatever you want" as a command can also sound like Critical Parent dismissal. | Fine. / Do whatever you want. | The brief "Fine" plus handing over the choice may sound like withdrawing. | "Fine" can sound like agreement on the surface while the topic still feels open. | As you typed "Fine. Do whatever you want.", what did you notice in your body or in the urge to keep writing? |
| m5 | Person A | Can we talk about it properly when I get home? I want to understand what's going on for you. | A→A | high |  | Can we talk about it properly / I want to understand | Asking to talk later and to understand can read as Adult seeking information. |  |  |
| m6 | You (me) | ok | UNCLEAR→UNCLEAR | low |  |  | The single word "ok" gives too little to settle on one reading. |  | After sending just "ok" to the idea of talking at home, what did you hope would happen next? |

## Shifts
- m2: The words move from a reschedule request to a complaint about a repeated pattern. (third time / You always do this.)
- m4: The words shift to a short closed reply after longer messages. (Fine. / Do whatever you want.)
- m5: The words shift from brief back-and-forth toward a plan to talk later. (Can we talk about it properly / when I get home?)

## Exchanges (experimental)
| pair | vectors | pattern | note |
|---|---|---|---|
| m1→m2 | C→P / P→C | complementary | An apology inviting understanding met a criticism back, keeping a Parent-Child shape. |
| m2→m3 | P→C / C→P | complementary | Criticism inviting a defensive reply met an apology back. |
| m3→m4 | C→P / C→UNCLEAR | unclear | An apology met a short closed reply that leaves the next step unclear. |
| m4→m5 | C→UNCLEAR / A→A | unclear | A short closed reply met a proposal to talk later, so the vectors do not line up clearly. |
| m5→m6 | A→A / UNCLEAR→UNCLEAR | unclear | A proposal for later talk met a one-word reply that is hard to pair. |

## Summary
The chat starts with an apology and a request to reschedule, then moves into protest about repetition. It narrows to brief closed replies before one side suggests talking properly later. It ends with a one-word reply that leaves the plan hanging.

## Uncertainty
Text alone cannot show tone of voice, history between you, or what work pressure and past dinners mean here.

## Safety
```json
{"categories":[],"flagged":false,"note":null}
```

## Our hypothesis (not ground truth)
```json
{"notes":"Our hypotheses only. A reading outside 'plausible' is a prompt to look closer, not an error. Founder/Claude hypothesis, not ground truth.","readings":{"m1":"AC or A, addresses P/A","m2":"CP -> C (crossed vs m1's request to Adult)","m3":"AC -> P (complementary to m2)","m4":"AC/FC sulk; ulterior: 'not fine'","m5":"A (maybe NP) -> A; crossed vs m4","m6":"UNCLEAR"},"turningPoints":["m2","m4 or m5"],"safetyFlagged":false,"plausible":{"m1":["AC","A"],"m2":["CP"],"m3":["AC","FC"],"m4":["AC","FC","CP"],"m5":["A","NP"],"m6":["UNCLEAR","AC"]}}
```

## Automatic checks
```json
{
  "coverage": "6/6",
  "cueVerbatimRate": 1,
  "unclearCount": 1,
  "secondLayers": [
    "m4"
  ],
  "shifts": [
    "m2",
    "m4",
    "m5"
  ],
  "repeatedOpeners": 0,
  "outsidePlausible": [],
  "exchanges": [
    {
      "pair": "m1->m2",
      "pattern": "complementary",
      "vectorsRule": "complementary"
    },
    {
      "pair": "m2->m3",
      "pattern": "complementary",
      "vectorsRule": "complementary"
    },
    {
      "pair": "m3->m4",
      "pattern": "unclear",
      "vectorsRule": "unclear"
    },
    {
      "pair": "m4->m5",
      "pattern": "unclear",
      "vectorsRule": "unclear"
    },
    {
      "pair": "m5->m6",
      "pattern": "unclear",
      "vectorsRule": "unclear"
    }
  ],
  "flags": {
    "unsupportedInference": [
      "m3: hurt"
    ],
    "leadingQuestions": []
  },
  "issues": []
}
```
