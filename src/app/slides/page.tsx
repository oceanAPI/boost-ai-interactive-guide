"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { decodeGuideData } from "@/lib/url-encoding";
import type { GuideData } from "@/lib/types";
import SlideshowClient from "@/components/SlideshowClient";

function SlidesContent() {
  const searchParams = useSearchParams();
  const encoded = searchParams.get("data");
  const sectionsParam = searchParams.get("sections");

  if (!encoded || !sectionsParam) {
    return (
      <div className="min-h-screen bg-boost-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-boost-dark text-xl mb-4">Missing presentation data</p>
          <a href="/admin" className="text-boost-green-light hover:underline">
            ← Back to admin
          </a>
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
          <a href="/admin" className="text-boost-green-light hover:underline">
            ← Back to admin
          </a>
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

  return <SlideshowClient guide={guide} sectionIds={sectionIds} />;
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
