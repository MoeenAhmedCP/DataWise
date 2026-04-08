export type Organization = {
  id: string
  name: string
  slug: string
  created_at: string
}

export type OrgMember = {
  id: string
  org_id: string
  user_id: string
  role: 'owner' | 'member'
}

export type MetricDefinition = {
  id: string
  org_id: string
  name: string
  description?: string
  unit?: string
  color: string
  created_at: string
}

export type MetricDataPoint = {
  id: string
  org_id: string
  metric_id: string
  date: string
  value: number
  label?: string
}

export type MetricWithData = MetricDefinition & {
  data: MetricDataPoint[]
  latest_value: number
  previous_value: number
  change_percent: number
  trend: 'up' | 'down' | 'neutral'
}

export type Alert = {
  id: string
  org_id: string
  metric_id: string
  name: string
  condition: 'drops_by' | 'rises_by' | 'below' | 'above'
  threshold: number
  threshold_type: 'percent' | 'absolute'
  period_days: number
  is_active: boolean
  last_triggered_at?: string
  metric?: MetricDefinition
}

export type AlertEvent = {
  id: string
  alert_id: string
  triggered_at: string
  current_value: number
  previous_value: number
  change_percent: number
  message: string
  alert?: Alert
}

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export type CSVRow = Record<string, string>

export type TriggeredAlert = {
  alert: Alert
  message: string
  current_value: number
  previous_value: number
  change_percent: number
}
