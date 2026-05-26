import type { AuditResult, Check } from './types'

const RED = [231, 76, 60] as const
const DARK = [12, 12, 12] as const
const CARD = [22, 12, 12] as const
const WHITE = [255, 255, 255] as const
const GREY = [180, 180, 180] as const
const LIGHT_GREY = [155, 155, 155] as const
const GREEN = [34, 197, 94] as const
const ORANGE = [251, 146, 60] as const

function statusColor(status: string): readonly [number, number, number] {
  if (status === 'good') return GREEN
  if (status === 'critical') return RED
  return ORANGE
}

function statusLabel(status: string): string {
  if (status === 'good') return 'GOOD'
  if (status === 'critical') return 'CRITICAL'
  return 'NEEDS WORK'
}

function getDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}

function loadImage(url: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => resolve('')
    img.src = url
  })
}

export async function generatePDF(audit: AuditResult): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const W = 210
  const margin = 14
  const col = W - margin * 2
  let y = 0

  // Header bar
  doc.setFillColor(...DARK)
  doc.rect(0, 0, W, 28, 'F')

  const logoData = await loadImage('https://rebelmarketer.co.uk/wp-content/uploads/2026/05/bl-logo.png')
  if (logoData) {
    doc.addImage(logoData, 'PNG', margin, 6, 40, 9)
  } else {
    doc.setTextColor(...WHITE)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('REBEL MARKETER', margin, 15)
  }

  doc.setTextColor(...RED)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('SEO AUDIT REPORT', margin, 22)

  doc.setTextColor(...RED)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text(String(audit.overall_score), W - margin - 18, 18)
  doc.setFontSize(9)
  doc.setTextColor(...GREY)
  doc.text('/100', W - margin - 4, 18)
  doc.setFontSize(6)
  doc.text('OVERALL', W - margin - 16, 23)

  y = 34

  // URL + date card
  doc.setFillColor(...CARD)
  doc.roundedRect(margin, y, col, 14, 2, 2, 'F')
  doc.setTextColor(...RED)
  doc.setFontSize(6)
  doc.setFont('helvetica', 'bold')
  doc.text('AUDITED', margin + 4, y + 5)
  doc.setTextColor(...WHITE)
  doc.setFontSize(10)
  doc.text(getDomain(audit.url).toUpperCase(), margin + 4, y + 10)
  doc.setTextColor(...LIGHT_GREY)
  doc.setFontSize(6)
  const date = new Date(audit.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  doc.text(date, W - margin - 4, y + 10, { align: 'right' })

  y += 18

  // Pillar scores
  const pillars = [
    { label: 'TECHNICAL', score: audit.technical_score },
    { label: 'ON-PAGE', score: audit.onpage_score },
    { label: 'CONTENT', score: audit.content_score },
    { label: 'AUTHORITY', score: audit.authority_score },
  ]
  const pW = (col - 6) / 4

  pillars.forEach((p, i) => {
    const x = margin + i * (pW + 2)
    doc.setFillColor(...CARD)
    doc.roundedRect(x, y, pW, 16, 2, 2, 'F')
    doc.setTextColor(...RED)
    doc.setFontSize(6)
    doc.setFont('helvetica', 'bold')
    doc.text(p.label, x + pW / 2, y + 5, { align: 'center' })
    doc.setTextColor(...WHITE)
    doc.setFontSize(14)
    doc.text(String(p.score), x + pW / 2, y + 12, { align: 'center' })
    doc.setTextColor(...GREY)
    doc.setFontSize(6)
    doc.text('/25', x + pW / 2 + 5, y + 12)
  })

  y += 20

  // Checks by pillar
  const sections: { title: string; checks: Check[] }[] = [
    { title: 'TECHNICAL', checks: audit.checks.technical },
    { title: 'ON-PAGE', checks: audit.checks.onpage },
    { title: 'CONTENT', checks: audit.checks.content },
    { title: 'AUTHORITY', checks: audit.checks.authority },
  ]

  for (const section of sections) {
    if (y > 260) { doc.addPage(); y = 14 }
    doc.setFillColor(...RED)
    doc.rect(margin, y, col, 6, 'F')
    doc.setTextColor(...WHITE)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text(section.title, margin + 3, y + 4)
    y += 8

    for (const check of section.checks) {
      const isGood = check.status === 'good'
      const detailLines = doc.splitTextToSize(check.detail, col - 30)
      const fixLines = check.fix ? doc.splitTextToSize(`FIX: ${check.fix}`, col - 6) : []
      const blockH = 6 + detailLines.length * 3.5 + (fixLines.length > 0 ? fixLines.length * 3.5 + 4 : 0) + 2

      if (y + blockH > 275) { doc.addPage(); y = 14 }

      doc.setFillColor(...CARD)
      doc.roundedRect(margin, y, col, blockH, 1.5, 1.5, 'F')

      doc.setFillColor(...statusColor(check.status))
      doc.roundedRect(W - margin - 24, y + 1.5, 22, 4, 1, 1, 'F')
      doc.setTextColor(...WHITE)
      doc.setFontSize(5)
      doc.setFont('helvetica', 'bold')
      doc.text(statusLabel(check.status), W - margin - 13, y + 4.5, { align: 'center' })

      doc.setTextColor(...WHITE)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.text(check.name, margin + 3, y + 5.5)

      if (isGood) { doc.setTextColor(175, 175, 175) } else { doc.setTextColor(210, 210, 210) }
      doc.setFontSize(6)
      doc.setFont('helvetica', 'normal')
      doc.text(detailLines, margin + 3, y + 10)

      if (fixLines.length > 0) {
        const fixY = y + 10 + detailLines.length * 3.5 + 1
        doc.setFillColor(40, 15, 15)
        doc.roundedRect(margin + 2, fixY, col - 4, fixLines.length * 3.5 + 2, 1, 1, 'F')
        doc.setTextColor(...RED)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(5.5)
        doc.text(fixLines, margin + 4, fixY + 3.5)
      }

      y += blockH + 2
    }
    y += 3
  }

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFillColor(...DARK)
    doc.rect(0, 287, W, 10, 'F')
    doc.setTextColor(...LIGHT_GREY)
    doc.setFontSize(5.5)
    doc.setFont('helvetica', 'normal')
    doc.text('rebelmarketer.co.uk | SEO Audit Report', margin, 293)
    doc.text(`Page ${i} of ${pageCount}`, W - margin, 293, { align: 'right' })
  }

  doc.save(`rebel-audit-${getDomain(audit.url)}-${audit.id.slice(0, 8)}.pdf`)
}
