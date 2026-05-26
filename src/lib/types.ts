export type CheckStatus = 'good' | 'needs_work' | 'critical'

export interface Check {
  name: string
  status: CheckStatus
  detail: string
  fix?: string
}

export interface AuditResult {
  id: string
  url: string
  overall_score: number
  technical_score: number
  onpage_score: number
  content_score: number
  authority_score: number
  rendering_type: 'SSR' | 'CSR' | 'Hybrid' | 'Estimated'
  raw_word_count: number
  rendered_word_count: number
  checks: {
    technical: Check[]
    onpage: Check[]
    content: Check[]
    authority: Check[]
  }
  created_at: string
}
