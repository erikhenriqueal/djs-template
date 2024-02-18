import './utils/loadEnv'
import { getClientConfig } from './utils/clientConfig'

import { Client } from 'discord.js'
const client = new Client({ intents: getClientConfig('intents') })

import { handleEvents } from './handlers/eventsHandler'

handleEvents(client)

client.login(process.env['BOT_TOKEN'])