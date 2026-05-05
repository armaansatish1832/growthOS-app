"use client";
import { useState, useRef } from "react";

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
  cuisine: string;
  location: string;
};

export default function AuditPage() {
  const [step, setStep] = useState<"form" | "loading" | "result">("form");
  const [formData, setFormData] = useState<FormData>({
    restaurantName: "",
    platform: "Zomato",
    period: "",
    cuisine: "",
    location: "",
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<"upload" | "manual">("upload");
  const [manualData, setManualData] = useState({
    impressions: "", ctr: "", pageOpens: "", orders: "",
    gmv: "", atv: "", cancellationRate: "", rating: "",
    newUserPercent: "", returningUserPercent: "",
  });
  const [audit, setAudit] = useState<AuditType | null>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualData({ ...manualData, [e.target.name]: e.target.value });
  };

  const handleFile = (file: File) => {
    setUploadedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    setStep("loading");
    setError("");
    try {
      let message = "";

      if (uploadMode === "upload" && uploadedFile) {
        const isImage = uploadedFile.type.startsWith("image/");

        if (isImage) {
          const base64 = await toBase64(uploadedFile);
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [{
                role: "user",
                content: [
                  {
                    type: "image",
                    source: {
                      type: "base64",
                      media_type: uploadedFile.type,
                      data: base64,
                    },
                  },
                  {
                    type: "text",
                    text: `You are GrowthOS AI, an expert restaurant growth analyst. This is a screenshot of a Zomato/Swiggy merchant dashboard for ${formData.restaurantName || "this restaurant"} (${formData.cuisine} cuisine, ${formData.location}).

Extract ALL visible metrics from this image and analyse them against these benchmarks:
- CTR: below 2% bad, above 4% good
- Menu Conversion (orders/page opens x 100): below 10% bad, 15-20% good
- Cancellation rate: above 1% bad, 0% ideal
- Returning users: below 15% bad, 30-40% good
- Rating: below 3.8 critical, above 4.2 strong

Return ONLY a valid JSON object with no extra text:
{"overallScore":75,"summary":"2 sentence summary","leaks":[{"severity":"critical","metric":"name","current":"value","benchmark":"target","impact":"Rs estimate","problem":"issue","cause":"reason","fix":"exact action"}],"topWins":["win1","win2","win3"],"weeklyPriority":"top action this week"}`,
                  },
                ],
              }],
            }),
          });
          const data = await res.json();
          if (data.content && data.content[0]?.text) {
            let text = data.content[0].text.trim();
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
            setAudit(JSON.parse(text));
            setStep("result");
          } else {
            setError("Could not read the image. Please try again.");
            setStep("form");
          }
          return;
        } else {
          message = `You are GrowthOS AI. The restaurant ${formData.restaurantName || "this restaurant"} (${formData.cuisine} cuisine, ${formData.location}) has uploaded a data file. Unfortunately I cannot read the file directly, but please provide a general audit framework and ask them to enter their key metrics manually.`;
        }
      } else {
        const conversionRate = (Number(manualData.orders) / Number(manualData.pageOpens) * 100).toFixed(1);
        message = `You are GrowthOS AI, an expert restaurant growth analyst. Analyse this data and return ONLY a valid JSON object with no extra text, no markdown, no backticks.

Benchmarks: CTR below 2% bad, above 4% good. Menu Conversion below 10% bad, 15-20% good. Cancellation above 1% bad. Returning users below 15% bad, 30-40% good. Rating below 3.8 critical, above 4.2 strong.

Restaurant: ${formData.restaurantName}
Platform: ${formData.platform}
Cuisine: ${formData.cuisine}
Location: ${formData.location}
Period: ${formData.period}
Impressions: ${manualData.impressions}
CTR: ${manualData.ctr}%
Page Opens: ${manualData.pageOpens}
Orders: ${manualData.orders}
Menu Conversion Rate: ${conversionRate}%
GMV: Rs ${manualData.gmv}
ATV: Rs ${manualData.atv}
Cancellation Rate: ${manualData.cancellationRate}%
Rating: ${manualData.rating}
New Users: ${manualData.newUserPercent}%
Returning Users: ${manualData.returningUserPercent}%

Return this exact JSON:
{"overallScore":75,"summary":"2 sentence summary","leaks":[{"severity":"critical","metric":"name","current":"value","benchmark":"target","impact":"Rs estimate","problem":"issue","cause":"reason","fix":"exact action"}],"topWins":["win1","win2","win3"],"weeklyPriority":"top action"}`;
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: message }],
        }),
      });
      const data = await res.json();
      if (data.content && data.content[0]?.text) {
        let text = data.content[0].text.trim();
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        setAudit(JSON.parse(text));
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
    width: "100%", background: "#111820",
    border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px",
    padding: "10px 12px", fontSize: "13px", color: "#EEF2FF",
    outline: "none", fontFamily: "sans-serif", boxSizing: "border-box" as const,
  };

  const labelStyle = {
    fontSize: "11px", color: "rgba(238,242,255,0.5)",
    display: "block", marginBottom: "6px",
  };

  if (step === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: "#07090F", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "3px solid rgba(24,201,122,0.2)", borderTop: "3px solid #18C97A", animation: "spin 1s linear infinite" }} />
        <div style={{ color: "#18C97A", fontSize: "15px", fontWeight: 600, fontFamily: "sans-serif" }}>GrowthOS AI is analysing...</div>
        <div style={{ color: "rgba(238,242,255,0.4)", fontSize: "12px", fontFamily: "sans-serif" }}>Reading your data and checking benchmarks</div>
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

          <button onClick={() => { setStep("form"); setAudit(null); setUploadedFile(null); }} style={{ width: "100%", padding: "13px", background: "#18C97A", border: "none", borderRadius: "10px", color: "#000", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
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
          <div style={{ fontSize: "13px", color: "rgba(238,242,255,0.45)" }}>Upload your dashboard screenshot or enter metrics manually</div>
        </div>

        {error && (
          <div style={{ background: "rgba(240,69,58,0.1)", border: "1px solid #F0453A", borderRadius: "10px", padding: "12px", marginBottom: "16px", fontSize: "13px", color: "#F0453A" }}>{error}</div>
        )}

        <div style={{ background: "#0C1118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "24px" }}>

          {/* Restaurant Details */}
          <div style={{ fontSize: "10px", fontFamily: "monospace", color: "rgba(238,242,255,0.3)", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: "14px" }}>Restaurant Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={labelStyle}>Restaurant Name</label>
              <input name="restaurantName" value={formData.restaurantName} onChange={handleChange} placeholder="e.g. Lotus Leaf" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Platform</label>
              <select name="platform" value={formData.platform} onChange={handleChange} style={inputStyle}>
                <option>Zomato</option>
                <option>Swiggy</option>
                <option>Both</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Cuisine Type</label>
              <input name="cuisine" value={formData.cuisine} onChange={handleChange} placeholder="e.g. North Indian" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Location</label>
              <input name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Rohini, Delhi" style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Period</label>
            <input name="period" value={formData.period} onChange={handleChange} placeholder="e.g. April 2026" style={inputStyle} />
          </div>

          {/* Upload vs Manual Toggle */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            {["upload", "manual"].map((mode) => (
              <button key={mode} onClick={() => setUploadMode(mode as "upload" | "manual")} style={{
                flex: 1, padding: "9px", borderRadius: "8px", border: "1px solid",
                borderColor: uploadMode === mode ? "#18C97A" : "rgba(255,255,255,0.07)",
                background: uploadMode === mode ? "rgba(24,201,122,0.1)" : "#111820",
                color: uploadMode === mode ? "#18C97A" : "rgba(238,242,255,0.4)",
                fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "sans-serif"
              }}>
                {mode === "upload" ? "📤 Upload File / Screenshot" : "✏️ Enter Manually"}
              </button>
            ))}
          </div>

          {/* Upload Zone */}
          {uploadMode === "upload" && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? "#18C97A" : uploadedFile ? "#18C97A" : "rgba(255,255,255,0.1)"}`,
                borderRadius: "12px", padding: "32px 20px", textAlign: "center" as const,
                cursor: "pointer", background: dragOver ? "rgba(24,201,122,0.05)" : uploadedFile ? "rgba(24,201,122,0.05)" : "#111820",
                transition: "all 0.2s", marginBottom: "16px"
              }}
            >
              <input ref={fileRef} type="file" accept="image/*,.csv,.xlsx,.pdf" style={{ display: "none" }} onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
              {uploadedFile ? (
                <div>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>✅</div>
                  <div style={{ fontSize: "13px", color: "#18C97A", fontWeight: 600 }}>{uploadedFile.name}</div>
                  <div style={{ fontSize: "11px", color: "rgba(238,242,255,0.3)", marginTop: "4px" }}>Click to change file</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: "32px", marginBottom: "10px" }}>📤</div>
                  <div style={{ fontSize: "13px", color: "#EEF2FF", fontWeight: 600, marginBottom: "4px" }}>Upload your dashboard data</div>
                  <div style={{ fontSize: "11px", color: "rgba(238,242,255,0.35)", marginBottom: "8px" }}>Drag & drop or click to browse</div>
                  <div style={{ fontSize: "10px", color: "rgba(238,242,255,0.2)", fontFamily: "monospace" }}>Screenshot · CSV · Excel · PDF</div>
                </div>
              )}
            </div>
          )}

          {/* Manual Entry */}
          {uploadMode === "manual" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              {[
                { name: "impressions", label: "Impressions", placeholder: "e.g. 12500" },
                { name: "ctr", label: "CTR (%)", placeholder: "e.g. 3.5" },
                { name: "pageOpens", label: "Page Opens", placeholder: "e.g. 437" },
                { name: "orders", label: "Total Orders", placeholder: "e.g. 65" },
                { name: "gmv", label: "GMV (Rs)", placeholder: "e.g. 94250" },
                { name: "atv", label: "ATV (Rs)", placeholder: "e.g. 1450" },
                { name: "cancellationRate", label: "Cancellation Rate (%)", placeholder: "e.g. 0.5" },
                { name: "rating", label: "Current Rating", placeholder: "e.g. 4.1" },
                { name: "newUserPercent", label: "New Users (%)", placeholder: "e.g. 65" },
                { name: "returningUserPercent", label: "Returning Users (%)", placeholder: "e.g. 35" },
              ].map((field) => (
                <div key={field.name}>
                  <label style={labelStyle}>{field.label}</label>
                  <input name={field.name} value={manualData[field.name as keyof typeof manualData]} onChange={handleManualChange} placeholder={field.placeholder} style={inputStyle} />
                </div>
              ))}
            </div>
          )}

          <button onClick={handleSubmit} style={{ width: "100%", padding: "13px", background: "#18C97A", border: "none", borderRadius: "10px", color: "#000", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
            Run AI Audit →
          </button>
        </div>
      </div>
    </div>
  );
}
