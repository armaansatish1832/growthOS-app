"use client";

import { useState } from "react";

export default function AuditPage() {
  const [step, setStep] = useState<"form" | "loading" | "result">("form");
  const [formData, setFormData] = useState({
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
  const [audit, setAudit] = useState<any>(null);
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

  const severityColor = (severity: string) => {
    if (severity === "critical") return { bg: "rgba(240,69,58,0.1)", border: "#F0453A", badge: "#F0453A", badgeBg: "rgba(240,69,58,0.15)" };
    if (severity === "warning") return { bg: "rgba(245,166,35,0.1)", border: "#F5A623", badge: "#F5A623", badgeBg: "rgba(245,166,35,0.15)" };
    return { bg: "rgba(24,201,122,0.1)", border: "#18C97A", badge: "#18C97A", badgeBg: "rgba(24,201,122,0.15)" };
  };

  const severityLabel = (severity: string) => {
    if (severity === "critical") return "🔴 CRITICAL";
    if (severity === "warning") return "🟡 WATCH";
    return "🟢 OPPORTUNITY";
  };

  if (step === "loading") {
    return (
      <div style={{
        minHeight: "100vh", background: "#07090F",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "20px"
      }}>
        <div style={{
          width: "60px", height: "60px", borderRadius: "50%",
          border: "3px solid rgba(24,201,122,0.2)",
          borderTop: "3px solid #18C97A",
          animation: "spin 1s linear infinite"
        }} />
        <div style={{ fontFamily: "sans-serif", color: "#18C97A", fontSize: "16px", fontWeight: 600 }}>
          GrowthOS AI is analysing your data...
        </div>
        <div style={{ color: "rgba(238,242,255,0.4)", fontSize: "13px", fontFamily: "sans-serif" }}>
          Checking all metrics against benchmarks
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (step === "result" && audit) {
    const scoreColor = audit.overallScore >= 70 ? "#18C97A" : audit.overallScore >= 50 ? "#F5A623" : "#F0453A";
    return (
      <div style={{ minHeight: "100vh", background: "#07090F", padding: "24px", fontFamily: "sans-serif" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>

          {/* Header */}
          <div style={{
            background: "linear-gradient(120deg,#0C1118,#111820)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "14px", padding: "24px", marginBottom: "20px",
            position: "relative", overflow: "hidden"
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "2px",
              background: "linear-gradient(90deg,#18C97A,#4A90D9,transparent)"
            }} />
            <div style={{ fontSize: "11px", color: "rgba(238,242,255,0.3)", fontFamily: "monospace", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              GrowthOS AI Audit — {formData.restaurantName}
            </div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#EEF2FF", marginBottom: "8px", letterSpacing: "-0.5px" }}>
              Your audit report is ready
            </div>
            <div style={{ fontSize: "13px", color: "rgba(238,242,255,0.5)", lineHeight: 1.6, marginBottom: "16px" }}>
              {audit.summary}
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <div style={{
                background: "rgba(255,255,255,0.05)", borderRadius: "10px",
                padding: "12px 20px", textAlign: "center"
              }}>
                <div style={{ fontSize: "32px", fontWeight: 800, color: scoreColor, letterSpacing: "-1px" }}>
                  {audit.overallScore}
                </div>
                <div style={{ fontSize: "10px", color: "rgba(238,242,255,0.4)", fontFamily: "monospace", textTransform: "uppercase" }}>
                  ROI Score
                </div>
              </div>
              <div style={{
                background: "rgba(255,255,255,0.05)", borderRadius: "10px",
                padding: "12px 20px", textAlign: "center"
              }}>
                <div style={{ fontSize: "32px", fontWeight: 800, color: "#F0453A", letterSpacing: "-1px" }}>
                  {audit.leaks?.filter((l: any) => l.severity === "critical").length || 0}
                </div>
                <div style={{ fontSize: "10px", color: "rgba(238,242,255,0.4)", fontFamily: "monospace", textTransform: "uppercase" }}>
                  Critical Leaks
                </div>
              </div>
              <div style={{
                background: "rgba(255,255,255,0.05)", borderRadius: "10px",
                padding: "12px 20px", textAlign: "center"
              }}>
                <div style={{ fontSize: "32px", fontWeight: 800, color: "#18C97A", letterSpacing: "-1px" }}>
                  {audit.leaks?.length || 0}
                </div>
                <div style={{ fontSize: "10px", color: "rgba(238,242,255,0.4)", fontFamily: "monospace", textTransform: "uppercase" }}>
                  Total Leaks
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Priority */}
          <div style={{
            background: "rgba(24,201,122,0.08)", border: "1px solid rgba(24,201,122,0.3)",
            borderRadius: "12px", padding: "16px", marginBottom: "20px",
            display: "flex", gap: "12px", alignItems: "flex-start"
          }}>
            <div style={{ fontSize: "20px" }}>⚡</div>
            <div>
              <div style={{ fontSize: "10px", color: "#18C97A", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>
                This Week's #1 Priority
              </div>
              <div style={{ fontSize: "13px", color: "#EEF2FF", lineHeight: 1.6 }}>
                {audit.weeklyPriority}
              </div>
            </div>
          </div>

          {/* Leaks */}
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#EEF2FF", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace" }}>
            Revenue Leaks Found
          </div>
          {audit.leaks?.map((leak: any, i: number) => {
            const colors = severityColor(leak.severity);
            return (
              <div key={i} style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderLeft: `3px solid ${colors.border}`,
                borderRadius: "12px", padding: "16px", marginBottom: "12px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", gap: "8px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#EEF2FF" }}>{leak.metric}</div>
                  <div style={{
                    fontSize: "9px", padding: "3px 8px", borderRadius: "20px",
                    background: colors.badgeBg, color: colors.badge,
                    fontFamily: "monospace", fontWeight: 600, whiteSpace: "nowrap"
                  }}>
                    {severityLabel(leak.severity)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px", marginBottom: "10px", flexWrap: "wrap" }}>
                  <div style={{ fontSize: "11px", color: "rgba(238,242,255,0.5)" }}>
                    Current: <span style={{ color: colors.badge, fontWeight: 600 }}>{leak.current}</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "rgba(238,242,255,0.5)" }}>
                    Benchmark: <span style={{ color: "#EEF2FF", fontWeight: 600 }}>{leak.benchmark}</span>
                  </div>
                  {leak.impact && (
                    <div style={{ fontSize: "11px", color: "rgba(238,242,255,0.5)" }}>
                      Impact: <span style={{ color: "#18C97A", fontWeight: 600 }}>{leak.impact}</span>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: "12px", color: "rgba(238,242,255,0.6)", lineHeight: 1.6, marginBottom: "10px" }}>
                  {leak.problem}
                </div>
                <div style={{
                  background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "8px", padding: "10px 12px",
                  fontSize: "11.5px", color: "#18C97A", lineHeight: 1.6,
                  display: "flex", gap: "8px"
                }}>
                  <span style={{ fontSize: "9px", fontFamily: "monospace", color: "#18C97A", fontWeight: 700, whiteSpace: "nowrap", marginTop: "2px" }}>AI FIX →</span>
                  {leak.fix}
                </div>
              </div>
            );
          })}

          {/* Quick Wins */}
          {audit.topWins && (
            <div style={{
              background: "#0C1118", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "12px", padding: "16px", marginBottom: "20px"
            }}>
              <div style={{ fontSize: "10px", fontFamily: "monospace", color: "rgba(238,242,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
                Quick Wins This Week
              </div>
              {audit.topWins.map((win: string, i: number) => (
                <div key={i} style={{
                  display: "flex", gap: "10px", alignItems: "flex-start",
                  padding: "8px 0", borderBottom: i < audit.topWins.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none"
                }}>
                  <div style={{
                    width: "20px", height: "20px", borderRadius: "50%",
                    background: "rgba(24,201,122,0.15)", border: "1px solid rgba(24,201,122,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "c
