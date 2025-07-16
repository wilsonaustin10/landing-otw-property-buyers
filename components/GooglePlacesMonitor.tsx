'use client';

import React, { useState, useEffect } from 'react';
import { googlePlacesMonitor } from '../utils/googlePlacesMonitor';

export default function GooglePlacesMonitor() {
  const [stats, setStats] = useState(googlePlacesMonitor.getStats());
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMonitor, setShowMonitor] = useState(false);

  // Update stats every second
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(googlePlacesMonitor.getStats());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleResetStats = () => {
    googlePlacesMonitor.reset();
    setStats(googlePlacesMonitor.getStats());
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowMonitor(!showMonitor)}
        className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 transition-colors z-50"
      >
        {showMonitor ? 'Hide' : 'Show'} API Monitor
      </button>

      {showMonitor && (
        <div className="fixed bottom-20 right-4 bg-black/90 text-white rounded-lg shadow-lg text-xs font-mono z-50">
          <div className="p-4" style={{ minWidth: '300px', maxWidth: isExpanded ? '500px' : '300px' }}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold">Google Places API Monitor</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30"
                >
                  {isExpanded ? 'Collapse' : 'Expand'}
                </button>
                <button
                  onClick={handleResetStats}
                  className="text-xs bg-red-600/50 px-2 py-1 rounded hover:bg-red-600/70"
                >
                  Reset
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              {/* API Call Stats */}
              <div className="border-b border-white/20 pb-2">
                <div className="font-semibold mb-1">API Call Statistics</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-gray-400">Total Calls</div>
                    <div className={`text-lg ${stats.totalCalls > 50 ? 'text-red-400' : 'text-green-400'}`}>
                      {stats.totalCalls}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Session Time</div>
                    <div className="text-lg">{stats.sessionDuration}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Avg/Min</div>
                    <div className="text-lg">{stats.averageCallsPerMinute}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Status</div>
                    <div className={`text-lg ${stats.totalCalls > 50 ? 'text-red-400' : 'text-green-400'}`}>
                      {stats.totalCalls > 50 ? '⚠️ High' : '✅ Normal'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="border-b border-white/20 pb-2">
                <div className="font-semibold mb-1">Recent Activity</div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {stats.recentLogs.length === 0 ? (
                    <div className="text-gray-400">No activity yet</div>
                  ) : (
                    stats.recentLogs.map((log, idx) => (
                      <div key={idx} className="bg-white/10 p-1 rounded">
                        <div className="flex justify-between">
                          <span className={log.action === 'place_selected' ? 'text-green-400' : 'text-blue-400'}>
                            {log.action}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {log.details?.address && (
                          <div className="text-gray-300 text-xs truncate mt-0.5">
                            📍 {log.details.address}
                          </div>
                        )}
                        {log.details?.inputLength !== undefined && (
                          <div className="text-gray-400 text-xs">
                            Input: {log.details.inputLength}/{log.details.minRequired} chars
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Calls per Minute Chart */}
              {isExpanded && Object.keys(stats.callsPerMinute).length > 0 && (
                <div className="border-b border-white/20 pb-2">
                  <div className="font-semibold mb-1">Calls Timeline</div>
                  <div className="grid grid-cols-6 gap-1">
                    {Object.entries(stats.callsPerMinute).slice(-12).map(([time, count]) => (
                      <div key={time} className="text-center">
                        <div className="text-xs text-gray-400">{time}</div>
                        <div 
                          className={`h-8 flex items-end justify-center rounded-t ${
                            count > 10 ? 'bg-red-500/50' : 'bg-green-500/50'
                          }`}
                          style={{ height: `${Math.min(count * 8, 64)}px` }}
                        >
                          <span className="text-xs font-bold">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {isExpanded && stats.totalCalls > 0 && (
                <div className="bg-white/10 p-2 rounded">
                  <div className="font-semibold mb-1">Optimization Status</div>
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span>✅</span>
                      <span>Session tokens implemented</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>✅</span>
                      <span>Built-in debouncing active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>✅</span>
                      <span>Minimum character validation</span>
                    </div>
                    {stats.totalCalls > 50 && (
                      <div className="flex items-center gap-2 text-yellow-400">
                        <span>⚠️</span>
                        <span>Consider checking for component re-renders</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}