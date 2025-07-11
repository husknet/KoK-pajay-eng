// lib/telegramLogger.ts
export async function logToTelegram(message: string, html: boolean = false) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId   = process.env.TELEGRAM_CHAT_ID

  // 1) Debug env
  console.log('> Telegram ENV:', { botToken: !!botToken, chatId: !!chatId })

  if (!botToken || !chatId) {
    throw new Error('Telegram bot token or chat ID is missing in environment variables.')
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`
  const payload = {
    chat_id:    chatId,
    text:       message,
    parse_mode: html ? 'HTML' : 'Markdown',
  }

  // 2) Debug payload
  console.log('> Telegram payload:', payload)

  let response: Response
  try {
    response = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })
  } catch (networkErr) {
    console.error('Network error sending Telegram message:', networkErr)
    throw new Error(`Network failure: ${networkErr}`)
  }

  // 3) Check HTTP status
  if (!response.ok) {
    const errText = await response.text()
    console.error('Telegram API error:', response.status, errText)
    throw new Error(`Telegram API error ${response.status}: ${errText}`)
  }

  // Optional: parse the JSON and confirm "ok" === true
  const data = await response.json()
  if (!data.ok) {
    console.error('Telegram responded with ok=false:', data)
    throw new Error(`Telegram responded with ok=false: ${JSON.stringify(data)}`)
  }

  console.log('✅ Telegram message sent successfully')
  return data
}
