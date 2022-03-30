// Type definitions for discord-xp v1.1.8
// Project: https://github.com/MrAugu/discord-xp
// Definitions by: Nico Finkernagel <https://github.com/gruselhaus/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

import { Client, Guild } from "discord.js";

type User = {
  userID: string;
  guildID: string;
  xp: number;
  level: number;
  lastUpdated: Date;
  cleanXp: number;
  cleanNextLevelXp: number;
};

type LeaderboardUser = {
  guildID: string;
  userID: string;
  xp: number;
  level: number;
  position: number;
  username: String | null;
  discriminator: String | null;
};

declare module "discord-xp" {
  export default class DiscordXp {
    static setURL(dbURL: string): Promise<typeof import("mongoose")>;
    static createUser(userId: string, guildId: string): Promise<User>;
    static deleteUser(userId: string, guildId: string): Promise<User>;
    static deleteGuild(guildId: string): Promise<Guild>;
    static appendXp(userId: string, guildId: string, xp: number): Promise<boolean>;
    static appendLevel(userId: string, guildId: string, levels: number): Promise<User>;
    static setXp(userId: string, guildId: string, xp: number): Promise<User>;
    static setLevel(userId: string, guildId: string, level: number): Promise<User>;
    static fetch(userId: string, guildId: string, fetchPosition?: boolean): Promise<User>;
    static subtractXp(userId: string, guildId: string, xp: number): Promise<User>;
    static subtractLevel(userId: string, guildId: string, level: number): Promise<User>;
    static fetchLeaderboard(guildId: String, limit: number): Promise<User[] | []>;
    static computeLeaderboard(client: Client, leaderboard: User[], fetchUsers?: boolean): Promise<LeaderboardUser[] | []>;
    static xpFor(targetLevel: number): number;
  }
}
