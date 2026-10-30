# 03-work-group-en · muse-spark-1.3 @ low · run 1

Synthetic. Work group chat, three participants, missed deadline. Tests group addressing, pairing replies, workplace framing.

latency 14102 ms · $0.0155 · usage {"completion_tokens":2965,"prompt_tokens":2322,"total_tokens":5287,"completion_tokens_details":{"reasoning_tokens":1556},"prompt_tokens_details":{"cached_tokens":0}}

## Readings
| id | speaker | text | expr | conf | alt | cues | rationale | second layer | reflection Q |
|---|---|---|---|---|---|---|---|---|---|
| m1 | Person A | The client deck was due at 10. Why am I only hearing now that it's not ready? | CP→C | medium | A: It can also read as a factual check on timing, asking when the delay was flagged. | was due at 10 / Why am I only hearing now | The words point to a missed rule and may sound like blame for late notice. |  |  |
| m2 | Person B | So sorry Priya, that's on me, I should have flagged it yesterday 🙏 | AC→P | high |  | So sorry / that's on me | The words apologize directly and take responsibility, which can read as complying. |  |  |
| m3 | You (me) | The data from finance came in late. We can send a first version by 2pm and the full numbers tomorrow morning. Would that work? | A→A | high |  | came in late / We can send a first version by 2pm / Would that work? | The words give information about the cause and propose options with an open question. |  | When you read the apology just before, what stood out to you in it as you wrote about the 2pm version? |
| m4 | Person A | This should never happen. I expect better from both of you. | CP→C | high |  | should never happen / I expect better | The words state a rule and a judgment about both people, which can read as Critical Parent. |  |  |
| m5 | You (me) | Honestly it's not like we were sitting around. We've been working late all week. | AC→P | medium | FC: It could also read as open hurt or frustration said directly about being seen as idle. | it's not like we were sitting around / We've been working late all week | The words push back against the criticism and defend effort, which can sound like resistant Adapted Child. |  | As you wrote "We've been working late all week," what did you notice in your body or urge right then? |
| m6 | Person B | Let's just get it done, I'll start on the slides now 😅 | A→A | medium | AC: It can also read as going along with the demand to move on and finish the work. | Let's just get it done / I'll start on the slides now | The words propose a next action and state what will happen now, which can read as problem-solving. |  |  |

## Shifts
- m3: The words move from apology and blame to proposing a concrete timeline. (We can send a first version by 2pm)
- m5: The words shift from discussing options to defending past effort. (it's not like we were sitting around)

## Exchanges (experimental)
| pair | vectors | pattern | note |
|---|---|---|---|
| m1→m2 | P→C / C→P | complementary | An apology for the delay follows the question about the missed deadline. |
| m2→m3 | C→P / A→A | crossed | A factual proposal with a new timeline follows the apology. |
| m3→m4 | A→A / P→C | crossed | A general rule about expectations comes back after the proposal for options. |
| m4→m5 | P→C / C→P | complementary | A pushback about effort follows the criticism of both people. |
| m5→m6 | C→P / A→A | crossed | A shift to starting work follows the defense of effort. |

## Summary
The conversation starts with a missed deadline and apology, then moves to a proposed workaround. After a general criticism, the tone turns defensive before one person refocuses on starting the slides.

## Uncertainty
Text alone cannot show tone of voice, work history, or pressure outside this chat, so these readings are only hypotheses about how the words could land.

## Safety
```json
{"categories":[],"flagged":false,"note":null}
```

## Our hypothesis (not ground truth)
```json
{"notes":"Our hypotheses only. A reading outside 'plausible' is a prompt to look closer, not an error. Founder/Claude hypothesis, not ground truth.","readings":{"m1":"CP -> C (question form but accusatory)","m2":"AC -> P (complementary to m1)","m3":"A -> A (crossed vs m1's P->C)","m4":"CP -> C; crossed vs m3's A->A","m5":"AC rebellious or FC -> P","m6":"AC/FC placating, addressed to group"},"turningPoints":["m4","m5"],"safetyFlagged":false,"plausible":{"m1":["CP","A"],"m2":["AC"],"m3":["A"],"m4":["CP"],"m5":["AC","FC","CP"],"m6":["AC","FC","A"]}}
```

## Automatic checks
```json
{
  "coverage": "6/6",
  "cueVerbatimRate": 1,
  "unclearCount": 0,
  "secondLayers": [],
  "shifts": [
    "m3",
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
      "pattern": "crossed",
      "vectorsRule": "crossed"
    },
    {
      "pair": "m3->m4",
      "pattern": "crossed",
      "vectorsRule": "crossed"
    },
    {
      "pair": "m4->m5",
      "pattern": "complementary",
      "vectorsRule": "complementary"
    },
    {
      "pair": "m5->m6",
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
