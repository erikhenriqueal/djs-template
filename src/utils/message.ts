import { InteractionReplyOptions, LocaleString, MessagePayload, MessageReplyOptions } from 'discord.js'

export type MessageContentTypes = string | MessagePayload | MessageReplyOptions | (InteractionReplyOptions & { fetchReply?: true; });
export type MultilanguageMessages<T extends MessageContentTypes> = { [key in LocaleString]?: T; };
export function multilangMessage<T extends MessageContentTypes = MessageContentTypes>(messages: MultilanguageMessages<T>, lang?: LocaleString): T | undefined {
  if (lang && lang in messages) return messages[lang]
  return undefined
}