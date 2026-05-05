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
    setFormData({ ...formData, [e.target.name]: e.target.v
