import { DefinedClientCommandOption, TypesEnum, ClientCommandOption, parseChatMessageOption } from '../classes/ClientCommand'
import { getClientConfig } from '../utils/clientConfig'
import { getCommand, executeCommand } from '../handlers/commandsHandler'

import ClientEvent from '../classes/ClientEvent'
const event = new ClientEvent('messageCreate')
.setListener(async message => {
  const prefix = getClientConfig('message_commands_prefix')
  if (typeof prefix === 'string' && prefix.length > 0 && message.content.startsWith(prefix)) {
    const commandString = message.content.slice(prefix.length)
    const commandArgs = commandString.match(/("[^"]*"|'[^']*')|("[^"]*$|'[^']*$)|\S+/g)
    if (!commandArgs) return

    const args = commandArgs.map(arg => {
      if (arg.startsWith('"') || arg.startsWith("'")) arg = arg.slice(1)
      if (arg.endsWith('"') || arg.endsWith("'")) arg = arg.slice(0, arg.length - 1)
      return arg
    })
    
    const rootCommandName = args.shift() as string

    let commandPath = rootCommandName
    if (args[0]) {
      if (getCommand(`${commandPath} ${args[0]}`)) commandPath += ' ' + args.shift()
      else if (args[1] && getCommand(`${commandPath} ${args[0]} ${args[1]}`)) commandPath += ' ' + args.splice(0, 2).join(' ')
    }

    const command = getCommand(commandPath)
    if (!command || !command.execute) return

    const options: { [key: string]: DefinedClientCommandOption[keyof typeof TypesEnum] | undefined } = {}

    if (command.options && command.chatMessageOptionsIndex) {
      if (args.length < command.options.filter(c => c.required).length) return message.reply(`> Sorry buddy, but you need to specify some parameters to execute this command.\n> - Usage: \`${prefix}${commandPath} ${command.usageString}\``)
      for (let i = 0; i < args.length; i++) {
        const optLabel: string = command.chatMessageOptionsIndex[i]
        const restOption = optLabel.startsWith('...')
        const optName = restOption ? optLabel.slice(3) : optLabel

        const option = command.options.find(o => o.name === optName) as ClientCommandOption<false>

        // Validates boolean option by it's name(s)
        if (option.type === TypesEnum.Boolean && [option.name, ...(option.nameLocalizations ? Object.values(option.nameLocalizations) : [])].some(n => n && n === args[i].toLowerCase())) {
          options[option.name] = true
          continue
        }

        const parsedValue = parseChatMessageOption(option.type, restOption ? args.slice(i).join(' ') : args[i], message)
        if (!parsedValue && option.required) return message.reply(`> Oh no, you need help?\n> Here is how to use this command: \`${prefix}${commandPath} ${command.usageString}\``)
        else if (parsedValue) {
          options[optName] = parsedValue
          if (restOption) break
        }
      }
    }

    await executeCommand(commandPath, message, options)
    .catch(async error => {
      console.warn(`Failed to execute command '${prefix}${commandPath}':`, message)
      console.error(error)
      
      await message.reply('> Command execution failed. Please, contact the Developer or an Administrator.')
    })
  }
})

export default event