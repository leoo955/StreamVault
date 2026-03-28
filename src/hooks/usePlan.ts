"use client";

import { useUser } from "@/lib/userProvider";
import { PlanFeatures } from "@/lib/plans";

export function usePlan(): { plan: PlanFeatures | null; loading: boolean } {
  const { planFeatures, loading } = useUser();
  return { plan: planFeatures, loading };
}
