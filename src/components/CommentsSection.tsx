"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Trash2, Loader2 } from "lucide-react";

interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  createdAt: string;
}

interface CommentsSectionProps {
  mediaId: string;
  currentUserId?: string;
  isAdmin?: boolean;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

export default function CommentsSection({ mediaId, currentUserId, isAdmin }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(() => {
    fetch(`/api/comments?mediaId=${mediaId}`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mediaId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const submit = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId, text }),
      });
      if (res.ok) {
        setText("");
        fetchComments();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (id: string) => {
    await fetch(`/api/comments?id=${id}`, { method: "DELETE" });
    fetchComments();
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-gold" />
        <h3 className="font-bold text-text-primary text-lg">
          Commentaires <span className="text-text-muted text-sm font-normal">({comments.length})</span>
        </h3>
      </div>

      {/* Input area */}
      {currentUserId ? (
        <div className="flex gap-3 items-end">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
            placeholder="Partagez votre avis sur ce contenu..."
            rows={2}
            maxLength={500}
            className="flex-1 resize-none px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--surface-light)",
              color: "var(--text-primary)",
            }}
          />
          <button
            onClick={submit}
            disabled={!text.trim() || submitting}
            className="p-3 rounded-xl transition-all disabled:opacity-30 flex items-center gap-2 font-medium text-sm"
            style={{ background: "var(--gold)", color: "var(--deep-black)" }}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      ) : (
        <p className="text-sm text-text-muted">Connectez-vous pour laisser un commentaire.</p>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 text-gold animate-spin" />
        </div>
      ) : (
        <AnimatePresence>
          {comments.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-4">Soyez le premier à commenter !</p>
          ) : (
            <div className="space-y-3">
              {comments.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  className="group flex gap-3 p-4 rounded-xl"
                  style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }}
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-lg bg-gold/20 flex items-center justify-center shrink-0 font-bold text-gold text-sm">
                    {c.username[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold text-text-primary">{c.username}</span>
                      <span className="text-xs text-text-muted">{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-text-secondary mt-1 break-words">{c.text}</p>
                  </div>
                  {/* Delete button */}
                  {(currentUserId === c.userId || isAdmin) && (
                    <button
                      onClick={() => deleteComment(c.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/20 text-text-muted hover:text-red-400 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
