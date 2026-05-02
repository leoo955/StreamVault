
<!-- ┌─────────────────────────────────────────────────────────────┐ -->
<!-- │          S T R E A M V A U L T  ·  C O N T E X T          │ -->
<!-- │              Vision · OLED Cinematic Interface             │ -->
<!-- └─────────────────────────────────────────────────────────────┘ -->

<div align="center">

# ◇ StreamVault

**Votre cinéma personnel · haut de gamme**

`Next.js 16` · `React 19` · `TypeScript 5` · `Tailwind CSS 4` · `Electron 41`

---

*Plateforme de streaming privée à interface cinématique, déployée en Web (Vercel) et Desktop natif (Electron/Windows).*
*Agrège et diffuse films & séries via une bibliothèque centralisée avec design OLED immersif.*

</div>

---

<br>

## ◈ Identité

StreamVault est une plateforme de streaming personnel à interface **cinématique immersive**. Elle agrège et diffuse des contenus multimédias (films & séries) via une bibliothèque centralisée. Le projet est déployé en **Web (Vercel)** et en **Desktop natif (Electron/Windows)**.

> **Philosophie Design** : *"Vision — OLED First, l'affiche dicte l'ambiance."*
> Le fond est **noir absolu** (`#000000`) pour l'extinction pixel OLED. L'interface flotte par-dessus le contenu via un **verre givré texturé** (Frosted Glass). Seuls les médias apportent la couleur : la **couleur dominante** du poster est extraite et injectée comme accent dynamique (bouton principal + glow).

<br>

---

<br>

## ◈ Stack Technique

<br>

### ○ Core

| Couche | Technologie | Version | Rôle |
|:---|:---|:---:|:---|
| Framework | **Next.js** (App Router) | `16.1.6` | SSR, routing, API routes |
| UI | **React** | `19.2.3` | Composants, hooks, state |
| Langage | **TypeScript** | `5` | Typage statique |
| Stylisation | **Tailwind CSS** | `4` | Utility-first + CSS vars custom |
| Animations | **Framer Motion** | `12` | Transitions, spring, layout anim |
| Icônes | **Lucide React** | `0.576` | Icônes SVG cohérentes |

### ○ Backend & Data

| Couche | Technologie | Version | Rôle |
|:---|:---|:---:|:---|
| ORM | **Prisma** | `5.22` | Accès PostgreSQL typé |
| BDD | **PostgreSQL** | — | Via Supabase |
| Auth/Storage | **Supabase** | `2` | Hosting BDD + storage |
| Sessions | **jose** | `6` | JWT signing/verification |
| Rate Limiting | Custom | — | Protection API maison |

### ○ Media & Streaming

| Couche | Technologie | Version | Rôle |
|:---|:---|:---:|:---|
| Lecteur vidéo | **HLS.js** + custom player | `1.6` | Streaming adaptatif |
| Sous-titres | **srt-parser-2** | `1.2` | Parsing SRT/VTT |
| Proxy vidéo | Custom API route | — | CORS bypass streaming |
| Charts | **Recharts** | `3.8` | Graphiques admin dashboard |

### ○ Platform

| Couche | Technologie | Version | Rôle |
|:---|:---|:---:|:---|
| Desktop | **Electron** + electron-builder | `41` | App Windows native (.exe) |
| PWA | Service Worker + manifest | — | Installation native, offline |
| Analytics | **Vercel Analytics** | `2` | Tracking usage |
| i18n | Custom provider | — | FR/EN |

<br>

---

<br>

## ◈ Architecture

<br>

### ○ Arborescence complète

```
src/
│
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Layout racine — providers chain
│   ├── page.tsx                      # Accueil — hero carousel, rows, trending
│   ├── globals.css                   # Design system complet (CSS vars, glass, etc.)
│   ├── not-found.tsx                 # Page 404 custom
│   │
│   ├── api/                          # ── 26 groupes d'endpoints API (BFF) ──
│   │   ├── auth/                     #   ↳ login, register, logout, /me
│   │   ├── admin/                    #   ↳ gestion médias, users, stats, logs
│   │   ├── media/                    #   ↳ CRUD médias (films + séries)
│   │   ├── stream/                   #   ↳ proxy streaming vidéo
│   │   ├── tmdb/                     #   ↳ recherche TMDB (métadonnées auto)
│   │   ├── comments/                 #   ↳ commentaires par média
│   │   ├── notifications/            #   ↳ notifications in-app
│   │   ├── ratings/                  #   ↳ notation utilisateur
│   │   ├── progress/                 #   ↳ suivi de progression (reprise lecture)
│   │   ├── profiles/                 #   ↳ multi-profils utilisateur
│   │   ├── invitations/              #   ↳ codes d'invitation admin
│   │   ├── requests/                 #   ↳ demandes de médias
│   │   ├── search/                   #   ↳ recherche globale
│   │   ├── subtitles/                #   ↳ gestion sous-titres SRT/VTT
│   │   ├── sagas/                    #   ↳ collections / sagas
│   │   ├── trending/                 #   ↳ contenu tendance
│   │   ├── stats/                    #   ↳ statistiques admin
│   │   ├── recommendations/          #   ↳ recommandations personnalisées
│   │   ├── proxy/                    #   ↳ proxy CORS pour flux externes
│   │   ├── images/                   #   ↳ proxy images
│   │   ├── anime/                    #   ↳ contenu anime
│   │   ├── announcements/            #   ↳ annonces admin
│   │   ├── items/                    #   ↳ items génériques
│   │   ├── user/                     #   ↳ données utilisateur
│   │   ├── users/                    #   ↳ gestion utilisateurs (admin)
│   │   └── test-db/                  #   ↳ test connexion BDD
│   │
│   ├── admin/                        # Dashboard administrateur complet
│   ├── detail/                       # Page de détail d'un média
│   ├── movies/                       # Catalogue films (grille filtrable)
│   ├── series/                       # Catalogue séries
│   ├── watch/                        # Lecteur vidéo plein écran
│   ├── search/                       # Page de recherche
│   ├── trending/                     # Page tendances
│   ├── my-list/                      # Liste personnelle (favoris ❤️)
│   ├── settings/                     # Paramètres utilisateur
│   ├── downloads/                    # Téléchargements (Premium+)
│   ├── login/                        # Connexion
│   ├── register/                     # Inscription (code invitation)
│   ├── profiles/                     # Sélection de profil
│   ├── pair/                         # Appairage d'appareils (TV, mobile)
│   ├── requests/                     # Demandes de contenu
│   ├── subscription/                 # Gestion d'abonnement
│   └── offline/                      # Page hors-ligne (PWA)
│
├── components/                       # ── 27 composants React ──
│   ├── Sidebar.tsx                   #   Navigation top bar + mobile bottom tab
│   ├── VideoPlayer.tsx               #   Lecteur vidéo custom complet (~47 KB)
│   ├── MediaCard.tsx                 #   Carte média avec hover + animations
│   ├── MediaRow.tsx                  #   Rangée horizontale défilante
│   ├── HeroHeader.tsx                #   Bannière hero page d'accueil
│   ├── SearchBar.tsx                 #   Barre de recherche globale
│   ├── ProfileGuard.tsx              #   Guard: redirection si pas de profil
│   ├── SplashScreen.tsx              #   Écran de chargement animé
│   ├── NotificationBell.tsx          #   Cloche notifications temps réel
│   ├── FullScreenPopup.tsx           #   Popup modale plein écran
│   ├── SafeImage.tsx                 #   Image avec fallback gracieux
│   ├── Skeleton.tsx                  #   Loading skeleton (breathe + shimmer)
│   ├── ShareButton.tsx               #   Partage natif Web Share API
│   ├── DownloadButton.tsx            #   Téléchargement médias (Premium+)
│   ├── CommentsSection.tsx           #   Section commentaires par média
│   ├── StarRating.tsx                #   Notation par étoiles
│   ├── SagaCard.tsx                  #   Card collection/saga
│   ├── SagaRow.tsx                   #   Rangée de sagas
│   ├── StudioCard.tsx                #   Card studio de production
│   ├── StudioRow.tsx                 #   Rangée de studios
│   ├── TrendingRow.tsx               #   Rangée contenu tendance
│   ├── PwaInstallButton.tsx          #   Bouton installation PWA
│   ├── ServiceWorkerRegister.tsx     #   Enregistrement Service Worker
│   ├── AnnouncementPopup.tsx         #   Popup annonces admin
│   ├── MainContent.tsx               #   Wrapper contenu principal
│   ├── Providers.tsx                 #   Composition I18nProvider
│   └── Footer.tsx                    #   Pied de page
│
├── hooks/                            # ── Custom Hooks ──
│   ├── useAdminAuth.ts               #   Guard d'authentification admin
│   ├── useImageColors.ts             #   Extraction couleurs dominantes
│   └── usePlan.ts                    #   Accès features du plan actif
│
└── lib/                              # ── Couche utilitaires & services ──
    ├── db.ts                         #   Accès données Prisma (~30 KB) — CENTRAL
    ├── userProvider.tsx               #   Context global auth (UserProvider)
    ├── theme.tsx                      #   Système de thèmes (5 thèmes)
    ├── i18n.tsx                       #   Internationalisation FR/EN
    ├── popup.tsx                      #   Système de popups globales
    ├── jwt.ts                        #   Génération/vérification JWT (jose)
    ├── plans.ts                      #   Définition plans (Starter/Premium/Ultimate)
    ├── rate-limit.ts                 #   Rate limiting API
    ├── logger.ts                     #   Logger serveur (ActivityLog)
    ├── mock-data.ts                  #   Données de test
    ├── downloader.ts                 #   Logique de téléchargement
    └── jellyfin/                     #   Client Jellyfin (types + API client)
```

<br>

---

<br>

## ◈ Providers Chain

Le layout racine (`layout.tsx`) compose les providers dans cet ordre :

```
ThemeProvider
  └── UserProvider
        └── PopupProvider
              └── I18nProvider (via Providers.tsx)
                    └── ProfileGuard
                          └── Sidebar + MainContent
```

> **Fonts chargées** : `Inter` (body, `--font-inter`) + `Outfit` (display, `--font-outfit`)

<br>

---

<br>

## ◈ Modèle de Données

**PostgreSQL via Prisma** — 13 modèles

<br>

### ○ Entités principales

| Modèle | Description | Relations clés |
|:---|:---|:---|
| **User** | Auth, rôle (`admin`/`user`), plan, préférences JSON, badges | → Profile[], Progress[], Comment[], Notification[], Session[] |
| **Profile** | Multi-profils par user (nom, avatar, mode enfant, PIN) | → User |
| **Media** | Films & séries (métadonnées, poster, backdrop, genres, studios, cast JSON, TMDB ID, saga) | → Season[], Progress[], Comment[] |
| **Season** | Saison d'une série (numéro) | → Media, Episode[] |
| **Episode** | Épisode (numéro, titre, streamUrl, runtime) | → Season |
| **Progress** | Suivi lecture par user/media/épisode (position, durée, isCompleted) | → User, Media |

### ○ Entités secondaires

| Modèle | Description |
|:---|:---|
| **Comment** | Commentaires sur les médias (userId, mediaId, text) |
| **Notification** | Notifications in-app (title, message, read, mediaId optionnel) |
| **ActivityLog** | Journal d'audit (action, details, IP, timestamp) |
| **InvitationCode** | Codes invitation avec quotas, rôle assigné, plan, expiration, note |
| **Session** | Sessions JWT persistées (token, userId, expiresAt) |
| **DevicePairingCode** | Appairage appareils TV/mobile (code unique, expiration) |
| **MediaRequest** | Demandes de contenu (title, type, tmdbId, status: PENDING/FULFILLED/REJECTED) |
| **SagaMetadata** | Métadonnées de collections/sagas (bannière) |
| **Badge** | Badges débloquables (name, description, icon emoji/SVG) |

<br>

---

<br>

## ◈ Design System — "Vision"

<br>

### ○ Philosophie

> **OLED First** — Le fond par défaut est **noir absolu** (`#000000`). Aucun gris foncé. Pixels éteints sur OLED.
> **Immersif** — Le Hero prend 100% de la hauteur écran (`100vh`). L'affiche du film dicte l'ambiance lumineuse de toute la page.
> **Non-intrusif** — L'interface flotte par-dessus le contenu via un **verre givré texturé** ("Frosted Glass"), sans obstruer l'image.
> Le site ne possède pratiquement aucune couleur en dur : tout est basé sur la **transparence** et le **contenu**.

### ○ Palette

Pas de thèmes multiples. Un seul langage visuel basé sur le contraste extrême :

| Token | Valeur | Usage |
|:---|:---|:---|
| `--deep-black` | `#000000` | Fond principal — noir pur OLED |
| `--surface` | `#0C0C0C` | Surfaces élevées |
| `--surface-hover` | `#141414` | Surfaces au hover |
| `--surface-light` | `#1A1A1A` | Cards, panels |
| `--text-primary` | `#FFFFFF` | Texte principal — blanc pur |
| `--text-secondary` | `rgba(255,255,255,0.8)` | Texte secondaire — blanc atténué |
| `--text-muted` | `#555555` | Labels, hints |
| `--glass` | `rgba(255,255,255,0.03)` | Fond des éléments verre givré |
| `--glass-border` | `rgba(255,255,255,0.10)` | Bordures glass |
| `--accent` | **Dynamique** | Couleur dominante extraite du poster du média affiché |

> **Couleur Dynamique (Accent Color)** : La couleur dominante est **extraite de l'affiche** du film/série via `useImageColors`. Elle est appliquée **uniquement** sur le bouton d'action principal et son ombre portée (glow). Le reste de l'interface reste intégralement blanc + noir + glass. Par exemple, un film à dominante jaune (`#eab308`) teintera le bouton "Regarder" et son halo en jaune.

### ○ L'Effet Clé : Verre Givré (Frosted Glass)

Signature visuelle du site. Utilisé sur la navbar, les boutons secondaires, et les panels. Composé de **3 couches** :

| Couche | Détail |
|:---|:---|
| **Fond** | Blanc à 3% d'opacité (`rgba(255,255,255,0.03)`) |
| **Flou** | `backdrop-filter: blur(20px) saturate(120%)` — flou d'arrière-plan + saturation augmentée |
| **Texture (Grain)** | SVG `feTurbulence` superposé à 10% d'opacité — effet neige/givre |
| **Bordure** | Blanc à 10% (`rgba(255,255,255,0.10)`) |

```css
.frost-effect {
  background-color: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px) saturate(120%);
  -webkit-backdrop-filter: blur(20px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-image: url("data:image/svg+xml,...feTurbulence..."); /* grain SVG 10% */
}
```

### ○ Tokens CSS

```css
/* Spacing — generous, luxury */
--space-xs: 4px    --space-sm: 8px    --space-md: 16px
--space-lg: 32px   --space-xl: 48px   --space-2xl: 64px
--space-3xl: 96px  --space-4xl: 128px

/* Radius — refined */
--radius-sm: 6px   --radius-md: 12px  --radius-lg: 20px
--radius-xl: 28px  --radius-2xl: 36px

/* Transitions — smooth, unhurried */
--ease-luxury: cubic-bezier(0.16, 1, 0.3, 1)
--ease-smooth: cubic-bezier(0.25, 0.1, 0.25, 1)
--duration-fast: 200ms   --duration-normal: 400ms
--duration-slow: 800ms   --duration-glacial: 1200ms
```

### ○ Classes Utilitaires Globales

| Classe | Fonction |
|:---|:---|
| `.frost-effect` | Verre givré complet (blur 20px + saturate 120% + grain SVG 10% + bordure blanche 10%) |
| `.glass-card` | Glassmorphism léger (`blur(12px)`, `border: 1px solid rgba(255,255,255,0.06)`) |
| `.glass-card-strong` | Glassmorphism fort (`blur(20px)`, fond blanc 8%) |
| `.glass-panel` | Panel glassmorphism (`blur(16px)`, radius xl) |
| `.btn-primary` | Fond = **accent color dynamique**, texte noir, `border-radius: 6px`, glow `box-shadow` de la même couleur |
| `.btn-secondary` | Verre givré (`.frost-effect`) + bordure blanche 20% |
| `.title-hero` | Titre cinématique — **Extra-Bold (900), Italique, Majuscules**, `tracking-tighter`, drop-shadow |
| `.title-section` | Titre section — Outfit, 300, clamp(1.5rem → 2rem) |
| `.label-refined` | Label — 11px, **Gras**, tracking `widest`, uppercase |
| `.skeleton` | Loading skeleton avec animation breathe + shimmer (blanc 3%) |
| `.card-luxury` | Card avec hover lift (`translateY(-4px)`) |
| `.divider` | Séparateur horizontal `rgba(255,255,255,0.04)` |
| `.mask-fade-edges` | Masque fondu pour les rangées horizontales |
| `.scrollbar-hide` | Cache la scrollbar native |

### ○ Typographie

Contraste typographique **fort** pour un aspect cinématique :

| Usage | Font | Poids | Style | Tracking |
|:---|:---|:---|:---|:---|
| Titre Hero (film) | **Outfit** | **900 (Black)** | *Italique*, MAJUSCULES | `tracking-tighter` (très serré) |
| Body / Description | **Inter** | 400–500 (Medium) | Normal | Normal |
| Description texte | Inter | 400 | Normal, opacité 80% | Normal |
| Navigation & Badges | Inter | **700 (Bold)** | Normal, MAJUSCULES | `tracking-widest` (large) |
| Labels | Inter | 500 | Uppercase | +0.15em |

<br>

---

<br>

## ◈ Authentification

<br>

| Étape | Mécanisme |
|:---|:---|
| 1. Inscription | Par **code d'invitation** créé par un admin (quotas, rôle, plan, expiration) |
| 2. Hash | **hash + salt** stocké en base (passwordHash, salt) |
| 3. Sessions | **JWT** via cookie `token` (bibliothèque `jose`, signing HS256) |
| 4. State client | **UserProvider** — React Context global avec cache module-level (`cachedUser`), refresh auto |
| 5. Guard profil | **ProfileGuard** — force sélection de profil après connexion |
| 6. Rôles | `admin` → accès dashboard complet · `user` → accès standard |

<br>

---

<br>

## ◈ Plans d'Abonnement

<br>

| | ○ Starter | ◇ Premium | ◆ Ultimate |
|:---|:---:|:---:|:---:|
| **Prix** | Gratuit | €9.99/mois | €14.99/mois |
| **Profils** | 1 | 3 | 5 |
| **Qualité max** | SD (480p) | HD (1080p) | 4K + HDR |
| **Téléchargement** | ✗ | ✓ | ✓ |
| **Écrans simultanés** | 1 | 2 | 4 |
| **Publicité** | Occasionnelle | Sans pub | Sans pub |
| **Accès anticipé** | ✗ | ✗ | ✓ |

<br>

---

<br>

## ◈ Fonctionnalités Clés

<br>

### ○ Lecteur Vidéo Custom (`VideoPlayer.tsx` — ~47 KB)

Le composant le plus complexe du projet. Fonctionnalités :

- **HLS adaptatif** via HLS.js avec sélection de qualité manuelle/auto
- **Sous-titres** SRT/VTT parsés manuellement avec overlay custom, délai ajustable
- **Pistes audio** multiples (VF/VO) via HLS audio tracks
- **Contrôle vitesse** : 0.5x → 2x, cycle clavier (`S`)
- **Picture-in-Picture** natif
- **Reprise automatique** : sauvegarde position toutes les 15s + on pause + on unload
- **Navigation épisodes** : prev/next avec auto-play countdown (10s)
- **Skip intro** (5s–120s) et **skip recap** (épisode > 1)
- **End credits** : prompt épisode suivant dans les 90 dernières secondes
- **Cast** : Web Remote Playback API / AirPlay
- **Raccourcis clavier** complets : `Space/K` play, `F` fullscreen, `M` mute, `←→` ±10s, `S` speed, `N/P` next/prev, `I` PiP

### ○ Page d'Accueil (Hero = 100vh)

- **Hero Banner** : occupe **100% de la hauteur écran** (`100vh`), image du film en `cover`
- **Dégradés Hero (crucial)** : DEUX dégradés noirs superposés sur l'image :
  - **Bas → Haut** : noir opaque en bas → transparent vers le milieu
  - **Gauche → Droite** : noir 90% à gauche → transparent vers la droite
- **Hero carousel** animé (8 médias max, rotation 12s, Ken Burns effect)
- **Up Next** thumbnails en desktop (coin inférieur droit)
- **Dot indicators** — thin, refined (2px height)
- **Deferred rows** avec `IntersectionObserver` (lazy loading progressif)
- **Sections** : Reprendre la lecture, Tendances, Récemment ajouté, Recommandations, Sagas, Top 10, Films, Séries, par Genre

### ○ Navigation (Frosted Glass)

- **Desktop** : Top navbar fixée (`fixed top-0`), utilise l'effet **Verre Givré** (`.frost-effect`)
- **Hover liens** : une ligne blanche de 2px se dessine de gauche à droite sous le mot (animation 300ms)
- **Mobile** : Header simplifié + bottom tab bar flottante (frosted glass, 5 tabs)
- **Active indicator** : underline blanche animée (`layoutId`) + dot indicator mobile

### ○ Autres Fonctionnalités

| Feature | Description |
|:---|:---|
| **PWA** | Service Worker, manifest, mode offline, bouton d'installation |
| **Electron** | App desktop Windows native, isolation contexte, accélération GPU |
| **Recherche** | Barre globale temps réel + intégration TMDB pour métadonnées |
| **Notifications** | In-app avec cloche + badge non-lu |
| **Commentaires** | Section par média |
| **Ma Liste** | Favoris personnels (❤️) |
| **Demandes** | Workflow user → admin (PENDING → FULFILLED/REJECTED) |
| **Sagas** | Regroupement par collection (MCU, Star Wars, etc.) |
| **Studios** | Navigation par studio de production |
| **Tendances** | Page dédiée aux contenus populaires |
| **Admin Dashboard** | Gestion complète : médias, users, stats, logs, invitations, annonces |
| **Multi-profils** | Jusqu'à 5 par compte, mode enfant, PIN |
| **Appairage** | Code unique pour lier TV/mobile |
| **i18n** | FR par défaut, EN disponible, persisté dans préférences user |
| **Design** | Vision — OLED noir pur, verre givré texturé, accent dynamique extrait des posters |

<br>

---

<br>

## ◈ Commandes

<br>

```bash
# ── Développement ──
npm run dev                # Serveur Next.js (http://localhost:3000)
npm run electron:dev       # Dev hybride Next.js + Electron

# ── Production ──
npm run build              # prisma generate + next build
npm run start              # Serveur de production
npm run electron:build     # Build installateur Windows (.exe → /release)

# ── Outils ──
npm run lint               # ESLint
```

<br>

---

<br>

## ◈ Variables d'Environnement

<br>

| Variable | Usage |
|:---|:---|
| `DATABASE_URL` | Connexion PostgreSQL (Supabase pooling) |
| `DIRECT_URL` | URL directe PostgreSQL (pour Prisma migrations) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL publique Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role Supabase (server-side only) |

<br>

---

<br>

## ◈ Conventions de Code

<br>

| Aspect | Convention |
|:---|:---|
| **Langue du code** | Anglais (variables, composants, API) |
| **Langue de l'UI** | Français par défaut, anglais via i18n |
| **Imports** | Alias `@/` → `./src/` |
| **Composants** | `.tsx` en PascalCase dans `src/components/` |
| **API Routes** | Pattern App Router `route.ts` dans `src/app/api/` |
| **Styles** | Tailwind CSS v4 + CSS variables custom dans `globals.css` |
| **État global** | React Context uniquement (UserProvider, ThemeProvider, I18nProvider, PopupProvider) |
| **State manager** | Aucun externe (pas de Redux, Zustand, Jotai, etc.) |
| **Animations** | Framer Motion pour les transitions, CSS pour les micro-animations |
| **Images** | Composant `SafeImage.tsx` avec fallback, ou `next/image` avec `sizes` |

<br>

---

<br>

## ◈ Configuration Next.js

<br>

```typescript
// next.config.ts
{
  output: "standalone",              // Pour build Electron
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      { protocol: "http",  hostname: "**" },   // Toutes les images distantes
      { protocol: "https", hostname: "**" },
    ],
  },
}
```

<br>

---

<br>

## ◈ Points d'Attention

<br>

> **Fichiers critiques à modifier avec prudence :**

| Fichier | Taille | Risque | Note |
|:---|:---:|:---:|:---|
| `VideoPlayer.tsx` | ~47 KB | ⚠️ Élevé | Composant le plus complexe, nombreux effets interdépendants |
| `db.ts` | ~30 KB | ⚠️ Élevé | Point unique d'accès données — centralise TOUTES les requêtes Prisma |
| `globals.css` | ~9 KB | ⚡ Moyen | Design system entier — une modif impacte tout le site |
| `Sidebar.tsx` | ~12 KB | ⚡ Moyen | Navigation desktop + mobile, responsive complexe |
| `userProvider.tsx` | — | ⚡ Moyen | Cache module-level `cachedUser` — attention login/logout side effects |

<br>

> **Contraintes techniques :**

- Le `UserProvider` utilise un **cache module-level** (`cachedUser`) pour éviter les fetches redondants — attention aux effets de bord lors du login/logout
- Le build Electron utilise **`output: "standalone"`** dans `next.config.ts`
- Les images distantes sont autorisées depuis **tous les domaines** (`hostname: "**"`)
- Le `ProfileGuard` redirige vers `/profiles` si aucun profil actif n'est sélectionné
- Les préférences utilisateur (langue, thème, autoplay) sont stockées en **JSON** dans le champ `preferences` du modèle `User`

<br>

---

<div align="center">

*◇ StreamVault · OLED First · Vision ◇*

</div>
