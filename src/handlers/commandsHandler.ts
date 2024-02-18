import ClientCommand, { ClientSingleSubCommand, DefinedClientCommandOption, TypesEnum } from '../classes/ClientCommand'
import {
  Client,
  REST,
  Routes,
  ChatInputCommandInteraction as DiscordChatInputCommandInteraction,
  Message as DiscordMessage
} from 'discord.js'


import { uniques } from '../utils/array'


import commands from '../commands'


export function getCommand(commandPath: string): ClientCommand | ClientSingleSubCommand | null {
  if (typeof commandPath !== 'string' || commandPath.trim().length === 0) return null
  const args = commandPath.trim().split(' ')
  const rootCommandName = args.shift() as string
  const rootCommand: ClientCommand | undefined = commands.find(c => [c.name, ...c.aliases].includes(rootCommandName))
  if (rootCommand) {
    if (args.length === 0) return rootCommand
    if (!rootCommand.subcommands) return null
    
    const subCommandName = args.shift() as string
    const subCommand = rootCommand.subcommands.find(sub => sub.name === subCommandName)
    if (subCommand) {
      if (args.length === 0) {
        if (!('execute' in subCommand)) return null
        return subCommand
      }

      if (!('groupCommands' in subCommand) || !subCommand.groupCommands) return null

      const internalCommandName = args.shift() as string
      const internalCommand = subCommand.groupCommands.find(sub => sub.name === internalCommandName) || null
      return internalCommand
    }
  }

  return null
}
export async function executeCommand<Origin extends DiscordMessage | DiscordChatInputCommandInteraction>(commandPath: string, origin: Origin, options: { [key: string]: DefinedClientCommandOption[keyof typeof TypesEnum] | undefined }): Promise<any> {
  if (!(origin instanceof DiscordMessage || origin instanceof DiscordChatInputCommandInteraction)) throw new SyntaxError('Invalid origin type')

  const rootCommandName = commandPath.split(/\s+/)[0] as string
  const rootCommand = getCommand(rootCommandName) as ClientCommand
  if (!rootCommand) throw new Error('Invalid command name')

  if (origin instanceof DiscordMessage) {
    if (!rootCommand.allowMessage) throw new Error('Invalid origin')
    if (!rootCommand.DMAllowed && !origin.inGuild()) throw new Error('Command is not allowed on guilds')
    if (origin.inGuild()) {
      if (rootCommand.guilds.length > 0 && !rootCommand.guilds.includes(origin.guildId)) throw new Error('Untrusted guild')
      if (
        rootCommand.whitelist?.permissions
        && !origin.member?.permissionsIn(origin.channel).has(rootCommand.whitelist?.permissions, true)
      ) throw new Error('Untrusted user')
    }
  } else if (!rootCommand.allowSlash) throw new Error('Untrusted origin')
  
  const userId = (origin instanceof DiscordMessage ? origin.author : origin.user).id
  if (rootCommand.whitelist) {
    if (
      rootCommand.whitelist.users
      && rootCommand.whitelist.users.length > 0
      && !rootCommand.whitelist.users.includes(userId)
    ) throw new Error('Untrusted user')
    
    if (
      origin.inGuild()
      && rootCommand.whitelist.roles
      && rootCommand.whitelist.roles?.length > 0
      && !rootCommand.whitelist.roles.some(r => !!origin.guild?.roles.resolve(r))
    ) throw new Error('Untrusted user')
  }
  if (rootCommand.blacklist) {
    if (
      rootCommand.blacklist.users
      && rootCommand.blacklist.users.length > 0
      && rootCommand.blacklist.users.includes(userId)
    ) throw new Error('Untrusted user')

    if (
      origin.inGuild()
      && rootCommand.blacklist.roles
      && rootCommand.blacklist.roles.length > 0
      && rootCommand.blacklist.roles.some(r => !!origin.guild?.roles.resolve(r))
    ) throw new Error('Untrusted user')
  }

  if (Object.getPrototypeOf(options) !== Object.prototype) throw new SyntaxError('Options must be a valid object')

  const command = getCommand(commandPath)
  if (typeof command?.execute !== 'function') throw new Error('Command execution function is missing')
  return await command.execute(origin, options)
}


export async function handleSlashCommands(client: Client<true>, silent?: boolean) {
  const slashCommands = commands.filter(c => c.allowSlash)
  console.log(`[ Commands - handleSlashCommands ] Loading ${slashCommands.length} command(s)`)

  const guilds = uniques(slashCommands.flatMap(c => c.guilds))
  const globalCommands = slashCommands.filter(c => c.guilds.length === 0)

  const rest = new REST().setToken(client.token)

  if (guilds.length > 0) for (const guildId of guilds) {
    const guildCommands = slashCommands.filter(c => c.guilds.includes(guildId))
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, guildId),
      { body: guildCommands.map(c => c.slash?.toJSON()) }
    ).then((data: any) => {
      if (!silent) console.log(`[ Commands - handleSlashCommands ] Guild '${guildId}' loaded ${data.length} command(s)`)
    }).catch(error => {
      console.warn(`[ Commands - handleSlashCommands ] Error on handling slash commands for guild '${guildId}'`)
      throw error
    })
  }

  if (globalCommands.length > 0) await rest.put(
    Routes.applicationCommands(client.user.id),
    { body: globalCommands.map(c => c.slash?.toJSON()) }
  ).then((data: any) => {
    if (!silent) console.log(`[ Commands - handleSlashCommands ] ${data.length} global command(s) loaded`)
  }).catch(error => {
    console.warn(`[ Commands - handleSlashCommands ] Error on handling slash commands`)
    throw error
  })
}