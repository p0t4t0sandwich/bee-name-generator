import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Channel, Client, Collection, ComponentBuilder, Events, GatewayIntentBits, Message, REST, Routes, SlashCommandBuilder, TextChannel } from 'discord.js';


import { DOMAIN, ROOT_ENDPOINT, AUTH_TOKEN } from "./webServer.js";
const DISCORD_ADMIN_IDS: string[] = process.env.DISCORD_ADMIN_IDS.split(",");
const DISCORD_GUILD_ID: string = process.env.DISCORD_GUILD_ID;
const DISCORD_CHANNEL_ID: string = process.env.DISCORD_CHANNEL_ID;
import commandLocales from '../localization/commands.json' assert { type: "json" };

interface BeeAPIResponse<T> {
    success: boolean,
    data?: T,
    error?: any
}

// Custom client type
interface CustomClient extends Client {
    commands: Collection<string, any>;
}


export class DiscordBot {
    // Properties
    private token: string;
    private clientId: string;
    private static client: CustomClient;

    // Constructor
    constructor() {
        this.token = <string>process.env.DISCORD_TOKEN;
        this.clientId = <string>process.env.DISCORD_CLIENT_ID;
    }

    // Methods
    logger(platform: string, channelId: string, userId: string, message: string): void {
        message = message.replace(/\n/g, "\\n");
        console.log(`[${new Date().toISOString()}] [Bee Name Generator] [${platform}] [${channelId}] [${userId}]: ${message}`);
    }

    // Get a random bee name from the database
    async getBeeNameCall(): Promise<BeeAPIResponse<string>> {
        try {
            // Get a random bee name from the database
            const response = await fetch(`${DOMAIN}${ROOT_ENDPOINT}/name`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
            });
            const data = await response.json();

            // Check if the response was successful
            if (!data?.name) {
                return { success: false, error: data?.error };
            }

            // Return the bee name
            return { success: true, data: data.name };
        } catch (error) {
            console.log(error);
            return { success: false, error: error };
        }
    }

    // Upload a bee name to the database
    async uploadBeeNameCall(beeName: string): Promise<BeeAPIResponse<string>> {
        try {
            // Upload the bee name to the database
            const response = await fetch(`${DOMAIN}${ROOT_ENDPOINT}/name`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + AUTH_TOKEN,
                },
                body: JSON.stringify({ name: beeName }),
            });
            const data = await response.json();

            // Check if the response was successful
            if (!data?.name) {
                return { success: false, error: data?.error };
            }

            // Return the bee name
            return { success: true, data: data.name };
        } catch (error) {
            console.log(error);
            return { success: false, error: error };
        }
    }

    // Delete a bee name from the database
    async deleteBeeNameCall(beeName: string): Promise<BeeAPIResponse<string>> {
        try {
            // Delete the bee name from the database
            const response = await fetch(`${DOMAIN}${ROOT_ENDPOINT}/name`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + AUTH_TOKEN,
                },
                body: JSON.stringify({ name: beeName }),
            });
            const data = await response.json();

            // Check if the response was successful
            if (!data?.name) {
                return { success: false, error: data?.error };
            }

            // Return the bee name
            return { success: true, data: data.name };
        } catch (error) {
            console.log(error);
            return { success: false, error: error };
        }
    }

    // Submit a bee name suggestion
    async submitBeeNameSuggestionCall(beeName: string): Promise<BeeAPIResponse<string>> {
        try {
            // Submit the bee name suggestion
            const response = await fetch(`${DOMAIN}${ROOT_ENDPOINT}/suggestion`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: beeName }),
            });
            const data = await response.json();
            
            // Check if the response was successful
            if (!data?.name) {
                return { success: false, error: data?.error };
            }

            // Return the bee name
            return { success: true, data: data.name };
        } catch (error) {
            console.log(error);
            return { success: false, error: error };
        }
    }

    // Get bee name suggestions
    async getBeeNameSuggestionsCall(): Promise<BeeAPIResponse<string[]>> {
        try {
            // Get the bee name suggestions
            const response = await fetch(`${DOMAIN}${ROOT_ENDPOINT}/suggestion`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + AUTH_TOKEN,
                }
            });
            const data = await response.json();

            // Check if the response was successful
            if (!data?.names) {
                return { success: false, error: data?.error };
            }

            // Return the bee name suggestions
            return { success: true, data: data.names };
        } catch (error) {
            console.log(error);
            return { success: false, error: error };
        }
    }

    // Accept a bee name suggestion
    async acceptBeeNameSuggestionCall(beeName: string): Promise<BeeAPIResponse<string>> {
        try {
            // Accept the bee name suggestion
            const response = await fetch(`${DOMAIN}${ROOT_ENDPOINT}/suggestion`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + AUTH_TOKEN,
                },
                body: JSON.stringify({ name: beeName }),
            });
            const data = await response.json();
            
            // Check if the response was successful
            if (!data?.name) {
                return { success: false, error: data?.error };
            }

            // Return the bee name
            return { success: true, data: data.name };
        } catch (error) {
            console.log(error);
            return { success: false, error: error };
        }
    }

    // Reject a bee name suggestion
    async rejectBeeNameSuggestionCall(beeName: string): Promise<BeeAPIResponse<string>> {
        try {
            // Reject the bee name suggestion
            const response = await fetch(`${DOMAIN}${ROOT_ENDPOINT}/suggestion`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + AUTH_TOKEN,
                },
                body: JSON.stringify({ name: beeName }),
            });
            const data = await response.json();

            // Check if the response was successful
            if (!data?.name) {
                return { success: false, error: data?.error };
            }

            // Return the bee name
            return { success: true, data: data.name };
        } catch (error) {
            console.log(error);
            return { success: false, error: error };
        }
    }

    // Get button components
    getButtonComponents(): ActionRowBuilder<ButtonBuilder> {
        const acceptButton = new ButtonBuilder()
            .setCustomId("bee_name_accept")
            .setLabel("Accept")
            .setStyle(ButtonStyle.Success);
        const rejectButton = new ButtonBuilder()
            .setCustomId("bee_name_reject")
            .setLabel("Reject")
            .setStyle(ButtonStyle.Danger);
        const nextButton = new ButtonBuilder()
            .setCustomId("bee_name_next")
            .setLabel("Next")
            .setStyle(ButtonStyle.Primary);

        const buttonRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(acceptButton, rejectButton, nextButton);

        return buttonRow;
    }

    // Send a message to the Discord channel
    static async sendMessage(message: string): Promise<void> {
        try {
            const channel: Channel = await this.client.channels.fetch(DISCORD_CHANNEL_ID);
            if (channel.isTextBased()) {
                const embed = {
                    color: 0xe8a917,
                    title: "Bee Name Generator Suggestion",
                    description: message
                };

                await channel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.log(error);
        }
    }

    async start() {
        const _this = this;

        const bee_name_command = {
            data: new SlashCommandBuilder()
                .setName('bee_name')
                .setNameLocalizations(commandLocales.bee_name.name)
                .setDescription('Get a random bee name')
                .setDescriptionLocalizations(commandLocales.bee_name.description)
                .setDefaultMemberPermissions(0)
                .setDMPermission(true)
                .addSubcommand(subcommand =>
                    subcommand.setName('get')
                        .setNameLocalizations(commandLocales.bee_name.get.name)
                        .setDescription('Get a random bee name')
                        .setDescriptionLocalizations(commandLocales.bee_name.description)
                )
                .addSubcommand(subcommand =>
                    subcommand.setName('upload')
                        .setNameLocalizations(commandLocales.bee_name.upload.name)
                        .setDescription('Upload a bee name')
                        .setDescriptionLocalizations(commandLocales.bee_name.upload.description)
                        .addStringOption(option =>
                            option.setName('name')
                                .setNameLocalizations(commandLocales.bee_name.global.variable.name.name)
                                .setDescription('The bee name to upload')
                                .setDescriptionLocalizations(commandLocales.bee_name.global.variable.name.description)
                                .setRequired(true)
                        )
                )
                .addSubcommandGroup(subcommandGroup =>
                    subcommandGroup.setName('suggestion')
                        .setNameLocalizations(commandLocales.bee_name.suggestion.name)
                        .setDescription('Bee name suggestions')
                        .setDescriptionLocalizations(commandLocales.bee_name.suggestion.description)
                        .addSubcommand(subcommand =>
                            subcommand.setName('submit')
                                .setNameLocalizations(commandLocales.bee_name.suggestion.submit.name)
                                .setDescription('Submit a bee name suggestion')
                                .setDescriptionLocalizations(commandLocales.bee_name.suggestion.submit.description)
                                .addStringOption(option =>
                                    option.setName('name')
                                        .setNameLocalizations(commandLocales.bee_name.global.variable.name.name)
                                        .setDescription('The bee name to submit')
                                        .setDescriptionLocalizations(commandLocales.bee_name.global.variable.name.description)
                                        .setRequired(true)
                                )
                        )
                        .addSubcommand(subcommand =>
                            subcommand.setName('get')
                                .setNameLocalizations(commandLocales.bee_name.get.name)
                                .setDescription('Get a bee name suggestion')
                                .setDescriptionLocalizations(commandLocales.bee_name.description)
                        )
                ),
            async execute(interaction: any) {
                await interaction.deferReply({ ephemeral: true });
                const discordID = interaction.user.id;
                const guildID = interaction.guild.id;
                const subcommandGroup = interaction.options.getSubcommandGroup();
                const subcommand = interaction.options.getSubcommand();

                _this.logger("discord", interaction.guild.id, discordID, interaction.commandName + " " + subcommandGroup + " " + subcommand);

                const embed = {
                    color: 0xbf0f0f,
                    title: "Bee Name Generator",
                    description: "An unknown error occurred."
                };
                let buttonRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>();
                let beeName: BeeAPIResponse<any>;

                switch (subcommandGroup) {
                    // Bee name suggestions
                    case "suggestion":
                        switch (subcommand) {
                            // Bee name suggestions
                            case 'submit':
                                beeName = await _this.submitBeeNameSuggestionCall(interaction.options.getString('name'));
                                if (beeName.success === false) {
                                    embed.color = 0xbf0f0f;
                                    embed.title = "Error Submitting Bee Name Suggestion";
                                    embed.description = beeName.error;
                                } else {
                                    embed.color = 0x65bf65;
                                    embed.title = "Bee Name Suggestion Submitted";
                                    embed.description = beeName.data;
                                }
                                break;

                            // Bee name suggestions
                            case 'get':
                                if (DISCORD_ADMIN_IDS.includes(discordID)) {
                                    beeName = await _this.getBeeNameSuggestionsCall();
                                    if (beeName.success === false) {
                                        embed.color = 0xbf0f0f;
                                        embed.title = "Error Getting Bee Name Suggestions";
                                        embed.description = beeName.error;
                                    } else {
                                        embed.color = 0x65bf65;
                                        embed.title = "Bee Name Suggestions";
                                        embed.description = beeName.data.join("\n");
                                    }

                                    buttonRow = _this.getButtonComponents();

                                } else {
                                    embed.color = 0xbf0f0f;
                                    embed.description = "You do not have permission to use this command.";
                                }
                                break;
                            }
                        break;

                // Other subcommand groups
                default:
                    switch (subcommand) {
                        // Get a random bee name
                        case 'get':
                            beeName = await _this.getBeeNameCall();
                            if (beeName.success === false) {
                                embed.color = 0xbf0f0f;
                                embed.title = "Error Getting Bee Name";
                                embed.description = beeName.error;
                            } else {
                                embed.color = 0x65bf65;
                                embed.title = "Bee Name";
                                embed.description = beeName.data;
                            }
                            break;

                        // Upload a bee name
                        case 'upload':
                            if (DISCORD_ADMIN_IDS.includes(discordID)) {
                                const name = interaction.options.getString('name');
                                const beeName = await _this.uploadBeeNameCall(name);
                                if (beeName.success === false) {
                                    embed.color = 0xbf0f0f;
                                    embed.title = "Error Uploading Bee Name";
                                    embed.description = beeName.error;
                                }
                                else {
                                    embed.color = 0x65bf65;
                                    embed.title = "Bee Name Uploaded";
                                    embed.description = beeName.data;
                                }
                            } else {
                                embed.color = 0xbf0f0f;
                                embed.description = "You do not have permission to use this command.";
                            }
                            break;

                        // Delete a bee name
                        case 'delete':
                            if (DISCORD_ADMIN_IDS.includes(discordID)) {
                                const name = interaction.options.getString('name');
                                const beeName = await _this.deleteBeeNameCall(name);
                                if (beeName.success === false) {
                                    embed.color = 0xbf0f0f;
                                    embed.title = "Error Deleting Bee Name";
                                    embed.description = beeName.error;
                                }
                                else {
                                    embed.color = 0x65bf65;
                                    embed.title = "Bee Name Deleted";
                                    embed.description = beeName.data;
                                }
                            } else {
                                embed.color = 0xbf0f0f;
                                embed.description = "You do not have permission to use this command.";
                            }
                            break;

                        default:
                            embed.color = 0xbf0f0f;
                            embed.description = "An unknown error occurred.";
                            break;
                    }
                    break;
                }

                _this.logger("discord", guildID, _this.clientId, embed.title + " " + embed.description);

                if (buttonRow.components.length > 0) {
                    await interaction.editReply({ embeds: [embed], components: [buttonRow] });
                } else {
                    await interaction.editReply({ embeds: [embed] });
                }
            }
        };

        DiscordBot.client = <CustomClient>(new Client({ intents: [GatewayIntentBits.Guilds] }));

        // Set up slash commands
        const commands = [];
        DiscordBot.client.commands = new Collection();
        DiscordBot.client.commands.set(bee_name_command.data.name, bee_name_command);
        commands.push(bee_name_command.data.toJSON());

        const rest = new REST({ version: '10' }).setToken(this.token);

        // Handle events
        DiscordBot.client.on(Events.InteractionCreate, async interaction => {
            try {
                // Handle slash commands
                if (interaction.isChatInputCommand()) {
                    const command = (<CustomClient>interaction.client).commands.get(interaction.commandName);

                    if (!command) {
                        console.error(`No command matching ${interaction.commandName} was found.`);
                        return;
                    }

                    try {
                        await command.execute(interaction);
                    } catch (error) {
                        console.error(error);
                        await interaction.editReply({ content: 'There was an error while executing this command!' });
                    }

                // Handle button clicks
                } else if (interaction.isButton()) {
                    await interaction.deferUpdate();

                    if (DISCORD_ADMIN_IDS.includes(interaction.user.id) === false) {
                        await interaction.editReply({ content: "You do not have permission to use this." });
                        return;
                    }

                    const discordID = interaction.user.id;
                    const guildID = interaction.guild.id;
                    const beeName = interaction.message.embeds[0].description;

                    _this.logger("discord", guildID, discordID, interaction.customId);

                    const embed = {
                        color: 0xbf0f0f,
                        title: "Bee Name Suggestions",
                        description: "An unknown error occurred."
                    };

                    switch (interaction.customId) {
                        // Accept a bee name suggestion
                        case "bee_name_accept":
                            const acceptBeeName = await _this.acceptBeeNameSuggestionCall(beeName);
                            if (acceptBeeName.success === false) {
                                embed.color = 0xbf0f0f;
                                embed.description = JSON.stringify(acceptBeeName.error);
                            } else {
                                embed.color = 0x65bf65;
                                embed.description = acceptBeeName.data + " has been accepted.";
                            }
                            break;

                        // Reject a bee name suggestion
                        case "bee_name_reject":
                            const rejectBeeName = await _this.rejectBeeNameSuggestionCall(beeName);
                            if (rejectBeeName.success === false) {
                                embed.color = 0xbf0f0f;
                                embed.description = JSON.stringify(rejectBeeName.error);
                            } else {
                                embed.color = 0x65bf65;
                                embed.description = rejectBeeName.data + " has been rejected.";
                            }
                            break;

                        // Get a new bee name suggestion
                        case "bee_name_next":
                            const newBeeName = await _this.getBeeNameSuggestionsCall();
                            if (newBeeName.success === false) {
                                embed.color = 0xbf0f0f;
                                embed.description = JSON.stringify(newBeeName.error);
                            } else {
                                embed.color = 0x65bf65;
                                embed.description = newBeeName.data.join("\n");
                            }
                            break;

                        // Default case
                        default:
                            embed.color = 0xbf0f0f;
                            embed.description = "An unknown error occurred.";
                            break;
                    }

                    _this.logger("discord", guildID, _this.clientId, embed.title + " " + embed.description);

                    let buttonRow: ActionRowBuilder<ButtonBuilder> = _this.getButtonComponents();

                    await interaction.editReply({ embeds: [embed], components: [buttonRow] });
                } else {
                    console.log(`${interaction.type} event was received but not handled.`);
                }
            } catch (error) {
                console.error(error);
            }
        });

        DiscordBot.client.once(Events.ClientReady, c => {
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

        DiscordBot.client.login(this.token);
    }
}