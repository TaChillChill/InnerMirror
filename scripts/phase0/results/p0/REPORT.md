# P0 classification eval — automatic metrics

Generated 2026-10-31T08:10:13.638Z. Model muse-spark-1.3. Effort: medium for v2.1/v3.1/v3.1-msg, low for v3.1-low and v3 (= v3.2, shipped). Reference sets are Claude's hypotheses (see fixtures); misses are prompts for review, not proof.

## Totals (selfA runs)
| spec | runs | acceptable | hard fails | over ceiling | high on review items | no alternative when < high | UNCLEAR | high | avg latency | avg cost | avg out tokens |
|---|---|---|---|---|---|---|---|---|---|---|---|
| v2.1 | 10 | 66/68 (97%) | 0 | 1 | 3 | 1 | 10 | 15 | 25.9 s | $0.0277 | 5880 |
| v3.1 | 11 | 86/91 (95%) | 0 | 4 | 4 | 0 | 11 | 26 | 30.8 s | $0.0308 | 6501 |
| v3.1-msg | 11 | 87/91 (96%) | 1 | 2 | 5 | 0 | 11 | 29 | 31.3 s | $0.0311 | 6836 |
| v3.1-low | 3 | 41/43 (95%) | 0 | 2 | 1 | 0 | 2 | 10 | 16.8 s | $0.0205 | 3916 |
| v3 | 11 | 84/91 (92%) | 0 | 5 | 5 | 0 | 9 | 24 | 14.6 s | $0.0177 | 3269 |

## Per fixture (selfA)
| fixture | spec | acceptable | hard fails | over ceiling | segments | safety |
|---|---|---|---|---|---|---|
| vi1-hardship | v3.1 | 22/23 | – | m15 AC:medium | 15 seg / 23 msg (split) | no (exp either) |
| vi1-hardship | v3.1-msg | 22/23 | – | – | 23 seg / 23 msg | no (exp either) |
| vi1-hardship | v3.1-low | 22/23 | – | m12 CP:high | 14 seg / 23 msg (split) | no (exp either) |
| vi1-hardship | v3 | 20/23 | – | m15 AC:medium | 13 seg / 23 msg (split) | no (exp either) |
| vi2-family | v2.1 | 7/7 | – | m6 AC:high | – | no (exp false) |
| vi2-family | v3.1 | 7/7 | – | m6 AC:high | 6 seg / 7 msg (split) | no (exp false) |
| vi2-family | v3.1-msg | 7/7 | – | – | 7 seg / 7 msg | no (exp false) |
| vi2-family | v3 | 7/7 | – | – | 6 seg / 7 msg (split) | no (exp false) |
| vi3-friends | v2.1 | 6/6 | – | – | – | no (exp false) |
| vi3-friends | v3.1 | 6/6 | – | – | 6 seg / 6 msg | no (exp false) |
| vi3-friends | v3.1-msg | 6/6 | – | – | 6 seg / 6 msg | no (exp false) |
| vi3-friends | v3 | 6/6 | – | m4 CP:high | 6 seg / 6 msg | no (exp false) |
| vi4-couple | v2.1 | 6/7 | – | – | – | no (exp false) |
| vi4-couple | v3.1 | 6/7 | – | m4 CP:high | 6 seg / 7 msg | no (exp false) |
| vi4-couple | v3.1-msg | 6/7 | m5 NP:high | m5 NP:high | 7 seg / 7 msg | no (exp false) |
| vi4-couple | v3 | 6/7 | – | m4 CP:high | 6 seg / 7 msg | no (exp false) |
| vi5-work | v2.1 | 6/6 | – | – | – | no (exp false) |
| vi5-work | v3.1 | 6/6 | – | – | 6 seg / 6 msg | no (exp false) |
| vi5-work | v3.1-msg | 6/6 | – | – | 6 seg / 6 msg | no (exp false) |
| vi5-work | v3 | 4/6 | – | – | 6 seg / 6 msg | no (exp false) |
| vi6-checkin | v2.1 | 7/7 | – | – | – | no (exp false) |
| vi6-checkin | v3.1 | 7/7 | – | – | 6 seg / 7 msg | no (exp false) |
| vi6-checkin | v3.1-msg | 7/7 | – | – | 7 seg / 7 msg | no (exp false) |
| vi6-checkin | v3.1-low | 7/7 | – | – | 6 seg / 7 msg | no (exp false) |
| vi6-checkin | v3 | 7/7 | – | – | 6 seg / 7 msg | no (exp false) |
| vi7-safety | v2.1 | 0/0 | – | – | – | no (exp true) |
| vi7-safety | v3.1 | 0/0 | – | – | 3 seg / 3 msg | flagged (self_harm) (exp true) |
| vi7-safety | v3.1-msg | 0/0 | – | – | 3 seg / 3 msg | flagged (self_harm) (exp true) |
| vi7-safety | v3 | 0/0 | – | – | 3 seg / 3 msg | flagged (self_harm) (exp true) |
| en1-venting | v2.1 | 13/13 | – | – | – | no (exp either) |
| en1-venting | v3.1 | 10/13 | – | m9 AC:medium | 8 seg / 13 msg (split) | no (exp either) |
| en1-venting | v3.1-msg | 12/13 | – | – | 13 seg / 13 msg | no (exp either) |
| en1-venting | v3.1-low | 12/13 | – | m9 AC:medium | 7 seg / 13 msg | no (exp either) |
| en1-venting | v3 | 13/13 | – | m9 AC:medium | 8 seg / 13 msg (split) | no (exp either) |
| en2-sibling | v2.1 | 8/8 | – | – | – | no (exp false) |
| en2-sibling | v3.1 | 8/8 | – | – | 8 seg / 8 msg | no (exp false) |
| en2-sibling | v3.1-msg | 8/8 | – | m1 A:high | 8 seg / 8 msg | no (exp false) |
| en2-sibling | v3 | 8/8 | – | m1 A:high | 8 seg / 8 msg | no (exp false) |
| en3-couple | v2.1 | 6/6 | – | – | – | no (exp false) |
| en3-couple | v3.1 | 6/6 | – | – | 6 seg / 6 msg | no (exp false) |
| en3-couple | v3.1-msg | 6/6 | – | – | 6 seg / 6 msg | no (exp false) |
| en3-couple | v3 | 6/6 | – | – | 6 seg / 6 msg | no (exp false) |
| en4-short | v2.1 | 7/8 | – | – | – | no (exp false) |
| en4-short | v3.1 | 8/8 | – | – | 8 seg / 8 msg | no (exp false) |
| en4-short | v3.1-msg | 7/8 | – | – | 8 seg / 8 msg | no (exp false) |
| en4-short | v3 | 7/8 | – | – | 8 seg / 8 msg | no (exp false) |

## Role reversal (selfA vs selfB, same fixture)
v2.1 sends who the user is; v3.x sends identical requests, so its difference is run-to-run noise only.
| fixture | spec | same label | same P/A/C | differences |
|---|---|---|---|---|
| vi2-family | v2.1 | 6/7 | 6/7 | m3 AC:medium→A:medium |
| vi3-friends | v2.1 | 6/6 | 6/6 | – |
| vi4-couple | v2.1 | 6/7 | 6/7 | m5 NP:low→A:low |
| vi5-work | v2.1 | 5/6 | 5/6 | m2 NP:medium→A:medium |
| vi6-checkin | v2.1 | 6/7 | 6/7 | m5 FC:low→A:medium |
| vi7-safety | v2.1 | 3/3 | 3/3 | – |
| en1-venting | v2.1 | 13/13 | 13/13 | – |
| en2-sibling | v2.1 | 6/8 | 7/8 | m4 AC:medium→FC:medium; m7 AC:medium→A:medium |
| en3-couple | v2.1 | 4/6 | 4/6 | m1 A:medium→AC:medium; m5 NP:medium→A:medium |
| en4-short | v2.1 | 8/8 | 8/8 | – |
| **all** | v2.1 | **89%** | **90%** | |
| vi2-family | v3.1 | 7/7 | 7/7 | – |
| vi3-friends | v3.1 | 5/6 | 5/6 | m1 A:medium→FC:medium |
| vi4-couple | v3.1 | 7/7 | 7/7 | – |
| vi5-work | v3.1 | 4/6 | 4/6 | m4 A:medium→CP:low; m6 UNCLEAR:low→A:low |
| vi6-checkin | v3.1 | 4/7 | 6/7 | m2 FC:medium→AC:medium; m3 FC:medium→AC:medium; m5 AC:low→A:low |
| vi7-safety | v3.1 | 2/3 | 2/3 | m3 UNCLEAR:low→CP:low |
| en1-venting | v3.1 | 9/13 | 13/13 | m1 FC:medium→AC:medium; m2 FC:medium→AC:medium; m3 FC:medium→AC:medium; m4 FC:medium→AC:medium |
| en2-sibling | v3.1 | 8/8 | 8/8 | – |
| en3-couple | v3.1 | 5/6 | 5/6 | m5 NP:medium→A:medium |
| en4-short | v3.1 | 7/8 | 8/8 | m5 UNCLEAR:low→AC:low |
| **all** | v3.1 | **82%** | **92%** | |
| vi1-hardship | v3.1-low | 20/23 | 22/23 | m19 UNCLEAR:low→AC:medium; m20 UNCLEAR:low→AC:medium; m21 AC:low→UNCLEAR:low |
| vi6-checkin | v3.1-low | 6/7 | 6/7 | m1 A:medium→NP:medium |
| en1-venting | v3.1-low | 12/13 | 13/13 | m13 AC:medium→FC:medium |
| **all** | v3.1-low | **88%** | **95%** | |
| vi1-hardship | v3 | 20/23 | 20/23 | m13 AC:medium→CP:low; m19 CP:low→UNCLEAR:low; m20 CP:low→UNCLEAR:low |
| vi2-family | v3 | 7/7 | 7/7 | – |
| vi3-friends | v3 | 6/6 | 6/6 | – |
| vi4-couple | v3 | 7/7 | 7/7 | – |
| vi5-work | v3 | 3/6 | 4/6 | m1 FC:medium→AC:low; m4 CP:medium→A:medium; m6 AC:low→UNCLEAR:low |
| vi6-checkin | v3 | 4/7 | 6/7 | m1 A:medium→NP:medium; m2 FC:medium→AC:medium; m3 FC:medium→AC:medium |
| vi7-safety | v3 | 3/3 | 3/3 | – |
| en1-venting | v3 | 9/13 | 13/13 | m1 AC:medium→FC:medium; m2 AC:medium→FC:medium; m3 AC:medium→FC:medium; m4 AC:medium→FC:medium |
| en2-sibling | v3 | 6/8 | 6/8 | m4 A:medium→AC:medium; m7 A:medium→AC:medium |
| en3-couple | v3 | 6/6 | 6/6 | – |
| en4-short | v3 | 7/8 | 7/8 | m5 AC:low→UNCLEAR:low |
| **all** | v3 | **83%** | **90%** | |

## Context variants (v3.1, medium) vs no-context runs
| fixture | variant | vs selfA | vs selfB | hard fails | over ceiling |
|---|---|---|---|---|---|
| vi1-hardship | relevant | m12 CP:medium→AC:medium | – | – | m15 AC:medium |
| vi1-hardship | leadingA | m20 FC:low→AC:low; m21 UNCLEAR:low→A:low | – | – | m15 AC:medium |
| vi2-family | relevant | same | same | – | – |
| vi3-friends | relevant | same | m1 FC:medium→A:medium | – | – |
| vi4-couple | leadingA | same | same | – | m4 CP:high |
| vi5-work | relevant | m1 FC:medium→A:medium; m6 UNCLEAR:low→A:low | m1 FC:medium→A:medium; m4 CP:low→A:medium | – | – |
| en1-venting | leadingA | m1 FC:medium→AC:medium; m2 FC:medium→AC:medium; m3 FC:medium→AC:medium; m4 FC:medium→AC:medium; m13 FC:medium→AC:low | m13 FC:low→AC:low | – | – |

eval-p0 spend so far: $2.6374 (cap $3).
