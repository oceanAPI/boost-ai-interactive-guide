import type { GuideFormData } from "@/lib/types";

export function encodeGuideData(data: GuideFormData): string {
  const json = JSON.stringify(data);
  // Use base64url encoding (URL-safe)
  if (typeof window !== "undefined") {
    const encoded = btoa(unescape(encodeURIComponent(json)));
    return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  const encoded = Buffer.from(json, "utf-8").toString("base64");
  return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeGuideData(encoded: string): GuideFormData | null {
  try {
    // Restore base64 padding and characters
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) base64 += "=";

    let json: string;
    if (typeof window !== "undefined") {
      json = decodeURIComponent(escape(atob(base64)));
    } else {
      json = Buffer.from(base64, "base64").toString("utf-8");
    }
    return JSON.parse(json) as GuideFormData;
  } catch {
    return null;
  }
}
