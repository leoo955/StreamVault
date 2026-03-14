import { NormalizedMediaItem } from "./jellyfin/types";

// Mock data for development — streamUrl contains external video links
// Replace these with your actual video URLs

export const MOCK_ITEMS: NormalizedMediaItem[] = [
  {
    id: "1",
    title: "Dune: Part Two",
    overview: "Paul Atreides s'allie avec les Fremen pour venger la destruction de sa famille, alors qu'il tente d'empêcher un terrible futur que lui seul peut prévoir.",
    year: 2024,
    rating: 0,
    communityRating: 8.6,
    runtime: 166,
    genres: ["Science-Fiction", "Aventure"],
    type: "Movie",
    posterUrl: "",
    backdropUrl: "",
    streamUrl: "", // ← Ajoutez votre lien vidéo ici
    isPlayed: false,
    playbackPosition: 0,
    playbackDuration: 0,
    playbackPercent: 42,
    dateAdded: "2024-03-01",
    tagline: "Il faut que les Fremen y croient.",
    studios: ["Legendary Pictures"],
    people: [],
  },
  {
    id: "2",
    title: "Oppenheimer",
    overview: "L'histoire de J. Robert Oppenheimer et de son rôle dans le développement de la bombe atomique.",
    year: 2023,
    rating: 0,
    communityRating: 8.9,
    runtime: 180,
    genres: ["Drame", "Historique"],
    type: "Movie",
    posterUrl: "",
    backdropUrl: "",
    streamUrl: "", // ← Ajoutez votre lien vidéo ici
    isPlayed: true,
    playbackPosition: 0,
    playbackDuration: 0,
    playbackPercent: 100,
    dateAdded: "2023-07-21",
    tagline: "Le monde change pour toujours.",
    studios: ["Universal Pictures"],
    people: [],
  },
  {
    id: "3",
    title: "The Batman",
    overview: "Quand un tueur en série sadique commence à assassiner des personnalités de Gotham City, Batman est contraint d'enquêter.",
    year: 2022,
    rating: 0,
    communityRating: 7.8,
    runtime: 176,
    genres: ["Action", "Thriller", "Policier"],
    type: "Movie",
    posterUrl: "",
    backdropUrl: "",
    streamUrl: "",
    isPlayed: false,
    playbackPosition: 0,
    playbackDuration: 0,
    playbackPercent: 0,
    dateAdded: "2022-03-04",
    studios: ["Warner Bros."],
    people: [],
  },
  {
    id: "4",
    title: "Interstellar",
    overview: "Un groupe d'explorateurs utilise un trou de ver récemment découvert pour dépasser les limites de l'exploration spatiale.",
    year: 2014,
    rating: 0,
    communityRating: 9.1,
    runtime: 169,
    genres: ["Science-Fiction", "Drame", "Aventure"],
    type: "Movie",
    posterUrl: "",
    backdropUrl: "",
    streamUrl: "",
    isPlayed: false,
    playbackPosition: 0,
    playbackDuration: 0,
    playbackPercent: 75,
    dateAdded: "2014-11-05",
    tagline: "L'humanité est née sur Terre. Elle n'a jamais été destinée à y mourir.",
    studios: ["Paramount Pictures"],
    people: [],
  },
  {
    id: "5",
    title: "Breaking Bad",
    overview: "Un professeur de chimie de lycée atteint d'un cancer du poumon se lance dans la fabrication de méthamphétamine.",
    year: 2008,
    rating: 0,
    communityRating: 9.5,
    runtime: 49,
    genres: ["Drame", "Thriller", "Crime"],
    type: "Series",
    posterUrl: "",
    backdropUrl: "",
    streamUrl: "",
    isPlayed: false,
    playbackPosition: 0,
    playbackDuration: 0,
    playbackPercent: 30,
    dateAdded: "2008-01-20",
    tagline: "Toute chimie est un art.",
    studios: ["AMC"],
    people: [],
  },
  {
    id: "6",
    title: "Blade Runner 2049",
    overview: "Un jeune officier de la police de Los Angeles découvre un secret longtemps enfoui qui pourrait plonger ce qu'il reste de la société dans le chaos.",
    year: 2017,
    rating: 0,
    communityRating: 8.0,
    runtime: 164,
    genres: ["Science-Fiction", "Drame"],
    type: "Movie",
    posterUrl: "",
    backdropUrl: "",
    streamUrl: "",
    isPlayed: false,
    playbackPosition: 0,
    playbackDuration: 0,
    playbackPercent: 0,
    dateAdded: "2017-10-06",
    studios: ["Warner Bros."],
    people: [],
  },
  {
    id: "7",
    title: "The Dark Knight",
    overview: "Batman doit accepter l'une des plus grandes épreuves psychologiques et physiques de sa croisade pour affronter le Joker.",
    year: 2008,
    rating: 0,
    communityRating: 9.0,
    runtime: 152,
    genres: ["Action", "Thriller", "Drame"],
    type: "Movie",
    posterUrl: "",
    backdropUrl: "",
    streamUrl: "",
    isPlayed: true,
    playbackPosition: 0,
    playbackDuration: 0,
    playbackPercent: 100,
    dateAdded: "2008-07-18",
    tagline: "Pourquoi si sérieux ?",
    studios: ["Warner Bros."],
    people: [],
  },
  {
    id: "8",
    title: "Stranger Things",
    overview: "Quand un garçon disparaît, une petite ville découvre un mystère impliquant des expériences secrètes et des forces surnaturelles.",
    year: 2016,
    rating: 0,
    communityRating: 8.7,
    runtime: 51,
    genres: ["Science-Fiction", "Horreur", "Drame"],
    type: "Series",
    posterUrl: "",
    backdropUrl: "",
    streamUrl: "",
    isPlayed: false,
    playbackPosition: 0,
    playbackDuration: 0,
    playbackPercent: 60,
    dateAdded: "2016-07-15",
    studios: ["Netflix"],
    people: [],
  },
  {
    id: "9",
    title: "Inception",
    overview: "Un voleur spécialisé dans l'extraction de secrets dans les rêves des gens reçoit une chance de retrouver sa vie d'avant.",
    year: 2010,
    rating: 0,
    communityRating: 8.8,
    runtime: 148,
    genres: ["Science-Fiction", "Action", "Thriller"],
    type: "Movie",
    posterUrl: "",
    backdropUrl: "",
    streamUrl: "",
    isPlayed: false,
    playbackPosition: 0,
    playbackDuration: 0,
    playbackPercent: 0,
    dateAdded: "2010-07-16",
    tagline: "Votre esprit est la scène du crime.",
    studios: ["Warner Bros."],
    people: [],
  },
  {
    id: "10",
    title: "The Witcher",
    overview: "Geralt de Riv, un chasseur de monstres mutant, lutte pour trouver sa place dans un monde où les humains se révèlent souvent plus mauvais que les bêtes.",
    year: 2019,
    rating: 0,
    communityRating: 8.0,
    runtime: 60,
    genres: ["Fantastique", "Action", "Aventure"],
    type: "Series",
    posterUrl: "",
    backdropUrl: "",
    streamUrl: "",
    isPlayed: false,
    playbackPosition: 0,
    playbackDuration: 0,
    playbackPercent: 15,
    dateAdded: "2019-12-20",
    studios: ["Netflix"],
    people: [],
  },
];

export function getMockHero(): NormalizedMediaItem {
  const inProgress = MOCK_ITEMS.filter(
    (i) => i.playbackPercent > 0 && i.playbackPercent < 100
  );
  return inProgress[0] || MOCK_ITEMS[0];
}

export function getMockResumeItems(): NormalizedMediaItem[] {
  return MOCK_ITEMS.filter(
    (i) => i.playbackPercent > 0 && i.playbackPercent < 100
  );
}

export function getMockByGenre(genre: string): NormalizedMediaItem[] {
  return MOCK_ITEMS.filter((i) => i.genres.includes(genre));
}

export function getMockLatest(): NormalizedMediaItem[] {
  return [...MOCK_ITEMS].sort(
    (a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
  );
}

export function getMockMovies(): NormalizedMediaItem[] {
  return MOCK_ITEMS.filter((i) => i.type === "Movie");
}

export function getMockSeries(): NormalizedMediaItem[] {
  return MOCK_ITEMS.filter((i) => i.type === "Series");
}
