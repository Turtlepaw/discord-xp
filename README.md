# Discord XP Typeorm

This is a modified verison of [discord-xp](https://npm.im/discord-xp) to work with [typeorm](https://npm.im/typeorm).

## Installation
### NPM
```shell
npm i discord-xp-typeorm
```
### Yarn
```shell
yarn add discord-xp-typeorm
```

## Usage
This is a quick example of how DiscordXpTypeorm works!

```js
const typeormXP = require("discord-xp-typeorm");
const typeorm = require("typeorm");
//Create your datasource or import an existing one
//So far only tested with sqlite
const DataSource = new typeorm.DataSource({
    type: "sqlite",
    database: "database.sqlite",
    synchronize: true,
    logging: false,
    entities: [typeormXP.Entity], //Required: use our level entity
    migrations: [],
    subscribers: [],
}).initialize();
const yourXP = new typeormXP();

yourXP.appendXp(
    "USER_SNOWFLAKE_ID", //The user Id
    "GUILD_SNOWFLAKE_ID", //The guild Id
    100 //The XP you wish to add
);
//boolean
yourXP.subtractXp(
    "USER_SNOWFLAKE_ID",
    "GUILD_SNOWFLAKE_ID",
    99
);
//boolean or typeormXP.Entity
yourXP.fetch(
    "USER_SNOWFLAKE_ID",
    "GUILD_SNOWFLAKE_ID"
);
//false or object:
//{
// userID: string,
// guildID: string,
// xp: number,
// cleanXp: any,
// level: number,
// position: any,
// lastUpdated: Date,
// cleanNextLevelXp: any
//}
```