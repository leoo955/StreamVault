# StreamVault — Personal VOD Platform

A premium self-hosted media center application for streaming your local video library with 4K/HDR support, TMDB metadata, and a Netflix-like UI.

## 🚀 Quick Start

### Prerequisites
- **Docker** and **Docker Compose** installed
- **FFmpeg** (included in Docker image)
- A **TMDB API key** (free) from [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)

### 1. Configure Environment
```bash
cp .env.example .env
# Edit .env and set:
# - TMDB_API_KEY=your-key-here
# - MEDIA_DIR=/path/to/your/movies
# - JWT_SECRET=a-long-random-string
```

### 2. Launch with Docker
```bash
docker-compose up -d
```

### 3. Access the App
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Via Nginx**: http://localhost (port 80)

### 4. Create Your Account
Navigate to the app and register your first account.

---

## 🏗️ Local Development (without Docker)

### Prerequisites
- Node.js 20+
- PostgreSQL 16
- Redis 7
- FFmpeg

### Server
```bash
cd server
npm install
npx prisma db push
npm run dev
```

### Client
```bash
cd client
npm install
npm run dev
```

---

## 📁 Project Structure
```
Netflix/
├── client/                  # Next.js 14 Frontend
│   ├── src/
│   │   ├── app/             # Pages (Home, Browse, Movie, Watch, Login)
│   │   ├── components/      # UI Components
│   │   └── lib/             # API client, Zustand store
│   ├── Dockerfile
│   └── tailwind.config.js
├── server/                  # Express.js Backend
│   ├── src/
│   │   ├── routes/          # API Routes (auth, movies, stream, genres, library)
│   │   ├── services/        # FFmpeg, TMDB, Scanner, File Watcher
│   │   └── middleware/      # JWT Auth
│   ├── prisma/schema.prisma # Database Schema
│   └── Dockerfile
├── docker/
│   └── nginx/nginx.conf     # Reverse proxy config
├── docker-compose.yml       # Full stack deployment
└── .env.example
```

## 🎬 Features

### Streaming
- **Direct Play** for browser-compatible formats (MP4/H.264/AAC)
- **HLS Transcoding** fallback via FFmpeg for incompatible formats
- **Hardware acceleration** (NVENC, QuickSync, VideoToolbox)
- Byte-range streaming with seek support

### Video Player
- Custom controls overlay (auto-hiding)
- Audio track selector
- Subtitle track selector (.srt, .vtt, .ass)
- Subtitle & audio offset adjustment
- Stats for Nerds (codec, bitrate, resolution, framerate, play method)
- Resume playback
- Keyboard shortcuts: Space/K (play/pause), F (fullscreen), M (mute), I (stats), Arrows (seek/volume)

### Library Management
- Automatic file watching (adds/removes movies on file changes)
- TMDB metadata scraping (posters, backdrops, logos, cast, genres)
- FFprobe analysis (codecs, resolution, HDR detection)
- Thumbnail generation for seek bar

### UI
- OLED-optimized dark theme
- Netflix-style hero banner
- Horizontal scrollable genre rows
- Browse grid with filters (genre, resolution, sort)
- Search
- Glassmorphism design elements
- Framer Motion animations

## 🔑 Keyboard Shortcuts (Player)
| Key | Action |
|-----|--------|
| Space / K | Play / Pause |
| F | Fullscreen toggle |
| M | Mute toggle |
| I | Stats for Nerds |
| ← | Skip back 10s |
| → | Skip forward 10s |
| ↑ | Volume up |
| ↓ | Volume down |
| Esc | Exit fullscreen |
