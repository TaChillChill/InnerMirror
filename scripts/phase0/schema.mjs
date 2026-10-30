// Strict JSON schema for the AI Observation. Follows Meta's strict subset:
// object root, additionalProperties:false, every key required, nullables via anyOf.

const str = { type: "string" };
const nullable = (s) => ({ anyOf: [s, { type: "null" }] });
const obj = (properties) => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

const EXPRESSION = { type: "string", enum: ["CP", "NP", "A", "FC", "AC", "UNCLEAR"] };
const STRUCTURAL = { type: "string", enum: ["P", "A", "C", "UNCLEAR"] };
const CONFIDENCE = { type: "string", enum: ["low", "medium", "high"] };

export const analysisSchema = obj({
  readings: {
    type: "array",
    items: obj({
      messageId: str,
      expression: EXPRESSION,
      addressedTo: nullable(str),
      target: STRUCTURAL,
      cues: { type: "array", items: str },
      rationale: str,
      confidence: CONFIDENCE,
      alternative: nullable({ type: "string", enum: ["CP", "NP", "A", "FC", "AC"] }),
      reflectionQuestion: nullable(str),
    }),
  },
  transactions: {
    type: "array",
    items: obj({
      stimulusId: str,
      responseId: str,
      type: { type: "string", enum: ["complementary", "crossed", "ulterior", "unclear"] },
      hiddenMessage: nullable(str),
      explanation: str,
      confidence: CONFIDENCE,
    }),
  },
  turningPoints: { type: "array", items: obj({ messageId: str, why: str }) },
  summary: str,
  uncertainty: str,
  safety: obj({
    flagged: { type: "boolean" },
    categories: {
      type: "array",
      items: { type: "string", enum: ["abuse", "coercion", "threat", "self_harm", "harassment"] },
    },
    note: nullable(str),
  }),
});

// Source state follows from the functional expression, so we derive it in code
// instead of asking the model for a second, possibly inconsistent, field.
export const SOURCE_OF = { CP: "P", NP: "P", A: "A", FC: "C", AC: "C", UNCLEAR: "UNCLEAR" };
