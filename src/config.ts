import * as dotenv from 'dotenv'
dotenv.config()

export const config = {
  isProduction: process.env.NODE_ENV ? process.env.NODE_ENV !== 'development' : false,
  port: process.env.PORT || 3000,
  telegramAPI : process.env.TELEGRAM_HTTP_KEY,
}
