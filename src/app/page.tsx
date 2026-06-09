import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Entry router. While the tool is Sales-only there's no standalone
 * landing — `/` just forwards:
 *   - signed in  → the builder (/admin?audience=sales)
 *   - signed out → the sign-in screen
 *
 * Server-side redirect (no flash, works without JS). The multi-workspace
 * landing (Sales / CE / PS / … picker) is preserved at
 * `src/components/WorkspaceLanding.tsx` — render it back here to restore
 * the chooser when CE/PS ship.
 */
export default async function Home() {
  const session = await auth();
  redirect(session?.user ? "/admin?audience=sales" : "/signin");
}
