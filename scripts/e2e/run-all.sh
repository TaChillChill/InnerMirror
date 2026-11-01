#!/bin/sh
# Mocked end-to-end checks against a local production build. Every /api/* request is
# intercepted in the browser (mocks or blocked), so no paid call can leave. Needs Google
# Chrome and the app on :3123:  npm run build && META_API_KEY= npx next start -p 3123
cd "$(dirname "$0")" || exit 1
for args in "m1-back.mjs 390" "m1-back.mjs 1280" "m2-merge.mjs 390" "m6-sample.mjs 390 en" "m6-sample.mjs 1280 vi" \
            "u7-mirror.mjs 390 vi" "u7-mirror.mjs 1280 en" "r1-untouched.mjs 390" "r1-untouched.mjs 1280" \
            "w1-observe.mjs 390" "w1-observe.mjs 1280" "w2-input.mjs 390" "w2-input.mjs 1280" \
            "u8-direction.mjs 390" "u8-direction.mjs 1280" "u3-story.mjs 390" "u3-story.mjs 1280"; do
  # shellcheck disable=SC2086 # word splitting is intended
  node --disable-warning=ExperimentalWarning $args
done | grep -E "^width|PASS|FAIL|ERROR|API requests"
