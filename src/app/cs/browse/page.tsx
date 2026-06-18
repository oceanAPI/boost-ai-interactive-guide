"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  listAllEngagements,
  requestEditAccess,
  getEngagementForView,
  type BrowseSummary,
} from "@/app/actions/engagements";
import { buildGuideUrl } from "@/lib/builder/build-guide-url";
import { CsChrome } from "@/components/builder/CsChrome";
import { EngagementCard } from "@/components/builder/EngagementCard";
import { AdminChip, AdminChipRow } from "@/components/admin/primitives";

/* ─── Browse all engagements (/cs/browse) ───
 *  The shared library: every engagement across the team. Search by
 *  company/owner, filter by type (Sales/CS), and tab by relationship
 *  (All / Mine / From others). For others' engagements, View opens the
 *  read-only guide and you can Request edit access. */

type TypeFilter = "all" | "sales" | "customer-success";
type RoleTab = "all" | "mine" | "others";

export default function CsBrowsePage() {
  const router = useRouter();

  const [list, setList] = useState<BrowseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [roleTab, setRoleTab] = useState<RoleTab>("all");
  const [pending, setPending] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const res = await listAllEngagements();
      if (res.ok) setList(res.data);
      else setError(res.error);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((e) => {
      if (typeFilter !== "all" && e.audience !== typeFilter) return false;
      if (roleTab === "mine" && e.role === "other") return false;
      if (roleTab === "others" && e.role !== "other") return false;
      if (q) {
        const hay = `${e.company_name ?? ""} ${e.title ?? ""} ${e.owner_email}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [list, query, typeFilter, roleTab]);

  const handleView = async (id: string) => {
    const res = await getEngagementForView(id);
    if (!res.ok) return;
    const url = buildGuideUrl({ data: res.data.data, sections: res.data.sections, audience: res.data.audience });
    router.push(url);
  };

  const handleRequest = async (id: string) => {
    const res = await requestEditAccess(id);
    if (!res.ok) return;
    setPending((prev) => new Set(prev).add(id));
  };

  return (
    <CsChrome
      title="Browse all engagements"
      subtitle="Every engagement across the team. View any, or request edit access to ones you don't own."
    >
      {/* Search + filters */}
      <div className="mb-5 space-y-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by company or owner…"
          className="w-full px-3.5 py-2.5 bg-white border border-boost-border rounded-lg text-[13px] text-boost-dark placeholder-boost-lavender focus:outline-none focus:ring-2 focus:ring-boost-green-light focus:border-transparent"
        />
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <AdminChipRow>
            <AdminChip active={roleTab === "all"} onClick={() => setRoleTab("all")}>All</AdminChip>
            <AdminChip active={roleTab === "mine"} onClick={() => setRoleTab("mine")}>Mine</AdminChip>
            <AdminChip active={roleTab === "others"} onClick={() => setRoleTab("others")}>From others</AdminChip>
          </AdminChipRow>
          <AdminChipRow>
            <AdminChip tone="secondary" active={typeFilter === "all"} onClick={() => setTypeFilter("all")}>All types</AdminChip>
            <AdminChip tone="secondary" active={typeFilter === "customer-success"} onClick={() => setTypeFilter("customer-success")}>CS</AdminChip>
            <AdminChip tone="secondary" active={typeFilter === "sales"} onClick={() => setTypeFilter("sales")}>Sales</AdminChip>
          </AdminChipRow>
        </div>
      </div>

      {loading ? (
        <p className="text-[13px] text-boost-muted py-10 text-center">Loading…</p>
      ) : error ? (
        <p className="text-[13px] text-boost-gold py-10 text-center">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="text-[13px] text-boost-muted py-10 text-center">No engagements match.</p>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((e) => {
            const isPending = e.pending_request || pending.has(e.id);
            const canOpen = e.role === "owner" || e.role === "collaborator";
            return (
              <EngagementCard
                key={e.id}
                companyName={e.company_name}
                title={e.title}
                companyUrl={e.company_url}
                audience={e.audience}
                ownerEmail={e.owner_email}
                updatedAt={e.updated_at}
                role={e.role}
                collaborators={e.collaborators}
                action={
                  canOpen ? (
                    <button
                      type="button"
                      onClick={() => router.push(`/cs/build?id=${e.id}`)}
                      className="rounded-lg bg-boost-purple px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white hover:bg-boost-purple/90 transition-colors"
                    >
                      Open
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleView(e.id)}
                        className="rounded-lg border border-boost-border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-boost-dark hover:bg-boost-surface transition-colors"
                      >
                        View
                      </button>
                      {isPending ? (
                        <span className="rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-boost-muted">
                          Requested
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRequest(e.id)}
                          className="rounded-lg bg-boost-purple px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white hover:bg-boost-purple/90 transition-colors"
                        >
                          Request edit
                        </button>
                      )}
                    </>
                  )
                }
              />
            );
          })}
        </div>
      )}
    </CsChrome>
  );
}
