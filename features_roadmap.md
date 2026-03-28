# StreamVault — Roadmap des Nouvelles Features 🚀

---

## 1. 🤖 Recommandations IA

**Objectif :** Suggérer automatiquement des films/séries en fonction de ce que l'utilisateur a regardé et noté.

### Comment ça marche
- **Collecte des signaux :** On analyse l'historique de visionnage ([WatchProgress](file:///c:/Users/leoo9/Desktop/Netflix/src/lib/db.ts#552-561)), les notes ([Rating](file:///c:/Users/leoo9/Desktop/Netflix/src/app/api/ratings/route.ts#10-16)), et les genres favoris de chaque utilisateur.
- **Algorithme de scoring :** Pour chaque média non-vu, on calcule un score basé sur :
  - Similarité de genres (ex: si l'user regarde beaucoup d'Action → boost les films Action)
  - Notes des films similaires (même saga, même studio, même acteurs)
  - Popularité globale sur la plateforme (pondération faible)
- **Affichage :** Nouvelle row "Recommandé pour toi" en haut de la homepage, personnalisée par utilisateur.

### Fichiers concernés
| Fichier | Action |
|---------|--------|
| `src/lib/recommendations.ts` | **[NEW]** Moteur de scoring (genre matching, collaborative filtering léger) |
| `src/app/api/recommendations/route.ts` | **[NEW]** Endpoint `GET /api/recommendations` |
| [src/app/page.tsx](file:///c:/Users/leoo9/Desktop/Netflix/src/app/page.tsx) | **[MODIFY]** Ajouter la row "Recommandé pour toi" |

### Complexité : ⭐⭐⭐ (Moyenne)

---

## 2. ✨ Animations de Transition

**Objectif :** Transitions fluides entre les pages, style Netflix mobile (shared element transitions).

### Comment ça marche
- **Shared Layout Animations :** Quand on clique sur une [MediaCard](file:///c:/Users/leoo9/Desktop/Netflix/src/components/MediaCard.tsx#15-196), le poster "s'agrandit" et se transforme en la page de détail (au lieu d'un simple changement de page brutal).
- **Page Transitions :** Fade + slide subtil entre chaque navigation.
- **Tech :** Utiliser `framer-motion` `layoutId` sur les posters pour créer l'illusion de continuité.

### Fichiers concernés
| Fichier | Action |
|---------|--------|
| [src/components/MediaCard.tsx](file:///c:/Users/leoo9/Desktop/Netflix/src/components/MediaCard.tsx) | **[MODIFY]** Ajouter `layoutId={item.id}` sur le poster |
| [src/app/detail/[id]/page.tsx](file:///c:/Users/leoo9/Desktop/Netflix/src/app/detail/%5Bid%5D/page.tsx) | **[MODIFY]** Ajouter `layoutId` correspondant + animation d'entrée |
| `src/components/PageTransition.tsx` | **[NEW]** Wrapper `AnimatePresence` pour les transitions de pages |
| [src/app/layout.tsx](file:///c:/Users/leoo9/Desktop/Netflix/src/app/layout.tsx) | **[MODIFY]** Intégrer `PageTransition` autour du `{children}` |

### Complexité : ⭐⭐ (Facile-Moyenne)

---

## 3. 🎨 Fond Dynamique Profil

**Objectif :** Le backdrop du dernier film/série regardé(e) devient le fond d'écran de la homepage.

### Comment ça marche
- **Détection :** On récupère le dernier [WatchProgress](file:///c:/Users/leoo9/Desktop/Netflix/src/lib/db.ts#552-561) de l'utilisateur connecté.
- **Extraction :** On prend le `backdropUrl` du média correspondant.
- **Rendu :** Le fond de la page d'accueil affiche ce backdrop en arrière-plan avec un overlay gradient, créant une atmosphère unique à chaque session.
- **Fallback :** Si pas d'historique → backdrop du film le mieux noté de la plateforme.

### Fichiers concernés
| Fichier | Action |
|---------|--------|
| [src/app/page.tsx](file:///c:/Users/leoo9/Desktop/Netflix/src/app/page.tsx) | **[MODIFY]** Ajouter un `<div>` en fond absolu avec le backdrop dynamique |
| [src/app/api/progress/route.ts](file:///c:/Users/leoo9/Desktop/Netflix/src/app/api/progress/route.ts) | **[MODIFY]** Retourner le `backdropUrl` du dernier média vu |

### Complexité : ⭐ (Facile)

---

## 4. 📊 Classement Hebdomadaire

**Objectif :** Afficher un "Top 10 cette semaine" basé sur les vues réelles de la plateforme (pas les notes TMDB).

### Comment ça marche
- **Comptage :** On compte les entrées [WatchProgress](file:///c:/Users/leoo9/Desktop/Netflix/src/lib/db.ts#552-561) des 7 derniers jours, groupées par `mediaId`.
- **Ranking :** Les 10 médias les plus regardés forment le classement.
- **Affichage :** Row spéciale avec de grands numéros style Netflix (1, 2, 3...) à côté des posters, avec un badge "🔥 Trending" animé.
- **Rafraîchissement :** Calcul côté API, mis en cache 1h.

### Fichiers concernés
| Fichier | Action |
|---------|--------|
| `src/app/api/trending/route.ts` | **[NEW]** Endpoint calculant les 10 médias les plus vus cette semaine |
| `src/components/TrendingRow.tsx` | **[NEW]** Row spéciale avec les grands numéros et l'animation fire |
| [src/app/page.tsx](file:///c:/Users/leoo9/Desktop/Netflix/src/app/page.tsx) | **[MODIFY]** Ajouter la `TrendingRow` en position proéminente |

### Complexité : ⭐⭐ (Facile-Moyenne)

---

## 5. 🎭 Thèmes Personnalisés

**Objectif :** Permettre à l'utilisateur de choisir entre plusieurs palettes visuelles.

### Thèmes prévus
| Thème | Couleurs principales |
|-------|---------------------|
| **Gold Classic** (actuel) | Noir + Or doré |
| **Midnight Blue** | Noir profond + Bleu néon |
| **Neon Purple** | Noir + Violet/Magenta |
| **Pure OLED** | Noir pur `#000` + Blanc minimaliste |
| **Crimson Red** | Noir + Rouge Netflix |

### Comment ça marche
- **CSS Variables :** Chaque thème redéfinit les variables CSS (`--gold`, `--surface`, `--accent`, etc.).
- **Stockage :** Le choix est sauvegardé en `localStorage` et appliqué au `<html>` via une classe (`theme-blue`, `theme-purple`, etc.).
- **UI :** Sélecteur dans `/settings` avec preview en direct de chaque thème.

### Fichiers concernés
| Fichier | Action |
|---------|--------|
| [src/app/globals.css](file:///c:/Users/leoo9/Desktop/Netflix/src/app/globals.css) | **[MODIFY]** Ajouter les variantes de thèmes via classes CSS |
| `src/lib/theme.ts` | **[NEW]** Hook `useTheme()` + constantes des thèmes |
| [src/app/settings/page.tsx](file:///c:/Users/leoo9/Desktop/Netflix/src/app/settings/page.tsx) | **[MODIFY]** Ajouter le sélecteur de thème visuel |

### Complexité : ⭐⭐ (Facile-Moyenne)

---

## 6. 🎬 Mode Cinéma (Ambilight)

**Objectif :** Effet "Ambilight" — les bordures de l'écran prennent les couleurs dominantes de la vidéo en cours.

### Comment ça marche
- **Extraction temps réel :** Pendant la lecture, un `<canvas>` caché capture des frames de la vidéo toutes les 500ms.
- **Analyse couleur :** On extrait les couleurs dominantes des bords de l'image (haut, bas, gauche, droite).
- **Projection :** Ces couleurs sont projetées en `box-shadow` / `background` diffus autour du player.
- **Toggle :** Bouton ON/OFF dans les contrôles du player (icône 💡).

### Fichiers concernés
| Fichier | Action |
|---------|--------|
| [src/components/VideoPlayer.tsx](file:///c:/Users/leoo9/Desktop/Netflix/src/components/VideoPlayer.tsx) | **[MODIFY]** Ajouter le canvas d'extraction + les divs de projection |
| `src/lib/ambilight.ts` | **[NEW]** Logique d'extraction de couleurs et de projection |

### Complexité : ⭐⭐⭐ (Moyenne)

---

## 7. 🔗 Partage Social

**Objectif :** Bouton pour partager un film/série sur WhatsApp, Discord, X (Twitter), ou copier le lien.

### Comment ça marche
- **Web Share API :** Sur mobile, utiliser l'API native `navigator.share()` qui ouvre le panneau de partage du système.
- **Fallback Desktop :** Boutons individuels (WhatsApp, Discord, X) + bouton "Copier le lien".
- **Lien partagé :** Format `/detail/{id}` avec meta OG tags (titre, image, description) pour un beau preview.

### Fichiers concernés
| Fichier | Action |
|---------|--------|
| `src/components/ShareButton.tsx` | **[NEW]** Composant bouton de partage avec dropdown |
| [src/app/detail/[id]/page.tsx](file:///c:/Users/leoo9/Desktop/Netflix/src/app/detail/%5Bid%5D/page.tsx) | **[MODIFY]** Ajouter le `ShareButton` à côté des actions |
| `src/app/detail/[id]/layout.tsx` | **[NEW]** Metadata OG dynamiques pour les previews sociaux |

### Complexité : ⭐ (Facile)

---

## 8. 📺 Qualité Adaptative

**Objectif :** Permettre à l'utilisateur de choisir manuellement la qualité vidéo (Auto, 480p, 720p, 1080p, 4K).

### Comment ça marche
- **Détection HLS :** Si le flux est en `.m3u8`, on parse les variantes de qualité disponibles dans le master playlist.
- **Sélecteur UI :** Icône ⚙️ dans les contrôles du player → dropdown avec les résolutions disponibles.
- **Forçage :** Quand l'utilisateur choisit une qualité, on force HLS.js à ne charger que ce niveau.
- **Mode Auto :** Par défaut, HLS.js adapte automatiquement selon la bande passante.

### Fichiers concernés
| Fichier | Action |
|---------|--------|
| [src/components/VideoPlayer.tsx](file:///c:/Users/leoo9/Desktop/Netflix/src/components/VideoPlayer.tsx) | **[MODIFY]** Ajouter le sélecteur de qualité + logique HLS level forcing |

### Complexité : ⭐⭐ (Facile-Moyenne)

---

## 9. ⏭️ Skip Recap / Générique

**Objectif :** Détecter les récaps d'épisodes et les génériques de fin, et proposer un bouton "Passer".

### Comment ça marche
- **Récap (début) :** Bouton "Passer le résumé" visible pendant les 90 premières secondes d'un épisode (sauf E01).
- **Générique (fin) :** Quand il reste < 90 secondes ET que le média est une série → afficher "Épisode suivant" en overlay.
- **Données :** Les timestamps de skip peuvent être enrichis manuellement par l'admin ou estimés automatiquement.

### Fichiers concernés
| Fichier | Action |
|---------|--------|
| [src/components/VideoPlayer.tsx](file:///c:/Users/leoo9/Desktop/Netflix/src/components/VideoPlayer.tsx) | **[MODIFY]** Ajouter la logique de détection + les overlays de skip |

### Complexité : ⭐⭐ (Facile-Moyenne)

---

## 10. 🔄 Synchronisation Multi-Appareil

**Objectif :** Reprendre exactement là où on s'est arrêté sur n'importe quel appareil en temps réel.

### Comment ça marche
- **Sauvegarde fréquente :** Le player envoie la position toutes les 15 secondes à `POST /api/progress`.
- **Récupération au lancement :** Quand on ouvre un média, `GET /api/progress/{mediaId}` retourne la dernière position.
- **Auto-resume :** Le player seek automatiquement à la position sauvegardée avec un toast "Reprise à X:XX".
- **Déjà partiellement implémenté** — il faut juste augmenter la fréquence de sync et ajouter le toast visuel.

### Fichiers concernés
| Fichier | Action |
|---------|--------|
| [src/components/VideoPlayer.tsx](file:///c:/Users/leoo9/Desktop/Netflix/src/components/VideoPlayer.tsx) | **[MODIFY]** Interval de sync (30s → 15s) + toast de reprise |
| `src/app/api/progress/[mediaId]/route.ts` | **[NEW]** Endpoint dédié par média pour get/set rapide |

### Complexité : ⭐ (Facile — base déjà existante)

---

## 11. 🌍 Sous-titres Multilingues

**Objectif :** Sélecteur de sous-titres avec téléchargement automatique depuis OpenSubtitles.

### Comment ça marche
- **Recherche auto :** Quand un utilisateur ouvre un film, on cherche les sous-titres disponibles via l'API OpenSubtitles (gratuite avec clé).
- **Langues :** Français, Anglais, Espagnol, Arabe, Portugais au minimum.
- **Format :** Conversion automatique en WebVTT pour compatibilité navigateur.
- **Sélecteur :** Dropdown dans le player avec les langues disponibles + option "Désactivé".
- **Cache :** Les sous-titres téléchargés sont stockés en base pour ne pas re-fetch.

### Fichiers concernés
| Fichier | Action |
|---------|--------|
| `src/app/api/subtitles/[mediaId]/route.ts` | **[NEW]** Proxy vers OpenSubtitles API + cache |
| [src/components/VideoPlayer.tsx](file:///c:/Users/leoo9/Desktop/Netflix/src/components/VideoPlayer.tsx) | **[MODIFY]** Ajouter le sélecteur de sous-titres + tracks `<track>` |
| [prisma/schema.prisma](file:///c:/Users/leoo9/Desktop/Netflix/prisma/schema.prisma) | **[MODIFY]** Ajouter model `Subtitle` (mediaId, lang, vttUrl) |

### Complexité : ⭐⭐⭐ (Moyenne)

---

## Résumé & Ordre de priorité suggéré

| # | Feature | Difficulté | Impact UX |
|---|---------|-----------|-----------|
| 1 | Fond Dynamique | ⭐ | 🔥🔥🔥 |
| 2 | Classement Hebdo | ⭐⭐ | 🔥🔥🔥 |
| 3 | Partage Social | ⭐ | 🔥🔥 |
| 4 | Sync Multi-Appareil | ⭐ | 🔥🔥🔥 |
| 5 | Thèmes Personnalisés | ⭐⭐ | 🔥🔥🔥 |
| 6 | Skip Recap/Générique | ⭐⭐ | 🔥🔥 |
| 7 | Qualité Adaptative | ⭐⭐ | 🔥🔥 |
| 8 | Animations Transition | ⭐⭐ | 🔥🔥🔥 |
| 9 | Recommandations IA | ⭐⭐⭐ | 🔥🔥🔥🔥 |
| 10 | Mode Cinéma | ⭐⭐⭐ | 🔥🔥🔥 |
| 11 | Sous-titres Multilingues | ⭐⭐⭐ | 🔥🔥🔥🔥 |

> **Stratégie :** Commencer par les features ⭐ (rapides à ship) pour un impact immédiat, puis attaquer les ⭐⭐⭐ pour les features "wow".
