"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { decodeGuideData } from "@/lib/url-encoding";
import type { Customer, GuideData } from "@/lib/types";
import SlideshowClient from "@/components/SlideshowClient";

/**
 * Fragment-first URL param reader. See `src/app/guide/page.tsx` for the
 * full rationale — in short: GitHub Pages' CDN rejects URLs past ~8KB,
 * but fragments are never sent to the server. Falls back to query-string
 * for back-compat with existing bookmarks.
 */
function useSlidesUrlParams(): URLSearchParams | null {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<URLSearchParams | null>(null);
  useEffect(() => {
    const raw = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const fromFragment = new URLSearchParams(raw);
    const merged = new URLSearchParams();
    for (const [k, v] of searchParams.entries()) merged.set(k, v);
    for (const [k, v] of fromFragment.entries()) merged.set(k, v);
    setParams(merged);
  }, [searchParams]);
  return params;
}

function SlidesContent() {
  const urlParams = useSlidesUrlParams();

  if (urlParams === null) {
    return (
      <div className="min-h-screen bg-boost-bg flex items-center justify-center">
        <p className="text-boost-muted">Loading presentation...</p>
      </div>
    );
  }

  const encoded = urlParams.get("data");
  const sectionsParam = urlParams.get("sections");

  if (!encoded || !sectionsParam) {
    return (
      <div className="min-h-screen bg-boost-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-boost-dark text-xl mb-4">Missing presentation data</p>
          <Link href="/admin" className="text-boost-green-light hover:underline">
            ← Back to admin
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
          <p className="text-boost-dark text-xl mb-4">Invalid guide data</p>
          <Link href="/admin" className="text-boost-green-light hover:underline">
            ← Back to admin
          </Link>
        </div>
      </div>
    );
  }

  const guide: GuideData = {
    id: "slides",
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
    conversation_cost: formData.conversation_cost || "",
    pricing_model: formData.pricing_model || "fixed",
    deployment_markets: formData.deployment_markets || 1,
    resources: formData.resources || {},
    integrations: formData.integrations || {},
    custom_notes: formData.custom_notes || "",
  };

  // Backwards-compat shim: old URLs reference "core-components" — rewrite to new id.
  const sectionIds = sectionsParam
    .split(",")
    .filter(Boolean)
    .map((id) => (id === "core-components" ? "platform-vision" : id));

  // Mirror guide/page.tsx: pass the full decoded formData as `customer`
  // so slides can render the CE + PS sections that read from
  // customer.* fields (agenda, performance, success-plan,
  // project-framing, build-scope, etc.).
  const customer: Customer = { ...formData };

  return <SlideshowClient guide={guide} customer={customer} sectionIds={sectionIds} />;
}

export default function SlidesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-boost-bg flex items-center justify-center">
          <p className="text-boost-muted">Loading presentation...</p>
        </div>
      }
    >
      <SlidesContent />
    </Suspense>
  );
}
