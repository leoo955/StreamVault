"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  mediaId: string;
}

export default function StarRating({ mediaId }: StarRatingProps) {
  const [userRating, setUserRating] = useState(0);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [hover, setHover] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/ratings?mediaId=${mediaId}`)
      .then((r) => r.json())
      .then((d) => {
        setUserRating(d.userRating || 0);
        setAverage(d.average || 0);
        setCount(d.count || 0);
      })
      .catch(() => {});
  }, [mediaId]);

  const rate = async (stars: number) => {
    setSaving(true);
    setUserRating(stars);
    try {
      await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId, stars }),
      });
      // Refresh
      const res = await fetch(`/api/ratings?mediaId=${mediaId}`);
      const d = await res.json();
      setAverage(d.average || 0);
      setCount(d.count || 0);
    } catch {
      // ignore
    }
    setSaving(false);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Star buttons */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const active = hover > 0 ? star <= hover : star <= userRating;
          return (
            <button
              key={star}
              onClick={() => rate(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              disabled={saving}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={`w-5 h-5 transition-colors ${
                  active ? "text-gold fill-gold" : "text-text-muted"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Info */}
      <span className="text-xs text-text-muted">
        {count > 0 ? (
          <>
            <span className="text-gold font-bold">{average.toFixed(1)}</span>/5
            <span className="ml-1">({count} vote{count > 1 ? "s" : ""})</span>
          </>
        ) : (
          "Pas encore noté"
        )}
      </span>
    </div>
  );
}
