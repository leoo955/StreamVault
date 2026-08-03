"use client";

export function ProfileGuard({ children }: { children: React.ReactNode }) {
  // L'authentification obligatoire et la sélection de profil ont été retirées
  // Le contenu est accessible librement et instantanément.
  return <>{children}</>;
}
