# Oghmabot

Oghmabot is a Discord chatbot running on [Node.js](nodejs.org/) which is written and built with [TypeScript](https://www.typescriptlang.org/). Installing Node.js will include everything that's required to develop.

![oghmabot](https://user-images.githubusercontent.com/46282792/104947799-9563c700-59bc-11eb-9408-a94dbc7be2e3.png)

## Getting started

1. Clone the repo.
2. Run `npm install` from the root folder, where `package.json` is located.

All necessary dependencies should then be installed. To run the project locally it must first be built with `npm run build`, then enter `npm start`. The effects of both `build` and `start` are defined in `package.json`.

Running the project immediately will fail, however, until you've added a file `.env` which will contain necessary environment variables. It should look more or less like the following.

```env
BOT_OWNER=<id of the Discord user that owns the chatbot -- NOT required>
BOT_TOKEN=<secret bot token granted by Discord -- REQUIRED>
BOT_STATUS_CHANNEL=<id of a Discord channel where the bot will notify when it has logged in -- NOT required>
DATABASE_URL=<secret postgres connection string -- REQUIRED>
```

## Relevant docs
- [TypeScript](https://www.typescriptlang.org/docs)
- [discord.js](https://discord.js.org/#/docs/main/stable/general/welcome)
- [discord.js-commando](https://discord.js.org/#/docs/commando/master/general/welcome)
- [Sequelize](https://sequelize.org/master/)
