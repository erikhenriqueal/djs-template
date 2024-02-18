import { ApplicationCommandOptionType } from 'discord.js'

import { ClientCommandAutocompletableOption, DefinedClientCommandOption, TypesEnum } from '../classes/ClientCommand'
import { executeCommand, getCommand } from '../handlers/commandsHandler'

import ClientEvent from '../classes/ClientEvent'

const event = new ClientEvent('interactionCreate')
event.setListener(async interaction => {
  if (interaction.isChatInputCommand()) {
    let commandPath = interaction.commandName

    let options = interaction.options.data
    const subcommandGroup = options.find(o => o.type === ApplicationCommandOptionType.SubcommandGroup)
    if (subcommandGroup) {
      commandPath += ' ' + subcommandGroup.name
      if (subcommandGroup.options) options = subcommandGroup.options
    }

    const subcommand = options.find(o => o.type === ApplicationCommandOptionType.Subcommand)
    if (subcommand) {
      commandPath += ' ' + subcommand.name
      if (subcommand.options) options = subcommand.options
    }

    const command = getCommand(commandPath)
    if (!command) return await interaction.reply({
      content: `> Command \`/${commandPath}\` was not found.`,
      ephemeral: true
    })

    const defOptions: { [key: string]: DefinedClientCommandOption[keyof typeof TypesEnum] | undefined } = {}

    for (const op of options) defOptions[op.name] = op.channel || (op.user && op.member ? { user: op.user, member: op.member } : op.user) || op.role || op.attachment || op.value

    await executeCommand(commandPath, interaction, defOptions)
    .catch(async error => {
      console.warn(`Failed to execute command '/${commandPath}':`, interaction)
      console.error(error)
  
      const content = '> Command execution failed. Please, contact the Developer or an Administrator.'
      
      if (interaction.replied || interaction.deferred) await interaction.editReply({ content, embeds: [] })
      else await interaction.reply({ content, embeds: [], ephemeral: true })
    })
  } else if (interaction.isAutocomplete()) {
    let commandPath = interaction.commandName

    let options = interaction.options.data
    const subcommandGroup = options.find(o => o.type === ApplicationCommandOptionType.SubcommandGroup)
    if (subcommandGroup) commandPath += ' ' + subcommandGroup.name

    const subcommand = (subcommandGroup?.options || options).find(o => o.type === ApplicationCommandOptionType.Subcommand)
    if (subcommand) commandPath += ' ' + subcommand.name

    const command = getCommand(commandPath)
    if (!command) return await interaction.respond([ ])
  
    const focused = interaction.options.getFocused(true)
    const option = command.options?.find(o => o.name === focused.name) as ClientCommandAutocompletableOption
    if (!option || !option.autocomplete || typeof option.onAutocomplete !== 'function') return await interaction.respond([ ])

    return await option.onAutocomplete(interaction, focused.value)
  }
})

export default event