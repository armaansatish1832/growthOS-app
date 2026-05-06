"use client";

import React from "react";
import { UserButton } from "@clerk/nextjs";
import ChatBot from "@/components/ChatBot";

export default function Home() {
  const [activeNav, setActiveNav] = React.useState("Dashboard");
  const [hoveredNav, setHoveredNav] = React.useState<string | null>(null);

  const navItems = [
    "Dashboard",
    "Weekly Report",
    "Platforms",
    "Compare",
    "Leak Detector",
    "ROAS Analyser",
    "Pricing",
    "Settings",
  ];

  const metricCards = [
    { label: "Total GMV", value: "₹8.4L", delta: "↑ +23.4% this month", deltaColor: "#18C97A" },
    { label: "Avg Order Value", value: "₹4,272", delta: "↑ +7.7% vs last month", deltaColor: "#18C97A" },
    { label: "ROI Score", value: "71", delta: "⚠ 3 leaks found", deltaColor: "#F5A623" },
    { label: "Impressions", value: "46.7K", delta: "↑ +910% MoM", deltaColor: "#18C97A" },
  ];

  return (
    <div
      style={{
        "--bg": "#07090F",
        "--sidebarBg": "#0C1118",
        "--sidebarBorder": "rgba(255,255,255,0.07)",
        "--accentGreen": "#18C97A",
        "--textPrimary": "#EEF2FF",
        "--textSecondary": "#7A8AA8",
        "--cardBg": "#0C1118",
        "--cardBorder": "rgba(255,255,255,0.07)",
        "--radius": "14px",
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--textPrimary)",
        display: "flex",
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif",
      } as React.CSSProperties}
    >
      <aside
        style={{
          width: "210px",
          minWidth: "210px",
          maxWidth: "210px",
          background: "var(--sidebarBg)",
          borderRight: "1px solid var(--sidebarBorder)",
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 10px",
            marginBottom: "20px",
          }}
        >
          <span
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "999px",
              background: "var(--accentGreen)",
              boxShadow: "0 0 16px rgba(24, 201, 122, 0.65)",
            }}
          />
          <span style={{ fontWeight: 700, fontSize: "18px", letterSpacing: "0.2px" }}>
            GrowthOS
          </span>
        </div>

        {navItems.map((item, index) => (
          <div
            key={item}
            onMouseEnter={() => setHoveredNav(item)}
            onMouseLeave={() => setHoveredNav(null)}
            onClick={() => setActiveNav(item)}
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              background:
                activeNav === item
                  ? "rgba(24, 201, 122, 0.14)"
                  : hoveredNav === item
                    ? "rgba(255,255,255,0.04)"
                    : "transparent",
              border:
                activeNav === item
                  ? "1px solid rgba(24, 201, 122, 0.35)"
                  : "1px solid transparent",
              color: activeNav === item ? "var(--accentGreen)" : "var(--textSecondary)",
              fontWeight: activeNav === item ? 600 : 500,
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow:
                activeNav === item && index === 0
                  ? "inset 2px 0 0 var(--accentGreen)"
                  : "none",
            }}
          >
            {item}
          </div>
        ))}
      </aside>

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header
          style={{
            height: "76px",
            borderBottom: "1px solid var(--sidebarBorder)",
            padding: "0 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--bg)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "999px",
                background: "var(--accentGreen)",
                boxShadow: "0 0 18px rgba(24, 201, 122, 0.7)",
              }}
            />
            <span style={{ fontSize: "22px", fontWeight: 700 }}>GrowthOS</span>
          </div>
          <a href="/audit" style={{ padding: "8px 16px", background: "var(--accentGreen)", color: "#000", borderRadius: "8px", fontWeight: 700, fontSize: "13px", textDecoration: "none" }}>Run AI Audit →</a>
          <UserButton />
        </header>

        <section style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "22px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "30px", fontWeight: 700 }}>Good morning, Armaan 👋</div>
            <div style={{ color: "var(--textSecondary)", fontSize: "15px", fontWeight: 500 }}>
              3 revenue leaks detected across your platforms this week
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: "16px",
            }}
          >
            {metricCards.map((card) => (
              <div
                key={card.label}
                style={{
                  background: "var(--cardBg)",
                  border: "1px solid var(--cardBorder)",
                  borderRadius: "var(--radius)",
                  padding: "18px",
                  minHeight: "130px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ color: "var(--textSecondary)", fontSize: "13px", fontWeight: 500 }}>
                  {card.label}
                </div>
                <div style={{ color: "var(--accentGreen)", fontSize: "34px", fontWeight: 700, lineHeight: 1.1 }}>
                  {card.value}
                </div>
                <div style={{ color: card.deltaColor, fontSize: "13px", fontWeight: 600 }}>{card.delta}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: "20px", fontWeight: 700 }}>Top Revenue Leaks</div>
              <div
                style={{
                  background: "#F0453A",
                  color: "#FFFFFF",
                  fontSize: "10px",
                  fontWeight: 700,
                  borderRadius: "999px",
                  padding: "4px 8px",
                  letterSpacing: "0.3px",
                }}
              >
                AI Detected
              </div>
            </div>

            <div
              style={{
                borderLeft: "3px solid #F0453A",
                background: "#0C1118",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "14px",
                padding: "15px",
                marginBottom: "9px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <div style={{ fontSize: "16px", fontWeight: 700 }}>Cart abandonment 31% above benchmark</div>
                <div
                  style={{
                    background: "rgba(240, 69, 58, 0.18)",
                    color: "#F0453A",
                    fontSize: "11px",
                    fontWeight: 700,
                    borderRadius: "999px",
                    padding: "4px 8px",
                    whiteSpace: "nowrap",
                  }}
                >
                  🔴 CRITICAL
                </div>
              </div>
              <div style={{ color: "var(--textSecondary)", fontSize: "14px", marginTop: "9px", lineHeight: 1.5 }}>
                Your checkout abandonment rate is 74% vs 56% category average. Estimated ₹42,000/week in lost
                revenue.
              </div>
              <div
                style={{
                  background: "#111820",
                  borderRadius: "8px",
                  padding: "9px",
                  color: "#18C97A",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginTop: "10px",
                  lineHeight: 1.45,
                }}
              >
                AI FIX → Rewrite checkout CTA to &apos;Confirm &amp; Get It Fast&apos;. Add trust badges above the pay
                button. Est. recovery: ₹18,000–28,000/week.
              </div>
            </div>

            <div
              style={{
                borderLeft: "3px solid #F5A623",
                background: "#0C1118",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "14px",
                padding: "15px",
                marginBottom: "9px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <div style={{ fontSize: "16px", fontWeight: 700 }}>Swiggy ad ROAS 2.3x vs Zomato 4.1x</div>
                <div
                  style={{
                    background: "rgba(245, 166, 35, 0.18)",
                    color: "#F5A623",
                    fontSize: "11px",
                    fontWeight: 700,
                    borderRadius: "999px",
                    padding: "4px 8px",
                    whiteSpace: "nowrap",
                  }}
                >
                  🟡 WATCH
                </div>
              </div>
              <div style={{ color: "var(--textSecondary)", fontSize: "14px", marginTop: "9px", lineHeight: 1.5 }}>
                Equal budget on both platforms. Moving 60% of Swiggy budget to Zomato generates ₹31,000 more GMV
                with the same total spend.
              </div>
              <div
                style={{
                  background: "#111820",
                  borderRadius: "8px",
                  padding: "9px",
                  color: "#18C97A",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginTop: "10px",
                  lineHeight: 1.45,
                }}
              >
                AI FIX → Reallocate ₹8,000 from Swiggy to Zomato ads this week.
              </div>
            </div>
          </div>
        </section>
      </main>
      <ChatBot />
    </div>
  );
}
