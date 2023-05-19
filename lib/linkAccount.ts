import { getMinecraftUser, getTwitchUserFromUsername } from "./accountUtils.js";
import { DiscordUser, MinecraftUser, TwitchUser, User } from "./interfaces.js";

import { DataBaseResponse, DatabaseHandler } from './databaseHandler.js';


export interface LinkSuccess<T> {
    success: boolean;
    data?: T;
    error?: any;
}

export interface PlatformInfo {
    platform: string;
    username: string;
    id?: string;
}

export class LinkAccount {
    // Properties
    public db: DatabaseHandler;

    // Constructor
    constructor(database: any) {
        this.db = new DatabaseHandler(database);
    }

    // Methods
    logger(platform: string, channelId: string, userId: string, message: string): void {
        message = message.replace(/\n/g, "\\n");
        console.log(`[${new Date().toISOString()}] [NN Account Linker] [${platform}] [${channelId}] [${userId}]: ${message}`);
    }

    async linkTwitchAccount(fromPlatform: PlatformInfo, toPlatform: PlatformInfo, user: User): Promise<LinkSuccess<string>> {
        // get twitchUser from twitchUsername
        const twitchUser: TwitchUser = await getTwitchUserFromUsername(toPlatform.username);

        if (!twitchUser) {
            return { success: false, error: "Invalid Twitch username"};
        }

        // Get user from TwitchUser
        let dbresult: DataBaseResponse<User> = await this.db.getUser("twitch", "id", twitchUser.id);
        let twitchUserFromDB: User;
        if (dbresult.success === true) {
            twitchUserFromDB = dbresult.data;
        } else if (dbresult.success === false) {
            console.log(dbresult.error);
            return { success: false, error: `There is no link pending for this Twitch account, please link your ${fromPlatform.platform} account in Twitch chat:\n\`\`\`!link ${fromPlatform.platform} username\`\`\`` };
        }

        // Check to see if linking the right user
        if (user.discord.username + "#" + user.discord.discriminator === twitchUserFromDB?.discord?.tag?.split("?confirm?")[0]) {
            // Merge old user data into new user -- TODO: make this better

            dbresult = await this.db.deleteUser(twitchUserFromDB.id);

            // Remove troublesome properties
            delete user["_id"];
            delete twitchUserFromDB["_id"];
            delete twitchUserFromDB["id"];
            delete twitchUserFromDB["discord"];
            
            dbresult = await this.db.updateUser(user.id, { ...user, ...twitchUserFromDB });

        // Message if no link pending
        } else {
            return { success: false, error: `There is no link pending for this Twitch account, please link your ${fromPlatform.platform} account in Twitch chat:\n\`\`\`!link ${fromPlatform.platform} username\`\`\`` };
        }

        if (dbresult?.error) {
            console.log(dbresult.error);
            return { success: false, error: "An error occurred while linking your account"};
        }

        return { success: true, data: "Your Twitch account has been linked" };
    }

    async linkDiscordAccount(fromPlatform: PlatformInfo, toPlatform: PlatformInfo, user: User): Promise<LinkSuccess<string>> {
        const discordUser: DiscordUser = {
            id: "",
            tag: `${toPlatform.username}?confirm?${fromPlatform.username}`,
        }

        let dbresult: DataBaseResponse<User> = await this.db.updateUser(user.id, { discord: discordUser });

        if (dbresult?.error) {
            console.log(dbresult.error);
            return { success: false, error: "An error occurred while linking your account"}
        }

        return { success: true, data: `Pending confirmation of your Discord account, please confirm the account link using our Discord Bot: /link twitch ${fromPlatform.username}`};
    }

    async linkMinecraftAccount(fromPlatform: PlatformInfo, toPlatform: PlatformInfo, user: User): Promise<LinkSuccess<string>> {
        const minecraftUser: MinecraftUser = await getMinecraftUser(toPlatform.username);

        if (!minecraftUser) {
            return { success: false, error: "Invalid Minecraft username"}
        }

        // Check if account is already linked
        let dbresult: DataBaseResponse<User> = await this.db.getUser("minecraft", "id", minecraftUser.id);

        if (dbresult.success === false && dbresult?.error !== "User not found") {
            console.log(dbresult.error);
            return { success: false, error: "An error occurred while linking your account"}
        } else if (dbresult.success === true && dbresult.data.id !== user.id) {
            return { success: false, error: "This Minecraft account has already been linked" };
        }

        dbresult = await this.db.updateUser(user.id, { minecraft: minecraftUser });

        if (dbresult?.error) {
            console.log(dbresult.error);
            return { success: false, error: "An error occurred while linking your account"}
        }

        const accountType = toPlatform.username.match(/^\.+[^\s]+$/) ? 'Minecraft Bedrock' : 'Minecraft Java';

        return { success: true, data: `Your ${accountType} account has been linked` };
    }
    
    async linkAccount(fromPlatform: PlatformInfo, toPlatform: PlatformInfo, user: User): Promise<LinkSuccess<string>> {
        try {
            let dbresult: DataBaseResponse<User>;
            switch (toPlatform.platform) {
                // Minecraft
                case 'minecraft':
                    return await this.linkMinecraftAccount(fromPlatform, toPlatform, user);

                // Link Twitch Account
                case 'twitch':
                    return await this.linkTwitchAccount(fromPlatform, toPlatform, user);

                // Link Discord Account
                case 'discord':
                    return await this.linkDiscordAccount(fromPlatform, toPlatform, user);

                // Generic catch-all
                default:
                    dbresult = await this.db.updateUser(user.id, { [toPlatform.platform]: toPlatform.username });

                    if (dbresult?.error) {
                        console.log(dbresult.error);
                        return { success: false, error: "An error occurred while linking your account"}
                    } else {
                        return { success: true, data: `Your ${toPlatform} account has been linked` };
                    }
            }

        } catch (error) {
            console.log(error);
            return { success: false, error: error };
        }
    }
}
