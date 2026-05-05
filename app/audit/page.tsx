"use client";
import { useState } from "react";

type LeakType = {
  severity: string;
  metric: string;
  current: string;
  benchmark: string;
  impact: string;
  problem: string;
  fix: string;
};

type AuditType = {
  overallScore: number;
  summary: string;
  leaks: LeakType[];
  topWins: string[];
  weeklyPriority: string;
};

type FormData = {
  restaurantName: string;
  platform: string;
  period: string;
  impressions: string;
  ctr: string;
  pageOpens: string;
  orders: string;
  gmv: string;
  atv: string;
  cancellationRate: string;
  rating: string;
  newUserPercent: string;
  returningUserPercent: string;
};

const fields = [
  { name: "impressions", label: "Restaurant Card Impressions", placeholder: "e.g. 12500" },
  { name: "ctr", label: "Restaurant Card CTR (%)", placeholder: "e.g. 3.5" },
  { name: "pageOpens", label: "Total Page Opens", placeholder: "e.g. 437" },
  { name: "orders", label: "Total Orders", placeholder: "e.g. 65" },
  { name: "gmv", label: "GMV (Rs)", placeholder: "e.g. 94250" },
  { name: "atv", label: "ATV / Avg Order Value (Rs)", placeholder: "e.g. 1450" },
  { name: "cancellationRate", label: "Cancellation Rate (%)", placeholder: "e.g. 0.5" },
  { name: "rating", label: "Current Rating", placeholder: "e.g. 4.1" },
  { name: "newUserPercent", label: "New Users (%)", placeholder: "e.g. 65" },
  { name: "returningUserPercent", label: "Returning Users (%)", placeholder: "e.g. 35" },
];

export default function AuditPage() {
  const [step, setStep] = useState<"form" | "loading" | "result">("form");
  const [formData, setFormData] = useState<FormData>({
    restaurantName: "",
    platform: "Zomato",
    period: "",
    impressions: "",
    ctr: "",
    pageOpens: "",
    orders: "",
    gmv: "",
    atv: "",
    cancellationRate: "",
    rating: "",
    newUserPercent: "",
    returningUserPercent: "",
  });
  const [audit, setAudit] = useState<AuditType | null>(null);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setStep("loading");
    setError("");
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantData: formData }),
      });
      const data = await res.json();
      if (data.success) {
        setAudit(data.audit);
        setStep("result");
      } else {
        setError("Something went wrong. Please try again.");
        setStep("form");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setStep("form");
    }
  };

  const getSeverityColors = (severity: string) => {
    if (severity === "critical") return { border: "#F0453A", badge: "#F0453A", bg: "rgba(240,69,58,0.08)" };
    if (severity === "warning") return { border: "#F5A623", badge: "#F5A623", bg: "rgba(245,166,35,0.08)" };
    return { border: "#18C97A", badge: "#18C97A", bg: "rgba(24,201,122,0.08)" };
  };

  const getSeverityLabel = (severity: string) => {
    if (severity === "critical") return "CRITICAL";
    if (severity === "warning") return "WATCH";
    return "OPPORTUNITY";
  };

  const inputStyle = {
    width: "100%",
    background: "#111820",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "13px",
    color: "#EEF2FF",
    outline: "none",
    fontFamily: "sans-serif",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    fontSize: "11px",
    color: "rgba(238,242,255,0.5)",
    display: "block",
    marginBottom: "6px",
  };

  if (step === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: "#07090F", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "3px solid rgba(24,201,122,0.2)", borderTop: "3px solid #18C97A", animation: "spin 1s linear infinite" }} />
        <div style={{ color: "#18C97A", fontSize: "15px", fontWeight: 600, fontFamily: "sans-serif" }}>Analysing your data...</div>
        <div style={{ color: "rgba(238,242,255,0.4)", fontSize: "12px", fontFamily: "sans-serif" }}>Checking metrics against benchmarks</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (step === "result" && audit) {
    const scoreColor = audit.overallScore >= 70 ? "#18C97A" : audit.overallScore >= 50 ? "#F5A623" : "#F0453A";
    return (
      <div style={{ minHeight: "100vh", background: "#07090F", padding: "24px", fontFamily: "sans-serif" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div style={{ background: "#0C1118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "24px", marginBottom: "16px" }}>
            <div style={{ fontSize: "11px", color: "rgba(238,242,255,0.3)", fontFamily: "monospace", marginBottom: "4px", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
              GrowthOS Audit — {formData.restaurantName}
            </div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#EEF2FF", marginBottom: "8px" }}>Your audit report is ready</div>
            <div style={{ fontSize: "13px", color: "rgba(238,242,255,0.5)", lineHeight: 1.6, marginBottom: "16px" }}>{audit.summary}</div>
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                { label: "ROI Score", value: audit.overallScore, color: scoreColor },
                { label: "Critical Leaks", value: audit.leaks?.filter((l) => l.severity === "critical").length || 0, color: "#F0453A" },
                { label: "Total Leaks", value: audit.leaks?.length || 0, color: "#EEF2FF" },
              ].map((stat) => (
                <div key={stat.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "12px 18px", textAlign: "center" as const }}>
                  <div style={{ fontSize: "28px", fontWeight: 800, color: stat.color, letterSpacing: "-1px", lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontSize: "10px", color: "rgba(238,242,255,0.35)", fontFamily: "monospace", textTransform: "uppercase" as const, marginTop: "4px" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "rgba(24,201,122,0.07)", border: "1px solid rgba(24,201,122,0.25)", borderRadius: "12px", padding: "14px 16px", marginBottom: "16px", display: "flex", gap: "10px" }}>
            <span style={{ fontSize: "18px" }}>⚡</span>
            <div>
              <div style={{ fontSize: "10px", color: "#18C97A", fontFamily: "monospace", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "4px" }}>This Week Priority</div>
              <div style={{ fontSize: "13px", color: "#EEF2FF", lineHeight: 1.6 }}>{audit.weeklyPriority}</div>
            </div>
          </div>

          <div style={{ fontSize: "11px", fontFamily: "monospace", color: "rgba(238,242,255,0.3)", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: "10px" }}>Revenue Leaks</div>
          {audit.leaks?.map((leak, i) => {
            const c = getSeverityColors(leak.severity);
            return (
              <div key={i} style={{ background: c.bg, border: `1px solid ${c.border}`, borderLeft: `3px solid ${c.border}`, borderRadius: "12px", padding: "14px", marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#EEF2FF" }}>{leak.metric}</div>
                  <div style={{ fontSize: "9px", padding: "2px 8px", borderRadius: "20px", background: `${c.badge}22`, color: c.badge, fontFamily: "monospace", fontWeight: 700 }}>{getSeverityLabel(leak.severity)}</div>
                </div>
                <div style={{ display: "flex", gap: "16px", marginBottom: "8px", flexWrap: "wrap" as const }}>
                  <span style={{ fontSize: "11px", color: "rgba(238,242,255,0.45)" }}>Current: <b style={{ color: c.badge }}>{leak.current}</b></span>
                  <span style={{ fontSize: "11px", color: "rgba(238,242,255,0.45)" }}>Benchmark: <b style={{ color: "#EEF2FF" }}>{leak.benchmark}</b></span>
                  {leak.impact && <span style={{ fontSize: "11px", color: "rgba(238,242,255,0.45)" }}>Impact: <b style={{ color: "#18C97A" }}>{leak.impact}</b></span>}
                </div>
                <div style={{ fontSize: "12px", color: "rgba(238,242,255,0.55)", lineHeight: 1.6, marginBottom: "10px" }}>{leak.problem}</div>
                <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "10px 12px", fontSize: "12px", color: "#18C97A", lineHeight: 1.6, display: "flex", gap: "8px" }}>
                  <span style={{ fontSize: "9px", fontFamily: "monospace", fontWeight: 700, whiteSpace: "nowrap" as const, marginTop: "2px" }}>AI FIX</span>
                  {leak.fix}
                </div>
              </div>
            );
          })}

          {audit.topWins && (
            <div style={{ background: "#0C1118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
              <div style={{ fontSize: "10px", fontFamily: "monospace", color: "rgba(238,242,255,0.3)", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: "12px" }}>Quick Wins</div>
              {audit.topWins.map((win, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", padding: "7px 0", borderBottom: i < audit.topWins.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(24,201,122,0.12)", border: "1px solid rgba(24,201,122,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#18C97A", fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: "12px", color: "rgba(238,242,255,0.65)", lineHeight: 1.6 }}>{win}</div>
                </div>
              ))}
            </div>
          )}

          <button onClick={() => { setStep("form"); setAudit(null); }} style={{ width: "100%", padding: "13px", background: "#18C97A", border: "none", borderRadius: "10px", color: "#000", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
            Run Another Audit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#07090F", padding: "24px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "580px", margin: "0 auto" }}>
        <div style={{ textAlign: "center" as const, marginBottom: "28px" }}>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#EEF2FF", letterSpacing: "-0.5px", marginBottom: "6px" }}>GrowthOS AI Audit</div>
          <div style={{ fontSize: "13px", color: "rgba(238,242,255,0.45)" }}>Enter your metrics and get a full AI audit in 30 seconds</div>
        </div>

        {error && (
          <div style={{ background: "rgba(240,69,58,0.1)", border: "1px solid #F0453A", borderRadius: "10px", padding: "12px", marginBottom: "16px", fontSize: "13px", color: "#F0453A" }}>{error}</div>
        )}

        <div style={{ background: "#0C1118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "24px" }}>
          <div style={{ fontSize: "10px", fontFamily: "monospace", color: "rgba(238,242,255,0.3)", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: "14px" }}>Restaurant Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={labelStyle}>Restaurant Name</label>
              <input name="restaurantName" value={formData.restaurantName} onChange={handleChange} placeholder="e.g. Cafe Bistro 57" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Platform</label>
              <select name="platform" value={formData.platform} onChange={handleChange} style={inputStyle}>
                <option>Zomato</option>
                <option>Swiggy</option>
                <option>Both</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Period</label>
            <input name="period" value={formData.period} onChange={handleChange} placeholder="e.g. 1-7 May 2026" style={inputStyle} />
          </div>

          <div style={{ fontSize: "10px", fontFamily: "monospace", color: "rgba(238,242,255,0.3)", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: "14px" }}>Your Metrics</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {fields.map((field) => (
              <div key={field.name}>
                <label style={labelStyle}>{field.label}</label>
                <input name={field.name} value={formData[field.name as keyof FormData]} onChange={handleChange} placeholder={field.placeholder} style={inputStyle} />
              </div>
            ))}
          </div>

          <button onClick={handleSubmit} style={{ width: "100%", padding: "13px", background: "#18C97A", border: "none", borderRadius: "10px", color: "#000", fontSize: "14px", fontWeight: 700, cursor: "pointer", marginTop: "20px" }}>
            Run AI Audit
          </button>
        </div>
      </div>
    </div>
  );
}
