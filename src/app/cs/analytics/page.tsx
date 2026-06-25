"use client";

import { useEffect, useMemo, useState } from "react";
import { CsChrome } from "@/components/builder/CsChrome";
import {
  AdminPrompt,
  AdminChip,
  AdminChipRow,
  AdminMiniLabel,
} from "@/components/admin/primitives";
import {
  PLACEHOLDER_CUSTOMERS,
  type PlaceholderCustomer,
} from "@/data/cs-placeholder-customers";
import { metricsFromCustomer } from "@/lib/cs-engine/metrics";
import { runEngine, DEFAULT_WEIGHTS } from "@/lib/cs-engine";
import {
  suggestStories,
  suggestRecommendations,
  suggestAgenticOutcomes,
  suggestChapters,
  ISSUE_THEME,
  CHAPTER_LABELS,
  W_INDUSTRY,
  W_THEME,
  W_GEO,
  BASE,
} from "@/lib/cs-engine/suggestions";
import {
  listMyEngagements,
  type EngagementSummary,
} from "@/app/actions/engagements";

/* ─── /cs/analytics — engine transparency dashboard ─────────────────
 *  "See all the logic and activity." Three reads, top to bottom:
 *    1. Engine logic   — the static scoring config: priority formula,
 *       effort/type/impact multipliers, the suggestion weights, and the
 *       issue→theme routing. Rendered straight off the live constants so
 *       this page can never drift from what the engine actually runs.
 *    2. Live signals   — pick a customer, run the engine, and watch the
 *       whole chain: detected issues (with severity) → ranked initiatives
 *       (with the exact formula) → the three suggestion lists with their
 *       reasons. This is the "why did we suggest that" audit trail.
 *    3. Activity       — recent engagements the CSM touched.
 *  The learning loop (capturing accepts/overrides back into the weights)
 *  lands with the events store; this page is its read-side today. */

export default function CsAnalyticsPage() {
  const [handle, setHandle] = useState(PLACEHOLDER_CUSTOMERS[0]?.handle ?? "");
  const [engagements, setEngagements] = useState<EngagementSummary[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await listMyEngagements();
      setEngagements(
        res.ok ? res.data.filter((e) => e.audience === "customer-success") : [],
      );
      setActivityLoading(false);
    })();
  }, []);

  const customer: PlaceholderCustomer | undefined = useMemo(
    () => PLACEHOLDER_CUSTOMERS.find((c) => c.handle === handle),
    [handle],
  );

  const signals = useMemo(
    () => (customer ? computeSignals(customer) : null),
    [customer],
  );

  return (
    <CsChrome
      title="Engine analytics"
      subtitle="The decision engine, in the open: the scoring logic it runs, the live signals it computes per customer, and recent activity."
    >
      <div className="space-y-10">
        <EngineLogic />
        <LiveSignals
          customer={customer}
          handle={handle}
          onPick={setHandle}
          signals={signals}
        />
        <Activity loading={activityLoading} engagements={engagements} />
      </div>
    </CsChrome>
  );
}

/* ─── 1 · Engine logic ──────────────────────────────────────────── */

function EngineLogic() {
  const themeCounts = Object.values(ISSUE_THEME).reduce<Record<string, number>>(
    (acc, t) => ({ ...acc, [t]: (acc[t] ?? 0) + 1 }),
    {},
  );

  return (
    <section>
      <AdminPrompt
        question="Engine logic"
        helper="The scoring config the engine runs, straight off the live constants — this can't drift from production."
      />

      <div className="grid gap-3 sm:grid-cols-2 mt-3">
        <Card title="Priority formula">
          <p className="font-mono text-[12px] leading-relaxed text-boost-dark">
            priority = severity × effort × importance × hierarchy
          </p>
          <p className="mt-2 text-[12px] text-boost-muted leading-relaxed">
            Each initiative scores its detected-issue severity (0–1), scaled by
            an effort multiplier (cheaper = higher), an issue-importance weight,
            and a hierarchy boost for company-level moves. Blocked or
            zero-severity initiatives score 0.
          </p>
        </Card>

        <Card title="Hierarchy boost">
          <p className="text-[12px] text-boost-muted leading-relaxed">
            Company-level initiatives (upsell, expand, risk, or matching
            keywords like “voice”, “proactivity”) gain{" "}
            <strong className="text-boost-dark">+0.1 per instance</strong>{" "}
            (capped +0.5), <strong className="text-boost-dark">+0.2</strong> for
            ARR &gt; 100k, and <strong className="text-boost-dark">+0.15</strong>{" "}
            during onboarding.
          </p>
        </Card>

        <Card title="Effort multipliers">
          <WeightRows rows={DEFAULT_WEIGHTS.effortMultipliers} />
        </Card>

        <Card title="Initiative-type multipliers">
          <WeightRows rows={DEFAULT_WEIGHTS.typeMultipliers} />
        </Card>

        <Card title="Impact bonuses">
          <WeightRows rows={DEFAULT_WEIGHTS.impactBonuses} />
        </Card>

        <Card title="Suggestion weights (stories & chapters)">
          <WeightRows
            rows={{
              "Industry match": W_INDUSTRY,
              "Theme severity ×": W_THEME,
              "Same region": W_GEO,
              "Base eligibility": BASE,
            }}
          />
          <p className="mt-2.5 text-[12px] text-boost-muted leading-relaxed">
            Stories rank by industry-peer match + summed severity of the issues
            routing to their chapter + shared geography. Every catalogue story
            stays eligible via the base weight.
          </p>
        </Card>
      </div>

      <div className="mt-3">
        <Card title="Issue → story-chapter routing">
          <p className="text-[12px] text-boost-muted leading-relaxed mb-2.5">
            {Object.keys(ISSUE_THEME).length} detector issues route to a chapter
            theme; their severities sum to rank which stories and chapters we
            surface.
          </p>
          <AdminChipRow>
            {Object.entries(themeCounts).map(([theme, count]) => (
              <span
                key={theme}
                className="inline-flex items-center gap-1.5 rounded-full bg-boost-surface px-2.5 py-1 text-[11px] font-medium text-boost-dark"
              >
                {CHAPTER_LABELS[theme as keyof typeof CHAPTER_LABELS] ?? theme}
                <span className="text-boost-muted">· {count}</span>
              </span>
            ))}
          </AdminChipRow>
        </Card>
      </div>
    </section>
  );
}

function WeightRows({ rows }: { rows: Record<string, number> }) {
  const entries = Object.entries(rows);
  if (entries.length === 0)
    return (
      <p className="text-[12px] text-boost-muted italic">
        Defaults (all at 1.0).
      </p>
    );
  return (
    <div className="space-y-1">
      {entries.map(([k, v]) => (
        <div key={k} className="flex items-center justify-between gap-3">
          <span className="text-[12px] text-boost-dark">{k}</span>
          <span className="font-mono text-[12px] tabular-nums text-boost-purple">
            ×{v}
          </span>
        </div>
      ))}
    </div>
  );
}

/* Run the whole chain for one customer: map → detect → rank → suggest. */
function computeSignals(customer: PlaceholderCustomer) {
  const mapped = metricsFromCustomer(customer);
  const hasMetrics = Object.keys(mapped.metricsSet).length > 0;
  const engine = runEngine(mapped.metrics, {
    metricsSet: mapped.metricsSet,
    hierarchy: mapped.hierarchy,
  });
  return {
    hasMetrics,
    hierarchy: mapped.hierarchy,
    detectedIssues: engine.detectedIssues,
    topPriorities: engine.topPriorities.slice(0, 10),
    stories: suggestStories(customer, { limit: 5 }),
    recommendations: suggestRecommendations(customer, { limit: 5 }),
    agentic: suggestAgenticOutcomes(customer, { limit: 4 }),
    chapters: suggestChapters(customer).filter((c) => c.score > 0),
  };
}
type Signals = ReturnType<typeof computeSignals>;

/* ─── 2 · Live signals ──────────────────────────────────────────── */

function LiveSignals({
  customer,
  handle,
  onPick,
  signals,
}: {
  customer: PlaceholderCustomer | undefined;
  handle: string;
  onPick: (h: string) => void;
  signals: Signals | null;
}) {
  return (
    <section>
      <AdminPrompt
        question="Live signals"
        helper="Pick a customer and watch the chain run end to end: detected issues → ranked initiatives → suggestions, each with its reasons."
      />

      <AdminChipRow className="mt-3 mb-4">
        {PLACEHOLDER_CUSTOMERS.map((c) => (
          <AdminChip
            key={c.handle}
            active={handle === c.handle}
            onClick={() => onPick(c.handle)}
          >
            {c.company_name}
          </AdminChip>
        ))}
      </AdminChipRow>

      {!customer || !signals ? (
        <Card title="No customer selected">
          <p className="text-[12px] text-boost-muted">Pick a customer above.</p>
        </Card>
      ) : !signals.hasMetrics ? (
        <Card title="No metrics on this record">
          <p className="text-[12px] text-boost-muted leading-relaxed">
            {customer.company_name} has no performance metrics or intent-traffic
            rollup, so the engine has nothing to detect. Add metrics in the
            builder and the chain lights up here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Detected issues */}
          <Card
            title={`Detected issues (${signals.detectedIssues.length})`}
          >
            {signals.detectedIssues.length === 0 ? (
              <p className="text-[12px] text-boost-muted">
                No issues cleared the detection threshold.
              </p>
            ) : (
              <div className="space-y-2.5">
                {signals.detectedIssues.map((issue) => (
                  <div
                    key={issue.issueId}
                    data-testid={`analytics-issue-${issue.issueId}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[12px] font-medium text-boost-dark">
                        {issue.issueName}
                      </span>
                      <span className="font-mono text-[11px] tabular-nums text-boost-muted">
                        sev {issue.severity.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-boost-surface overflow-hidden">
                      <div
                        className="h-full rounded-full bg-boost-gold"
                        style={{
                          width: `${Math.round(Math.min(1, issue.severity) * 100)}%`,
                        }}
                      />
                    </div>
                    {issue.reason ? (
                      <p className="mt-1 text-[11px] text-boost-muted leading-snug">
                        {issue.reason}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Ranked initiatives */}
          <Card title={`Ranked initiatives (top ${signals.topPriorities.length})`}>
            {signals.topPriorities.length === 0 ? (
              <p className="text-[12px] text-boost-muted">
                No actionable initiatives — every match is blocked or scores 0.
              </p>
            ) : (
              <div className="space-y-2">
                {signals.topPriorities.map((p) => (
                  <div
                    key={p.initiative.id}
                    data-testid={`analytics-initiative-${p.rank}`}
                    className="rounded-lg border border-boost-border bg-white px-3 py-2"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[12px] font-semibold text-boost-dark">
                        <span className="text-boost-purple">#{p.rank}</span>{" "}
                        {p.initiative.name}
                      </span>
                      <span className="font-mono text-[11px] tabular-nums text-boost-purple flex-shrink-0">
                        {p.priority.toFixed(3)}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-[10.5px] leading-snug text-boost-muted">
                      {p.calculation.formula}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Suggestion lists */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Card title={`Suggested recommendations (${signals.recommendations.length})`}>
              <SuggestionList
                items={signals.recommendations.map((r) => ({
                  key: String(r.sourceInitiativeId),
                  title: r.recommendation.title,
                  reasons: r.reasons,
                }))}
              />
            </Card>
            <Card title={`Suggested stories (${signals.stories.length})`}>
              <SuggestionList
                items={signals.stories.map((s) => ({
                  key: s.story.id,
                  title: s.story.name,
                  reasons: s.reasons,
                }))}
              />
            </Card>
            <Card title={`Suggested agentic outcomes (${signals.agentic.length})`}>
              <SuggestionList
                items={signals.agentic.map((a) => ({
                  key: a.sourceStoryId,
                  title: a.outcome.topic,
                  reasons: a.reasons,
                }))}
              />
            </Card>
            <Card title={`Chapter emphasis (${signals.chapters.length})`}>
              {signals.chapters.length === 0 ? (
                <p className="text-[12px] text-boost-muted">
                  No chapter cleared a non-zero score.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {signals.chapters.map((c) => (
                    <div
                      key={c.chapter}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="text-[12px] text-boost-dark">
                        {CHAPTER_LABELS[c.chapter] ?? c.chapter}
                      </span>
                      <span className="font-mono text-[11px] tabular-nums text-boost-purple">
                        {c.score.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </section>
  );
}

function SuggestionList({
  items,
}: {
  items: { key: string; title: string; reasons: string[] }[];
}) {
  if (items.length === 0)
    return (
      <p className="text-[12px] text-boost-muted">
        Nothing ranked for this customer.
      </p>
    );
  return (
    <div className="space-y-2.5">
      {items.map((it) => (
        <div key={it.key}>
          <p className="text-[12px] font-medium text-boost-dark leading-snug">
            {it.title}
          </p>
          {it.reasons.length ? (
            <div className="mt-1 flex flex-wrap gap-1">
              {it.reasons.map((r, i) => (
                <span
                  key={i}
                  className="inline-block rounded-full bg-boost-surface px-2 py-0.5 text-[10.5px] text-boost-muted"
                >
                  {r}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/* ─── 3 · Activity ──────────────────────────────────────────────── */

function Activity({
  loading,
  engagements,
}: {
  loading: boolean;
  engagements: EngagementSummary[];
}) {
  return (
    <section>
      <AdminPrompt
        question="Activity"
        helper="Customer-success engagements you own or collaborate on, most recent first. Richer event history (accepts, overrides, reorders) lands with the learnings store."
      />
      <div className="mt-3">
        {loading ? (
          <Card title="Loading…">
            <p className="text-[12px] text-boost-muted">Fetching engagements.</p>
          </Card>
        ) : engagements.length === 0 ? (
          <Card title="No activity yet">
            <p className="text-[12px] text-boost-muted">
              Start an engagement in the builder and it shows up here.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {engagements.map((e) => (
              <div
                key={e.id}
                data-testid={`analytics-activity-${e.id}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-boost-border bg-white px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-boost-dark truncate">
                    {e.company_name || e.title || "Untitled"}
                  </p>
                  <AdminMiniLabel className="mt-0.5 normal-case tracking-normal text-boost-muted">
                    {e.role} · {e.owner_email}
                  </AdminMiniLabel>
                </div>
                <span className="flex-shrink-0 font-mono text-[11px] tabular-nums text-boost-muted">
                  {new Date(e.updated_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── shared card ───────────────────────────────────────────────── */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-boost-border bg-boost-surface/30 p-3.5">
      <AdminMiniLabel className="mb-2">{title}</AdminMiniLabel>
      {children}
    </div>
  );
}
