import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { BuildEmbed } from '../../client/embeds/build.embed';
import { Build, BuildModel } from '../../data/models';
import { stripCommandNotation } from '../../utils';

export class BuildCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'build',
      group: 'mechanics',
      memberName: 'build',
      description: 'Replies with links to relevant character builds.',
      details: 'The command returns builds found on the Arelith Wiki\'s Character Builds page. The search uses simple string matching.',
      aliases: ['builds'],
      args: [
        {
          key: 'query',
          type: 'string',
          prompt: 'What build should I search for?',
          parse: stripCommandNotation,
        },
      ],
      examples: [
        '-build ranger(21) kenji',
        '-build firbolg druid',
      ],
    });
  }

  async run(msg: CommandoMessage, { query }: { query: string }): Promise<Message> {
    try {
      const builds = await BuildModel.fetchAll(query);
      const foundBuilds = this.sortBuildsByQueryMatch(builds, query);
      if (foundBuilds.length) return msg.reply(new BuildEmbed(foundBuilds.slice(0, 10)));
    } catch (error) {
      console.error('[BuildCommand] Unexpected error.', error);
    }

    return msg.reply('No builds were found.');
  }

  private sortBuildsByQueryMatch(builds: Build[], query: string): Build[] {
    return builds.sort((a, b) => this.matchRating(b, query.trim()) - this.matchRating(a, query.trim()));
  }

  private matchRating(build: Build, query: string): number {
    const { name, race, classes, author, description } = build;
    const buildStr = [name, race, ...classes, author, description].filter(Boolean).join(' ').toLowerCase().trim();
    return query.toLowerCase().trim().split(' ').reduce((matches, q) => (buildStr.match(new RegExp(q, 'g'))?.length ?? 0) + matches, 0);
  }
}
