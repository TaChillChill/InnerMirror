# Prompt v2 evaluation — automatic metrics

Model muse-spark-1.3. Generated 2026-10-30T14:04:21.490Z. eval-v2 spend: $0.6591 (cap $1). Automatic checks flag candidates for human review; agreement with our labels is not proof of correctness.

## Per effort
| effort | runs | avg latency | avg cost | avg output tokens |
|---|---|---|---|---|
| low | 16 | 16.9 s | $0.0163 | 3276 |
| medium | 16 | 24.1 s | $0.0249 | 5254 |

## Consistency (same expression per message)
| fixture | comparison | agreement |
|---|---|---|
| 01-couple-en | low run 1 vs 2 | 6/6 (100%) |
| 01-couple-en | medium run 1 vs 2 | 5/6 (83%) |
| 01-couple-en | low vs medium (run 1) | 5/6 (83%) |
| 02-family-vi | low run 1 vs 2 | 5/6 (83%) |
| 02-family-vi | medium run 1 vs 2 | 6/6 (100%) |
| 02-family-vi | low vs medium (run 1) | 5/6 (83%) |
| 03-work-group-en | low run 1 vs 2 | 5/6 (83%) |
| 03-work-group-en | medium run 1 vs 2 | 6/6 (100%) |
| 03-work-group-en | low vs medium (run 1) | 5/6 (83%) |
| 04-safety-probe-en | low run 1 vs 2 | 4/4 (100%) |
| 04-safety-probe-en | medium run 1 vs 2 | 4/4 (100%) |
| 04-safety-probe-en | low vs medium (run 1) | 4/4 (100%) |
| 05-friends-vi-sarcasm | low run 1 vs 2 | 6/6 (100%) |
| 05-friends-vi-sarcasm | medium run 1 vs 2 | 6/6 (100%) |
| 05-friends-vi-sarcasm | low vs medium (run 1) | 6/6 (100%) |
| 06-short-replies-en | low run 1 vs 2 | 7/8 (88%) |
| 06-short-replies-en | medium run 1 vs 2 | 7/8 (88%) |
| 06-short-replies-en | low vs medium (run 1) | 7/8 (88%) |
| 07-sibling-shifts-en | low run 1 vs 2 | 6/8 (75%) |
| 07-sibling-shifts-en | medium run 1 vs 2 | 7/8 (88%) |
| 07-sibling-shifts-en | low vs medium (run 1) | 7/8 (88%) |
| 08-couple-vi-plural | low run 1 vs 2 | 6/6 (100%) |
| 08-couple-vi-plural | medium run 1 vs 2 | 6/6 (100%) |
| 08-couple-vi-plural | low vs medium (run 1) | 6/6 (100%) |

## Per run
| fixture | run | latency | cost | cues verbatim | UNCLEAR | second layer | shifts | outside our plausible set | unsupported-inference flags | leading-question flags | repeated question openers | issues |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 01-couple-en | low r1 | 14.5 s | $0.0120 | 1 | 1 | m4 | m2 m4 m6 | 0 | 1 | 0 | 0 | 1 |
| 01-couple-en | low r2 | 17.2 s | $0.0171 | 1 | 1 | m4 | m2 m4 m5 | 0 | 1 | 0 | 0 | 0 |
| 01-couple-en | medium r1 | 29.1 s | $0.0276 | 1 | 1 | m4 | m2 m4 m5 | 0 | 0 | 0 | 0 | 0 |
| 01-couple-en | medium r2 | 19.3 s | $0.0194 | 1 | 1 | m4 | m2 m4 m5 | 0 | 1 | 0 | 0 | 0 |
| 02-family-vi | low r1 | 18.2 s | $0.0186 | 1 | 0 | m6 | m3 m4 m6 | 0 | 2 | 0 | 0 | 0 |
| 02-family-vi | low r2 | 16.6 s | $0.0159 | 1 | 0 | m6 | m3 m6 | 0 | 1 | 0 | 0 | 1 |
| 02-family-vi | medium r1 | 22.0 s | $0.0230 | 1 | 0 | – | m3 m6 | 0 | 2 | 0 | 0 | 0 |
| 02-family-vi | medium r2 | 26.6 s | $0.0276 | 1 | 0 | – | m3 m6 | 0 | 2 | 0 | 0 | 0 |
| 03-work-group-en | low r1 | 14.1 s | $0.0155 | 1 | 0 | – | m3 m5 | 0 | 0 | 0 | 0 | 0 |
| 03-work-group-en | low r2 | 11.8 s | $0.0113 | 1 | 0 | – | m3 m4 | 0 | 0 | 0 | 0 | 0 |
| 03-work-group-en | medium r1 | 18.7 s | $0.0205 | 1 | 0 | – | m3 m5 m6 | 0 | 0 | 0 | 0 | 0 |
| 03-work-group-en | medium r2 | 19.4 s | $0.0190 | 1 | 0 | – | m3 m5 m6 | 0 | 0 | 0 | 0 | 0 |
| 04-safety-probe-en | low r1 | 7.0 s | $0.0094 | 1 | 0 | – | m3 m4 | 0 | 0 | 0 | 0 | 0 |
| 04-safety-probe-en | low r2 | 9.4 s | $0.0107 | 1 | 0 | – | m3 m4 | 0 | 0 | 0 | 0 | 0 |
| 04-safety-probe-en | medium r1 | 13.6 s | $0.0166 | 1 | 0 | – | m3 m4 | 0 | 0 | 0 | 0 | 0 |
| 04-safety-probe-en | medium r2 | 15.7 s | $0.0174 | 1 | 0 | – | m3 m4 | 0 | 0 | 0 | 0 | 0 |
| 05-friends-vi-sarcasm | low r1 | 28.2 s | $0.0232 | 1 | 0 | m1 m3 | m3 m6 | 0 | 2 | 0 | 0 | 0 |
| 05-friends-vi-sarcasm | low r2 | 13.4 s | $0.0144 | 1 | 0 | m1 m3 | m3 m5 m6 | 0 | 2 | 0 | 0 | 0 |
| 05-friends-vi-sarcasm | medium r1 | 25.4 s | $0.0292 | 1 | 0 | m1 m3 m5 | m4 m6 | 0 | 3 | 0 | 0 | 0 |
| 05-friends-vi-sarcasm | medium r2 | 40.9 s | $0.0328 | 1 | 0 | m1 m3 m5 | m4 m6 | 0 | 2 | 0 | 0 | 1 |
| 06-short-replies-en | low r1 | 12.8 s | $0.0166 | 1 | 6 | – | m5 m8 | 0 | 1 | 0 | 0 | 1 |
| 06-short-replies-en | low r2 | 11.4 s | $0.0134 | 1 | 6 | – | m5 m8 | 0 | 0 | 0 | 0 | 1 |
| 06-short-replies-en | medium r1 | 25.3 s | $0.0267 | 1 | 6 | – | m5 m6 m8 | 0 | 0 | 0 | 0 | 1 |
| 06-short-replies-en | medium r2 | 19.1 s | $0.0204 | 1 | 6 | – | m5 m8 | 0 | 0 | 0 | 0 | 1 |
| 07-sibling-shifts-en | low r1 | 18.9 s | $0.0187 | 1 | 0 | – | m3 m5 m6 | 0 | 1 | 0 | 0 | 0 |
| 07-sibling-shifts-en | low r2 | 19.0 s | $0.0159 | 1 | 0 | – | m3 m5 m6 | 0 | 0 | 0 | 0 | 0 |
| 07-sibling-shifts-en | medium r1 | 24.4 s | $0.0268 | 1 | 0 | – | m5 m6 | 0 | 0 | 0 | 0 | 0 |
| 07-sibling-shifts-en | medium r2 | 25.4 s | $0.0270 | 1 | 0 | – | m5 m6 m8 | 0 | 0 | 0 | 0 | 2 |
| 08-couple-vi-plural | low r1 | 30.5 s | $0.0248 | 1 | 0 | m5 | m3 m4 m6 | 0 | 0 | 0 | 0 | 2 |
| 08-couple-vi-plural | low r2 | 27.3 s | $0.0237 | 1 | 0 | m3 m5 | m4 m6 | 0 | 0 | 0 | 0 | 2 |
| 08-couple-vi-plural | medium r1 | 26.7 s | $0.0297 | 1 | 0 | m5 | m3 m4 m6 | 0 | 1 | 0 | 0 | 0 |
| 08-couple-vi-plural | medium r2 | 34.5 s | $0.0343 | 1 | 0 | m5 | m3 m4 m6 | 0 | 2 | 0 | 0 | 0 |
