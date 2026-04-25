/**
 * Scope of Work PDF Generator
 *
 * Rule-based PDF layout — same structure every time, populated from GuideFormData.
 * Includes a QR code linking to the generated interactive guide URL.
 */

import jsPDF from "jspdf";
import QRCode from "qrcode";
import type { GuideFormData } from "./types";
import { calculateROI } from "./roi-calculator";
import { getInvoiceContext, calculatePricing, pricingConfigHasContent } from "./pricing-calculator";
import { getOrchestratorConfig, getAgentsForGuide } from "@/data/agents";
import { ROADMAP_PHASES, ROADMAP_LANES } from "@/data/roadmap";

/* ─── Color constants (boost.ai brand) ─── */
const PURPLE = [89, 25, 93] as const;      // #59195d
const PURPLE_DARK = [69, 17, 73] as const; // #451149
const GREEN = [32, 130, 105] as const;     // #208269
const GREEN_LIGHT = [54, 181, 149] as const; // #36b595
const DARK = [58, 45, 64] as const;        // #3a2d40
const MUTED = [122, 107, 128] as const;    // #7a6b80
const SURFACE = [247, 245, 248] as const;  // #f7f5f8
const BORDER = [226, 220, 229] as const;   // #e2dce5
const WHITE = [255, 255, 255] as const;

type RGB = readonly [number, number, number];

/* ─── Helpers ─── */
const PAGE_W = 210; // A4 mm
const PAGE_H = 297;
const MARGIN_L = 20;
const MARGIN_R = 20;
const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R;

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "TBD";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function addWeeks(dateStr: string, weeks: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + weeks * 7);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function pricingLabel(model: string): string {
  switch (model) {
    case "fixed": return "Fixed Monthly";
    case "usage": return "Usage-Based";
    case "outcome": return "Outcome-Based";
    default: return model;
  }
}

/* ─── PDF Builder class ─── */
class SOWBuilder {
  private doc: jsPDF;
  private y = 0;
  private pageNum = 0;

  constructor() {
    this.doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    this.pageNum = 1;
  }

  /* ── Page management ── */
  private ensureSpace(needed: number) {
    if (this.y + needed > PAGE_H - 25) {
      this.addPage();
    }
  }

  private addPage() {
    this.doc.addPage();
    this.pageNum++;
    this.y = 25;
    // Page footer line
    this.addFooter();
  }

  private addFooter() {
    const doc = this.doc;
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setDrawColor(...BORDER);
      doc.line(MARGIN_L, PAGE_H - 15, PAGE_W - MARGIN_R, PAGE_H - 15);
      doc.setFontSize(7);
      doc.setTextColor(...MUTED);
      doc.text("boost.ai — Scope of Work", MARGIN_L, PAGE_H - 10);
      doc.text(`Page ${i} of ${pages}`, PAGE_W - MARGIN_R, PAGE_H - 10, { align: "right" });
    }
  }

  /* ── Text helpers ── */
  private heading(text: string, level: 1 | 2 | 3 = 1) {
    const sizes = { 1: 18, 2: 13, 3: 10 };
    const colors: Record<number, RGB> = { 1: PURPLE, 2: PURPLE_DARK, 3: DARK };
    this.doc.setFontSize(sizes[level]);
    this.doc.setTextColor(...colors[level]);
    this.doc.setFont("helvetica", "bold");
    const lines = this.doc.splitTextToSize(text, CONTENT_W);
    this.ensureSpace(sizes[level] * 0.4 * lines.length + 4);
    this.doc.text(lines, MARGIN_L, this.y);
    this.y += sizes[level] * 0.4 * lines.length + 4;
  }

  private body(text: string, indent = 0) {
    this.doc.setFontSize(9);
    this.doc.setTextColor(...DARK);
    this.doc.setFont("helvetica", "normal");
    const w = CONTENT_W - indent;
    const lines = this.doc.splitTextToSize(text, w);
    this.ensureSpace(lines.length * 4 + 2);
    this.doc.text(lines, MARGIN_L + indent, this.y);
    this.y += lines.length * 4 + 2;
  }

  private label(key: string, value: string) {
    this.ensureSpace(6);
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...MUTED);
    this.doc.text(key, MARGIN_L, this.y);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...DARK);
    this.doc.text(value, MARGIN_L + 50, this.y);
    this.y += 5;
  }

  private divider() {
    this.y += 3;
    this.doc.setDrawColor(...BORDER);
    this.doc.line(MARGIN_L, this.y, PAGE_W - MARGIN_R, this.y);
    this.y += 6;
  }

  private spacer(mm = 6) {
    this.y += mm;
  }

  private sectionNumber(num: string) {
    this.doc.setFontSize(8);
    this.doc.setTextColor(...GREEN_LIGHT);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(num, MARGIN_L, this.y);
    this.y += 2;
  }

  private bullet(text: string, indent = 6) {
    this.ensureSpace(5);
    this.doc.setFontSize(9);
    this.doc.setTextColor(...DARK);
    this.doc.setFont("helvetica", "normal");
    this.doc.text("•", MARGIN_L + indent, this.y);
    const lines = this.doc.splitTextToSize(text, CONTENT_W - indent - 6);
    this.doc.text(lines, MARGIN_L + indent + 5, this.y);
    this.y += lines.length * 4 + 1.5;
  }

  private tableRow(cols: string[], widths: number[], header = false) {
    const h = 7;
    this.ensureSpace(h + 2);

    if (header) {
      this.doc.setFillColor(...PURPLE);
      this.doc.rect(MARGIN_L, this.y - 4.5, CONTENT_W, h, "F");
      this.doc.setTextColor(...WHITE);
      this.doc.setFont("helvetica", "bold");
    } else {
      this.doc.setFillColor(...SURFACE);
      this.doc.rect(MARGIN_L, this.y - 4.5, CONTENT_W, h, "F");
      this.doc.setTextColor(...DARK);
      this.doc.setFont("helvetica", "normal");
    }

    this.doc.setFontSize(8);
    let x = MARGIN_L + 3;
    cols.forEach((col, i) => {
      this.doc.text(col, x, this.y);
      x += widths[i];
    });
    this.y += h - 1;
  }

  private accentBar(color: RGB = GREEN_LIGHT) {
    this.doc.setFillColor(...color);
    this.doc.rect(MARGIN_L, this.y, CONTENT_W, 1.5, "F");
    this.y += 4;
  }

  private statBox(x: number, w: number, value: string, label: string, color: RGB) {
    this.doc.setFillColor(...SURFACE);
    this.doc.roundedRect(x, this.y, w, 20, 2, 2, "F");
    this.doc.setFontSize(16);
    this.doc.setTextColor(...color);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(value, x + w / 2, this.y + 10, { align: "center" });
    this.doc.setFontSize(7);
    this.doc.setTextColor(...MUTED);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(label, x + w / 2, this.y + 16, { align: "center" });
  }

  /* ── Page builders ── */

  async buildCoverPage(form: GuideFormData, qrDataUrl: string, logoDataUrl: string) {
    this.y = 35;

    // Logo
    try {
      this.doc.addImage(logoDataUrl, "PNG", MARGIN_L, 20, 40, 10);
    } catch {
      // Fallback text logo
      this.doc.setFontSize(14);
      this.doc.setTextColor(...PURPLE);
      this.doc.setFont("helvetica", "bold");
      this.doc.text("boost.ai", MARGIN_L, 28);
    }

    // Top accent
    this.y = 45;
    this.doc.setFillColor(...GREEN_LIGHT);
    this.doc.rect(MARGIN_L, this.y, 50, 2, "F");
    this.y += 12;

    // Title
    this.doc.setFontSize(28);
    this.doc.setTextColor(...PURPLE);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Scope of Work", MARGIN_L, this.y);
    this.y += 12;

    // Subtitle
    this.doc.setFontSize(14);
    this.doc.setTextColor(...DARK);
    this.doc.setFont("helvetica", "normal");
    this.doc.text("AI-Powered Customer Service Platform", MARGIN_L, this.y);
    this.y += 20;

    // Client info block
    this.doc.setFillColor(...SURFACE);
    this.doc.roundedRect(MARGIN_L, this.y, CONTENT_W, 40, 3, 3, "F");
    this.doc.setFontSize(8);
    this.doc.setTextColor(...MUTED);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("PREPARED FOR", MARGIN_L + 8, this.y + 8);
    this.doc.setFontSize(16);
    this.doc.setTextColor(...PURPLE);
    this.doc.text(form.company_name, MARGIN_L + 8, this.y + 18);
    this.doc.setFontSize(9);
    this.doc.setTextColor(...DARK);
    this.doc.setFont("helvetica", "normal");
    if (form.contact_name) {
      this.doc.text(`${form.contact_name}${form.contact_role ? ` — ${form.contact_role}` : ""}`, MARGIN_L + 8, this.y + 26);
    }
    if (form.company_url) {
      this.doc.setTextColor(...GREEN);
      this.doc.text(form.company_url, MARGIN_L + 8, this.y + 33);
    }
    this.y += 50;

    // Date and document info
    this.label("Document Date", new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }));
    this.label("Projected Start", formatDate(form.start_date));
    this.label("Pricing Model", pricingLabel(form.pricing_model));
    this.label("Deployment Markets", String(form.deployment_markets));

    this.y += 10;

    // QR code
    this.doc.setFontSize(8);
    this.doc.setTextColor(...MUTED);
    this.doc.text("Scan to view interactive guide:", MARGIN_L, this.y);
    try {
      this.doc.addImage(qrDataUrl, "PNG", MARGIN_L, this.y + 2, 30, 30);
    } catch { /* skip if QR fails */ }

    // Confidentiality notice
    this.y = PAGE_H - 40;
    this.doc.setFillColor(...PURPLE);
    this.doc.rect(MARGIN_L, this.y, CONTENT_W, 0.5, "F");
    this.y += 5;
    this.doc.setFontSize(7);
    this.doc.setTextColor(...MUTED);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(
      "CONFIDENTIAL — This document contains proprietary information prepared exclusively for the named recipient.",
      MARGIN_L, this.y,
    );
    this.doc.text(
      "Distribution without prior written consent from boost.ai is prohibited.",
      MARGIN_L, this.y + 4,
    );
  }

  buildScopeSection(form: GuideFormData) {
    this.addPage();
    this.sectionNumber("01");
    this.heading("Scope of Services");
    this.body(
      `This Scope of Work defines the delivery of boost.ai's AI-powered customer service platform for ${form.company_name}. ` +
      `The engagement covers the design, configuration, integration, and deployment of an agentic AI solution across ` +
      `${form.deployment_markets} market${form.deployment_markets > 1 ? "s" : ""}.`,
    );
    this.spacer(4);

    // Areas of interest
    if (form.areas_of_interest.length > 0) {
      this.heading("Areas of Interest", 3);
      for (const area of form.areas_of_interest) {
        this.bullet(area.charAt(0).toUpperCase() + area.slice(1).replace(/_/g, " "));
      }
    }

    // Channel volumes
    const vols = form.channel_volumes;
    const totalVol = (vols.chat || 0) + (vols.voice || 0) + (vols.email || 0) + (vols.social || 0);
    if (totalVol > 0) {
      this.spacer(4);
      this.heading("Channel Volumes (Monthly)", 3);
      const widths = [40, 40, 40, 40];
      this.tableRow(["Channel", "Volume", "% of Total", "Status"], widths, true);
      const channels = [
        { name: "Chat", vol: vols.chat || 0 },
        { name: "Voice", vol: vols.voice || 0 },
        { name: "Email", vol: vols.email || 0 },
        { name: "Social", vol: vols.social || 0 },
      ];
      for (const ch of channels) {
        if (ch.vol > 0) {
          this.tableRow(
            [ch.name, ch.vol.toLocaleString(), `${Math.round((ch.vol / totalVol) * 100)}%`, "In scope"],
            widths,
          );
        }
      }
      this.spacer(2);
      this.body(`Total monthly volume: ${totalVol.toLocaleString()} conversations`);
    }

    // Specific requirements
    if (form.specific_requirements) {
      this.spacer(4);
      this.heading("Specific Requirements", 3);
      this.body(form.specific_requirements);
    }

    // Custom notes
    if (form.custom_notes) {
      this.spacer(4);
      this.heading("Additional Notes", 3);
      this.body(form.custom_notes);
    }
  }

  buildAgentSection(form: GuideFormData) {
    this.addPage();
    this.sectionNumber("02");
    this.heading("Agent Architecture");
    this.body(
      "The following specialist agents will be configured within the boost.ai Agent Orchestrator. " +
      "Each agent is purpose-built for its domain with dedicated knowledge sources, guardrails, and action hooks.",
    );
    this.spacer(4);

    const config = getOrchestratorConfig(form.areas_of_interest, form.selected_variants);
    const allAgents = getAgentsForGuide(form.areas_of_interest, form.selected_variants);

    // Summary stat boxes
    const boxW = (CONTENT_W - 8) / 3;
    this.statBox(MARGIN_L, boxW, String(allAgents.length), "SPECIALIST AGENTS", PURPLE);
    this.statBox(MARGIN_L + boxW + 4, boxW, String(config.topicGroups.length), "TOPIC GROUPS", GREEN);
    const avgAuto = allAgents.length > 0
      ? Math.round(allAgents.reduce((s, a) => s + (a.automationRate || 0), 0) / allAgents.length)
      : 0;
    this.statBox(MARGIN_L + (boxW + 4) * 2, boxW, `${avgAuto}%`, "AVG AUTOMATION", GREEN_LIGHT);
    this.y += 24;

    // Standalone agents
    if (config.standaloneAgents.length > 0) {
      this.heading("Standalone Agents", 3);
      for (const agent of config.standaloneAgents) {
        this.bullet(`${agent.name} — ${agent.description || "Custom configured agent"}`);
      }
      this.spacer(3);
    }

    // Topic groups with agents
    for (const group of config.topicGroups) {
      this.ensureSpace(20);
      this.accentBar(PURPLE);
      this.heading(group.label, 2);

      const widths = [50, 25, 90];
      this.tableRow(["Agent", "Automation", "Description"], widths, true);
      for (const agent of group.agents) {
        this.tableRow(
          [agent.name, `${agent.automationRate || 0}%`, (agent.description || "—").slice(0, 70)],
          widths,
        );
      }
      this.spacer(4);
    }
  }

  buildIntegrationSection(form: GuideFormData) {
    this.addPage();
    this.sectionNumber("03");
    this.heading("Integration Requirements");
    this.body(
      "The following integrations have been identified for the deployment. " +
      "boost.ai provides pre-built connectors and a flexible API layer to support custom backends.",
    );
    this.spacer(4);

    const categories = [
      { key: "channel", label: "Channels", items: form.integrations.channel },
      { key: "human_handover", label: "Human Handover", items: form.integrations.human_handover },
      { key: "voice", label: "Voice", items: form.integrations.voice },
      { key: "utility", label: "Utility / Backend", items: form.integrations.utility },
      { key: "openid", label: "OpenID / SSO", items: form.integrations.openid },
    ];

    let hasAny = false;
    for (const cat of categories) {
      if (cat.items && cat.items.length > 0) {
        hasAny = true;
        this.heading(cat.label, 3);
        for (const item of cat.items) {
          this.bullet(item);
        }
        this.spacer(3);
      }
    }

    if (!hasAny) {
      this.body("No specific integrations selected. Integration requirements will be defined during the Discovery phase.");
    }
  }

  buildResourceSection(form: GuideFormData) {
    this.addPage();
    this.sectionNumber("04");
    this.heading("Resource Allocation");
    this.body(
      "The following resources have been identified for the project. " +
      "boost.ai provides dedicated Customer Success, Solution Architecture, and Training support throughout the engagement.",
    );
    this.spacer(4);

    // Resource table
    const res = form.resources;
    const widths = [60, 30, 75];
    this.tableRow(["Role", "FTE Count", "Responsibility"], widths, true);
    this.tableRow(["Stakeholder Owners", String(res.stakeholder_owners || 1), "Strategic direction, sign-offs, escalations"], widths);
    this.tableRow(["AI Trainers", String(res.ai_trainers || 1), "Intent mapping, agent tuning, knowledge curation"], widths);
    this.tableRow(["Technical Resources", String(res.technical_resources || 1), "Integration development, API configuration"], widths);
    this.spacer(4);

    // Supporting departments
    if (res.supporting_departments && res.supporting_departments.length > 0) {
      this.heading("Supporting Departments", 3);
      for (const dept of res.supporting_departments) {
        this.bullet(dept);
      }
      this.spacer(3);
    }

    // Knowledge management
    if (res.knowledge_management) {
      this.heading("Knowledge Management", 3);
      this.body("Dedicated knowledge management capacity has been allocated. boost.ai will provide the Knowledge Base platform with structured content ingestion, version control, and analytics.");
    }

    // boost.ai team
    this.spacer(4);
    this.accentBar(GREEN_LIGHT);
    this.heading("boost.ai Delivery Team", 2);
    const boostWidths = [55, 110];
    this.tableRow(["Role", "Scope"], boostWidths, true);
    this.tableRow(["Customer Success Manager", "Project lead, stakeholder alignment, success metrics, reporting"], boostWidths);
    this.tableRow(["Solution Architect", "Platform configuration, agent design, integration architecture"], boostWidths);
    this.tableRow(["AI Trainer Lead", "Best-practice intent structures, training methodology, knowledge setup"], boostWidths);
    this.tableRow(["Integration Engineer", "API setup, connector configuration, testing"], boostWidths);
  }

  buildTimelineSection(form: GuideFormData) {
    this.addPage();
    this.sectionNumber("05");
    this.heading("Implementation Timeline");
    this.body(
      `The implementation follows a 12-week phased approach starting ${formatDate(form.start_date)}. ` +
      "Each phase has defined deliverables and sign-off checkpoints.",
    );
    this.spacer(6);

    // Phase summary
    for (const phase of ROADMAP_PHASES) {
      this.ensureSpace(18);
      const color: RGB = phase.color === "purple" ? PURPLE
        : phase.color === "purple-dark" ? PURPLE_DARK
          : phase.color === "green" ? GREEN : GREEN_LIGHT;
      this.accentBar(color);
      this.doc.setFontSize(11);
      this.doc.setTextColor(...color);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(
        `${phase.name}  (Week ${phase.startWeek}–${phase.endWeek})`,
        MARGIN_L, this.y,
      );
      this.y += 4;

      // Date range
      this.doc.setFontSize(8);
      this.doc.setTextColor(...MUTED);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(
        `${addWeeks(form.start_date, phase.startWeek - 1)} — ${addWeeks(form.start_date, phase.endWeek)}`,
        MARGIN_L, this.y,
      );
      this.y += 5;

      // Lane items in this phase
      for (const lane of ROADMAP_LANES) {
        for (const item of lane.items) {
          if (item.startWeek >= phase.startWeek && item.startWeek <= phase.endWeek) {
            this.bullet(`${item.name}${item.owner ? ` (${item.owner})` : ""}`, 4);
            if (item.deliverables && item.deliverables.length > 0) {
              for (const d of item.deliverables) {
                this.bullet(d, 14);
              }
            }
          }
        }
      }
      this.spacer(3);
    }
  }

  buildROISection(form: GuideFormData) {
    this.addPage();
    this.sectionNumber("06");
    this.heading("ROI Projection");

    const agents = getAgentsForGuide(form.areas_of_interest, form.selected_variants);
    const avgAutomation = agents.length > 0
      ? Math.round(agents.reduce((s, a) => s + (a.automationRate || 0), 0) / agents.length)
      : 70;

    const vols = form.channel_volumes;
    const cost = parseFloat(form.conversation_cost) || 5;

    // Invoice-first: if the 2026 pricing builder is populated, the
    // SoW quotes the same monthly + implementation numbers as the
    // Commercial Offer. Falls back to the legacy channel-volumes
    // heuristic when not.
    const ig = form.integrations ?? {};
    const integrationCount =
      (ig.channel?.length || 0) + (ig.human_handover?.length || 0) +
      (ig.openid?.length || 0) + (ig.utility?.length || 0) + (ig.voice?.length || 0);
    const teamSize =
      (form.resources?.stakeholder_owners || 0) +
      (form.resources?.ai_trainers || 0) +
      (form.resources?.technical_resources || 0);
    const invoiceCtx = getInvoiceContext(form.pricing_config, {
      deployment_markets: form.deployment_markets,
      integration_count: integrationCount,
      customer_team_size: teamSize,
    });

    const totalVol = invoiceCtx?.expectedMonthlyChat
      ? invoiceCtx.expectedMonthlyChat
      : (vols.chat || 0) + (vols.voice || 0) + (vols.email || 0) + (vols.social || 0);

    if (totalVol === 0 && !invoiceCtx) {
      this.body("Channel volumes not specified. ROI projection will be calculated during the Discovery phase with actual volume data.");
      return;
    }

    const roi = calculateROI({
      monthlyConversations: totalVol,
      costPerConversation: cost,
      pricingModel: form.pricing_model,
      automationRate: avgAutomation,
      markets: form.deployment_markets,
      currency: form.conversation_cost,
      fteCapacityPerMonth: form.fte_capacity_per_month,
      automationRampMonths: form.automation_ramp_months,
      invoiceMonthlyCostUSD: invoiceCtx?.monthlyUSD,
      invoiceImplementationUSD: invoiceCtx?.implementationOneTimeUSD,
    });

    this.body(
      `Based on ${totalVol.toLocaleString()} monthly conversations at ${formatCurrency(cost)}/conversation ` +
      `with a projected ${avgAutomation}% automation rate:`,
    );
    this.spacer(6);

    // Stat boxes
    const boxW2 = (CONTENT_W - 12) / 4;
    this.statBox(MARGIN_L, boxW2, formatCurrency(roi.annualSavings), "ANNUAL SAVINGS", GREEN);
    this.statBox(MARGIN_L + boxW2 + 4, boxW2, `${roi.roiPercentage}%`, "COST REDUCTION", PURPLE);
    this.statBox(MARGIN_L + (boxW2 + 4) * 2, boxW2, String(roi.fteEquivalent), "FTE EQUIVALENT", GREEN_LIGHT);
    this.statBox(MARGIN_L + (boxW2 + 4) * 3, boxW2, `${roi.breakEvenMonths}mo`, "BREAK-EVEN", DARK);
    this.y += 26;

    // Cost comparison table
    this.heading("Cost Comparison", 3);
    const widths = [55, 55, 55];
    this.tableRow(["Metric", "Current", "With boost.ai"], widths, true);
    this.tableRow(["Monthly Cost", formatCurrency(roi.currentMonthlyCost), formatCurrency(roi.newMonthlyCost)], widths);
    this.tableRow(["Monthly Savings", "—", formatCurrency(roi.monthlySavings)], widths);
    this.tableRow(["Automated Conversations", "0", roi.automatedConversations.toLocaleString()], widths);
    this.tableRow(["Human Conversations", totalVol.toLocaleString(), roi.humanConversations.toLocaleString()], widths);
    this.spacer(4);

    this.doc.setFontSize(7);
    this.doc.setTextColor(...MUTED);
    this.doc.text("* Projections are estimates based on industry benchmarks. Actual results may vary.", MARGIN_L, this.y);
    this.y += 6;

    // 2026 pricing invoice — only when the builder is populated.
    // Procurement wants the line items, not just the headline.
    if (pricingConfigHasContent(form.pricing_config)) {
      this.spacer(8);
      this.heading("2026 Pricing — Invoice Line Items", 3);
      const invoice = calculatePricing(form.pricing_config!);
      const groups: Array<{ title: string; lines: typeof invoice.platform }> = [
        { title: "Platform",       lines: invoice.platform },
        { title: "Usage",          lines: invoice.usage },
        { title: "Add-ons",        lines: invoice.addons },
      ];
      const lineWidths = [110, 55];
      for (const g of groups) {
        if (g.lines.length === 0) continue;
        this.tableRow([g.title.toUpperCase(), "Monthly (USD)"], lineWidths, true);
        for (const l of g.lines) {
          this.tableRow([l.label, `$${Math.round(l.monthly).toLocaleString("en-US")}`], lineWidths);
        }
      }
      this.spacer(2);
      this.tableRow(
        ["Monthly total", `$${Math.round(invoice.monthlyTotal).toLocaleString("en-US")}`],
        lineWidths,
        true,
      );
      this.tableRow(
        ["Annual total", `$${Math.round(invoice.annualTotal).toLocaleString("en-US")}`],
        lineWidths,
        true,
      );
      if (invoiceCtx?.implementationOneTimeUSD) {
        this.tableRow(
          ["Implementation (one-time)", `$${Math.round(invoiceCtx.implementationOneTimeUSD).toLocaleString("en-US")}`],
          lineWidths,
          true,
        );
      }
      this.spacer(4);
      this.doc.setFontSize(7);
      this.doc.setTextColor(...MUTED);
      this.doc.text(
        "Pricing reflects the 2026 Boost pricing calculator. Commitments, overage, and service tiers as captured in admin.",
        MARGIN_L,
        this.y,
      );
      this.y += 6;
    }
  }

  buildSignaturePage(form: GuideFormData) {
    this.addPage();
    this.sectionNumber("07");
    this.heading("Terms & Acceptance");
    this.body(
      "By signing below, both parties agree to the scope, timeline, resource commitments, and commercial terms " +
      "outlined in this Scope of Work. Any material changes will be managed through a formal change request process.",
    );
    this.spacer(8);

    // Two signature blocks side by side
    const halfW = (CONTENT_W - 10) / 2;

    // Client side
    this.doc.setFillColor(...SURFACE);
    this.doc.roundedRect(MARGIN_L, this.y, halfW, 55, 2, 2, "F");
    this.doc.setFontSize(8);
    this.doc.setTextColor(...MUTED);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("CLIENT", MARGIN_L + 6, this.y + 8);
    this.doc.setFontSize(10);
    this.doc.setTextColor(...DARK);
    this.doc.text(form.company_name, MARGIN_L + 6, this.y + 16);
    // Signature line
    this.doc.setDrawColor(...BORDER);
    this.doc.line(MARGIN_L + 6, this.y + 35, MARGIN_L + halfW - 6, this.y + 35);
    this.doc.setFontSize(7);
    this.doc.setTextColor(...MUTED);
    this.doc.setFont("helvetica", "normal");
    this.doc.text("Signature", MARGIN_L + 6, this.y + 39);
    this.doc.line(MARGIN_L + 6, this.y + 48, MARGIN_L + halfW - 6, this.y + 48);
    this.doc.text("Name, Title & Date", MARGIN_L + 6, this.y + 52);

    // boost.ai side
    const rightX = MARGIN_L + halfW + 10;
    this.doc.setFillColor(...SURFACE);
    this.doc.roundedRect(rightX, this.y, halfW, 55, 2, 2, "F");
    this.doc.setFontSize(8);
    this.doc.setTextColor(...MUTED);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("BOOST.AI", rightX + 6, this.y + 8);
    this.doc.setFontSize(10);
    this.doc.setTextColor(...DARK);
    this.doc.text("boost.ai AS", rightX + 6, this.y + 16);
    this.doc.setDrawColor(...BORDER);
    this.doc.line(rightX + 6, this.y + 35, rightX + halfW - 6, this.y + 35);
    this.doc.setFontSize(7);
    this.doc.setTextColor(...MUTED);
    this.doc.setFont("helvetica", "normal");
    this.doc.text("Signature", rightX + 6, this.y + 39);
    this.doc.line(rightX + 6, this.y + 48, rightX + halfW - 6, this.y + 48);
    this.doc.text("Name, Title & Date", rightX + 6, this.y + 52);

    this.y += 65;
  }

  /* ── Main build ── */

  async build(form: GuideFormData, guideUrl: string, logoDataUrl: string): Promise<jsPDF> {
    // Generate QR code
    let qrDataUrl = "";
    try {
      qrDataUrl = await QRCode.toDataURL(guideUrl, {
        width: 200,
        margin: 1,
        color: { dark: "#59195d", light: "#ffffff" },
      });
    } catch { /* skip QR on failure */ }

    await this.buildCoverPage(form, qrDataUrl, logoDataUrl);
    this.buildScopeSection(form);
    this.buildAgentSection(form);
    this.buildIntegrationSection(form);
    this.buildResourceSection(form);
    this.buildTimelineSection(form);
    this.buildROISection(form);
    this.buildSignaturePage(form);

    // Add footers after all pages are generated
    this.addFooter();

    return this.doc;
  }
}

/* ─── Public API ─── */

export async function generateSOWPdf(form: GuideFormData, guideUrl: string): Promise<void> {
  // Fetch logo as data URL
  let logoDataUrl = "";
  try {
    const resp = await fetch("/brand/boost_logo_purple-_main.png");
    const blob = await resp.blob();
    logoDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch { /* skip logo on failure */ }

  const builder = new SOWBuilder();
  const doc = await builder.build(form, guideUrl, logoDataUrl);

  // Download
  const filename = `SOW_${form.company_name.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}
