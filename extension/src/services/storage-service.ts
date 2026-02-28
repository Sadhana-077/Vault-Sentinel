import { ExchangeData } from '../types'

const CACHE_KEY = 'vault_sentinel_cache'
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes

interface CacheEntry {
  data: ExchangeData[]
  timestamp: number
}

/**
 * Storage Service - Manages Chrome extension storage
 * Handles caching of exchange data with TTL
 */
export class StorageService {
  /**
   * Get cached exchange data
   */
  async getCachedData(): Promise<ExchangeData[] | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get([CACHE_KEY], (result) => {
        if (chrome.runtime.lastError) {
          console.error('[VaultSentinel] Storage error:', chrome.runtime.lastError)
          resolve(null)
          return
        }

        const entry = result[CACHE_KEY] as CacheEntry | undefined
        if (!entry) {
          resolve(null)
          return
        }

        const age = Date.now() - entry.timestamp
        if (age > CACHE_TTL) {
          resolve(null)
          return
        }

        resolve(entry.data)
      })
    })
  }

  /**
   * Save exchange data to cache
   */
  async setCachedData(data: ExchangeData[]): Promise<void> {
    return new Promise((resolve) => {
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
      }
      chrome.storage.local.set({ [CACHE_KEY]: entry }, () => {
        if (chrome.runtime.lastError) {
          console.error('[VaultSentinel] Storage error:', chrome.runtime.lastError)
        }
        resolve()
      })
    })
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.remove([CACHE_KEY], () => {
        if (chrome.runtime.lastError) {
          console.error('[VaultSentinel] Storage error:', chrome.runtime.lastError)
        }
        resolve()
      })
    })
  }

  /**
   * Get user preferences
   */
  async getPreferences() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['preferences'], (result) => {
        resolve(result.preferences || {
          alertThreshold: 0.95,
          refreshInterval: 15,
          enableNotifications: true,
        })
      })
    })
  }

  /**
   * Save user preferences
   */
  async setPreferences(prefs: any): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ preferences: prefs }, resolve)
    })
  }
}

export const storageService = new StorageService()
