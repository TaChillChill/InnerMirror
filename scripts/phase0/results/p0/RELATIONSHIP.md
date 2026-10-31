# Relationship eval (v3.2, low effort) — automatic summary

Note: "family" also matches the schema field name, so ignore it in the mentions column.

```
vi2-family     ctx-rel       beyond-noise: none | mentions: family, gia đình
vi3-friends    ctx-rel       beyond-noise: none | mentions: family
vi5-work       ctx-rel       beyond-noise: none | mentions: family
vi5-work       ctx-relLead   beyond-noise: none | mentions: sếp cũ, family
vi6-checkin    ctx-rel       beyond-noise: none | mentions: family, gia đình
vi6-checkin    ctx-relOther  beyond-noise: none | mentions: hàng xóm, family
en2-sibling    ctx-rel       beyond-noise: none | mentions: family
en3-couple     ctx-rel       beyond-noise: m1 A.m|A.m → AC.m | mentions: partner, family
vi8-roles      ctx-rel       beyond-noise: none | mentions: family, gia đình
vi8-roles      ctx-relOther  beyond-noise: none | mentions: mẹ chồng, family, gia đình
vi9-hierarchy  ctx-relOther  beyond-noise: none | mentions: trưởng phòng, nhân viên mới, vai, family
messages changed vs BOTH no-context runs: 1/70; no-context runs disagree with each other on 14/70
vi8-roles selfA         m1:A.m m2:NP.h m3:FC.h m4:CP.h m5:AC.h m6:A.m
vi8-roles selfB         m1:A.m m2:NP.h m3:FC.h m4:CP.h m5:AC.h m6:A.m
vi8-roles ctx-rel       m1:A.h m2:NP.h m3:FC.h m4:CP.h m5:AC.h m6:A.h
vi8-roles ctx-relOther  m1:A.m m2:NP.h m3:FC.h m4:CP.h m5:AC.h m6:A.m
vi9-hierarchy selfA         m1:CP.h m2:AC.h m3:A.h m4:NP.m m5:FC.h
vi9-hierarchy selfB         m1:CP.h m2:AC.h m3:A.h m4:NP.m m5:FC.h
vi9-hierarchy ctx-relOther  m1:CP.h m2:AC.h m3:A.h m4:NP.m m5:FC.h
```
