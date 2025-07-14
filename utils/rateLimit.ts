// Rate limiting configuration
const RATE_LIMIT = 5; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute in milliseconds

// Type definitions
export interface RateLimitStore {
  count: number;
  timestamp: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining?: number;
  retryAfter?: number;
}

// In-memory store for rate limiting
// Note: In production, use Redis or similar for distributed systems
const rateLimitStore = new Map<string, RateLimitStore>();

// Clean up old entries periodically
const cleanup = () => {
  const now = Date.now();
  rateLimitStore.forEach((data, key) => {
    if (now - data.timestamp > RATE_WINDOW) {
      rateLimitStore.delete(key);
    }
  });
};

setInterval(cleanup, RATE_WINDOW);

/**
 * Rate limit function that implements a sliding window approach
 * @param identifier - Unique identifier for the client (e.g., IP address)
 * @returns Promise<RateLimitResult> - Result of the rate limit check
 */
export async function rateLimit(identifier: string): Promise<RateLimitResult> {
  const now = Date.now();
  const userLimit = rateLimitStore.get(identifier);

  // Reset if window has expired
  if (!userLimit || (now - userLimit.timestamp) > RATE_WINDOW) {
    rateLimitStore.set(identifier, { count: 1, timestamp: now });
    return {
      success: true,
      remaining: RATE_LIMIT - 1
    };
  }

  // Check if limit exceeded
  if (userLimit.count >= RATE_LIMIT) {
    const retryAfter = Math.ceil(
      (RATE_WINDOW - (now - userLimit.timestamp)) / 1000
    );
    
    return {
      success: false,
      remaining: 0,
      retryAfter
    };
  }

  // Increment counter
  userLimit.count += 1;
  rateLimitStore.set(identifier, userLimit);

  return {
    success: true,
    remaining: RATE_LIMIT - userLimit.count
  };
} 