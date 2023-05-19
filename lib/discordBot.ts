import { Client, Collection, Events, GatewayIntentBits, Message, REST, Routes, SlashCommandBuilder } from 'discord.js';


import { LinkAccount, LinkSuccess, PlatformInfo } from './linkAccount.js';
import { DataBaseResponse, DatabaseHandler } from './databaseHandler.js';
import { DiscordUser, User } from './interfaces.js';
import linkLocales from '../localizations/link.json' assert { type: "json" };


export class DiscordBot {
    // Properties
    private token: string;
    private clientId: string;
    public db: DatabaseHandler;

    // Constructor
    constructor(database: any) {
        this.token = <string>process.env.DISCORD_TOKEN;
        this.clientId = <string>process.env.DISCORD_CLIENT_ID;
    }

    // Methods
    logger(platform: string, channelId: string, userId: string, message: string): void {
        message = message.replace(/\n/g, "\\n");
        console.log(`[${new Date().toISOString()}] [Bee Name Generator] [${platform}] [${channelId}] [${userId}]: ${message}`);
    }

    async chatHandler(msg: Message) {
        try {
            if (msg.author.bot) return;
            if (msg.content.startsWith("!")) {
                this.logger("discord", msg.guild.id, msg.author.id, msg.content);

                // Parse command
                const cmd = msg.content.match(/([^\s]+)/g);
                const discordUser: DiscordUser = msg.author;

                let message: string;
                switch (cmd[0].toLowerCase()) {
                    // Account link command
                    case '!link':
                        if (cmd.length == 3) {
                            const platform = cmd[1].toLowerCase();
                            const username = cmd[2];

                            let dbresult: DataBaseResponse<User> = await this.db.getUser("discord", "id", discordUser.id);
                            let user: User;
                            if (dbresult.success === false && dbresult.error === "User not found") {
                                dbresult = await this.db.createUser({ id: "", discord: <DiscordUser>discordUser });
                                if (dbresult.success === true) {
                                    user = dbresult.data;
                                }
                            } else {
                                user = dbresult.data;
                            }

                            if (dbresult.success === false) {
                                message = "An error occurred while linking your account";
                                this.logger("discord", msg.guild.id, this.clientId, dbresult.error);
                                this.logger("discord", msg.guild.id, msg.author.id, message);
                                await msg.reply({ embeds: [{ color: 0xbf0f0f, description: message }] });
                                return await msg.delete();
                            }

                            const fromPlatform: PlatformInfo = { platform: "discord", username: msg.author.username, id: msg.author.id };
                            const toPlatform: PlatformInfo = { platform: platform, username: username };

                            let linkResult: LinkSuccess<string> = await this.linkAccount(fromPlatform, toPlatform, user);

                            const embed = { color: 0x65bf65, description: "" };
                            if (linkResult.success === false) {
                                embed.color = 0xbf0f0f;
                                embed.description = linkResult.error;
                            } else {
                                embed.color = 0x65bf65;
                                embed.description = linkResult.data;
                            }

                            message = embed.description;
                            this.logger("discord", msg.guild.id, this.clientId, message);
                            await msg.reply({ embeds: [embed] });
                            return await msg.delete();

                        } else {
                            message = `Wrong arguments. Correct usage: "!link platform platformUsername"`;
                            this.logger("discord", msg.guild.id, this.clientId, message);
                            await msg.reply({ embeds: [{ color: 0xbf0f0f, description: message }] });
                            return await msg.delete();
                        }
                    default:
                        break;
                }
            }
        } catch (error) {
            this.logger("discord", msg.guild.id, this.clientId, error);
        }
    }

    async start() {
        const _this = this;

        const link = {
            data: new SlashCommandBuilder()
                .setName('link')
                .setNameLocalizations(linkLocales.link.name)
                .setDescription('Link your accounts')
                .setDescriptionLocalizations(linkLocales.link.description)
                .setDefaultMemberPermissions(0)
                .setDMPermission(true)
                .addSubcommand(subcommand =>
                    subcommand.setName('twitch')
                        .setDescription('Link your Twitch account')
                        .setDescriptionLocalizations(linkLocales.link.twitch.description)
                        .addStringOption(option =>
                            option.setName('username')
                                .setNameLocalizations(linkLocales.link.global.variable.username.name)
                                .setDescription('Your Twitch username')
                                .setDescriptionLocalizations(linkLocales.link.global.variable.username.description)
                                .setRequired(true)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand.setName('game')
                        .setNameLocalizations(linkLocales.link.game.name)
                        .setDescription('Link your game account')
                        .setDescriptionLocalizations(linkLocales.link.game.description)
                        .addStringOption(option =>
                            option.setName('platform')
                                .setNameLocalizations(linkLocales.link.game.variable.platform.name)
                                .setDescription('The platform/game you play on')
                                .setDescriptionLocalizations(linkLocales.link.game.variable.platform.description)
                                .setRequired(true)
                                .addChoices(
                                    { name: 'Minecraft', value: 'minecraft' },
                                    { name: 'Steam64 ID', value: 'steam64' }
                                )
                        )
                        .addStringOption(option =>
                            option.setName('username')
                                .setNameLocalizations(linkLocales.link.global.variable.username.name)
                                .setDescription('Your username in the platform/game')
                                .setDescriptionLocalizations(linkLocales.link.global.variable.username.description)
                                .setRequired(true)
                        )
                ),
            async execute(interaction: any) {
                await interaction.deferReply({ ephemeral: true });
                const discordID = interaction.user.id;
                const guildID = interaction.guild.id;
                const subcommand = interaction.options.getSubcommand();
                const platform = subcommand === "twitch" ? "twitch" : interaction.options.getString('platform');
                const username = interaction.options.getString('username');

                _this.logger("discord", guildID, discordID, interaction.commandName + " " + subcommand + " " + platform + " " + username);

                let dbresult: DataBaseResponse<User> = await _this.db.getUser("discord", "id", discordID);
                let user: User;
                let message: string;
                if (dbresult.success === false && dbresult.error === "User not found") {
                    dbresult = await _this.db.createUser({ discord: <DiscordUser>interaction.user });
                    if (dbresult.success === true) {
                        user = dbresult.data;
                    }
                } else {
                    user = dbresult.data;
                }

                if (dbresult.success === false) {
                    message = "An error occurred while linking your account";
                    _this.logger("discord", guildID, _this.clientId, dbresult.error);
                    _this.logger("discord", guildID, interaction.user.id, message);
                    return await interaction.editReply({ embeds: [{ color: 0x65bf65, description: message }], ephemeral: true });
                }

                const fromPlatform: PlatformInfo = { platform: "discord", username: interaction.user.username, id: discordID };
                const toPlatform: PlatformInfo = { platform: platform, username: username };

                let linkResult: LinkSuccess<string> = await _this.linkAccount(fromPlatform, toPlatform, user);

                const embed = { color: 0x65bf65, description: "" };
                if (linkResult.success === false) {
                    embed.color = 0xbf0f0f;
                    embed.description = linkResult.error;
                } else {
                    embed.color = 0x65bf65;
                    embed.description = linkResult.data;
                }

                message = embed.description;
                _this.logger("discord", guildID, _this.clientId, message);
                return await interaction.editReply({ embeds: [embed] });
            }
        };

        // Custom client type
        interface CustomClient extends Client {
            commands: Collection<string, any>;
        }

        const client: CustomClient = <CustomClient>(new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        }));

        // Set up slash commands
        const commands = [];
        client.commands = new Collection();
        client.commands.set(link.data.name, link);
        commands.push(link.data.toJSON());

        const rest = new REST({ version: '10' }).setToken(this.token);

        client.on(Events.InteractionCreate, async interaction => {
            if (!interaction.isChatInputCommand()) return;

            const command = (<CustomClient>interaction.client).commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
            }
        });

        client.once(Events.ClientReady, c => {
            console.log(`Ready! Logged in as ${c.user.tag}`);

            (async () => {
                try {
                    console.log(`Started refreshing ${commands.length} application (/) commands.`);
                    const data = <any[]>(await rest.put(
                        Routes.applicationCommands(this.clientId),
                        { body: commands },
                    ));
        
                    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        
                } catch (error) {
                    console.error(error);
                }
            })();
        });

        client.on(Events.MessageCreate, async msg => {
            await _this.chatHandler(msg);
        });

        client.login(this.token);
    }
}