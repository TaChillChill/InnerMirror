#!/bin/sh
# Mocked end-to-end checks against a local production build. Every /api/* request is
# intercepted in the browser (mocks or blocked), so no paid call can leave. Needs Google
# Chrome and the app on :3123:  npm run build && META_API_KEY= npx next start -p 3123
cd "$(dirname "$0")" || exit 1
# A plain-HTTP LAN address is not a secure context (as on an iPhone testing a local build);
# f2 runs there too. Falls back to localhost when there is no LAN address. Needs -H 0.0.0.0
# or the default host binding of `next start`.
LAN="http://$(ipconfig getifaddr en0 2>/dev/null || echo localhost):3123/"
for args in "m1-back.mjs 390" "m1-back.mjs 1280" "m2-merge.mjs 390" "m6-sample.mjs 390 en" "m6-sample.mjs 1280 vi" \
            "u7-mirror.mjs 390 vi" "u7-mirror.mjs 1280 en" "r1-untouched.mjs 390" "r1-untouched.mjs 1280" \
            "w1-observe.mjs 390" "w1-observe.mjs 1280" "w2-input.mjs 390" "w2-input.mjs 1280" \
            "u8-direction.mjs 390" "u8-direction.mjs 1280" "u3-story.mjs 390" "u3-story.mjs 1280" \
            "t1-theme.mjs 360" "t1-theme.mjs 1280" "e1-errors.mjs 390" \
            "f1-uat-fixes.mjs 360 dark" "f1-uat-fixes.mjs 390 light" "f1-uat-fixes.mjs 390 dark" "f1-uat-fixes.mjs 1280 light" \
            "f2-batch2.mjs 390 dark vi $LAN" "f2-batch2.mjs 360 light en $LAN" "f2-batch2.mjs 1280 light vi" "f2-batch2.mjs 1280 dark en $LAN"; do
  # shellcheck disable=SC2086 # word splitting is intended
  node --disable-warning=ExperimentalWarning $args
done | grep -E "^width|PASS|FAIL|ERROR|API requests"
