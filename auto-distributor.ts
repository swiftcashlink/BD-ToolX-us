import { Account, AccountStatus } from './types';
import { INITIAL_ACCOUNTS } from './constants';
import { analyticsMonitor } from './analytics';
import { triggerMakeEvent, WEBHOOK_EVENTS } from './services/webhookService';

// Shortlink Platform Configs
export const SHORTLINK_CONFIGS: Record<string, any> = {
  'Ouo.io': {
    apiKey: '3SvRMAWc',
    endpoint: 'http://ouo.io/api/3SvRMAWc?s=',
    risk: 'HIGH',
    responseType: 'text',
    bestFor: ['YouTube', 'US Tech', 'High CPC']
  },
  'ShrinkMe.io': {
    apiKey: 'bc4d877bc1556fcfac362f362dfd2d8fb451c313',
    endpoint: 'https://shrinkme.io/api?api=bc4d877bc1556fcfac362f362dfd2d8fb451c313&url=',
    risk: 'HIGH',
    responseType: 'json',
    bestFor: ['Instagram', 'Facebook', 'General']
  },
  'FC.LC': {
    apiKey: 'f160fc9b8ac819529efb9c612a3c0ffb6ef648d5',
    endpoint: 'https://fc.lc/api?api=f160fc9b8ac819529efb9c612a3c0ffb6ef648d5&url=',
    risk: 'HIGH',
    responseType: 'json',
    bestFor: ['TikTok', 'Viral', 'Telegram Bot']
  },
  'Uploady.io': {
    apiKey: '1saep52buejc4ngwo',
    endpoint: 'https://uploady.io/api?api=1saep52buejc4ngwo&url=',
    risk: 'CRITICAL',
    responseType: 'json',
    bestFor: ['Download Links', 'File Sharing', 'Exclusive']
  },
  'Upfiles.com': {
    apiKey: '643a0b5d1145e218ce161e86fe643bb0',
    endpoint: 'https://upfiles.com/api?api=643a0b5d1145e218ce161e86fe643bb0&url=',
    risk: 'CRITICAL',
    responseType: 'json',
    bestFor: ['Software', 'Games', 'Media Files']
  },
  'GPLinks.com': {
    apiKey: '44f0abb70dcad7225128110dc8cf998018a32442',
    endpoint: 'https://gplinks.in/api?api=44f0abb70dcad7225128110dc8cf998018a32442&url=',
    risk: 'MEDIUM',
    responseType: 'json',
    bestFor: ['Websites', 'Blogs', 'Auto-Scripts']
  },
  'BC.VC': {
    apiKey: '0b4b685f6922fd18cc05ea9120808cde',
    endpoint: 'https://bc.vc/api?api=0b4b685f6922fd18cc05ea9120808cde&url=',
    risk: 'MEDIUM',
    responseType: 'json',
    bestFor: ['Forum Signatures', 'Pinterest', 'SEO']
  },
  'Cuty.io': {
    apiKey: '603836642af86bf2a9bbfd1d8',
    endpoint: 'https://api.cuty.io/full',
    risk: 'LOW',
    responseType: 'json',
    bestFor: ['General Traffic', 'Clean Ads']
  }
};

const DISTRIBUTION_RULES: Record<string, any> = {
  'BD ToolX': {
    'YouTube': 'Ouo.io',
    'Instagram': 'ShrinkMe.io',
    'Facebook': 'FC.LC',
    'Telegram': 'FC.LC Bot API',
    'default': 'ShrinkMe.io'
  },
  'SwiftCash Link': {
    'TikTok': 'FC.LC',
    'YouTube': 'Ouo.io',
    'Instagram': 'ShrinkEarn.com',
    'default': 'ClicksFly.com'
  },
  'AffiRise Network': {
    'YouTube': 'Ouo.io',
    'Instagram': 'BC.VC',
    'default': 'ShrinkMe.io'
  },
  'LinkSurge Pro': {
    'Facebook': 'Uploady.io',
    'YouTube': 'Ouo.io',
    'default': 'Cuty.io'
  },
  'ZipLink Flow': {
    'YouTube': 'Ouo.io',
    'Facebook': 'Upfiles.com',
    'default': 'ShrinkMe.io'
  }
};

export class AutoDistributor {
  private accounts: Account[];
  
  constructor(accounts: Account[]) {
    this.accounts = accounts;
  }
  
  getPlatformForAccount(account: Account): string {
    const setup = account.setup;
    const platform = account.platform;
    
    if (DISTRIBUTION_RULES[setup] && DISTRIBUTION_RULES[setup][platform]) {
      return DISTRIBUTION_RULES[setup][platform];
    }
    
    if (setup === 'LinkSurge Pro' || setup === 'ZipLink Flow') {
      if (platform.toLowerCase().includes('facebook') || platform.toLowerCase().includes('fb')) {
        return Math.random() > 0.5 ? 'Uploady.io' : 'Upfiles.com';
      }
      return 'Cuty.io';
    }
    
    if (account.notes) {
      const match = Object.keys(SHORTLINK_CONFIGS).find(k => account.notes?.toLowerCase().includes(k.toLowerCase()));
      if (match) return match;
    }
    
    return 'ShrinkMe.io';
  }
  
  async generateShortUrl(account: Account, originalUrl: string): Promise<string> {
    const platformName = this.getPlatformForAccount(account);
    const config = SHORTLINK_CONFIGS[platformName];
    
    if (!config) return originalUrl;
    
    try {
      let shortened = originalUrl;
      if (platformName === 'Cuty.io') {
        const response = await fetch(config.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: config.apiKey, url: originalUrl })
        });
        const data = await response.json();
        shortened = data.data?.short_url || originalUrl;
      } else {
        const response = await fetch(`${config.endpoint}${encodeURIComponent(originalUrl)}`);
        if (response.ok) {
          if (config.responseType === 'text') {
            shortened = await response.text() || originalUrl;
          } else {
            const data = await response.json();
            shortened = data.shortenedUrl || data.short_url || data.link || (data.data && data.data.short_url) || originalUrl;
          }
        }
      }

      // Track distribution event if successful
      if (shortened !== originalUrl && shortened !== 'FAILED') {
        analyticsMonitor.trackDistribution(account.id, platformName, originalUrl, shortened);
        
        // Trigger Make.com Webhook Event
        triggerMakeEvent(WEBHOOK_EVENTS.LINK_CREATED, {
          accountId: account.id,
          setup: account.setup,
          platform: platformName,
          original: originalUrl,
          shortened: shortened,
          timestamp: new Date().toISOString()
        });
      }

      return shortened;
    } catch (error) {
      console.error(`Sync error with ${platformName}:`, error);
    }
    
    return originalUrl;
  }

  getDistributionReport(): Record<string, { count: number, accounts: string[], setups: Set<string> }> {
    const report: Record<string, { count: number, accounts: string[], setups: Set<string> }> = {};
    
    for (const account of this.accounts) {
      const platform = this.getPlatformForAccount(account);
      
      if (!report[platform]) {
        report[platform] = {
          count: 0,
          accounts: [],
          setups: new Set()
        };
      }
      
      report[platform].count++;
      report[platform].accounts.push(account.id);
      report[platform].setups.add(account.setup);
    }
    
    return report;
  }
}

export const autoDistributor = new AutoDistributor(INITIAL_ACCOUNTS);