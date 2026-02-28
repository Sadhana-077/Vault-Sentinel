/**
 * Background Service Worker for VaultSentinel
 * Handles:
 * - Periodic data refresh
 * - Alert notifications
 * - Badge updates
 */

const REFRESH_INTERVAL_MINUTES = 15
const ALARM_NAME = 'vault-sentinel-refresh'

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('[VaultSentinel] Extension installed')
  // Set up initial alarm for data refresh
  setupRefreshAlarm()
})

// Set up periodic refresh
function setupRefreshAlarm() {
  chrome.alarms.create(ALARM_NAME, {
    periodInMinutes: REFRESH_INTERVAL_MINUTES,
  })
}

// Handle alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    await refreshExchangeData()
  }
})

// Refresh exchange data from background
async function refreshExchangeData() {
  try {
    const response = await fetch('https://api.chainlink.com/cre/all-exchanges', {
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    const data = await response.json()

    // Update badge with alert count
    const criticalCount = data.alerts?.filter((a: any) => a.type === 'critical').length || 0
    if (criticalCount > 0) {
      chrome.action.setBadgeText({ text: criticalCount.toString() })
      chrome.action.setBadgeBackgroundColor({ color: '#ef4444' })
    } else {
      chrome.action.setBadgeText({ text: '' })
    }

    // Send notification for critical alerts
    if (data.alerts && data.alerts.length > 0) {
      const critical = data.alerts.filter((a: any) => a.type === 'critical')
      if (critical.length > 0) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'images/icon-128.png',
          title: 'VaultSentinel Alert',
          message: `${critical.length} exchange(s) below critical solvency threshold`,
        })
      }
    }

    console.log('[VaultSentinel] Background refresh completed')
  } catch (error) {
    console.error('[VaultSentinel] Background refresh failed:', error)
  }
}

// Handle messages from popup/dashboard
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'REFRESH_DATA') {
    refreshExchangeData().then(() => {
      sendResponse({ success: true })
    }).catch(error => {
      sendResponse({ success: false, error: error.message })
    })
    return true // Keep the message channel open
  }
})

// Set up initial alarm
setupRefreshAlarm()
