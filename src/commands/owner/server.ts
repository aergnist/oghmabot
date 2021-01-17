import { Message } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Server, ServerModel } from "../../data";

import { fetchServer, isValidBeamdogIdentifier } from "../../data/proxy";

interface ServerCommandArgs {
  descriptor: string;
  identifier: string;
  input?: string;
}

export class ServerCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'server',
      group: 'owner',
      memberName: 'server',
      description: 'Add and manage known servers.',
      ownerOnly: true,
      args: [
        {
          key: 'descriptor',
          prompt: 'new/remove/alias/href/img',
          type: 'string',
          validate: (text: string) => [
            'new', 'add', 'remove', 'rm', 'alias', 'href', 'img',
          ].includes(text.toLowerCase().trim()),
        },
        {
          key: 'identifier',
          prompt: 'Please supply a valid server identifier.',
          type: 'string',
          validate: isValidBeamdogIdentifier,
        },
        {
          key: 'input',
          prompt: 'Varies with usage.',
          type: 'string',
          default: '',
        },
      ],
    });
  }

  async run(msg: CommandoMessage, args: ServerCommandArgs): Promise<any> {
    const { descriptor } = args;

    if (descriptor === 'new' || descriptor === 'add') {
      return await this.addNewServer(msg, args);
    }

    if (descriptor === 'remove' || descriptor === 'rm') {
      return await this.removeServer(msg, args);
    }

    if (descriptor === 'alias') {
      return await this.addAlias(msg, args);
    }

    if (descriptor === 'href' || descriptor === 'link') {
      // return await this.setServerLink(msg, args);
    }

    if (descriptor === 'img') {
      // return await this.setServerImage(msg, args);
    }
  }
  async addNewServer(msg: CommandoMessage, args: ServerCommandArgs): Promise<Message | CommandoMessage> {
    const { identifier } = args;
    const server = ServerModel.fromBeamdogAPIResponse(await fetchServer(identifier));

    try {
      if (await ServerModel.serverExists(server)) {
        return msg.say('Server already exists.');
      } else {
        await ServerModel.addServer(server);
        return msg.say(this.formatServerAddedReply(server));
      }
    } catch (err) {
      console.error(err);
    }

    return msg.say('Failed to add new server.');
  }

  async removeServer(msg: CommandoMessage, args: ServerCommandArgs): Promise<Message | CommandoMessage> {
    const { identifier } = args;

    try {
      const server = await ServerModel.getServerById(identifier);
      if (server === undefined) return msg.say('Cannot remove that which does not exist.');
      
      if (await ServerModel.removeServer(server)) return msg.say('Successfully removed server.');
    } catch (err) {
      console.error(err);
    }

    return msg.say('Failed to remove server.');
  }

  async addAlias(msg: CommandoMessage, args: ServerCommandArgs): Promise<Message | CommandoMessage> {
    const { identifier, input } = args;
    if (input === undefined) return msg.say('One or more aliases must be provided.');

    try {
      const server = await ServerModel.getServerById(identifier);
      if (server === undefined) return msg.say('No known server by that identifier.');

      await ServerModel.update({
        alias: server.alias
          ? [...server.alias, ...input.toLowerCase().split(' ')]
          : input.toLowerCase().split(' '),
      }, {
        where: {
          id: server.id,
        }
      });
      
      return msg.say('Successfully added new aliases.');
    } catch (err) {
      console.error(err);
    }

    return msg.say('Failed to add alias.');
  }

  formatServerAddedReply = (server: Server): string => (
    'Server added.'
    + '\n```'
    + `\nID: ${server.id}`
    + `\nNAME: ${server.name}`
    + `\nIP: ${server.ip}`
    + `\nPORT: ${server.port}`
    + `\nALIAS: ${server.alias}`
    + `\nHREF: ${server.href}`
    + `\nIMG: ${server.img}`
    + '\n```'
  );
}