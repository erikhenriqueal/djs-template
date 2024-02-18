import { Client } from 'discord.js'
import { getClientConfig } from '../utils/clientConfig'
import { randomint } from '../utils/number'

export function rotateActivities(client: Client<true>, time: number) {
  setTimeout(() => {
    const allowAutoActivities: boolean | undefined = getClientConfig('rotate_activities')
    if (allowAutoActivities === false) return

    const activities = getClientConfig('activities')
    if (!Array.isArray(activities) || activities.length == 0) return client.user.setActivity()
    
    try {
      const activity = activities[randomint(0, activities.length - 1)]
      if (activity.name) activity.name = replaceActivitiesVariables(activity.name, client)
      if (activity.state) activity.state = replaceActivitiesVariables(activity.state, client)
      if (activity.url) activity.url = replaceActivitiesVariables(activity.url, client)

      client.user.setActivity(activity)
    } catch (e) {}

    return rotateActivities(client, time)
  }, time * 1000)
}
function replaceActivitiesVariables(input: string, client: Client<true>): string {
  if (typeof input !== 'string' || !(client instanceof Client)) return input

  const variables = {
    'client-username': client.user.username,
    'client-id': client.user.id
  }

  return input.replace(
    new RegExp(`{(${Object.keys(variables).join('|')})}`, 'g'),
    substr => variables[substr.slice(1, -1) as keyof typeof variables]
  )

}


import { handleSlashCommands } from '../handlers/commandsHandler'


import ClientEvent from '../classes/ClientEvent'
const ready = new ClientEvent('ready', true)
.setListener(async client => {
  ready.log(`Hey, I'm ${client.user.username}!`)

  rotateActivities(client, 5)
  await handleSlashCommands(client)
})

export default ready