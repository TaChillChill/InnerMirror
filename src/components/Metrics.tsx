"use client";
// Vercel Web Analytics: default page views only (no custom events, nothing from the
// conversation). The layout renders this on Production builds only. The app never puts
// anything in the URL, but query and hash are stripped before sending anyway, so a future
// link can't leak into the statistics.
import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

const bare = (e: BeforeSendEvent): BeforeSendEvent => {
  const u = new URL(e.url);
  u.search = "";
  u.hash = "";
  return { ...e, url: u.toString() };
};

export function Metrics() {
  return <Analytics beforeSend={bare} />;
}
