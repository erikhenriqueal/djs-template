import { config as _envConfig } from 'dotenv'
import { resolve } from 'path'
import { existsSync } from 'fs'
const isProduction = process.env.NODE_ENV === 'production'
const dynamicEnvFile = resolve(process.cwd(), isProduction ? './.env.production' : './.env.development')
const envFile = existsSync(dynamicEnvFile) ? dynamicEnvFile : resolve(process.cwd(), './.env')
if (!existsSync(envFile)) throw new Error('Can\'t find .env file')
_envConfig({ path: existsSync(envFile) ? envFile : '.env' })