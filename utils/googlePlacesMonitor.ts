// Google Places API monitoring utilities

export interface ApiCallLog {
  timestamp: Date;
  action: string;
  details?: any;
}

class GooglePlacesMonitor {
  private static instance: GooglePlacesMonitor;
  private callLogs: ApiCallLog[] = [];
  private sessionStartTime: Date = new Date();
  private totalCalls: number = 0;
  private callsPerMinute: Map<string, number> = new Map();

  private constructor() {}

  static getInstance(): GooglePlacesMonitor {
    if (!GooglePlacesMonitor.instance) {
      GooglePlacesMonitor.instance = new GooglePlacesMonitor();
    }
    return GooglePlacesMonitor.instance;
  }

  logApiCall(action: string, details?: any) {
    const now = new Date();
    this.totalCalls++;
    
    // Track calls per minute
    const minuteKey = `${now.getHours()}:${now.getMinutes()}`;
    this.callsPerMinute.set(minuteKey, (this.callsPerMinute.get(minuteKey) || 0) + 1);
    
    // Add to log
    const log: ApiCallLog = {
      timestamp: now,
      action,
      details
    };
    
    this.callLogs.push(log);
    
    // Keep only last 100 logs to prevent memory issues
    if (this.callLogs.length > 100) {
      this.callLogs.shift();
    }
    
    // Log to console with color coding
    const color = action === 'place_selected' ? 'color: green' : 'color: blue';
    console.log(
      `%c[Google Places Monitor] ${action}`,
      color,
      {
        timestamp: now.toISOString(),
        totalCalls: this.totalCalls,
        details
      }
    );
    
    // Warn if too many calls
    if (this.totalCalls > 50) {
      console.warn('[Google Places Monitor] High API call count detected:', this.totalCalls);
    }
  }

  getStats() {
    const now = new Date();
    const sessionDuration = (now.getTime() - this.sessionStartTime.getTime()) / 1000; // seconds
    
    return {
      totalCalls: this.totalCalls,
      sessionDuration: `${Math.floor(sessionDuration / 60)}m ${Math.floor(sessionDuration % 60)}s`,
      callsPerMinute: Object.fromEntries(this.callsPerMinute),
      recentLogs: this.callLogs.slice(-10), // Last 10 logs
      averageCallsPerMinute: sessionDuration > 60 ? (this.totalCalls / (sessionDuration / 60)).toFixed(2) : 'N/A'
    };
  }

  reset() {
    this.callLogs = [];
    this.totalCalls = 0;
    this.callsPerMinute.clear();
    this.sessionStartTime = new Date();
    console.log('[Google Places Monitor] Stats reset');
  }
}

export const googlePlacesMonitor = GooglePlacesMonitor.getInstance();

// Debounce utility specifically for Google Places
export function createPlacesDebouncer(delay: number = 300) {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (callback: () => void) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      callback();
      timeoutId = null;
    }, delay);
  };
}

// Throttle utility for rate limiting
export function createPlacesThrottler(limit: number = 100) {
  let lastRun = 0;
  
  return (callback: () => void) => {
    const now = Date.now();
    
    if (now - lastRun >= limit) {
      lastRun = now;
      callback();
    }
  };
}