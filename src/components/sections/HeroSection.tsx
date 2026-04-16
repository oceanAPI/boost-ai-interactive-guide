"use client";

import { useEffect, useRef } from "react";
import type { GuideData } from "@/lib/types";
import { assetPath } from "@/lib/asset-path";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCountUp } from "@/hooks/useCountUp";
// useCompanyLogo available if needed for favicon — currently using company name typography instead

function computeDynamicStats(guide: GuideData) {
  const totalVolume = Object.values(guide.channel_volumes).reduce((s, v) => s + (v || 0), 0);
  const costNum = parseFloat(guide.conversation_cost?.replace(/[^0-9.]/g, "") || "0");

  if (totalVolume > 0 && costNum > 0) {
    const automated = Math.round(totalVolume * 0.8);
    const savings = Math.round(automated * costNum * 0.85);
    return [
      { value: automated, suffix: "", label: "Conversations Automated / mo", prefix: "", icon: "chat" as const },
      { value: savings, suffix: "", label: "Projected Monthly Savings", prefix: "$", icon: "savings" as const },
      { value: 80, suffix: "%+", label: "Avg Automation Rate", prefix: "", icon: "bolt" as const },
    ];
  }

  return [
    { value: 80, suffix: "%+", label: "Avg Automation", prefix: "", icon: "bolt" as const },
    { value: 7, suffix: "", label: "Weeks to Go-Live", prefix: "", icon: "rocket" as const },
    { value: 90, suffix: "%", label: "Cost Reduction", prefix: "", icon: "savings" as const },
  ];
}

const STAT_ICONS = {
  bolt: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M11 1L3 12h5l-1 7 8-11h-5l1-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  rocket: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10.5 1.5s4 2 4 8l2 3H4l2-3c0-6 4-8 4-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 16.5a3 3 0 006 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  savings: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 1v18M14 5H8a3 3 0 000 6h4a3 3 0 010 6H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  chat: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 3h14a1 1 0 011 1v9a1 1 0 01-1 1H7l-4 3V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

function HeroStat({
  value,
  suffix = "",
  prefix = "",
  label,
  icon,
  delay,
  visible,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  icon: keyof typeof STAT_ICONS;
  delay: number;
  visible: boolean;
}) {
  const count = useCountUp({ target: value, enabled: visible, duration: 1400 });

  return (
    <div
      className="hero-stat-card group relative flex-1 min-w-[160px]"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {/* Glassmorphism card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl p-5 sm:p-6 text-center transition-all duration-300 group-hover:border-white/[0.15] group-hover:bg-white/[0.07]">
        {/* Subtle glow on hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: "radial-gradient(circle at 50% 50%, rgba(54,181,149,0.08) 0%, transparent 70%)" }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-boost-green-light/60">{STAT_ICONS[icon]}</span>
          </div>
          <span className="text-3xl sm:text-4xl font-bold tabular-nums bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
            {prefix}{count}{suffix}
          </span>
          <p className="text-[11px] sm:text-xs mt-2 text-white/40 uppercase tracking-widest font-medium">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Animated constellation dots in background */
function ConstellationField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    const count = 40;
    const rect = canvas.getBoundingClientRect();

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }

    const draw = () => {
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.06;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(54, 181, 149, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(54, 181, 149, ${p.opacity})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(animationId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}

export default function HeroSection({ guide }: { guide: GuideData }) {
  const { ref: statsRef, isVisible: statsVisible } = useScrollReveal({ once: true });
  const stats = computeDynamicStats(guide);
  // Company logo hook available but not used — using typography co-brand instead
  // const { logoUrl: companyLogoUrl, loading: logoLoading } = useCompanyLogo(guide.company_url);

  return (
    <section className="relative overflow-hidden rounded-2xl hero-section">
      {/* Deep dark background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(89,25,93,0.5) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 100%, rgba(32,130,105,0.25) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 10% 80%, rgba(54,181,149,0.1) 0%, transparent 60%),
            linear-gradient(180deg, #231528 0%, #1a1020 40%, #141118 100%)
          `,
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
        aria-hidden="true"
      />

      {/* Animated constellation */}
      <ConstellationField />

      {/* Accent glow orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.07] pointer-events-none hero-orb-1"
        style={{ background: "radial-gradient(circle, #59195d 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full opacity-[0.05] pointer-events-none hero-orb-2"
        style={{ background: "radial-gradient(circle, #36b595 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      {/* Brand shape - very subtle */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={assetPath("/brand/boost_brandshape_white.svg")}
        alt=""
        width={300}
        height={300}
        className="absolute top-8 right-12 opacity-[0.02] pointer-events-none"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 px-5 sm:px-8 max-w-4xl mx-auto pt-14 sm:pt-20 pb-8 sm:pb-12">
        {/* Co-branded logo bar */}
        <div className="flex items-center justify-center gap-4 sm:gap-5 mb-8 sm:mb-10 hero-fade-in" style={{ animationDelay: "0.1s" }}>
          {/* boost.ai logo */}
          <div className="relative">
            <div className="absolute inset-0 blur-2xl opacity-30 pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(54,181,149,0.4) 0%, transparent 70%)" }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assetPath("/brand/boost_logo-_negative.svg")}
              alt="boost.ai"
              className="relative h-6 sm:h-7 w-auto opacity-80"
            />
          </div>

          {/* Co-brand connector + company name */}
          {guide.company_name && (
            <>
              <span className="w-px h-4 bg-white/25" />
              <span className="text-white/90 text-sm sm:text-base font-semibold tracking-tight select-none">
                {guide.company_name}
              </span>
            </>
          )}
        </div>

        {/* Accent line */}
        <div className="flex justify-center mb-8 hero-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="hero-accent-line h-px w-16 sm:w-24" />
        </div>

        {/* Company name */}
        <div className="hero-fade-in" style={{ animationDelay: "0.3s" }}>
          <h1 className="text-center text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.1] tracking-tight">
            <span className="bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-transparent">
              {guide.company_name}
            </span>
          </h1>
        </div>

        {/* Contact line */}
        {guide.contact_name && (
          <div className="hero-fade-in mt-4 text-center" style={{ animationDelay: "0.4s" }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-boost-green-light animate-pulse" />
              <span className="text-white/50">Prepared for</span>
              <span className="text-white/80 font-medium">{guide.contact_name}</span>
              {guide.contact_role && (
                <span className="text-white/30">{guide.contact_role}</span>
              )}
            </span>
          </div>
        )}

        {/* Company URL (if provided) */}
        {guide.company_url && (
          <div className="hero-fade-in mt-3 text-center" style={{ animationDelay: "0.45s" }}>
            <a
              href={guide.company_url.startsWith("http") ? guide.company_url : `https://${guide.company_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-boost-green-light/60 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-50">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
              </svg>
              {guide.company_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
            </a>
          </div>
        )}

        {/* Tagline */}
        <div className="hero-fade-in" style={{ animationDelay: "0.5s" }}>
          <p className="text-center text-base sm:text-lg text-white/40 mt-6 sm:mt-8 leading-relaxed max-w-2xl mx-auto font-light">
            Your AI-powered customer service transformation
            <span className="text-white/20 mx-2">—</span>
            <span className="text-boost-green-light/60">from first contact to full resolution.</span>
          </p>
        </div>

        {/* Requirements & notes (if provided) */}
        {(guide.specific_requirements || guide.custom_notes) && (
          <div className="hero-fade-in mt-4 flex justify-center" style={{ animationDelay: "0.55s" }}>
            <div className="max-w-lg text-center space-y-2">
              {guide.specific_requirements && (
                <p className="text-xs text-white/25 leading-relaxed italic">
                  &ldquo;{guide.specific_requirements}&rdquo;
                </p>
              )}
              {guide.custom_notes && !guide.specific_requirements && (
                <p className="text-xs text-white/25 leading-relaxed italic">
                  &ldquo;{guide.custom_notes}&rdquo;
                </p>
              )}
            </div>
          </div>
        )}

        {/* CTA hint */}
        <div className="hero-fade-in flex justify-center mt-8 sm:mt-10" style={{ animationDelay: "0.6s" }}>
          <div className="inline-flex items-center gap-2 text-xs text-white/25 uppercase tracking-[0.2em] font-medium">
            <span className="h-px w-6 bg-gradient-to-r from-transparent to-white/20" />
            Explore below
            <span className="h-px w-6 bg-gradient-to-l from-transparent to-white/20" />
          </div>
        </div>

        {/* Stats row */}
        <div ref={statsRef} className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-10 sm:mt-14">
          {stats.map((stat, i) => (
            <HeroStat
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              prefix={stat.prefix}
              label={stat.label}
              icon={stat.icon}
              delay={200 + i * 150}
              visible={statsVisible}
            />
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="relative z-10 flex justify-center pb-8">
        <div className="scroll-hint flex flex-col items-center gap-1">
          <div className="w-5 h-8 rounded-full border border-white/10 flex items-start justify-center p-1.5">
            <div className="w-1 h-1.5 rounded-full bg-white/30 hero-scroll-dot" />
          </div>
        </div>
      </div>
    </section>
  );
}
