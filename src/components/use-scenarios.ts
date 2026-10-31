"use client";
// What if? results live only in this component tree's memory: leaving Replay (or a
// refresh) drops them. Nothing is written to localStorage or My Mirror. Each key is one
// message + character + language, so comparing characters never repeats a call.
import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/conversation";
import type { ScenarioContext, ScenarioRequest, ScenarioResult } from "@/lib/ai/scenario";
import type { State } from "@/lib/ai/scenario-spec";
import { effectiveState, type Session } from "./session";

export type Entry = { status: "loading" } | { status: "done"; result: ScenarioResult; labels: Record<string, string> } | { status: "error"; code: string };
type Msg = NonNullable<Session["transcript"]>["messages"][number];

export const scenarioKey = (lang: Lang, messageId: string, state: State) => `${lang}:${messageId}:${state}`;

/** Only the messages before and including the explored one leave the browser, never the reply that followed. */
export function buildRequest(s: Session, ctx: ScenarioContext<Msg>, state: State, language: Lang): ScenarioRequest {
  const messages = [...ctx.history, ctx.target].map((m) => ({ id: m.id, speakerId: m.speakerId, text: m.text.trim(), ...effectiveState(s, m.id) }));
  const participantIds = [...new Set([s.selfId as string, ctx.receiverId, ...messages.map((m) => m.speakerId)])];
  return { language, selfId: s.selfId as string, receiverId: ctx.receiverId, state, participantIds, messages, consent: true };
}

export function useScenarios() {
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const pending = useRef(new Map<string, AbortController>());

  // Leaving Replay cancels anything still in flight.
  useEffect(() => {
    const requests = pending.current;
    return () => requests.forEach((c) => c.abort());
  }, []);

  const explore = useCallback(async (key: string, request: ScenarioRequest) => {
    if (pending.current.has(key)) return;
    const controller = new AbortController();
    pending.current.set(key, controller);
    setEntries((cur) => ({ ...cur, [key]: { status: "loading" } }));
    const settle = (entry: Entry) => setEntries((cur) => ({ ...cur, [key]: entry }));
    try {
      const res = await fetch("/api/scenario", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request), signal: controller.signal });
      const json = await res.json().catch(() => ({}));
      settle(res.ok ? { status: "done", result: json.scenario, labels: json.labels ?? {} } : { status: "error", code: typeof json.error === "string" ? json.error : "unknown" });
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) settle({ status: "error", code: "network" });
    } finally {
      pending.current.delete(key);
    }
  }, []);

  return { entries, explore };
}
