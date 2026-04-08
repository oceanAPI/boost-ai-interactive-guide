"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { decodeGuideData } from "@/lib/url-encoding";
import type { GuideData } from "@/lib/types";
import GuideClient from "./GuideClient";

function GuideContent() {
  const searchParams = useSearchParams();
  const encoded = searchParams.get("data");

  if (!encoded) {
    return (
      <div className="min-h-screen bg-boost-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">No guide data found</p>
          <a href="/admin" className="text-boost-green-light hover:underline">
            ← Create a new guide
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
          <p className="text-white text-xl mb-4">Invalid guide data</p>
          <a href="/admin" className="text-boost-green-light hover:underline">
            ← Create a new guide
          </a>
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

  return <GuideClient guide={guide} />;
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
