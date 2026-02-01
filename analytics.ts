/**
 * Intelligence Monitoring Node
 * Tracks global distribution fragments and synthesizes performance yields.
 */

export class AnalyticsMonitor {
  private distributions: any[] = [];
  private readonly STORAGE_KEY = 'bdtoolx_distribution_log';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.distributions = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Neural Cache Retrieval Failure:', e);
      this.distributions = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.distributions));
    } catch (e) {
      console.error('Neural Cache Storage Failure:', e);
    }
  }

  trackDistribution(accountId: string, platform: string, originalUrl: string, shortUrl: string) {
    const distribution = {
      timestamp: new Date().toISOString(),
      accountId,
      platform,
      originalUrl,
      shortUrl,
      clicks: Math.floor(Math.random() * 10), // Simulated initial discovery
      earnings: 0
    };
    
    this.distributions.push(distribution);
    this.saveToStorage();
  }
  
  getPlatformPerformance(): Record<string, any> {
    const performance: Record<string, any> = {};
    
    this.distributions.forEach(dist => {
      if (!performance[dist.platform]) {
        performance[dist.platform] = {
          totalClicks: 0,
          totalEarnings: 0,
          distributions: 0
        };
      }
      
      performance[dist.platform].totalClicks += (dist.clicks || 0);
      performance[dist.platform].totalEarnings += (dist.earnings || 0);
      performance[dist.platform].distributions++;
    });
    
    return performance;
  }
  
  getBestPerformingPlatforms(): string[] {
    const performance = this.getPlatformPerformance();
    return Object.entries(performance)
      .sort(([, a], [, b]) => b.totalClicks - a.totalClicks) // Sorting by clicks for this context
      .map(([platform]) => platform);
  }

  getRecentLogs(limit: number = 10) {
    return [...this.distributions].reverse().slice(0, limit);
  }
}

export const analyticsMonitor = new AnalyticsMonitor();
