export interface PlanFeatures {
  id: string;
  name: string;
  maxProfiles: number;
  canDownload: boolean;
  maxQuality: "SD" | "HD" | "4K";
  price: string;
  benefits: string[];
}

export const PLAN_FEATURES: Record<string, PlanFeatures> = {
  Starter: {
    id: "Starter",
    name: "Starter",
    maxProfiles: 1,
    canDownload: false,
    maxQuality: "SD",
    price: "Gratuit",
    benefits: [
      "Qualité SD (480p)",
      "1 profil utilisateur",
      "Accès à tout le catalogue",
      "Publicité occasionnelle"
    ]
  },
  Premium: {
    id: "Premium",
    name: "Premium",
    maxProfiles: 3,
    canDownload: true,
    maxQuality: "HD",
    price: "€9.99/mois",
    benefits: [
      "Qualité HD (1080p)",
      "3 profils utilisateurs",
      "Téléchargements illimités",
      "Sans publicité",
      "Regardez sur 2 écrans à la fois"
    ]
  },
  Ultimate: {
    id: "Ultimate",
    name: "Ultimate",
    maxProfiles: 5,
    canDownload: true,
    maxQuality: "4K",
    price: "€14.99/mois",
    benefits: [
      "Qualité 4K + HDR",
      "5 profils utilisateurs",
      "Téléchargements illimités",
      "Sans publicité",
      "Regardez sur 4 écrans à la fois",
      "Accès anticipé aux nouveautés"
    ]
  }
};

export function getPlanFeatures(planName: string = "Starter"): PlanFeatures {
  return PLAN_FEATURES[planName] || PLAN_FEATURES.Starter;
}
