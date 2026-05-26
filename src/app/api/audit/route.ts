import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { randomUUID } from 'crypto'
import type { Check, CheckStatus } from '@/lib/types'

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function makeCheck(name: string, status: CheckStatus, detail: string, fix?: string): Check {
  return { name, status, detail, ...(fix ? { fix } : {}) }
}

async function fetchRawHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
    },
    redirect: 'follow',
  })
  if (!response.ok) throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
  return response.text()
}

async function fetchRenderedHtml(url: string): Promise<string | null> {
  const apiKey = process.env.BROWSERLESS_API_KEY
  if (!apiKey) return null
  try {
    const response = await fetch('https://chrome.browserless.io/content', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, waitFor: 2000 }),
      signal: AbortSignal.timeout(15000),
    })
    if (!response.ok) return null
    return response.text()
  } catch { return null }
}

function extractBodyText($: cheerio.CheerioAPI): string {
  const bodyClone = $('body').clone()
  bodyClone.find('script, style, noscript').remove()
  return bodyClone.text().replace(/\s+/g, ' ').trim()
}

// ── TECHNICAL ─────────────────────────────────────────────────────────────────
// HTTPS, noindex, canonical, robots.txt, sitemap — from MEMENTO + RAMBO

interface MaverickData {
  rawWordCount: number
  renderedWordCount: number
  rawH1: boolean
  rawSchema: boolean
}

async function scoreTechnical(url: string, $: cheerio.CheerioAPI, maverick?: MaverickData): Promise<{ score: number; checks: Check[] }> {
  const checks: Check[] = []
  let score = 0
  const origin = new URL(url).origin
  const currentUrl = url.replace(/\/$/, '').toLowerCase()

  // 1. HTTPS
  if (url.startsWith('https://')) {
    score += 5
    checks.push(makeCheck('HTTPS', 'good', 'Served over HTTPS. Secure and trusted by search engines.'))
  } else {
    checks.push(makeCheck('HTTPS', 'critical', 'Not using HTTPS.', 'Move to HTTPS and install an SSL certificate. HTTP is a ranking disadvantage.'))
  }

  // 2. Noindex (MEMENTO)
  const metaRobots = $('meta[name="robots"], meta[name="ROBOTS"]').attr('content') || ''
  const metaGooglebot = $('meta[name="googlebot"]').attr('content') || ''
  const hasNoindex = /noindex/i.test(metaRobots) || /noindex/i.test(metaGooglebot)
  if (hasNoindex) {
    checks.push(makeCheck('Indexability', 'critical',
      'noindex directive found. Google is told to skip this page entirely.',
      'Remove noindex from meta robots unless you intentionally want this page hidden from search.'))
  } else {
    score += 5
    const robotsContent = metaRobots || 'not set, indexable by default'
    checks.push(makeCheck('Indexability', 'good', `Page is indexable. Meta robots: "${robotsContent}".`))
  }

  // 3. Canonical present (MEMENTO + RAMBO)
  const canonicalEl = $('link[rel="canonical"]')
  const canonical = canonicalEl.attr('href')
  if (!canonical) {
    checks.push(makeCheck('Canonical tag', 'needs_work',
      'No canonical tag found.',
      'Add <link rel="canonical" href="[this-page-url]"> to the <head> to prevent duplicate content issues.'))
  } else {
    const canonNorm = canonical.replace(/\/$/, '').toLowerCase()
    if (canonNorm !== currentUrl && !currentUrl.startsWith(canonNorm) && !canonNorm.startsWith(currentUrl)) {
      score += 3
      checks.push(makeCheck('Canonical tag', 'needs_work',
        `Canonical points to a different URL: ${canonical}`,
        'Check whether this is intentional. If not, update the canonical to match the current page URL.'))
    } else {
      score += 5
      checks.push(makeCheck('Canonical tag', 'good', `Canonical is set and matches the page URL.`))
    }
  }

  // 4. robots.txt
  try {
    const robotsRes = await fetch(`${origin}/robots.txt`, { signal: AbortSignal.timeout(5000) })
    if (robotsRes.ok) {
      const robotsText = await robotsRes.text()
      const isBlocked = /User-agent:\s*\*[\s\S]*?Disallow:\s*\//i.test(robotsText)
      if (isBlocked) {
        score += 2
        checks.push(makeCheck('robots.txt', 'needs_work',
          'robots.txt may be blocking all crawlers with a wildcard Disallow rule.',
          'Review your robots.txt. A "Disallow: /" under "User-agent: *" blocks all search engines from the entire site.'))
      } else {
        score += 5
        checks.push(makeCheck('robots.txt', 'good', 'robots.txt exists and does not block all crawlers.'))
      }
    } else {
      score += 2
      checks.push(makeCheck('robots.txt', 'needs_work',
        'No robots.txt file found.',
        'Create a /robots.txt. At minimum: "User-agent: *\\nAllow: /".'))
    }
  } catch {
    score += 2
    checks.push(makeCheck('robots.txt', 'needs_work', 'Could not fetch robots.txt.', 'Make sure /robots.txt is publicly accessible.'))
  }

  // 5. sitemap.xml
  try {
    const sitemapRes = await fetch(`${origin}/sitemap.xml`, { signal: AbortSignal.timeout(5000) })
    if (sitemapRes.ok) {
      score += 5
      checks.push(makeCheck('sitemap.xml', 'good', 'sitemap.xml found. Helps search engines discover and prioritise your pages.'))
    } else {
      checks.push(makeCheck('sitemap.xml', 'needs_work',
        'No sitemap.xml found.',
        'Generate an XML sitemap and submit it to Google Search Console. Most CMS platforms have a plugin for this.'))
    }
  } catch {
    checks.push(makeCheck('sitemap.xml', 'needs_work', 'Could not check sitemap.xml.', 'Make sure /sitemap.xml is publicly accessible.'))
  }

  // 6. Page rendering (MAVERICK — only present when Browserless rendered HTML is available)
  if (maverick) {
    const issues: string[] = []
    const renderedH1 = $('h1').length > 0
    const renderedSchema = $('script[type="application/ld+json"]').length > 0
    if (maverick.rawWordCount < 100 && maverick.renderedWordCount > 300) issues.push('Page content is JavaScript-rendered')
    if (!maverick.rawH1 && renderedH1) issues.push('H1 tag is JavaScript-rendered and not in the raw HTML')
    if (!maverick.rawSchema && renderedSchema) issues.push('Structured data is JavaScript-injected and not in the raw HTML')
    if (issues.length === 0) {
      checks.push(makeCheck('Page rendering', 'good',
        'Server-rendered. Googlebot sees the same content as the browser.'))
    } else if (issues.length === 1 && !issues[0].startsWith('Page content')) {
      checks.push(makeCheck('Page rendering', 'needs_work',
        issues[0] + '.',
        'Move this SEO element to server-side rendering so Googlebot can read it without executing JavaScript.'))
    } else {
      checks.push(makeCheck('Page rendering', 'critical',
        issues.join('. ') + '.',
        'Key SEO signals are hidden behind JavaScript. Googlebot may index a thin or empty page. Move to server-side rendering.'))
    }
  }

  return { score: Math.min(score, 25), checks }
}

// ── ON-PAGE ───────────────────────────────────────────────────────────────────
// Title, meta description, H1, OG tags — from RAMBO

function scoreOnPage($: cheerio.CheerioAPI): { score: number; checks: Check[] } {
  const checks: Check[] = []
  let score = 0

  // 1. Title tag
  const title = $('title').text().trim()
  if (!title) {
    checks.push(makeCheck('Title tag', 'critical', 'No title tag found.',
      'Add a <title> tag of 30-60 characters. It is the single most important on-page signal.'))
  } else if (title.length >= 30 && title.length <= 60) {
    score += 7
    checks.push(makeCheck('Title tag', 'good', `Title is ${title.length} chars: "${title.slice(0, 80)}"`))
  } else {
    score += 4
    const hint = title.length < 30 ? 'too short, expand it' : 'too long, likely gets cut off in search results'
    checks.push(makeCheck('Title tag', 'needs_work',
      `Title is ${title.length} chars (${hint}): "${title.slice(0, 80)}"`,
      'Aim for 30-60 characters. Lead with your primary keyword, end with the brand name.'))
  }

  // 2. Meta description — find first non-empty
  const metaDescEl = $('meta[name="description"], meta[name="Description"]').toArray()
    .find(el => ($(el).attr('content') || '').trim().length > 0)
  const metaDesc = metaDescEl ? ($(metaDescEl).attr('content') || '') : ''
  if (!metaDesc) {
    checks.push(makeCheck('Meta description', 'critical', 'No meta description found.',
      'Write a meta description of 120-160 characters. Google often uses it as the search snippet.'))
  } else if (metaDesc.length >= 120 && metaDesc.length <= 160) {
    score += 7
    checks.push(makeCheck('Meta description', 'good', `Meta description is ${metaDesc.length} chars. Good length.`))
  } else {
    score += 4
    const hint = metaDesc.length < 120 ? 'too short' : 'too long'
    checks.push(makeCheck('Meta description', 'needs_work',
      `Meta description is ${metaDesc.length} chars (${hint}). Ideal is 120-160.`,
      'Rewrite to 120-160 characters. Include a clear benefit or call to action.'))
  }

  // 3. H1 tag (RAMBO)
  const h1Count = $('h1').length
  if (h1Count === 0) {
    checks.push(makeCheck('H1 tag', 'critical', 'No H1 found on this page.',
      'Add one H1 that clearly describes the page topic. Include your primary keyword.'))
  } else if (h1Count === 1) {
    score += 6
    checks.push(makeCheck('H1 tag', 'good', `One H1 found: "${$('h1').first().text().trim().slice(0, 80)}"`))
  } else {
    score += 3
    checks.push(makeCheck('H1 tag', 'needs_work',
      `${h1Count} H1 tags found. Only one is needed.`,
      'Pick one H1 as the main heading. Demote the others to H2.'))
  }

  // 4. Open Graph tags (RAMBO meta check extended)
  const ogTitle = $('meta[property="og:title"]').attr('content')
  const ogDesc = $('meta[property="og:description"]').attr('content')
  if (ogTitle && ogDesc) {
    score += 5
    checks.push(makeCheck('Open Graph tags', 'good', 'og:title and og:description are both set.'))
  } else if (ogTitle || ogDesc) {
    score += 3
    const missing = !ogTitle ? 'og:title' : 'og:description'
    checks.push(makeCheck('Open Graph tags', 'needs_work',
      `Missing ${missing}.`,
      'Add both og:title and og:description. They control how your page appears on social media and in AI previews.'))
  } else {
    checks.push(makeCheck('Open Graph tags', 'needs_work',
      'No Open Graph tags found.',
      'Add og:title, og:description, og:image and og:url to the <head>. Essential for social sharing and rich previews.'))
  }

  return { score: Math.min(score, 25), checks }
}

// ── CONTENT ───────────────────────────────────────────────────────────────────
// Word count, heading hierarchy, images, internal linking, lists — from RAMBO + PREDATOR

function scoreContent($: cheerio.CheerioAPI, url: string): { score: number; checks: Check[] } {
  const checks: Check[] = []
  let score = 0

  // 1. Word count (RAMBO)
  const bodyText = extractBodyText($)
  const wordCount = countWords(bodyText)
  if (wordCount >= 300) {
    score += 5
    checks.push(makeCheck('Word count', 'good', `${wordCount.toLocaleString()} words. Enough content for search engines to understand the topic.`))
  } else if (wordCount >= 150) {
    score += 3
    checks.push(makeCheck('Word count', 'needs_work',
      `Only ${wordCount} words. On the thin side.`,
      'Aim for 300 words minimum. Expand your main points with more detail and examples.'))
  } else {
    checks.push(makeCheck('Word count', 'critical',
      `Only ${wordCount} words. Too thin to rank for anything competitive.`,
      'Add more content. 300 words minimum, 600+ is better for competitive topics.'))
  }

  // 2. Heading hierarchy (PREDATOR-inspired)
  const headings: number[] = []
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    headings.push(parseInt((el as cheerio.Element).tagName.replace('h', ''), 10))
  })
  if (headings.length === 0) {
    score += 2
    checks.push(makeCheck('Heading structure', 'needs_work',
      'No headings found.',
      'Add H2 and H3 subheadings to break up your content. Headings are how Google understands page structure.'))
  } else {
    let hierarchyOk = true
    for (let i = 1; i < headings.length; i++) {
      if (headings[i] > headings[i - 1] + 1) { hierarchyOk = false; break }
    }
    if (hierarchyOk) {
      score += 5
      checks.push(makeCheck('Heading structure', 'good', `${headings.length} heading(s) in correct hierarchy order.`))
    } else {
      score += 2
      checks.push(makeCheck('Heading structure', 'needs_work',
        'Heading levels are skipped (e.g., H1 straight to H3).',
        'Keep headings in order without skipping levels. H1 > H2 > H3. Skipping levels confuses crawlers.'))
    }
  }

  // 3. Image alt text (RAMBO)
  const allImages = $('img').toArray()
  if (allImages.length === 0) {
    score += 7
    checks.push(makeCheck('Image alt text', 'good', 'No images found. N/A.'))
  } else {
    const withAlt = allImages.filter(img => {
      const alt = $(img).attr('alt')
      return alt !== undefined && alt !== null
    })
    const pct = Math.round((withAlt.length / allImages.length) * 100)
    if (pct === 100) {
      score += 7
      checks.push(makeCheck('Image alt text', 'good', `All ${allImages.length} images have alt text.`))
    } else if (pct >= 50) {
      score += 4
      checks.push(makeCheck('Image alt text', 'needs_work',
        `${pct}% of images have alt text (${withAlt.length}/${allImages.length}).`,
        'Add descriptive alt text to all images. It helps accessibility and gives Google context for image content.'))
    } else {
      checks.push(makeCheck('Image alt text', 'critical',
        `Only ${pct}% of images have alt text (${withAlt.length}/${allImages.length}).`,
        'Add alt text to every image. Missing alt text is an accessibility failure and means Google cannot read your images.'))
    }
  }

  // 4. Internal linking (TERMINATOR + RAMBO)
  let internalLinks = 0
  let externalLinks = 0
  const hostname = new URL(url).hostname
  $('a').each((_, el) => {
    const href = $(el).attr('href') || ''
    try {
      const linkHostname = href.startsWith('http') ? new URL(href).hostname : hostname
      if (linkHostname === hostname) internalLinks++
      else if (linkHostname) externalLinks++
    } catch { /* ignore malformed hrefs */ }
  })
  if (internalLinks >= 3) {
    score += 4
    checks.push(makeCheck('Internal linking', 'good', `${internalLinks} internal links found. Good for crawlability and spreading link equity.`))
  } else if (internalLinks >= 1) {
    score += 2
    checks.push(makeCheck('Internal linking', 'needs_work',
      `Only ${internalLinks} internal link(s) found.`,
      'Add more internal links to related pages. Aim for at least 3-5 contextual internal links per page.'))
  } else {
    checks.push(makeCheck('Internal linking', 'needs_work',
      'No internal links found.',
      'Add links to other relevant pages on your site. Internal linking helps Google discover pages and understand site structure.'))
  }

  // 5. Lists / tables
  const hasList = $('ul, ol, table').length > 0
  if (hasList) {
    score += 4
    checks.push(makeCheck('Lists / tables', 'good', 'Lists or tables found. Structured content helps search engines extract key information.'))
  } else {
    checks.push(makeCheck('Lists / tables', 'needs_work',
      'No lists or tables found.',
      'Use bullet lists, numbered lists, or tables to structure information. Google frequently pulls list content for featured snippets.'))
  }

  return { score: Math.min(score, 25), checks }
}

// ── AUTHORITY ─────────────────────────────────────────────────────────────────
// Schema, author, favicon — from BLADE + RAMBO

function scoreAuthority($: cheerio.CheerioAPI): { score: number; checks: Check[] } {
  const checks: Check[] = []
  let score = 0

  const richTypes = [
    'Organization', 'Article', 'Product', 'FAQPage', 'BreadcrumbList',
    'WebSite', 'LocalBusiness', 'Person', 'NewsArticle', 'BlogPosting',
    'ItemList', 'Event', 'Recipe', 'HowTo', 'Review', 'Service',
  ]

  const ldJsonScripts = $('script[type="application/ld+json"]').toArray()
  let validJsonLd = false
  let invalidJsonLd = false
  const foundTypes: string[] = []
  let hasAuthorInJsonLd = false
  // MORPHEUS: check for Person + Organization conflict
  let hasPerson = false
  let hasOrg = false

  for (const el of ldJsonScripts) {
    try {
      const raw = $(el).html() || ''
      const data = JSON.parse(raw)
      validJsonLd = true
      const entries = Array.isArray(data) ? data : [data]
      for (const entry of entries) {
        const t = entry['@type']
        const types = Array.isArray(t) ? t : (t ? [t] : [])
        for (const type of types) {
          if (richTypes.includes(type) && !foundTypes.includes(type)) foundTypes.push(type)
          if (type === 'Person') hasPerson = true
          if (type === 'Organization') hasOrg = true
        }
        if (entry.author || entry.publisher) hasAuthorInJsonLd = true
      }
    } catch { invalidJsonLd = true }
  }

  // Also check microdata (BLADE)
  $('[itemtype]').each((_, el) => {
    const t = ($(el).attr('itemtype') || '').split('/').pop() || ''
    if (t && richTypes.includes(t) && !foundTypes.includes(t)) foundTypes.push(t)
  })

  // 1. JSON-LD schema
  if (validJsonLd) {
    score += 7
    checks.push(makeCheck('JSON-LD schema', 'good', `Valid structured data found (${ldJsonScripts.length} block${ldJsonScripts.length > 1 ? 's' : ''}).`))
  } else if (invalidJsonLd) {
    score += 3
    checks.push(makeCheck('JSON-LD schema', 'needs_work',
      'JSON-LD script found but contains invalid JSON.',
      'Fix the syntax in your schema. Use https://validator.schema.org to check it.'))
  } else {
    checks.push(makeCheck('JSON-LD schema', 'needs_work',
      'No structured data found.',
      'Add JSON-LD schema to your page. Start with WebSite and Organization, then add page-specific types like Article or Product.'))
  }

  // 2. Schema types (BLADE)
  if (foundTypes.length >= 2) {
    score += 6
    const conflictNote = (hasPerson && hasOrg) ? ' (note: Person + Organization on same page can confuse search engines)' : ''
    checks.push(makeCheck('Schema types', 'good', `${foundTypes.length} schema types found: ${foundTypes.join(', ')}.${conflictNote}`))
  } else if (foundTypes.length === 1) {
    score += 3
    checks.push(makeCheck('Schema types', 'needs_work',
      `Only 1 schema type found: ${foundTypes[0]}.`,
      'Add more schema types. BreadcrumbList, WebSite, Organization are good starting points for most pages.'))
  } else {
    checks.push(makeCheck('Schema types', 'critical',
      'No recognised schema types found.',
      'Add structured data types relevant to your content. Organization + Article cover most business pages.'))
  }

  // 3. Author / publisher
  const metaAuthor = $('meta[name="author"]').attr('content')
  if (hasAuthorInJsonLd || metaAuthor) {
    score += 6
    const source = hasAuthorInJsonLd ? 'JSON-LD' : `meta author tag ("${metaAuthor}")`
    checks.push(makeCheck('Author metadata', 'good', `Author or publisher found in ${source}.`))
  } else {
    checks.push(makeCheck('Author metadata', 'needs_work',
      'No author or publisher metadata found.',
      'Add an author or publisher to your JSON-LD schema, or a <meta name="author"> tag. A key E-E-A-T signal.'))
  }

  // 4. Favicon
  const favicon = $('link[rel="icon"]').attr('href') ||
    $('link[rel="shortcut icon"]').attr('href') ||
    $('link[rel="apple-touch-icon"]').attr('href')
  if (favicon) {
    score += 6
    checks.push(makeCheck('Favicon', 'good', 'Favicon is set.'))
  } else {
    checks.push(makeCheck('Favicon', 'needs_work',
      'No favicon found.',
      'Add <link rel="icon" href="/favicon.ico"> to the <head>. Quick win, takes two minutes.'))
  }

  return { score: Math.min(score, 25), checks }
}

// ── ROUTE HANDLER ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: { url?: string }
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }

  const rawUrl = (body.url || '').trim()
  if (!rawUrl) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

  let url = rawUrl
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url

  try { new URL(url) }
  catch { return NextResponse.json({ error: 'Invalid URL' }, { status: 400 }) }

  try {
    let rawHtml: string
    try { rawHtml = await fetchRawHtml(url) }
    catch (err) {
      return NextResponse.json(
        { error: `Could not fetch the URL: ${err instanceof Error ? err.message : 'Unknown error'}` },
        { status: 422 }
      )
    }

    const $raw = cheerio.load(rawHtml)
    const rawBodyText = extractBodyText(cheerio.load(rawHtml))
    const rawWordCount = countWords(rawBodyText)

    const renderedHtml = await fetchRenderedHtml(url)
    let renderedWordCount = rawWordCount
    let renderingType: 'SSR' | 'CSR' | 'Hybrid' | 'Estimated'
    let $forScoring = $raw

    if (renderedHtml) {
      const $rendered = cheerio.load(renderedHtml)
      const renderedBodyText = extractBodyText(cheerio.load(renderedHtml))
      renderedWordCount = countWords(renderedBodyText)
      $forScoring = $rendered
      const ratio = renderedWordCount / Math.max(rawWordCount, 1)
      renderingType = ratio <= 1.2 && ratio >= 0.8 ? 'SSR' : ratio > 2 ? 'CSR' : 'Hybrid'
    } else {
      renderingType = 'Estimated'
    }

    const maverickData: MaverickData | undefined = renderedHtml
      ? {
          rawWordCount,
          renderedWordCount,
          rawH1: $raw('h1').length > 0,
          rawSchema: $raw('script[type="application/ld+json"]').length > 0,
        }
      : undefined

    const [technical, onpage, content, authority] = await Promise.all([
      scoreTechnical(url, $forScoring, maverickData),
      Promise.resolve(scoreOnPage($forScoring)),
      Promise.resolve(scoreContent($forScoring, url)),
      Promise.resolve(scoreAuthority($forScoring)),
    ])

    const overallScore = technical.score + onpage.score + content.score + authority.score

    return NextResponse.json({
      id: randomUUID(),
      url,
      overall_score: overallScore,
      technical_score: technical.score,
      onpage_score: onpage.score,
      content_score: content.score,
      authority_score: authority.score,
      rendering_type: renderingType,
      raw_word_count: rawWordCount,
      rendered_word_count: renderedWordCount,
      checks: {
        technical: technical.checks,
        onpage: onpage.checks,
        content: content.checks,
        authority: authority.checks,
      },
      created_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Audit error:', err)
    return NextResponse.json(
      { error: `Audit failed: ${err instanceof Error ? err.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
