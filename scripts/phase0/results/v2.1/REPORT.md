# Prompt v2 evaluation — automatic metrics

Model muse-spark-1.3. Generated 2026-10-30T14:24:06.896Z. eval-v2 spend: $0.7362 (cap $1). Automatic checks flag candidates for human review; agreement with our labels is not proof of correctness.

## Per effort
| effort | runs | avg latency | avg cost | avg output tokens |
|---|---|---|---|---|
| medium | 3 | 23.1 s | $0.0257 | 5356 |

## Consistency (same expression per message)
| fixture | comparison | agreement |
|---|---|---|

## Per run
| fixture | run | latency | cost | cues verbatim | UNCLEAR | second layer | shifts | outside our plausible set | unsupported-inference flags | leading-question flags | repeated question openers | issues |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 02-family-vi | medium r1 | 23.4 s | $0.0274 | 1 | 0 | – | m3 m4 m6 | 0 | 2 | 0 | 0 | 0 |
| 05-friends-vi-sarcasm | medium r1 | 18.1 s | $0.0199 | 0.95 | 0 | m1 m3 m5 | m3 m6 | 0 | 0 | 0 | 0 | 3 |
| 08-couple-vi-plural | medium r1 | 28.0 s | $0.0298 | 1 | 0 | – | m4 m6 | 0 | 0 | 0 | 0 | 0 |
