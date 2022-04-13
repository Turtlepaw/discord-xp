import { DataSource, Repository } from "typeorm";
import "reflect-metadata";
import { Levels } from "./models/levels";
import { Client } from "discord.js";

export default class DiscordXp {
  private AppDataSource: DataSource;
  public repository: Repository<Levels>;

  private async save(...items: Levels[]){
    const res = await this.repository.save(items);
    return res[0];
  }

  private async first(item: Promise<Levels[]>){
    return (await item)[0];
  }

  private filter(userId: string, guildId: string){
    return {
      guildID: guildId,
      userID: userId
    };
  }

  constructor(source: DataSource) {
    if (!source) throw new TypeError("A datasource was not provided.");
    this.AppDataSource = source;
    this.repository = source.getRepository(Levels);
    return this;
  }

  async createUser(userId: string, guildId: string) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");

    const isUser = await this.first(this.repository.findBy({ userID: userId, guildID: guildId }));
    if (isUser) return isUser;

    const item = this.repository.create({
      guildID: guildId,
      lastUpdated: Date.now(),
      level: 0,
      userID: userId,
      xp: 0
    });

    return this.save(item);
  }

  async deleteUser(userId: string, guildId: string) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");

    const user = await this.first(this.repository.findBy({ userID: userId, guildID: guildId }));
    if (!user) return user;

    await this.repository.delete({
      userID: userId,
      guildID: guildId
    });

    return user;
  }

  async appendXp(userId: string, guildId: string, xp: number) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");
    //@ts-expect-error
    if (xp == 0 || !xp || isNaN(parseInt(xp))) throw new TypeError("An amount of xp was not provided/was invalid.");

    const user = await this.first(this.repository.findBy({ userID: userId, guildID: guildId }));

    if (!user) {
      const newUser = this.repository.create({
        userID: userId,
        guildID: guildId,
        xp: xp,
        level: Math.floor(0.1 * Math.sqrt(xp))
      });

      this.save(newUser);

      return (Math.floor(0.1 * Math.sqrt(xp)) > 0);
    };

    await this.repository.update({
      userID: userId,
      guildID: guildId
    }, {
      level: Math.floor(0.1 * Math.sqrt(user.xp)),
      xp: user.xp + parseInt(xp.toString(), 10),
      lastUpdated: Date.now()
    });

    return (Math.floor(0.1 * Math.sqrt(user.xp -= xp)) < user.level);
  }

  async appendLevel(userId: string, guildId: string, levels: number) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");
    if (!levels) throw new TypeError("An amount of levels was not provided.");

    const user = await this.first(this.repository.findBy({ userID: userId, guildID: guildId }));
    if (!user) return user;
    
    await this.repository.update({
      userID: userId,
      guildID: guildId
    }, {
      lastUpdated: Date.now(),
      xp: user.level * user.level * 100,
      level: parseInt((user.level + levels).toString(), 10)
    });

    return user;
  }

  async setXp(userId: string, guildId: string, xp: number) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");
    //@ts-expect-error
    if (xp == 0 || !xp || isNaN(parseInt(xp))) throw new TypeError("An amount of xp was not provided/was invalid.");

    const user = await this.first(this.repository.findBy({ userID: userId, guildID: guildId }));
    if (!user) return user;

    await this.repository.update({
      userID: userId,
      guildID: guildId
    }, {
      xp: xp,
      level: Math.floor(0.1 * Math.sqrt(user.xp)),
      lastUpdated: Date.now()
    });

    return user;
  }

  async setLevel(userId: string, guildId: string, level: number) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");
    if (!level) throw new TypeError("A level was not provided.");

    const user = await this.first(this.repository.findBy({ userID: userId, guildID: guildId }));
    if (!user) return user;

    await this.repository.update(this.filter(userId, guildId), {
      level: level,
      xp: level * level * 100,
      lastUpdated: Date.now()
    });

    return user;
  }

  async fetch(userId: string, guildId: string, fetchPosition: boolean = false) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");

    const user = await this.first(this.repository.findBy({ userID: userId, guildID: guildId }));
    if (!user) return user;

    let customUser = {
      userID: user.userID,
      guildID: user.guildID,
      xp: user.xp,
      cleanXp: null,
      level: user.level,
      position: null,
      lastUpdated: new Date(user.lastUpdated),
      cleanNextLevelXp: null
    };

    if (fetchPosition === true) {
      const leaderboard = await this.repository.findBy({
        guildID: guildId
      });

      const sortedLeaderboard = leaderboard.sort().reverse();

      customUser.position = leaderboard.findIndex(i => i.userID === userId) + 1;
    }

    
    /* To be used with canvacord or displaying xp in a pretier fashion, with each level the cleanXp stats from 0 and goes until cleanNextLevelXp when user levels up and gets back to 0 then the cleanNextLevelXp is re-calculated */
    customUser.cleanXp = user.xp - this.xpFor(user.level);
    customUser.cleanNextLevelXp = this.xpFor(user.level + 1) - this.xpFor(user.level);
    
    return customUser;
  }

  async subtractXp(userId: string, guildId: string, xp: number) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");
    //@ts-expect-error
    if (xp == 0 || !xp || isNaN(parseInt(xp))) throw new TypeError("An amount of xp was not provided/was invalid.");

    const user = await this.first(this.repository.findBy({ userID: userId, guildID: guildId }));
    if (!user) return user;

    await this.repository.update(this.filter(userId, guildId), {
      xp: user.xp - xp,
      level: Math.floor(0.1 * Math.sqrt(user.xp)),
      lastUpdated: Date.now()
    });

    return user;
  }

  async subtractLevel(userId: string, guildId: string, levels: number) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");
    if (!levels) throw new TypeError("An amount of levels was not provided.");

    const user = await this.first(this.repository.findBy({ userID: userId, guildID: guildId }));
    if (!user) return user;

    await this.repository.update(this.filter(userId, guildId), {
      lastUpdated: Date.now(),
      level: user.level - levels,
      xp: user.level * user.level * 100
    });

    return user;
  }

  async fetchLeaderboard(guildId: string, limit: number = 10) {
    if (!guildId) throw new TypeError("A guild id was not provided.");
    if (!limit) throw new TypeError("A limit was not provided.");

    var users = await this.repository.findBy({
      guildID: guildId
    });

    return users.slice(0, limit);
  }

  async computeLeaderboard(client: Client, leaderboard: Levels[], fetchUsers: boolean = false) {
    if (!client) throw new TypeError("A client was not provided.");
    if (!leaderboard) throw new TypeError("A leaderboard id was not provided.");
    if (leaderboard.length < 1) return [];

    const computedArray: {
      guildID: string;
      userID: string;
      xp: number;
      level: number;
      position: number;
      username: string;
      discriminator: string;
    }[] = [];

    if (fetchUsers) {
      for (const key of leaderboard) {
        const user = await client.users.fetch(key.userID) || { username: "Unknown", discriminator: "0000" };
        computedArray.push({
          guildID: key.guildID,
          userID: key.userID,
          xp: key.xp,
          level: key.level,
          position: (leaderboard.findIndex(i => i.guildID === key.guildID && i.userID === key.userID) + 1),
          username: user.username,
          discriminator: user.discriminator
        });
      }
    } else {
      leaderboard.map(key => computedArray.push({
        guildID: key.guildID,
        userID: key.userID,
        xp: key.xp,
        level: key.level,
        position: (leaderboard.findIndex(i => i.guildID === key.guildID && i.userID === key.userID) + 1),
        username: client.users.cache.get(key.userID) ? client.users.cache.get(key.userID).username : "Unknown",
        discriminator: client.users.cache.get(key.userID) ? client.users.cache.get(key.userID).discriminator : "0000"
      }));
    }

    return computedArray;
  }

  xpFor(targetLevel: number) {
    //@ts-expect-error
    if (isNaN(targetLevel) || isNaN(parseInt(targetLevel, 10))) throw new TypeError("Target level should be a valid number.");
    //@ts-expect-error
    if (isNaN(targetLevel)) targetLevel = parseInt(targetLevel, 10);
    if (targetLevel < 0) throw new RangeError("Target level should be a positive number.");
    return targetLevel * targetLevel * 100;
  }

   async deleteGuild(guildId: string) {
    if (!guildId) throw new TypeError("A guild id was not provided.");

    const guild = await this.repository.findBy({ guildID: guildId });
    if (!guild) return false;

    await this.repository.delete({
      guildID: guildId
    });

    return guild;
  }
}

export const Entity = Levels;