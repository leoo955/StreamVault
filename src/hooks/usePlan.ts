"use client";

import { useState, useEffect } from "react";
import { PlanFeatures, getPlanFeatures } from "@/lib/plans";

export function usePlan() {
  const [plan, setPlan] = useState<PlanFeatures | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setPlan(getPlanFeatures(data.user.plan));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { plan, loading };
}
