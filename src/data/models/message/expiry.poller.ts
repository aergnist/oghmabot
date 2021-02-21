import { TextChannel } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';
import { BasePoller } from '../../common';
import { MessageExpiry, MessageExpiryModel } from './expiry.model';

export class MessageExpiryPoller extends BasePoller<MessageExpiry> {
  constructor(client: CommandoClient, interval: number = 20000) {
    super(client, interval);
    this.activatePolling();
  }

  public fetch = async (messageId: string): Promise<MessageExpiry | undefined> => this.cache.get(messageId) ?? await MessageExpiryModel.get(messageId);

  public pollAndUpdate = async (): Promise<void> => {
    const expiries = await MessageExpiryModel.getAll();
    for (const expiry of expiries) {
      const { messageId, expires } = expiry;
      const expired = new Date(Date.now()) <= expires;

      if (expired) {
        this.deleteExpiredMessage(expiry);
      } else {
        this.cache.set(messageId, expiry);
      }
    }
  }

  private deleteExpiredMessage = async (expiry: MessageExpiry): Promise<void> => {
    console.log('[MessageExpiryPoller] Found expired message, deleting.');
    const { messageId, channelId } = expiry;
    const channel = await this.client.channels.fetch(channelId) as TextChannel | undefined;
    const message = await channel?.messages.fetch(messageId);
    await message?.delete();
    await MessageExpiryModel.destroy({ where: { messageId } });
  }
}