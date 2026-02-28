import React from 'react'
import { Alert } from '../types'

interface AlertsSectionProps {
  alerts: Alert[]
  onDismiss: (id: string) => void
}

export const AlertsSection: React.FC<AlertsSectionProps> = ({ alerts, onDismiss }) => {
  if (alerts.length === 0) {
    return null
  }

  const groupedAlerts = alerts.reduce((acc, alert) => {
    const key = alert.type
    if (!acc[key]) acc[key] = []
    acc[key].push(alert)
    return acc
  }, {} as Record<string, Alert[]>)

  return (
    <div className="space-y-3">
      {groupedAlerts.critical?.map(alert => (
        <AlertItem key={alert.id} alert={alert} onDismiss={onDismiss} severity="critical" />
      ))}
      {groupedAlerts.warning?.map(alert => (
        <AlertItem key={alert.id} alert={alert} onDismiss={onDismiss} severity="warning" />
      ))}
    </div>
  )
}

interface AlertItemProps {
  alert: Alert
  severity: 'warning' | 'critical'
  onDismiss: (id: string) => void
}

const AlertItem: React.FC<AlertItemProps> = ({ alert, severity, onDismiss }) => {
  const colors = {
    critical: 'bg-red-500/10 border-red-500/30 text-red-400',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  }

  return (
    <div className={`border rounded-lg p-3 flex items-start justify-between gap-2 ${colors[severity]}`}>
      <div className="flex-1">
        <p className="text-sm font-semibold">{alert.exchange}</p>
        <p className="text-xs opacity-90 mt-1">{alert.message}</p>
        <p className="text-xs opacity-75 mt-1">
          {alert.timestamp.toLocaleTimeString()}
        </p>
      </div>
      <button
        onClick={() => onDismiss(alert.id)}
        className="text-lg font-bold opacity-50 hover:opacity-100 transition-opacity"
      >
        ×
      </button>
    </div>
  )
}
