// Strict JSON schema for screenshot extraction (the analysis schema lives in
// src/lib/ai/analysis-spec.ts). Follows Meta's strict subset:
// object root, additionalProperties:false, every key required, nullables via anyOf.

const str = { type: "string" };
const nullable = (s) => ({ anyOf: [s, { type: "null" }] });
const obj = (properties) => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

// Screenshot extraction (PHASE0_REPORT §8). The model never decides who the user is;
// it reports sides, and the user confirms "right side = me" in the app.
export const extractionSchema = obj({
  participants: {
    type: "array",
    items: obj({ id: str, side: { type: "string", enum: ["left", "right", "unknown"] }, visibleName: nullable(str) }),
  },
  messages: {
    type: "array",
    items: obj({ id: str, participantId: str, text: str, legibility: { type: "string", enum: ["clear", "partial", "unreadable"] } }),
  },
  notes: { type: "array", items: str },
});
