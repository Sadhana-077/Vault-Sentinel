import { create } from 'zustand'
import { ExchangeData, Alert, DashboardState } from '../types'
import { creService } from '../services/cre-service'
import { storageService } from '../services/storage-service'
import { EXCHANGES } from '../lib/exchanges'

interface DashboardStore extends DashboardState {
  fetchExchanges: () => Promise<void>
  setError: (error: string | null) => void
  clearAlerts: () => void
  dismissAlert: (alertId: string) => void
  addAlert: (alert: Alert) => void
  refreshData: () => Promise<void>
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  exchanges: [],
  alerts: [],
  loading: false,
  error: null,
  lastRefresh: null,
  refreshing: false,

  fetchExchanges: async () => {
    set({ loading: true, error: null })
    try {
      // Try to get cached data first
      const cached = await storageService.getCachedData()
      if (cached) {
        set({ exchanges: cached, lastRefresh: new Date(), loading: false })
        return
      }

      // Fetch fresh data from CRE
      const exchangeNames = EXCHANGES.map(e => e.name)
      const data = await creService.fetchAllExchanges(exchangeNames)

      // Check for alerts
      const newAlerts: Alert[] = []
      data.forEach(exchange => {
        if (exchange.status === 'critical') {
          newAlerts.push({
            id: `${exchange.name}-critical-${Date.now()}`,
            exchange: exchange.name,
            type: 'critical',
            message: `${exchange.name} solvency below 95%`,
            timestamp: new Date(),
            resolved: false,
          })
        } else if (exchange.status === 'warning') {
          newAlerts.push({
            id: `${exchange.name}-warning-${Date.now()}`,
            exchange: exchange.name,
            type: 'warning',
            message: `${exchange.name} solvency approaching critical`,
            timestamp: new Date(),
            resolved: false,
          })
        }
      })

      // Cache the data
      await storageService.setCachedData(data)

      set({
        exchanges: data,
        alerts: newAlerts,
        lastRefresh: new Date(),
        loading: false,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch exchange data'
      set({ error: errorMessage, loading: false })
    }
  },

  refreshData: async () => {
    set({ refreshing: true })
    try {
      // Clear cache to force fresh data
      await storageService.clearCache()
      // Fetch fresh data
      await get().fetchExchanges()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh data'
      set({ error: errorMessage })
    } finally {
      set({ refreshing: false })
    }
  },

  setError: (error) => set({ error }),

  clearAlerts: () => set({ alerts: [] }),

  dismissAlert: (alertId) => {
    set(state => ({
      alerts: state.alerts.filter(a => a.id !== alertId)
    }))
  },

  addAlert: (alert) => {
    set(state => ({
      alerts: [...state.alerts, alert]
    }))
  },
}))
