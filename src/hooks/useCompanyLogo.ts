"use client";

import { useState, useEffect } from "react";

/**
 * Tries to load a company logo via Google's favicon API.
 * Returns the URL on success, null on failure. Callers render a
 * fallback (industry monogram, initials, etc.) when logoUrl is null.
 *
 * Google Favicon: https://www.google.com/s2/favicons?domain={domain}&sz=128
 * Free, reliable, CORS-enabled. Returns a generic globe for unknown
 * domains (16x16), which we detect and reject.
 */

function extractDomain(companyUrl: string): string | null {
  if (!companyUrl) return null;
  try {
    let url = companyUrl.trim();
    if (!url.startsWith("http")) url = `https://${url}`;
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export interface CompanyLogoState {
  logoUrl: string | null;
  loading: boolean;
}

export function useCompanyLogo(companyUrl: string): CompanyLogoState {
  const [state, setState] = useState<CompanyLogoState>({
    logoUrl: null,
    loading: false,
  });

  useEffect(() => {
    const domain = extractDomain(companyUrl);
    if (!domain) {
      setState({ logoUrl: null, loading: false });
      return;
    }

    const logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    setState({ logoUrl: null, loading: true });

    const img = new Image();
    img.onload = () => {
      // Google returns a generic globe (16x16) for unknown domains — reject it
      setState({ logoUrl: img.naturalWidth > 16 ? logoUrl : null, loading: false });
    };
    img.onerror = () => {
      setState({ logoUrl: null, loading: false });
    };
    img.src = logoUrl;

    return () => { img.onload = null; img.onerror = null; };
  }, [companyUrl]);

  return state;
}
