import type { Metadata } from "next";
import { PrivacyPolicy } from "@/components/PrivacyPolicy";

export const metadata: Metadata = { title: "Privacy · InnerMirror" };

export default function PrivacyPage() {
  return <PrivacyPolicy />;
}
