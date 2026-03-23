# DOCUMENTATION TECHNIQUE EXHAUSTIVE : ÉCOSYSTÈME STREAMVAULT

---

## 1. RÉSUMÉ EXÉCUTIF
StreamVault est une plateforme d'agrégation et de diffusion de contenus multimédias haut de gamme. Conçue comme une solution hybride, elle exploite les dernières avancées du framework Next.js pour sa version Web et l'environnement Electron pour sa distribution Desktop native. L'architecture est pensée pour la scalabilité, la sécurité des données et une fluidité d'interface sans compromis.

---

## 2. ARCHITECTURE LOGICIELLE ET CHOIX TECHNOLOGIQUES

### 2.1. Noyau Applicatif (Core)
| Composant | Technologie | Justification |
| :--- | :--- | :--- |
| **Framework UI** | Next.js 16 (React 19) | Utilisation de l'App Router pour un routage optimisé et React Server Components (RSC). |
| **Langage** | TypeScript | Garantit une robustesse du code via un typage statique fort et une maintenance simplifiée. |
| **Moteur d'Animation** | Framer Motion v12 | Gestion fine des états d'animation spring et transitions de mise en page (Layout Animations). |
| **Stylisation** | Tailwind CSS v4 | Approche Utility-First pour une cohérence graphique et un temps de rendu CSS minimal. |

### 2.2. Couche de Données et Sécurité
- **Prisma ORM** : Utilisé pour la modélisation des données et les interactions avec la base de données. Il permet une génération de types automatique et des migrations fluides.
- **Supabase SDK** : Gère l'authentification utilisateur et le stockage cloud, offrant une couche de sécurité robuste et des capacités de synchronisation en temps réel.
- **JWT (JSON Web Tokens)** : Implémentation via la bibliothèque `jose` pour la gestion des sessions sécurisées et des middlewares d'authentification.

---

## 3. VERSION WEB : ARCHITECTURE ET DÉPLOIEMENT

La version Web de StreamVault est optimisée pour un rendu hybride performant, capable de s'adapter à une large gamme de terminaux.

### 3.1. Stratégies de Rendu
- **Server-Side Rendering (SSR)** : Utilisé pour les pages dynamiques nécessitant des données à jour (ex: listes de tendances).
- **Static Site Generation (SSG)** : Employé pour les pages de documentation ou les structures de base afin de réduire le Time To First Byte (TTFB).
- **Client-Side Rendering (CSR)** : Réservé aux composants interactifs comme le lecteur vidéo et les modales de compte.

### 3.2. Capacités PWA (Progressive Web App)
StreamVault intègre des fonctionnalités PWA avancées :
- **Service Workers** : Gestion intelligente du cache pour les ressources critiques.
- **Manifeste d'Installation** : Permet l'installation de l'application sur le bureau ou l'écran d'accueil mobile avec une icône dédiée.
- **Mode Offline** : Accès aux contenus précédemment mis en cache et interface de secours en cas de perte de connexion.

### 3.3. Déploiement et CI/CD
Le déploiement est optimisé pour les plateformes de type Vercel ou serveurs Node.js managés.
```bash
# Compilation des ressources web
npm run build

# Démarrage de l'instance de production
npm run start
```

---

## 4. VERSION DESKTOP : INGÉNIERIE ELECTRON

La version Desktop transforme l'expérience web en une application logicielle native pour Windows, offrant des capacités étendues.

### 4.1. Processus Electron
- **Main Process (`electron-main.js`)** : Responsable de la création des fenêtres, de la gestion des protocoles système et de la communication IPC (Inter-Process Communication).
- **Renderer Process** : Affiche l'interface Next.js à l'intérieur de Chromium.
- **Isolation du Contexte** : Activation forcée de `contextIsolation` pour empêcher l'accès direct aux API Node.js depuis le rendu web, renforçant la sécurité contre les injections.

### 4.2. Optimisation des Performances
- **Hardware Acceleration** : Utilisation intensive du GPU pour le décodage vidéo 4K, libérant les ressources CPU.
- **Gestion de la Mémoire** : Nettoyage automatique des caches Chromium lors de la fermeture des fenêtres.

### 4.3. Pipeline de Compilation (Build Engineering)
L'utilisation de `electron-builder` permet la création d'installateurs professionnels.
```bash
# Lancement du mode développement hybride
# Ce script lance Next.js et Electron simultanément
npm run electron:dev

# Génération du package redistribuable (.exe)
# Le build inclut la compression ASAR et la configuration NSIS
npm run electron:build
```

---

## 5. MOTEUR MULTIMÉDIA ET GESTION DES SOURCES

### 5.1. Lecture Vidéo Adaptative
- **HLS.js Integration** : Support du protocole HTTP Live Streaming. Permet d'ajuster dynamiquement la qualité vidéo en fonction de la bande passante utilisateur (ABR - Adaptive Bitrate).
- **Custom Player UI** : Lecteur développé sur mesure incluant la gestion des sous-titres (`srt-parser-2`), le contrôle de la vitesse et la sélection des pistes audio.

### 5.2. Agrégation de Contenus
- **@movie-web/providers** : Intégration d'un moteur de recherche multi-sources pour récupérer les métadonnées et les liens de streaming.
- **Intersection Observer API** : Chargement paresseux (Lazy Loading) des vignettes et des composants lourds pour optimiser le rendu initial.

---

## 6. STRUCTURE DÉTAILLÉE DU RÉPERTOIRE

```text
C:\Users\leoo9\Desktop\Netflix\
├── prisma/                # Schémas et migrations de la base de données
├── public/                # Assets statiques (icônes, splashscreens, logos)
├── release/               # Artefacts de compilation finale (installateurs .exe)
├── src/
│   ├── app/               # Architecture App Router (Routes, Layouts, Pages)
│   │   ├── api/           # Points de terminaison API internes (Backend-for-Frontend)
│   │   ├── movies/        # Logique spécifique au module Cinéma
│   │   ├── watch/         # Interface du lecteur vidéo haute performance
│   │   └── settings/      # Configuration des préférences utilisateur
│   ├── components/        # Bibliothèque de composants UI atomiques et moléculaires
│   ├── hooks/             # Logique React réutilisable (auth, media, notifications)
│   └── lib/               # Services tiers, i18n, middleware et utilitaires core
├── .env                   # Configuration des secrets et variables d'environnement
├── electron-main.js       # Architecture du processus principal Electron
├── next.config.ts         # Configuration avancée du framework Next.js
└── package.json           # Manifeste du projet et gestion des dépendances
```

---

## 7. PROTOCOLE D'INSTALLATION ET MAINTENANCE

### 7.1. Configuration de l'Environnement
Il est impératif de configurer les variables suivantes avant toute compilation :
- `DATABASE_URL` : Chaîne de connexion PostgreSQL.
- `NEXT_PUBLIC_SUPABASE_URL` : Point d'accès à l'API Supabase.
- `SUPABASE_SERVICE_ROLE_KEY` : Clé de privilège pour les fonctions serveurs.

### 7.2. Cycle de Maintenance
1. **Mise à jour des dépendances** : `npm update`
2. **Synchronisation Prisma** : `npx prisma generate` après chaque modification du schéma.
3. **Analyse de Qualité** : `npm run lint` pour garantir la conformité aux standards de codage définis par ESLint.

---

## 8. MATRICE DE COMPATIBILITÉ ET LIMITES
| Plateforme | OS / Moteur | Résolution Supportée | Statut |
| :--- | :--- | :--- | :--- |
| **Navigateur Web** | Chromium 115+, Safari 16+, Firefox 110+ | Jusqu'à 8K (selon GPU) | Validé |
| **Application Desktop** | Windows 10 & 11 (x64) | Plein écran natif / Multi-écran | Validé |
| **Mobile (PWA)** | iOS 16.4+, Android 12+ | Adaptatif / Portrait & Paysage | Validé |

---
*Ce document fait foi pour l'architecture technique du projet StreamVault au 23 mars 2026. Toute modification structurelle doit être consignée dans ce rapport.*