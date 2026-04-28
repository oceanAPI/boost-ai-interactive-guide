"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { decodeGuideData } from "@/lib/url-encoding";
import type { Customer, GuideData } from "@/lib/types";
import GuideClient from "./GuideClient";

/**
 * Hook: read `data` + `sections` from the URL fragment (`#data=...&sections=...`)
 * with fall-back to query-string (`?data=...`) for back-compat with existing
 * bookmarks / shared links.
 *
 * Why fragment: GitHub Pages' Varnish CDN returns HTTP 414 for URLs past ~8KB.
 * A fully-populated H&M PS guide encodes to ~32KB. Fragments are never sent
 * to the server, so the CDN never sees the payload — no URL-length cap.
 *
 * Returns `null` until the first client render has read the hash, so we
 * don't flash "Invalid guide data" for fragment URLs on initial hydration.
 */
function useGuideUrlParams(): URLSearchParams | null {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<URLSearchParams | null>(null);
  useEffect(() => {
    const raw = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const fromFragment = new URLSearchParams(raw);
    // Merge: fragment wins, query-string fills gaps for back-compat.
    const merged = new URLSearchParams();
    for (const [k, v] of searchParams.entries()) merged.set(k, v);
    for (const [k, v] of fromFragment.entries()) merged.set(k, v);
    setParams(merged);
  }, [searchParams]);
  return params;
}

function GuideContent() {
  const urlParams = useGuideUrlParams();

  // First client render — we haven't parsed the fragment yet. Fall through
  // to the Suspense fallback rather than briefly showing "No guide data".
  if (urlParams === null) {
    return (
      <div className="min-h-screen bg-boost-bg flex items-center justify-center">
        <p className="text-boost-muted">Loading guide...</p>
      </div>
    );
  }

  const encoded = urlParams.get("data");

  if (!encoded) {
    return (
      <div className="min-h-screen bg-boost-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">No guide data found</p>
          <Link href="/admin" className="text-boost-green-light hover:underline">
            ← Create a new guide
          </Link>
        </div>
      </div>
    );
  }

  const formData = decodeGuideData(encoded);

  if (!formData) {
    return (
      <div className="min-h-screen bg-boost-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Invalid guide data</p>
          <Link href="/admin" className="text-boost-green-light hover:underline">
            ← Create a new guide
          </Link>
        </div>
      </div>
    );
  }

  const guide: GuideData = {
    id: "url",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    company_name: formData.company_name,
    company_url: formData.company_url || "",
    contact_name: formData.contact_name || "",
    contact_role: formData.contact_role || "",
    start_date: formData.start_date || new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    areas_of_interest: formData.areas_of_interest || [],
    specific_requirements: formData.specific_requirements || "",
    channel_volumes: formData.channel_volumes || {},
    market_volumes: formData.market_volumes,
    conversation_cost: formData.conversation_cost || "",
    currency: formData.currency,
    pricing_model: formData.pricing_model || "fixed",
    fte_capacity_per_month: formData.fte_capacity_per_month,
    automation_ramp_months: formData.automation_ramp_months,
    deployment_markets: formData.deployment_markets || 1,
    resources: formData.resources || {},
    integrations: formData.integrations || {},
    pricing_config: formData.pricing_config,
    engagement_framework: formData.engagement_framework,
    custom_notes: formData.custom_notes || "",
  };

  const sectionsParam = urlParams.get("sections");
  // Backwards-compat shim: old URLs reference "core-components" — rewrite to new id.
  const sectionIds = sectionsParam
    ? sectionsParam.split(",").map((id) => (id === "core-components" ? "platform-vision" : id))
    : undefined;

  // Pass the full decoded formData as `customer` alongside the
  // Sales-shaped `guide` projection. Existing Sales sections keep
  // reading from `guide`; new CE sections (agenda, performance,
  // success plan, etc.) read from `customer` which carries the
  // optional CE fields (br_context, performance, agent_swot,
  // uat_status, benchmarks, recommendations, etc.).
  const customer: Customer = { ...formData };

  return <GuideClient guide={guide} customer={customer} sectionIds={sectionIds} />;
}

export default function GuidePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-boost-bg flex items-center justify-center">
          <p className="text-boost-muted">Loading guide...</p>
        </div>
      }
    >
      <GuideContent />
    </Suspense>
  );
}
