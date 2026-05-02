"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { VideoPlayer } from "@/components/VideoPlayer";
import * as utils from "@/lib/utils";

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [media, setMedia] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await fetch(`/api/media/${id}`);
        if (res.ok) {
          const data = await res.json();
          setMedia(data);
        } else {
          router.replace("/");
        }
      } catch (err) {
        console.error("Failed to fetch media for player", err);
        router.replace("/");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchMedia();
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-white animate-spin"></div>
      </div>
    );
  }

  if (!media) return null;

  return (
    <main className="min-h-screen w-full bg-black">
      <VideoPlayer 
        id={media.id}
        title={media.title}
        posterUrl={utils.getTmdbImage(media.backdropPath)}
        streamUrl={media.streamUrl} // If the DB has it
      />
    </main>
  );
}
