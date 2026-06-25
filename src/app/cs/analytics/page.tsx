"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { CsChrome } from "@/components/builder/CsChrome";
import {
  AdminPrompt,
  AdminChip,
  AdminChipRow,
  AdminMiniLabel,
} from "@/components/admin/primitives";
import {
  PLACEHOLDER_CUSTOMERS,
} from "@/data/cs-placeholder-customers";
import type { Customer } from "@/lib/types";
import { metricsFromCustomer } from "@/lib/cs-engine/metrics";
import { runEngine, DEFAULT_WEIGHTS } from "@/lib/cs-engine";
import {
  suggestStories,
  suggestRecommendations,
  suggestAgenticOutcomes,
  suggestChapters,
  setActiveLearned,
  emptyLearned,
  type LearnedSet,
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
import {
  getDefaultPlanhatConnection,
  searchPlanhatCompanies,
  pullCustomer,
  type CompanyHit,
} from "@/app/actions/integrations";
import {
  loadActiveSuppressions,
  listLearnings,
  stageLearning,
  removeLearning,
  runTraining,
  type LearningKind,
  type LearningRow,
  type SerializedLearned,
} from "@/app/actions/cs-learnings";

/* ─── /cs/analytics — engine transparency + learnings loop ──────────
 *  "See all the logic and activity, then correct it."
 *    1. Engine logic   — the static scoring config (formula, multipliers,
 *       suggestion weights, issue→theme routing) straight off live constants.
 *    2. Live signals   — pick a placeholder OR search a real Planhat customer,
 *       run the engine, watch the chain: detected issues → ranked initiatives
 *       → the four suggestion lists, each with its reasons. The operator
 *       (mikal@boost.ai) can REMOVE any suggestion that makes no sense.
 *    3. Learnings      — operator-only: every removal stages a global mute
 *       row; "Run training" publishes staged→active so the suppressed items
 *       disappear from the engine for EVERY customer, everywhere it runs.
 *    4. Activity       — recent engagements the CSM touched. */

const LEARNINGS_OPERATOR = "mikal@boost.ai";

function deserialize(s: SerializedLearned): LearnedSet {
  return {
    stories: new Set(s.stories),
    recommendations: new Set(s.recommendations),
    agentic: new Set(s.agentic),
    chapters: new Set(s.chapters),
  };
}

export default function CsAnalyticsPage() {
  const { data: session } = useSession();
  const isOperator =
    (session?.user?.email ?? "").toLowerCase() === LEARNINGS_OPERATOR;

  const [handle, setHandle] = useState(PLACEHOLDER_CUSTOMERS[0]?.handle ?? "");
  const [pulled, setPulled] = useState<{ name: string; customer: Customer } | null>(
    null,
  );
  const [engagements, setEngagements] = useState<EngagementSummary[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  // Hydrated ACTIVE mute list — drives the live recompute AND the module-level
  // default used by every builder panel. Staged removals don't land here until
  // "Run training" publishes them.
  const [activeLearned, setActiveLearnedState] = useState<LearnedSet>(emptyLearned);
  // Operator's staged + active rows (the learnings panel + per-item badges).
  const [learnings, setLearnings] = useState<{
    staged: LearningRow[];
    active: LearningRow[];
  }>({ staged: [], active: [] });

  // Activity feed.
  useEffect(() => {
    (async () => {
      const res = await listMyEngagements();
      setEngagements(
        res.ok ? res.data.filter((e) => e.audience === "customer-success") : [],
      );
      setActivityLoading(false);
    })();
  }, []);

  // Hydrate the active mute list once (whole app reads the module default).
  useEffect(() => {
    (async () => {
      const res = await loadActiveSuppressions();
      if (res.ok) {
        const set = deserialize(res.data);
        setActiveLearnedState(set);
        setActiveLearned(set);
      }
    })();
  }, []);

  const refreshLearnings = async () => {
    const res = await listLearnings();
    if (res.ok) setLearnings(res.data);
  };

  // Operator-only: load the staged + active rows for the panel.
  useEffect(() => {
    if (isOperator) void refreshLearnings();
  }, [isOperator]);

  const customer: Customer | undefined = useMemo(() => {
    if (pulled) return pulled.customer;
    return PLACEHOLDER_CUSTOMERS.find((c) => c.handle === handle);
  }, [pulled, handle]);

  const signals = useMemo(
    () => (customer ? computeSignals(customer, activeLearned) : null),
    [customer, activeLearned],
  );

  // Set of staged mute keys ("kind:item_key") to badge items pending training.
  const stagedKeys = useMemo(
    () => new Set(learnings.staged.map((r) => `${r.kind}:${r.item_key}`)),
    [learnings.staged],
  );

  const onStage = async (
    kind: LearningKind,
    item_key: string,
    item_label: string,
  ) => {
    const res = await stageLearning({ kind, item_key, item_label });
    if (res.ok) await refreshLearnings();
  };

  const onUnremove = async (kind: LearningKind, item_key: string) => {
    const res = await removeLearning(kind, item_key);
    if (!res.ok) return;
    await refreshLearnings();
    // An active row was un-suppressed — re-hydrate so the live list returns it.
    const act = await loadActiveSuppressions();
    if (act.ok) {
      const set = deserialize(act.data);
      setActiveLearnedState(set);
      setActiveLearned(set);
    }
  };

  const onTrain = async () => {
    const res = await runTraining();
    if (!res.ok) return;
    const act = await loadActiveSuppressions();
    if (act.ok) {
      const set = deserialize(act.data);
      setActiveLearnedState(set);
      setActiveLearned(set);
    }
    await refreshLearnings();
  };

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
          pulledName={pulled?.name ?? null}
          onPickPlaceholder={(h) => {
            setPulled(null);
            setHandle(h);
          }}
          onPullCustomer={(name, c) => setPulled({ name, customer: c })}
          signals={signals}
          isOperator={isOperator}
          stagedKeys={stagedKeys}
          onStage={onStage}
        />
        {isOperator ? (
          <LearningsPanel
            learnings={learnings}
            onUnremove={onUnremove}
            onTrain={onTrain}
          />
        ) : null}
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

/* Run the whole chain for one customer: map → detect → rank → suggest.
 * `learned` is the ACTIVE mute list — suppressed items never appear. */
function computeSignals(customer: Customer, learned: LearnedSet) {
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
    stories: suggestStories(customer, { limit: 5, learned }),
    recommendations: suggestRecommendations(customer, { limit: 5, learned }),
    agentic: suggestAgenticOutcomes(customer, { limit: 4, learned }),
    chapters: suggestChapters(customer, { learned }).filter((c) => c.score > 0),
  };
}
type Signals = ReturnType<typeof computeSignals>;

/* ─── 2 · Live signals ──────────────────────────────────────────── */

function LiveSignals({
  customer,
  handle,
  pulledName,
  onPickPlaceholder,
  onPullCustomer,
  signals,
  isOperator,
  stagedKeys,
  onStage,
}: {
  customer: Customer | undefined;
  handle: string;
  pulledName: string | null;
  onPickPlaceholder: (h: string) => void;
  onPullCustomer: (name: string, customer: Customer) => void;
  signals: Signals | null;
  isOperator: boolean;
  stagedKeys: Set<string>;
  onStage: (kind: LearningKind, itemKey: string, label: string) => void;
}) {
  return (
    <section>
      <AdminPrompt
        question="Live signals"
        helper="Pick a placeholder or search a real Planhat customer, then watch the chain run: detected issues → ranked initiatives → suggestions, each with its reasons."
      />

      <PlanhatSearch onPull={onPullCustomer} />

      <AdminChipRow className="mt-3 mb-4">
        {PLACEHOLDER_CUSTOMERS.map((c) => (
          <AdminChip
            key={c.handle}
            active={!pulledName && handle === c.handle}
            onClick={() => onPickPlaceholder(c.handle)}
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
          {pulledName ? (
            <p className="text-[11px] text-boost-muted">
              Live signals for{" "}
              <strong className="text-boost-dark">{pulledName}</strong> (pulled
              from Planhat).
            </p>
          ) : null}

          {/* Detected issues */}
          <Card title={`Detected issues (${signals.detectedIssues.length})`}>
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
                kind="recommendation"
                items={signals.recommendations.map((r) => ({
                  itemKey: String(r.sourceInitiativeId),
                  title: r.recommendation.title,
                  reasons: r.reasons,
                }))}
                isOperator={isOperator}
                stagedKeys={stagedKeys}
                onStage={onStage}
              />
            </Card>
            <Card title={`Suggested stories (${signals.stories.length})`}>
              <SuggestionList
                kind="story"
                items={signals.stories.map((s) => ({
                  itemKey: s.story.id,
                  title: s.story.name,
                  reasons: s.reasons,
                }))}
                isOperator={isOperator}
                stagedKeys={stagedKeys}
                onStage={onStage}
              />
            </Card>
            <Card title={`Suggested agentic outcomes (${signals.agentic.length})`}>
              <SuggestionList
                kind="agentic"
                items={signals.agentic.map((a) => ({
                  itemKey: a.sourceStoryId,
                  title: a.outcome.topic,
                  reasons: a.reasons,
                }))}
                isOperator={isOperator}
                stagedKeys={stagedKeys}
                onStage={onStage}
              />
            </Card>
            <Card title={`Chapter emphasis (${signals.chapters.length})`}>
              {signals.chapters.length === 0 ? (
                <p className="text-[12px] text-boost-muted">
                  No chapter cleared a non-zero score.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {signals.chapters.map((c) => {
                    const label = CHAPTER_LABELS[c.chapter] ?? c.chapter;
                    const muteKey = `chapter:${c.chapter}`;
                    return (
                      <div
                        key={c.chapter}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="text-[12px] text-boost-dark flex items-center gap-2">
                          {label}
                          {stagedKeys.has(muteKey) ? <PendingBadge /> : null}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="font-mono text-[11px] tabular-nums text-boost-purple">
                            {c.score.toFixed(2)}
                          </span>
                          {isOperator && !stagedKeys.has(muteKey) ? (
                            <RemoveButton
                              onClick={() =>
                                onStage("chapter", c.chapter, label)
                              }
                            />
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </section>
  );
}

/* Debounced live Planhat company search → pull → build a Customer. */
function PlanhatSearch({
  onPull,
}: {
  onPull: (name: string, customer: Customer) => void;
}) {
  const [connId, setConnId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<CompanyHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [open, setOpen] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let live = true;
    void getDefaultPlanhatConnection().then((res) => {
      if (live && res.ok && res.data) setConnId(res.data.id);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!connId || !open) return;
    const q = query.trim();
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      setSearching(true);
      void searchPlanhatCompanies(connId, q).then((res) => {
        setSearching(false);
        setHits(res.ok ? res.data : []);
      });
    }, 300);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [query, connId, open]);

  const pick = async (hit: CompanyHit) => {
    setOpen(false);
    setQuery(hit.name);
    setPulling(true);
    setMsg(null);
    const res = await pullCustomer(connId!, hit.id);
    setPulling(false);
    if (!res.ok) {
      setMsg({ ok: false, text: res.error });
      return;
    }
    const built = {
      company_name: hit.name,
      ...(res.data.patch as Partial<Customer>),
    } as Customer;
    onPull(hit.name, built);
    setMsg({
      ok: true,
      text: `Pulled ${res.data.appliedCount} field${
        res.data.appliedCount === 1 ? "" : "s"
      } from Planhat${
        res.data.missing.length ? ` · ${res.data.missing.length} missing` : ""
      }.`,
    });
  };

  if (!connId) return null;

  return (
    <div className="mt-3 mb-1">
      <AdminMiniLabel className="mb-1.5">Search a live Planhat customer</AdminMiniLabel>
      <div className="relative max-w-md">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Type a company name…"
          className="w-full rounded-lg border border-boost-border bg-white px-3 py-2 text-[13px] text-boost-dark placeholder:text-boost-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light"
        />
        {open && (searching || hits.length > 0) ? (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-boost-border bg-white shadow-lg max-h-64 overflow-auto">
            {searching ? (
              <p className="px-3 py-2 text-[12px] text-boost-muted">Searching…</p>
            ) : (
              hits.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => pick(h)}
                  className="block w-full text-left px-3 py-2 text-[13px] text-boost-dark hover:bg-boost-surface focus-visible:outline-none focus-visible:bg-boost-surface"
                >
                  {h.name}
                </button>
              ))
            )}
          </div>
        ) : null}
      </div>
      {pulling ? (
        <p className="mt-1.5 text-[11px] text-boost-muted">Pulling…</p>
      ) : msg ? (
        <p
          className={
            "mt-1.5 text-[11px] " +
            (msg.ok ? "text-boost-green-dark" : "text-boost-orange")
          }
        >
          {msg.text}
        </p>
      ) : null}
    </div>
  );
}

function PendingBadge() {
  return (
    <span className="inline-block rounded-full bg-boost-gold/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-boost-orange">
      removed · pending
    </span>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Not relevant — remove this suggestion"
      className="inline-flex items-center gap-0.5 rounded-full border border-boost-border px-1.5 py-0.5 text-[10px] font-semibold text-boost-muted hover:border-boost-orange hover:text-boost-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light transition-colors"
    >
      ✕ Not relevant
    </button>
  );
}

function SuggestionList({
  kind,
  items,
  isOperator,
  stagedKeys,
  onStage,
}: {
  kind: LearningKind;
  items: { itemKey: string; title: string; reasons: string[] }[];
  isOperator: boolean;
  stagedKeys: Set<string>;
  onStage: (kind: LearningKind, itemKey: string, label: string) => void;
}) {
  if (items.length === 0)
    return (
      <p className="text-[12px] text-boost-muted">
        Nothing ranked for this customer.
      </p>
    );
  return (
    <div className="space-y-2.5">
      {items.map((it) => {
        const muteKey = `${kind}:${it.itemKey}`;
        const pending = stagedKeys.has(muteKey);
        return (
          <div key={it.itemKey}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-[12px] font-medium text-boost-dark leading-snug flex items-center gap-2 flex-wrap">
                {it.title}
                {pending ? <PendingBadge /> : null}
              </p>
              {isOperator && !pending ? (
                <RemoveButton
                  onClick={() => onStage(kind, it.itemKey, it.title)}
                />
              ) : null}
            </div>
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
        );
      })}
    </div>
  );
}

/* ─── 3 · Learnings (operator-only) ─────────────────────────────── */

const KIND_LABEL: Record<LearningKind, string> = {
  story: "Stories",
  recommendation: "Recommendations",
  agentic: "Agentic outcomes",
  chapter: "Chapters",
};

function LearningsPanel({
  learnings,
  onUnremove,
  onTrain,
}: {
  learnings: { staged: LearningRow[]; active: LearningRow[] };
  onUnremove: (kind: LearningKind, itemKey: string) => void;
  onTrain: () => void;
}) {
  const [training, setTraining] = useState(false);
  const { staged, active } = learnings;

  const train = async () => {
    setTraining(true);
    await onTrain();
    setTraining(false);
  };

  return (
    <section>
      <AdminPrompt
        question="Learnings"
        helper="Removals you make above are global — they suppress the item for every customer, everywhere the engine runs. Stage as many as you like, then publish them all with one training run."
      />

      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-boost-border bg-boost-surface/30 px-3.5 py-3">
        <p className="text-[12px] text-boost-muted">
          <strong className="text-boost-dark">{staged.length}</strong> staged ·{" "}
          <strong className="text-boost-dark">{active.length}</strong> active
        </p>
        <button
          type="button"
          onClick={train}
          disabled={training || staged.length === 0}
          className="rounded-lg bg-boost-purple px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light transition-shadow"
        >
          {training ? "Training…" : "Run training"}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 mt-3">
        <Card title={`Staged removals (${staged.length})`}>
          <LearningRows
            rows={staged}
            empty="Nothing staged. Remove a suggestion above to stage it."
            onUnremove={onUnremove}
          />
        </Card>
        <Card title={`Active (live) suppressions (${active.length})`}>
          <LearningRows
            rows={active}
            empty="No active suppressions yet. Run training to publish staged removals."
            onUnremove={onUnremove}
          />
        </Card>
      </div>
    </section>
  );
}

function LearningRows({
  rows,
  empty,
  onUnremove,
}: {
  rows: LearningRow[];
  empty: string;
  onUnremove: (kind: LearningKind, itemKey: string) => void;
}) {
  if (rows.length === 0)
    return <p className="text-[12px] text-boost-muted leading-relaxed">{empty}</p>;

  const byKind = rows.reduce<Record<string, LearningRow[]>>((acc, r) => {
    (acc[r.kind] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      {(Object.keys(byKind) as LearningKind[]).map((kind) => (
        <div key={kind}>
          <AdminMiniLabel className="mb-1.5 text-boost-muted">
            {KIND_LABEL[kind] ?? kind}
          </AdminMiniLabel>
          <div className="space-y-1.5">
            {byKind[kind].map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-boost-border bg-white px-2.5 py-1.5"
              >
                <span className="text-[12px] text-boost-dark truncate">
                  {r.item_label || r.item_key}
                </span>
                <button
                  type="button"
                  onClick={() => onUnremove(r.kind, r.item_key)}
                  title="Un-remove (restore this suggestion)"
                  className="flex-shrink-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-boost-muted hover:text-boost-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light rounded-sm px-1 transition-colors"
                >
                  Undo
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── 4 · Activity ──────────────────────────────────────────────── */

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
