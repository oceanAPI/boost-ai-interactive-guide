"use client";

/* ──────────────────────────────────────────────────────────────
 *  VoicePreviewSection — voice-channel dispatcher
 *
 *  Mirrors DemoPreviewSection's routing logic, voice-flavoured.
 *  Switches between three render paths based on the customer's
 *  `demo_mode`:
 *
 *    - "live"        → VoiceLiveSection on the default demo tenant
 *                      (financewizard.boost.ai) with browser Web
 *                      Speech API for STT/TTS.
 *    - "custom_live" → VoiceLiveSection on the customer's own
 *                      tenant (customer.demo_tenant).
 *    - otherwise     → existing scripted VoiceSection playback.
 *
 *  If "custom_live" is selected but no tenant is configured, we
 *  fall through to scripted — safer than rendering a broken voice
 *  session on a shared engagement URL.
 *
 *  Honest framing: live voice uses the browser's TTS, not the
 *  production ElevenLabs voice. The VoiceLiveSection subtitle
 *  surfaces this so AEs / prospects aren't surprised.
 * ────────────────────────────────────────────────────────────── */

import { resolveDemoTenant } from "@/lib/boost-chat";
import type { GuideData, Customer } from "@/lib/types";
import VoiceLiveSection from "./demo/VoiceLiveSection";
import VoiceSection from "./VoiceSection";

interface VoicePreviewSectionProps {
  guide: GuideData;
  customer?: Customer;
  sectionNumber?: string;
}

export default function VoicePreviewSection({
  guide,
  customer,
  sectionNumber,
}: VoicePreviewSectionProps) {
  const mode = customer?.demo_mode ?? "simulated";

  if (mode === "live") {
    const tenant = resolveDemoTenant();
    return (
      <VoiceLiveSection
        tenant={tenant}
        mode="live"
        sectionNumber={sectionNumber}
      />
    );
  }

  if (mode === "custom_live") {
    const tenant = (customer?.demo_tenant ?? "").trim();
    if (tenant) {
      return (
        <VoiceLiveSection
          tenant={tenant}
          mode="custom_live"
          sectionNumber={sectionNumber}
        />
      );
    }
    // Fall through to scripted when no tenant configured — safer
    // than rendering a broken voice session on a shared URL.
  }

  return <VoiceSection guide={guide} sectionNumber={sectionNumber} />;
}
