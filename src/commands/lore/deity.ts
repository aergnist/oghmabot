import { MessageEmbed } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Deity, DeityModel } from "../../data/models";
import { fetchDeity, fetchDeityDetails } from "../../data/proxy";
import { getOghmabotEmbed } from "../../utils";

export class DeityCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'deity',
      group: 'lore',
      memberName: 'deity',
      description: 'Replies with the details of a deity in the Arelith pantheon.',
      args: [
        {
          key: 'deityQuery',
          type: 'string',
          prompt: 'Specify deity of which you want to find details.',
        },
      ],
    });
  }

  async run(msg: CommandoMessage, { deityQuery }: { deityQuery: string }): Promise<any> {
    const deityAR = await fetchDeity(deityQuery);

    if (deityAR) {
      const deityFR = await fetchDeityDetails(deityQuery, DeityModel);
      return msg.embed(this.createDeityEmbed({ ...deityFR, ...deityAR }));
    }

    return msg.say('Deity not found.');
  }

  createDeityEmbed = (deity: Deity): MessageEmbed => {
    const { name, titles, alignment, dogma, ar_aspects, ar_clergy_alignments, ar_wiki_url, thumbnail } = deity;
    const embed = getOghmabotEmbed();
    embed.setTitle(name);
    embed.setDescription(`*${titles && titles.join(', ')}*`);
    if (ar_wiki_url) embed.setURL(ar_wiki_url);
    if (thumbnail) embed.setThumbnail(thumbnail);
    embed.addFields(
      {
        name: 'Alignment',
        value: alignment,
      },
      {
        name: 'Clergy Alignments',
        value: ar_clergy_alignments ? ar_clergy_alignments.join(', ') : 'N/A',
      },
      {
        name: 'Aspects',
        value: ar_aspects ? ar_aspects?.join(', ') : 'N/A',
      },
      {
        name: ':book:',
        value: this.createDeityEmbedInfoField(deity),
      },
      {
        name: 'Dogma',
        value: dogma ? dogma : 'N/A',
      },
    );

    return embed;
  }

  createDeityEmbedInfoField = (deity: Deity): string => {
    const { symbol, portfolio, worshipers, domains } = deity;
    return `**Symbol:** ${symbol}\n`
      + `**Portfolio:** ${portfolio && portfolio.join(', ')}\n`
      + `**Worshipers:** ${worshipers && worshipers.join(', ')}\n`
      + `**Domains:** ${domains && domains.join(', ')}\n`;
  }
}
