# Discord Bot Template
### For `(Java || Type)Script`
### Wrote in TypeScript

## Features
### [Classes](./src/classes)
> [ClientCommand](./src/classes/ClientCommand.ts)
> - Supports both Chat Message and Discord's Slash commands simultaneously.
> - Function Based listeners to handle Commands/Subcommands executions, Options usage and Autocompletes.
### [Commands](./src/commands)
> This path is made to handle all your [ClientCommands](./src/classes/ClientCommand.ts). The file [commands.ts](./src/commands.ts) is responsible to automatically handle the commands in this path.
### [Events](./src/events)
> Made for you to create your [ClientEvents](./src/classes/ClientEvent.ts), this path is read by [events.ts](./src/events.ts) to listen to all your events.
### [Handlers](./src/handlers)
> Includes simple functions to help with handling events and commands.
### [Utils](./src/utils)
> Includes some utilities functions to manipulate and validate different types of data and structures, including [Environment Variables](./.env.template) configuration.

## Client Settings
> You can use [clientConfig.json](./clientConfig.json) to define some custom settings for your client.  
> Additionally, you can use [clientConfig.ts](./src/utils/clientConfig.ts) to manipulate this file using code.

## Usage
> This tamplate was made on Windows, but you can change the scripts in [package.json](./package.json) to fit for your OS.
### DevMode
You can run you application in developing mode using this command:
```bash
npm run dev
```
But... You can also use this for clear you client application commands before running in dev mode:
```bash
npm run clear-dev
```
### Production Mode
```bash
npm start
```
Running `start` will automatically build your TypeScript code before running it. After it, the commands are automatically cleared. You can change this behavior in [package.json](./package.json).

## Next Features:
> - Create Stated Messages (messages that automatically updates when some of these variables are changed)
> - Add Interface Context Menu Commands
> - Implement Interactions (like Buttons, Selection menu, etc.)