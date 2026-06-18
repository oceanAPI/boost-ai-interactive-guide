import { encodeGuideData } from "@/lib/url-encoding";
import type { GuideFormData } from "@/lib/types";

/* ─── Read-only guide URL builder ───
 *  Given a stored engagement's data + section list (+ optional
 *  audience), produce the URL that renders the read-only guide output.
 *
 *  The bulky payload lives in the URL FRAGMENT (`#data=…`) — fragments
 *  are client-only so the CDN never sees them (GitHub Pages' Varnish
 *  rejects URIs past ~8KB; a rich fixture encodes to ~32KB). `audience`
 *  rides as a tiny query param. Mirrors admin's proceedWithGenerate. */
export function buildGuideUrl(opts: {
  data: GuideFormData;
  sections: string[];
  audience?: string | null;
}): string {
  const encoded = encodeGuideData(opts.data);
  const fragment = new URLSearchParams();
  fragment.set("data", encoded);
  if (opts.sections?.length) fragment.set("sections", opts.sections.join(","));
  const qs = opts.audience ? `?audience=${encodeURIComponent(opts.audience)}` : "";
  return `/guide${qs}#${fragment.toString()}`;
}
