"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useUser } from "@/lib/userProvider";

// ============================================================
// Translation dictionaries
// ============================================================
const translations: Record<string, Record<string, string>> = {
  fr: {
    // Nav / Sidebar
    "nav.home": "Accueil",
    "nav.movies": "Films",
    "nav.series": "Séries",
    "nav.trending": "Tendances",
    "nav.myList": "Ma Liste",
    "nav.admin": "Dashboard Admin",
    "nav.settings": "Paramètres",
    "nav.login": "Se connecter",
    "nav.register": "Créer un compte",
    "nav.logout": "Déconnexion",

    // Home
    "home.continueWatching": "Continuer à regarder",
    "home.recentlyAdded": "Récemment ajouté",
    "home.topRated": "Les mieux notés",
    "home.popular": "Populaires",
    "home.emptyLibrary": "Bibliothèque vide",
    "home.addContent": "Ajoutez du contenu via le dashboard admin",
    "home.goToAdmin": "Aller au dashboard",

    // Detail
    "detail.watch": "Regarder",
    "detail.similar": "Titres similaires",
    "detail.studio": "Studio",
    "detail.notFound": "Média introuvable",
    "detail.backHome": "Retour à l'accueil",
    "detail.seasons": "Saisons & Épisodes",
    "detail.episodes": "épisodes",
    "detail.season": "Saison",

    // Media types
    "type.movie": "Film",
    "type.series": "Série",
    "type.saga": "Saga",

    // Admin
    "admin.title": "Dashboard Admin",
    "admin.addMedia": "Ajouter un média",
    "admin.search": "Rechercher...",
    "admin.totalMedia": "Total médias",
    "admin.movieCount": "Films",
    "admin.seriesCount": "Séries",
    "admin.edit": "Modifier",
    "admin.delete": "Supprimer",
    "admin.confirmDelete": "Confirmer",
    "admin.cancel": "Annuler",

    // Add/Edit form
    "form.addTitle": "Ajouter un média",
    "form.editTitle": "Modifier",
    "form.autoSearch": "Les affiches et infos sont récupérées automatiquement",
    "form.type": "Type",
    "form.titleLabel": "Titre",
    "form.titleSearch": "Tapez un titre pour chercher...",
    "form.videoLink": "Lien vidéo",
    "form.poster": "Affiche",
    "form.backdrop": "Fond",
    "form.overview": "Synopsis",
    "form.year": "Année",
    "form.runtime": "Durée (min)",
    "form.rating": "Note /10",
    "form.tagline": "Slogan",
    "form.genres": "Genres",
    "form.languages": "Langues",
    "form.studios": "Studios",
    "form.saga": "Saga / Collection",
    "form.sagaPlaceholder": "Ex: MCU, Star Wars, Harry Potter...",
    "form.seasons": "Saisons & Épisodes",
    "form.addSeason": "Ajouter une saison",
    "form.noSeason": "Aucune saison. Cliquez pour en ajouter.",
    "form.noEpisode": "Aucun épisode",
    "form.episodeTitle": "Titre",
    "form.episodeLink": "Lien vidéo",
    "form.submit": "Ajouter le média",
    "form.submitting": "Ajout en cours...",
    "form.save": "Enregistrer",
    "form.saving": "Sauvegarde...",
    "form.success": "Média ajouté avec succès ! Redirection...",
    "form.updated": "Mis à jour ! Redirection...",
    "form.error": "Erreur lors de l'ajout",
    "form.auto": "auto",

    // Settings
    "settings.title": "Paramètres",
    "settings.subtitle": "Gérez votre compte et vos préférences",
    "settings.profile": "Profil",
    "settings.admin": "Administrateur",
    "settings.user": "Utilisateur",
    "settings.preferences": "Préférences",
    "settings.autoplay": "Lecture automatique",
    "settings.autoplayDesc": "Lancer automatiquement le prochain épisode",
    "settings.language": "Langue",
    "settings.save": "Sauvegarder",
    "settings.saved": "Préférences sauvegardées",
    "settings.password": "Mot de passe",
    "settings.oldPassword": "Mot de passe actuel",
    "settings.newPassword": "Nouveau mot de passe",
    "settings.confirmPassword": "Confirmer",
    "settings.changePassword": "Changer le mot de passe",
    "settings.passwordChanged": "Mot de passe changé",
    "settings.loginRequired": "Connectez-vous pour accéder aux paramètres",

    // Movies/Series pages
    "movies.title": "Films",
    "series.title": "Séries",
    "trending.title": "Tendances",
    "trending.topRated": "Les mieux notés",
    "trending.newest": "Nouveautés",

    // My List
    "list.subtitle": "Vos films et séries favoris",
    "list.empty": "Votre liste est vide",
    "list.emptyDesc": "Ajoutez des films et séries à votre liste pour les retrouver facilement ici. Utilisez le bouton ❤️ sur chaque titre pour l'ajouter.",

    // Watch
    "watch.noLink": "Aucun lien vidéo",
    "watch.noLinkDesc": "Ajoutez-en un via le dashboard admin.",
    "watch.back": "Retour",

    // Sagas
    "saga.collection": "Collection",
    "saga.movies": "films dans cette saga",

    // Auth
    "auth.login": "Connexion",
    "auth.register": "Inscription",
    "auth.username": "Nom d'utilisateur",
    "auth.password": "Mot de passe",
    "auth.confirmPassword": "Confirmer le mot de passe",
    "auth.loginBtn": "Se connecter",
    "auth.registerBtn": "Créer un compte",
    "auth.noAccount": "Pas de compte ?",
    "auth.hasAccount": "Déjà un compte ?",

    // Generic
    "generic.back": "Retour",
    "generic.loading": "Chargement...",
    "generic.min": "min",
    "generic.episode": "Épisode",
  },

  en: {
    // Nav / Sidebar
    "nav.home": "Home",
    "nav.movies": "Movies",
    "nav.series": "Series",
    "nav.trending": "Trending",
    "nav.myList": "My List",
    "nav.requests": "Requests",
    "nav.admin": "Admin Dashboard",
    "nav.settings": "Settings",
    "nav.login": "Log in",
    "nav.register": "Sign up",
    "nav.logout": "Log out",

    // Home
    "home.continueWatching": "Continue Watching",
    "home.recentlyAdded": "Recently Added",
    "home.topRated": "Top Rated",
    "home.popular": "Popular",
    "home.emptyLibrary": "Empty Library",
    "home.addContent": "Add content from the admin dashboard",
    "home.goToAdmin": "Go to dashboard",

    // Detail
    "detail.watch": "Watch",
    "detail.similar": "Similar Titles",
    "detail.studio": "Studio",
    "detail.notFound": "Media not found",
    "detail.backHome": "Back to home",
    "detail.seasons": "Seasons & Episodes",
    "detail.episodes": "episodes",
    "detail.season": "Season",

    // Media types
    "type.movie": "Movie",
    "type.series": "Series",
    "type.saga": "Saga",

    // Admin
    "admin.title": "Admin Dashboard",
    "admin.addMedia": "Add Media",
    "admin.search": "Search...",
    "admin.totalMedia": "Total Media",
    "admin.movieCount": "Movies",
    "admin.seriesCount": "Series",
    "admin.edit": "Edit",
    "admin.delete": "Delete",
    "admin.confirmDelete": "Confirm",
    "admin.cancel": "Cancel",

    // Add/Edit form
    "form.addTitle": "Add Media",
    "form.editTitle": "Edit",
    "form.autoSearch": "Posters and info are fetched automatically",
    "form.type": "Type",
    "form.titleLabel": "Title",
    "form.titleSearch": "Type a title to search...",
    "form.videoLink": "Video link",
    "form.poster": "Poster",
    "form.backdrop": "Backdrop",
    "form.overview": "Overview",
    "form.year": "Year",
    "form.runtime": "Runtime (min)",
    "form.rating": "Rating /10",
    "form.tagline": "Tagline",
    "form.genres": "Genres",
    "form.languages": "Languages",
    "form.studios": "Studios",
    "form.saga": "Saga / Collection",
    "form.sagaPlaceholder": "Ex: MCU, Star Wars, Harry Potter...",
    "form.seasons": "Seasons & Episodes",
    "form.addSeason": "Add season",
    "form.noSeason": "No seasons yet. Click to add one.",
    "form.noEpisode": "No episodes",
    "form.episodeTitle": "Title",
    "form.episodeLink": "Video link",
    "form.submit": "Add Media",
    "form.submitting": "Adding...",
    "form.save": "Save",
    "form.saving": "Saving...",
    "form.success": "Media added! Redirecting...",
    "form.updated": "Updated! Redirecting...",
    "form.error": "Error while adding",
    "form.auto": "auto",

    // Settings
    "settings.title": "Settings",
    "settings.subtitle": "Manage your account and preferences",
    "settings.profile": "Profile",
    "settings.admin": "Administrator",
    "settings.user": "User",
    "settings.preferences": "Preferences",
    "settings.autoplay": "Autoplay",
    "settings.autoplayDesc": "Automatically play the next episode",
    "settings.language": "Language",
    "settings.save": "Save",
    "settings.saved": "Preferences saved",
    "settings.password": "Password",
    "settings.oldPassword": "Current password",
    "settings.newPassword": "New password",
    "settings.confirmPassword": "Confirm",
    "settings.changePassword": "Change password",
    "settings.passwordChanged": "Password changed",
    "settings.loginRequired": "Log in to access settings",

    // Movies/Series pages
    "movies.title": "Movies",
    "series.title": "Series",
    "trending.title": "Trending",
    "trending.topRated": "Top Rated",
    "trending.newest": "New Releases",

    // My List
    "list.subtitle": "Your favorite movies and series",
    "list.empty": "Your list is empty",
    "list.emptyDesc": "Add movies and series to your list to easily find them here. Use the ❤️ button on any title to add it.",

    // Watch
    "watch.noLink": "No video link",
    "watch.noLinkDesc": "Add one from the admin dashboard.",
    "watch.back": "Back",

    // Sagas
    "saga.collection": "Collection",
    "saga.movies": "movies in this saga",

    // Auth
    "auth.login": "Log In",
    "auth.register": "Sign Up",
    "auth.username": "Username",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm password",
    "auth.loginBtn": "Log in",
    "auth.registerBtn": "Sign up",
    "auth.noAccount": "No account?",
    "auth.hasAccount": "Already have an account?",

    // Generic
    "generic.back": "Back",
    "generic.loading": "Loading...",
    "generic.min": "min",
    "generic.episode": "Episode",
  },
};

// ============================================================
// Context & Provider
// ============================================================
interface I18nContextType {
  lang: string;
  setLang: (l: string) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: "fr",
  setLang: () => {},
  t: (key: string) => key,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState("fr");
  const { user, loading } = useUser();

  // Load language from user preferences (via centralized UserProvider)
  useEffect(() => {
    if (!loading && user?.preferences?.language) {
      setLangState(user.preferences.language);
    }
  }, [user, loading]);

  const setLang = useCallback((l: string) => {
    setLangState(l);
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[lang]?.[key] || translations["fr"]?.[key] || key;
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
