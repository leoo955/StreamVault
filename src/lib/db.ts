import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ===== Types =====

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  role: "admin" | "user";
  plan: string;
  createdAt: string;
  preferences: {
    language: string;
    autoplay: boolean;
  };
}

export interface UserPublic {
  id: string;
  username: string;
  role: "admin" | "user";
  plan: string;
  createdAt: string;
  preferences: {
    language: string;
    autoplay: boolean;
  };
}

export interface Session {
  token: string;
  userId: string;
  expiresAt: string;
}

export interface Episode {
  number: number;
  title: string;
  streamUrl: string;
  runtime: number;
  imageUrl?: string;
  overview?: string;
}

export interface Season {
  number: number;
  episodes: Episode[];
}

export interface NormalizedPerson {
  id: string;
  name: string;
  role?: string;
  type: string;
  imageUrl?: string;
}

export interface MediaItem {
  id: string;
  title: string;
  overview: string;
  year: number;
  runtime: number;
  genres: string[];
  languages?: string[];
  type: "Movie" | "Series" | "Episode" | "Anime";
  posterUrl: string;
  backdropUrl: string;
  streamUrl: string;
  communityRating?: number;
  tagline?: string;
  saga?: string;
  moviedbId?: number;
  director?: string;
  cast?: NormalizedPerson[];
  subtitles?: { lang: string; url: string }[];
  studios?: string[];
  seasons?: Season[];
  dateAdded: string;
  addedBy?: string;
}

export interface MediaItemSummary {
  id: string;
  title: string;
  overview: string; // Restored for Hero
  year: number;
  runtime: number;
  genres: string[];
  type: "Movie" | "Series" | "Episode" | "Anime";
  posterUrl: string;
  backdropUrl: string;
  streamUrl: string;
  communityRating?: number;
  saga?: string;
  dateAdded: string;
}

export interface ActivityLog {
  id: string;
  userId?: string;
  username?: string;
  action: string;
  details: string;
  ip: string;
  timestamp: string;
}

export interface SagaMetadata {
  name: string;
  bannerUrl: string;
}

// ===== User Functions =====

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function mapPrismaUser(u: any): User {
  return {
    ...u,
    role: u.role as "admin" | "user",
    plan: u.plan || "Starter",
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
    preferences: (u.preferences as any) || { language: "fr", autoplay: true }
  };
}

function mapPrismaUserPublic(u: any): UserPublic {
  return {
    id: u.id,
    username: u.username,
    role: u.role as "admin" | "user",
    plan: u.plan || "Starter",
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
    preferences: (u.preferences as any) || { language: "fr", autoplay: true }
  };
}

export async function getUsers(): Promise<User[]> {
  const users = await prisma.user.findMany();
  return users.map(mapPrismaUser);
}

export async function getUserById(id: string): Promise<User | undefined> {
  const u = await prisma.user.findUnique({ where: { id } });
  if (!u) return undefined;
  return mapPrismaUser(u);
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const u = await prisma.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" } }
  });
  if (!u) return undefined;
  return mapPrismaUser(u);
}

export async function createUser(
  username: string,
  password: string,
  role: "admin" | "user" = "user",
  plan: string = "Starter"
): Promise<UserPublic> {
  const lowercaseUser = username.toLowerCase();
  const existing = await prisma.user.findFirst({ where: { username: { equals: lowercaseUser, mode: "insensitive" } }});
  if (existing) throw new Error("Ce nom d'utilisateur existe déjà");

  const salt = crypto.randomBytes(16).toString("hex");
  const hashed = hashPassword(password, salt);
  const count = await prisma.user.count();

  const u = await prisma.user.create({
    data: {
      username,
      passwordHash: hashed,
      salt,
      role: count === 0 ? "admin" : role,
      plan: count === 0 ? "Ultimate" : plan,
      preferences: { language: "fr", autoplay: true }
    }
  });

  return mapPrismaUserPublic(u);
}

export async function verifyPassword(username: string, password: string): Promise<User | null> {
  const user = await getUserByUsername(username);
  if (!user) return null;
  const hash = hashPassword(password, user.salt);
  return hash === user.passwordHash ? user : null;
}

export async function updateUserPreferences(
  userId: string,
  preferences: Partial<User["preferences"]>
): Promise<UserPublic | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  
  const updatedPrefs = { ...(user.preferences as any || {}), ...preferences };
  const u = await prisma.user.update({
    where: { id: userId },
    data: { preferences: updatedPrefs }
  });

  return mapPrismaUserPublic(u);
}

export async function changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return false;

  const oldHash = hashPassword(oldPassword, user.salt);
  if (oldHash !== user.passwordHash) return false;

  const newSalt = crypto.randomBytes(16).toString("hex");
  const newHash = hashPassword(newPassword, newSalt);

  await prisma.user.update({
    where: { id: userId },
    data: { salt: newSalt, passwordHash: newHash }
  });
  return true;
}

export async function resetUserPassword(userId: string, newPassword: string): Promise<boolean> {
  const newSalt = crypto.randomBytes(16).toString("hex");
  const newHash = hashPassword(newPassword, newSalt);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { salt: newSalt, passwordHash: newHash }
  }).catch(() => null);
  
  return !!updated;
}

export async function updateUserRole(userId: string, role: "admin" | "user"): Promise<boolean> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { role }
  }).catch(() => null);
  return !!user;
}

export async function updateUserPlan(userId: string, plan: string): Promise<boolean> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { plan }
  }).catch(() => null);
  return !!user;
}

export async function deleteUser(userId: string): Promise<boolean> {
  const deleted = await prisma.user.delete({ where: { id: userId } }).catch(() => null);
  return !!deleted;
}

export function toPublicUser(user: User): UserPublic {
  return mapPrismaUserPublic(user);
}

// ===== Session Operations =====

export async function createSession(userId: string): Promise<Session> {
  const session = await prisma.session.create({
    data: {
      token: generateToken(),
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });
  return { ...session, expiresAt: session.expiresAt.toISOString() };
}

export async function getSessionByToken(token: string): Promise<Session | undefined> {
  const session = await prisma.session.findUnique({ where: { token } });
  if (!session) return undefined;
  if (new Date(session.expiresAt) < new Date()) {
    await prisma.session.delete({ where: { token } }).catch(() => null);
    return undefined;
  }
  return { ...session, expiresAt: session.expiresAt.toISOString() };
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.session.delete({ where: { token } }).catch(() => null);
}

// ===== Media Operations =====

function mapPrismaMedia(m: any): MediaItem {
  return {
    id: m.id,
    title: m.title,
    overview: m.overview,
    type: m.type as any,
    year: m.year,
    runtime: m.runtime,
    genres: m.genres,
    languages: m.languages || [],
    posterUrl: m.posterUrl || "",
    backdropUrl: m.backdropUrl || "",
    streamUrl: m.streamUrl || "",
    communityRating: m.communityRating || 0,
    studios: m.studios || [],
    saga: m.saga || undefined,
    moviedbId: m.moviedbId || undefined,
    director: m.director || undefined,
    cast: (m.cast as any) || [],
    seasons: m.seasons ? m.seasons.map((s: any) => ({
      number: s.number,
      episodes: s.episodes ? s.episodes.map((e: any) => ({
        number: e.number,
        title: e.title || `Épisode ${e.number}`,
        streamUrl: e.streamUrl || "",
        runtime: e.runtime || 0,
      })).sort((a: any, b: any) => a.number - b.number) : []
    })).sort((a: any, b: any) => a.number - b.number) : [],
    dateAdded: m.addedAt.toISOString(),
  };
}

function mapPrismaMediaSummary(m: any): MediaItemSummary {
  return {
    id: m.id,
    title: m.title,
    overview: m.overview ? (m.overview.length > 160 ? m.overview.substring(0, 157) + "..." : m.overview) : "",
    type: m.type as any,
    year: m.year,
    runtime: m.runtime,
    genres: m.genres,
    posterUrl: m.posterUrl || "",
    backdropUrl: m.backdropUrl || "",
    streamUrl: m.streamUrl || "",
    communityRating: m.communityRating || 0,
    saga: m.saga || undefined,
    dateAdded: m.addedAt.toISOString(),
  };
}

export async function getMediaItems(): Promise<MediaItem[]> {
  const media = await prisma.media.findMany({
    include: {
      seasons: {
        include: { episodes: true }
      }
    },
    orderBy: { addedAt: "desc" }
  });
  return media.map(mapPrismaMedia);
}

export async function getMediaItemsOptimized(limit?: number): Promise<MediaItemSummary[]> {
  const media = await prisma.media.findMany({
    take: limit,
    orderBy: { addedAt: "desc" }
  });
  return media.map(mapPrismaMediaSummary);
}

export async function getMediaItemById(id: string): Promise<MediaItem | undefined> {
  const m = await prisma.media.findUnique({
    where: { id },
    include: {
      seasons: {
        include: { episodes: true }
      }
    }
  });
  return m ? mapPrismaMedia(m) : undefined;
}

export async function createMediaItem(
  item: Omit<MediaItem, "id" | "dateAdded">
): Promise<MediaItem> {
  const m = await prisma.media.create({
    data: {
      title: item.title,
      type: item.type,
      year: item.year,
      overview: item.overview,
      posterUrl: item.posterUrl,
      backdropUrl: item.backdropUrl,
      runtime: item.runtime,
      communityRating: item.communityRating,
      genres: item.genres,
      languages: item.languages || [],
      studios: item.studios || [],
      cast: (item.cast as any) || [],
      streamUrl: item.streamUrl || null,
      saga: item.saga,
      moviedbId: item.moviedbId,
      director: item.director,
      seasons: {
        create: (item.seasons || []).map(s => ({
          number: s.number,
          episodes: {
            create: s.episodes.map(e => ({
              number: e.number,
              title: e.title,
              streamUrl: e.streamUrl,
              runtime: e.runtime
            }))
          }
        }))
      }
    },
    include: {
      seasons: {
        include: { episodes: true }
      }
    }
  });

  const createdMedia = mapPrismaMedia(m);

  try {
    const users = await prisma.user.findMany({ select: { id: true } });
    await prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        title: "Nouveauté ✨",
        message: `${createdMedia.title} est maintenant disponible !`,
        mediaId: createdMedia.id,
        read: false,
      })),
    });
  } catch (err) {
    console.error("Failed to trigger notifications for new media", err);
  }

  return createdMedia;
}

export async function updateMediaItem(
  id: string,
  updates: Partial<Omit<MediaItem, "id" | "dateAdded">>
): Promise<MediaItem | null> {
  let updatePayload: any = {
    title: updates.title,
    type: updates.type,
    year: updates.year,
    overview: updates.overview,
    posterUrl: updates.posterUrl,
    backdropUrl: updates.backdropUrl,
    runtime: updates.runtime,
    communityRating: updates.communityRating,
    genres: updates.genres,
    languages: updates.languages,
    studios: updates.studios,
    cast: updates.cast ? (updates.cast as any) : undefined,
    streamUrl: updates.streamUrl,
    saga: updates.saga,
    moviedbId: updates.moviedbId,
    director: updates.director,
  };

  // Remove undefined properties
  Object.keys(updatePayload).forEach(key => {
    if (updatePayload[key] === undefined) delete updatePayload[key];
  });

  if (updates.seasons) {
    // Delete existing seasons to recreate cleanly
    await prisma.season.deleteMany({ where: { mediaId: id } });
    updatePayload.seasons = {
      create: updates.seasons.map(s => ({
        number: s.number,
        episodes: {
          create: s.episodes.map(e => ({
            number: e.number,
            title: e.title,
            streamUrl: e.streamUrl,
            runtime: e.runtime
          }))
        }
      }))
    };
  }

  try {
    const updated = await prisma.media.update({
      where: { id },
      data: updatePayload,
      include: {
        seasons: {
          include: { episodes: true }
        }
      }
    });
    return mapPrismaMedia(updated);
  } catch (err) {
    console.error("Failed to update media item", err);
    return null;
  }
}

export async function deleteMediaItem(id: string): Promise<boolean> {
  try {
    await prisma.media.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function getMediaByType(type: "Movie" | "Series"): Promise<MediaItem[]> {
  const items = await prisma.media.findMany({
    where: { type },
    include: {
      seasons: { include: { episodes: true } }
    },
    orderBy: { addedAt: "desc" }
  });
  return items.map(mapPrismaMedia);
}

// ===== Auth Helper for API Routes =====

export async function getAuthUser(request: Request): Promise<UserPublic | null> {
  const { getJWTUser } = await import("./jwt");
  const jwtPayload = await getJWTUser(request);
  if (!jwtPayload) return null;

  const user = await getUserById(jwtPayload.userId);
  if (!user) return null;

  return toPublicUser(user);
}

// ===== Watch Progress =====

export interface WatchProgress {
  userId: string;
  mediaId: string;
  seasonNum?: number;
  episodeNum?: number;
  position: number; // seconds
  duration: number; // seconds
  updatedAt: string;
}

export async function getWatchProgressForUser(userId: string): Promise<WatchProgress[]> {
  const p = await prisma.progress.findMany({ where: { userId } });
  return p.map(item => ({
    userId: item.userId,
    mediaId: item.mediaId,
    seasonNum: item.episodeId ? parseInt(item.episodeId.split('E')[0].replace('S', '')) : undefined,
    episodeNum: item.episodeId ? parseInt(item.episodeId.split('E')[1]) : undefined,
    position: item.progress,
    duration: item.duration,
    updatedAt: item.updatedAt.toISOString(),
  }));
}

export async function getWatchProgress(
  userId: string,
  mediaId: string,
  seasonNum?: number,
  episodeNum?: number
): Promise<WatchProgress | undefined> {
  const episodeId = seasonNum && episodeNum ? `S${seasonNum}E${episodeNum}` : null;
  const p = await prisma.progress.findUnique({
    where: {
      userId_mediaId_episodeId: {
        userId,
        mediaId,
        episodeId: episodeId || ""
      }
    }
  });

  if (!p) {
    if (episodeId === null) {
        const pNull = await prisma.progress.findFirst({
            where: { userId, mediaId, episodeId: null }
        });
        if (!pNull) return undefined;
        return {
            userId: pNull.userId,
            mediaId: pNull.mediaId,
            seasonNum,
            episodeNum,
            position: pNull.progress,
            duration: pNull.duration,
            updatedAt: pNull.updatedAt.toISOString(),
        };
    }
    return undefined;
  }
  return {
    userId: p.userId,
    mediaId: p.mediaId,
    seasonNum,
    episodeNum,
    position: p.progress,
    duration: p.duration,
    updatedAt: p.updatedAt.toISOString(),
  };
}

export async function saveWatchProgress(progress: WatchProgress): Promise<void> {
  const episodeId = progress.seasonNum && progress.episodeNum ? `S${progress.seasonNum}E${progress.episodeNum}` : null;
  await prisma.progress.upsert({
    where: {
      userId_mediaId_episodeId: {
        userId: progress.userId,
        mediaId: progress.mediaId,
        episodeId: episodeId || ""
      }
    },
    update: {
      progress: progress.position,
      duration: progress.duration,
      isCompleted: progress.duration > 0 && progress.position / progress.duration > 0.9
    },
    create: {
      userId: progress.userId,
      mediaId: progress.mediaId,
      episodeId: episodeId || "",
      progress: progress.position,
      duration: progress.duration,
      isCompleted: progress.duration > 0 && progress.position / progress.duration > 0.9
    }
  });
}

// ===== Profiles =====

export interface Profile {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string;
  isKids: boolean;
  createdAt: string;
  pin?: string; 
}

export interface Comment {
  id: string;
  mediaId: string;
  userId: string;
  username: string;
  text: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  mediaId?: string;
  read: boolean;
  createdAt: string;
}

export async function getProfilesForUser(userId: string): Promise<Profile[]> {
  const profiles = await prisma.profile.findMany({ where: { userId } });
  return profiles.map(p => ({
    ...p,
    pin: p.pin || undefined,
    createdAt: p.createdAt.toISOString()
  }));
}

export async function getProfileById(id: string): Promise<Profile | undefined> {
  const p = await prisma.profile.findUnique({ where: { id } });
  if (!p) return undefined;
  return {
    ...p,
    pin: p.pin || undefined,
    createdAt: p.createdAt.toISOString()
  };
}

export async function createProfile(
  userId: string,
  name: string,
  avatarUrl: string,
  isKids: boolean = false,
  pin?: string
): Promise<Profile> {
  const p = await prisma.profile.create({
    data: { userId, name, avatarUrl, isKids, pin }
  });
  return {
    ...p,
    pin: p.pin || undefined,
    createdAt: p.createdAt.toISOString()
  };
}

export async function updateProfile(
  id: string,
  updates: Partial<Pick<Profile, "name" | "avatarUrl" | "isKids" | "pin">>
): Promise<Profile | null> {
  try {
    const p = await prisma.profile.update({
      where: { id },
      data: updates
    });
    return {
      ...p,
      pin: p.pin || undefined,
      createdAt: p.createdAt.toISOString()
    };
  } catch {
    return null;
  }
}

export async function deleteProfile(id: string): Promise<boolean> {
  try {
    await prisma.profile.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

// ===== Invitation Codes =====

export interface InvitationCode {
  code: string;
  maxUses: number;
  usedCount: number;
  role: "admin" | "user";
  plan: string;
  expiresAt: string | null;
  note: string | null;
  createdBy: string;
  createdAt: string;
}

export async function getInvitationCodes(): Promise<InvitationCode[]> {
  const codes = await prisma.invitationCode.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return codes.map(c => ({
    ...c,
    role: c.role as "admin" | "user",
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    createdAt: c.createdAt.toISOString()
  }));
}

export async function createInvitationCode(
  params: {
    code: string;
    maxUses: number;
    createdBy: string;
    role?: "admin" | "user";
    plan?: string;
    expiresAt?: Date | null;
    note?: string | null;
  }
): Promise<InvitationCode> {
  const cleanCode = params.code.trim().toUpperCase();
  const c = await prisma.invitationCode.create({
    data: {
      code: cleanCode,
      maxUses: params.maxUses,
      createdBy: params.createdBy,
      role: params.role || "user",
      plan: params.plan || "Starter",
      expiresAt: params.expiresAt,
      note: params.note || null,
    }
  });
  return {
    ...c,
    role: c.role as "admin" | "user",
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    createdAt: c.createdAt.toISOString()
  };
}

export async function deleteInvitationCode(code: string): Promise<boolean> {
  try {
    await prisma.invitationCode.delete({ where: { code: code.toUpperCase() } });
    return true;
  } catch {
    return false;
  }
}

export async function validateAndUseInvitationCode(code: string): Promise<InvitationCode | null> {
  const cleanCode = code.trim().toUpperCase();
  const invite = await prisma.invitationCode.findUnique({ where: { code: cleanCode } });
  
  if (!invite) return null;
  
  // Check usages
  if (invite.usedCount >= invite.maxUses) return null;
  
  // Check expiration
  if (invite.expiresAt && invite.expiresAt < new Date()) return null;
  
  const updated = await prisma.invitationCode.update({
    where: { code: cleanCode },
    data: { usedCount: { increment: 1 } }
  });

  return {
    ...updated,
    role: updated.role as "admin" | "user",
    expiresAt: updated.expiresAt ? updated.expiresAt.toISOString() : null,
    createdAt: updated.createdAt.toISOString()
  };
}

// ===== Activity Log Operations =====

export async function getActivityLogs(): Promise<ActivityLog[]> {
  const logs = await prisma.activityLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: 5000
  });
  return logs.map(l => ({
    ...l,
    userId: l.userId || undefined,
    username: l.username || undefined,
    timestamp: l.timestamp.toISOString()
  }));
}

export async function addActivityLog(log: Omit<ActivityLog, "id" | "timestamp">): Promise<void> {
  await prisma.activityLog.create({
    data: {
      userId: log.userId,
      username: log.username,
      action: log.action,
      details: log.details,
      ip: log.ip
    }
  });
}

// ===== Saga Operations =====

export async function getSagasMetadata(): Promise<SagaMetadata[]> {
  return await prisma.sagaMetadata.findMany();
}

export async function updateSagaMetadata(name: string, bannerUrl: string): Promise<void> {
  await prisma.sagaMetadata.upsert({
    where: { name },
    update: { bannerUrl },
    create: { name, bannerUrl }
  });
}

// ===== Comments =====

export async function getComments(mediaId: string): Promise<Comment[]> {
  const c = await prisma.comment.findMany({
    where: { mediaId },
    orderBy: { createdAt: 'desc' }
  });
  return c.map(x => ({
    ...x,
    createdAt: x.createdAt.toISOString()
  }));
}

export async function addComment(comment: Omit<Comment, "id" | "createdAt">): Promise<Comment> {
  const c = await prisma.comment.create({
    data: comment
  });

  try {
    const admins = await prisma.user.findMany({ where: { role: "admin" }, select: { id: true } });
    await prisma.notification.createMany({
      data: admins.map(admin => ({
        userId: admin.id,
        title: "Nouveau commentaire 💬",
        message: `${comment.username} a commenté sur un média.`,
        mediaId: comment.mediaId,
        read: false
      }))
    });
  } catch (err) {
    console.warn("Failed to notify admins of new comment", err);
  }

  return {
    ...c,
    createdAt: c.createdAt.toISOString()
  };
}

export async function deleteComment(commentId: string, userId: string, isAdmin: boolean): Promise<boolean> {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return false;
    if (!isAdmin && comment.userId !== userId) return false;

    await prisma.comment.delete({ where: { id: commentId } });
    return true;
  } catch {
    return false;
  }
}

// ===== Notifications =====

export async function getNotificationsForUser(userId: string): Promise<Notification[]> {
  const n = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  return n.map(x => ({
    ...x,
    mediaId: x.mediaId || undefined,
    createdAt: x.createdAt.toISOString()
  }));
}

export async function createNotification(notification: Omit<Notification, "id" | "createdAt" | "read">): Promise<void> {
  await prisma.notification.create({
    data: notification
  });
}

export async function markNotificationRead(notificationId: string, userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true }
  });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId },
    data: { read: true }
  });
}

export async function notifyAllUsers(title: string, message: string, mediaId?: string): Promise<void> {
  try {
    const users = await prisma.user.findMany({ select: { id: true } });
    if (users.length === 0) return;

    await prisma.notification.createMany({
      data: users.map(u => ({
        userId: u.id,
        title,
        message,
        mediaId: mediaId || null,
        read: false
      }))
    });
  } catch (err) {
    console.error("Failed to notify all users", err);
    throw err;
  }
}

// ===== Device Pairing =====

export async function getPairingCode(userId: string) {
  const code = await prisma.devicePairingCode.findFirst({
    where: { userId, expiresAt: { gt: new Date() } }
  });
  return code;
}

export async function generatePairingCode(userId: string) {
  // Delete existing codes for user
  await prisma.devicePairingCode.deleteMany({ where: { userId } });

  // Generate a random 6-digit string
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15);

  const newCode = await prisma.devicePairingCode.create({
    data: { code, userId, expiresAt }
  });
  return newCode;
}

export async function consumePairingCode(code: string) {
  const pairingCode = await prisma.devicePairingCode.findUnique({
    where: { code }
  });

  if (!pairingCode) return null;

  // Single-use: delete immediately upon consumption attempt
  await prisma.devicePairingCode.delete({ where: { id: pairingCode.id } });

  if (pairingCode.expiresAt < new Date()) {
    return null; // Expired
  }

  return pairingCode.userId;
}
