export async function logToTelegram(message: string, html: boolean = false) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    console.warn('Telegram bot token or chat ID is missing in environment variables.')
    return
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: html ? 'HTML' : 'Markdown',
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Telegram API error:', response.status, errText)
    }
  } catch (error) {
    console.error('Failed to send Telegram message:', error)
  }
}
