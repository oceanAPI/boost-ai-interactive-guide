import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Entry router. `/` just forwards:
 *   - signed in  → the workspace picker (/home: Sales / Customer Success)
 *   - signed out → the sign-in screen
 *
 * Server-side redirect (no flash, works without JS).
 */
export default async function Home() {
  const session = await auth();
  redirect(session?.user ? "/home" : "/signin");
}
