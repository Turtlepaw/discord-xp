import { Client } from "discord.js";
import { DataSource, Repository } from "typeorm";
import { Levels } from "./src/models/levels";

declare module "discord-xp-typeorm" {
    type leaderboardUser = {
        guildID: string,
        userID: string,
        xp: number,
        level: number,
        position: number,
        username: string,
        discriminator: `#${number}`
    };

    type guildUser = {
        userID: string,
        guildID: string,
        xp: number,
        cleanXp: number,
        level: number,
        position: number,
        lastUpdated: Date,
        cleanNextLevelXp: number
    };

    export default class DiscordXp {
        public repository: Repository<Levels>;
        private AppDataSource: DataSource;

        private first(...items: Levels[]): Levels;
        private save(...items: Promise<Levels>[]): Promise<Levels>;
        private filter(userId: string, guildId: string): {
            userID: string,
            guildID: string
        };

        setURL(src: DataSource, RepositoryName?: string): DiscordXp;
        createUser(userId: string, guildId: string): Promise<Levels>;
        deleteUser(userId: string, guildId: string): Promise<Levels>;
        appendXp(userId: string, guildId: string, xp: number): Promise<number>;
        appendLevel(userId: string, guildId: string, levels: number): Promise<Levels>;
        setXp(userId: string, guildId: string, xp: number): Promise<Levels>;
        setLevel(userId: string, guildId: string, level: number): Promise<Levels>;
        fetch(userId: string, guildId: string, fetchPosition: boolean): Promise<guildUser>;
        subtractXp(userId: string, guildId: string, xp: number): Promise<Levels>;
        subtractLevel(userId: string, guildId: string, levels: number): Promise<Levels>;
        fetchLeaderboard(guildId: string, limit: number): Promise<Levels[]>
        computeLeaderboard(client: Client, leaderboard: Levels[], fetchUsers: boolean): Promise<guildUser[]>;
        xpFor(targetLevel: number): number;
        deleteGuild(guildId: string): Promise<Levels>;
    }
}