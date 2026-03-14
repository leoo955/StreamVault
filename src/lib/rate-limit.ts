// Token-bucket rate limiter per IP for API routes

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, TokenBucket>();

const DEFAULTS = {
  maxTokens: 30,     // max requests per window
  refillRate: 30,    // tokens restored per second
  windowMs: 1000,    // refill interval in ms
};

export function rateLimit(
  ip: string,
  options: Partial<typeof DEFAULTS> = {}
): { allowed: boolean; remaining: number } {
  const { maxTokens, refillRate, windowMs } = { ...DEFAULTS, ...options };

  const now = Date.now();
  let bucket = buckets.get(ip);

  if (!bucket) {
    bucket = { tokens: maxTokens, lastRefill: now };
    buckets.set(ip, bucket);
  }

  // Refill tokens based on elapsed time
  const elapsed = now - bucket.lastRefill;
  const tokensToAdd = Math.floor((elapsed / windowMs) * refillRate);

  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  // Consume a token
  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    return { allowed: true, remaining: bucket.tokens };
  }

  return { allowed: false, remaining: 0 };
}

// Stricter limit for transcoding-heavy endpoints
export function rateLimitStream(ip: string) {
  return rateLimit(ip, { maxTokens: 5, refillRate: 2 });
}

// Cleanup stale buckets every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const cutoff = Date.now() - 300000;
    for (const [ip, bucket] of buckets) {
      if (bucket.lastRefill < cutoff) {
        buckets.delete(ip);
      }
    }
  }, 300000);
}
