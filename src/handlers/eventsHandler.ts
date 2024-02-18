import { Client } from 'discord.js'

import events from '../events'

export function handleEvents(client: Client) {
  for (const event of events) {
    if (event.once) client.once(event.name, event.listener)
    else client.on(event.name, event.listener)
  }
}