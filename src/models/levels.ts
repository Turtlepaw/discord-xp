import { PrimaryColumn, Column, Entity } from "typeorm";

@Entity()
export class Levels {
    @PrimaryColumn()
    guildID!: string;

    @Column()
    userID!: string;

    @Column()
    xp!: number;

    @Column()
    level!: number;

    @Column()
    lastUpdated!: number;
}