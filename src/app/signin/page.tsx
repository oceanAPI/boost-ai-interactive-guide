"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { assetPath } from "@/lib/asset-path";

function SignInCard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin?audience=sales";
  const error = searchParams.get("error");
  const [pending, setPending] = useState(false);

  // Already signed in? Don't show the login box — forward to the builder.
  useEffect(() => {
    if (status === "authenticated") router.replace(callbackUrl);
  }, [status, callbackUrl, router]);

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl border border-boost-border bg-white shadow-sm px-8 py-10 flex flex-col items-center text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={assetPath("/brand/boost_logo_purple-_main.svg")}
          alt="boost.ai"
          className="h-7 w-auto mb-8"
        />

        <h1 className="text-lg font-semibold text-boost-dark">
          Sign in to continue
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-boost-text-secondary">
          The guide builder is for boost.ai team members and invited
          collaborators. Sign in with your work Google account.
        </p>

        {error ? (
          <p className="mt-5 w-full rounded-lg border border-boost-orange/30 bg-boost-orange/5 px-3 py-2 text-[12px] text-boost-orange">
            {error === "AccessDenied"
              ? "That account isn't allowed. Use your @boost.ai account, or ask to be added as a collaborator."
              : "Sign-in failed. Please try again."}
          </p>
        ) : null}

        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setPending(true);
            signIn("google", { callbackUrl });
          }}
          className="mt-7 w-full inline-flex items-center justify-center gap-2.5 rounded-lg border border-boost-border bg-white px-4 py-2.5 text-sm font-semibold text-boost-dark hover:bg-boost-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
          </svg>
          {pending ? "Redirecting…" : "Continue with Google"}
        </button>

        {/* Dev-only local sign-in. process.env.NODE_ENV is inlined by
            Next at build time, so this button is stripped from the
            production bundle entirely. */}
        {process.env.NODE_ENV === "development" ? (
          <button
            type="button"
            onClick={() => signIn("dev", { callbackUrl })}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-boost-border bg-boost-surface/40 px-4 py-2 text-[12px] font-medium text-boost-muted hover:text-boost-dark hover:bg-boost-surface transition-colors"
          >
            Continue as dev@boost.ai (local only)
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <main className="flex-1 flex items-center justify-center bg-boost-surface px-4 py-16">
      <Suspense fallback={null}>
        <SignInCard />
      </Suspense>
    </main>
  );
}
