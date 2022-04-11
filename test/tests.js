const { DataSource } = require("typeorm");
const { Entity, default: DiscordXP } = require("../dist");

const AppDataSource = new DataSource({
    type: "sqlite",
    database: "./test/database.sqlite",
    synchronize: true,
    logging: false,
    entities: [Entity],
    migrations: [],
    subscribers: [],
}).initialize().then(async (db) => {
    //Varibles
    const userId = "main_user";
    const guildId = "guildId";
    //Connect
    const xp = new DiscordXP().setURL(db);

    //Create a user
    const createdUser = await xp.createUser(userId, guildId);
    console.log(createdUser);

    //Edit a user
    const editedUser = await xp.appendXp(userId, guildId, 56);
    console.log(editedUser);
    
    //Test adding another user for fetchPostion
    const testUser = await xp.createUser("test_user", guildId);
    await xp.appendLevel("test_user", guildId, 10);

    //Fetch a user
    const userWithPosition = await xp.fetch(userId, guildId, true);
    const user = await xp.fetch(userId, guildId);
    console.log(user, userWithPosition);
});