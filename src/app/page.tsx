"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div className="min-h-screen bg-boost-bg flex items-center justify-center">
      <p className="text-boost-muted">Redirecting...</p>
    </div>
  );
}
