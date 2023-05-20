import { Client, Collection, Events, GatewayIntentBits, Message, REST, Routes, SlashCommandBuilder } from 'discord.js';


const DOMAIN: string = <string>process.env.DOMAIN || "http://localhost:3001";
const ROOT_ENDPOINT: string = "";//<string>process.env.ROOT_ENDPOINT || "/api/v1/bee-name";
const AUTH_TOKEN: string = <string>process.env.AUTH_TOKEN || "1234567890";
const ADMIN_IDS: string[] = process.env.ADMIN_IDS.split(",");


interface BeeAPIResponse<T> {
    success: boolean,
    data?: T,
    error?: any
}


export class DiscordBot {
    // Properties
    private token: string;
    private clientId: string;

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
                    "Authorization": AUTH_TOKEN,
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
                    "Authorization": AUTH_TOKEN,
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
                    "Content-Type": "application/json",
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
                    "Authorization": AUTH_TOKEN,
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
                    "Authorization": AUTH_TOKEN,
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
                    "Authorization": AUTH_TOKEN,
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


    async start() {
        const _this = this;

        const bee_name = {
            data: new SlashCommandBuilder()
                .setName('bee_name')
                .setDescription('Get a random bee name')
                .setDefaultMemberPermissions(0)
                .setDMPermission(true)
                .addSubcommand(subcommand =>
                    subcommand.setName('get')
                        .setDescription('Get a random bee name')
                )
                .addSubcommand(subcommand =>
                    subcommand.setName('upload')
                        .setDescription('Upload a bee name')
                        .addStringOption(option =>
                            option.setName('name')
                                .setDescription('The bee name to upload')
                                .setRequired(true)
                        )
                )
                .addSubcommandGroup(subcommandGroup =>
                    subcommandGroup.setName('suggestion')
                        .setDescription('Submit a bee name suggestion')
                        .addSubcommand(subcommand =>
                            subcommand.setName('submit')
                                .setDescription('Submit a bee name suggestion')
                                .addStringOption(option =>
                                    option.setName('name')
                                        .setDescription('The bee name to submit')
                                        .setRequired(true)
                                )
                        )
                        .addSubcommand(subcommand =>
                            subcommand.setName('list')
                                .setDescription('List all bee name suggestions')
                        )
                        .addSubcommand(subcommand =>
                            subcommand.setName('accept')
                                .setDescription('Accept a bee name suggestion')
                                .addStringOption(option =>
                                    option.setName('name')
                                        .setDescription('The bee name to accept')
                                        .setRequired(true)
                                )
                        )
                        .addSubcommand(subcommand =>
                            subcommand.setName('reject')
                                .setDescription('Reject a bee name suggestion')
                                .addStringOption(option =>
                                    option.setName('name')
                                        .setDescription('The bee name to reject')
                                        .setRequired(true)
                                )
                        )
                ),
            async execute(interaction: any) {
                await interaction.deferReply({ ephemeral: true });
                const discordID = interaction.user.id;
                const guildID = interaction.guild.id;
                const subcommandGroup = interaction.options.getSubcommandGroup();
                const subcommand = interaction.options.getSubcommand();

                const embed = { color: 0xbf0f0f, description: "An unknown error occurred." };
                let beeName;
                switch (subcommandGroup) {
                    // Bee name suggestions
                    case 'submit':
                        beeName = await _this.submitBeeNameSuggestionCall(interaction.options.getString('name'));
                        if (beeName.success === false) {
                            embed.color = 0xbf0f0f;
                            embed.description = beeName.error;
                        } else {
                            embed.color = 0x65bf65;
                            embed.description = beeName.data;
                        }
                        break;

                    // Bee name suggestions
                    case 'list':
                        if (ADMIN_IDS.includes(discordID)) {
                            beeName = await _this.getBeeNameSuggestionsCall();
                            if (beeName.success === false) {
                                embed.color = 0xbf0f0f;
                                embed.description = beeName.error;
                            } else {
                                embed.color = 0x65bf65;
                                embed.description = beeName.data.join("\n");
                            }
                        } else {
                            embed.color = 0xbf0f0f;
                            embed.description = "You do not have permission to use this command.";
                        }
                        break;

                    // Accept a bee name suggestion
                    case 'accept':
                        if (ADMIN_IDS.includes(discordID)) {
                            beeName = await _this.acceptBeeNameSuggestionCall(interaction.options.getString('name'));
                            if (beeName.success === false) {
                                embed.color = 0xbf0f0f;
                                embed.description = beeName.error;
                            } else {
                                embed.color = 0x65bf65;
                                embed.description = beeName.data;
                            }
                        } else {
                            embed.color = 0xbf0f0f;
                            embed.description = "You do not have permission to use this command.";
                        }
                        break;
                        
                    // Reject a bee name suggestion
                    case 'reject':
                        if (ADMIN_IDS.includes(discordID)) {
                            beeName = await _this.rejectBeeNameSuggestionCall(interaction.options.getString('name'));
                            if (beeName.success === false) {
                                embed.color = 0xbf0f0f;
                                embed.description = beeName.error;
                            } else {
                                embed.color = 0x65bf65;
                                embed.description = beeName.data;
                            }
                        } else {
                            embed.color = 0xbf0f0f;
                            embed.description = "You do not have permission to use this command.";
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
                                    embed.description = beeName.error;
                                } else {
                                    embed.color = 0x65bf65;
                                    embed.description = beeName.data;
                                }
                                break;

                            // Upload a bee name
                            case 'upload':
                                if (ADMIN_IDS.includes(discordID)) {
                                    const name = interaction.options.getString('name');
                                    const beeName = await _this.uploadBeeNameCall(name);
                                    if (beeName.success === false) {
                                        embed.color = 0xbf0f0f;
                                        embed.description = beeName.error;
                                    }
                                    else {
                                        embed.color = 0x65bf65;
                                        embed.description = beeName.data;
                                    }
                                } else {
                                    embed.color = 0xbf0f0f;
                                    embed.description = "You do not have permission to use this command.";
                                }
                                break;

                            // Delete a bee name
                            case 'delete':
                                if (ADMIN_IDS.includes(discordID)) {
                                    const name = interaction.options.getString('name');
                                    const beeName = await _this.deleteBeeNameCall(name);
                                    if (beeName.success === false) {
                                        embed.color = 0xbf0f0f;
                                        embed.description = beeName.error;
                                    }
                                    else {
                                        embed.color = 0x65bf65;
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

                _this.logger("discord", guildID, _this.clientId, embed.description);
                interaction.editReply({ embeds: [embed] });
            }
        };

        // Custom client type
        interface CustomClient extends Client {
            commands: Collection<string, any>;
        }

        const client: CustomClient = <CustomClient>(new Client({ intents: [GatewayIntentBits.Guilds] }));

        // Set up slash commands
        const commands = [];
        client.commands = new Collection();
        client.commands.set(bee_name.data.name, bee_name);
        commands.push(bee_name.data.toJSON());

        const rest = new REST({ version: '10' }).setToken(this.token);

        client.on(Events.InteractionCreate, async interaction => {
            try {
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
                    await interaction.editReply({ content: 'There was an error while executing this command!' });
                }
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

        client.login(this.token);
    }
}