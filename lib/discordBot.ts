import { Client, Collection, Events, GatewayIntentBits, Message, REST, Routes, SlashCommandBuilder } from 'discord.js';


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
                const subcommand = interaction.options.getSubcommand();
                const platform = interaction.options.getString('platform');
                const username = interaction.options.getString('username');


                // const embed = { color: 0x65bf65, description: "" };
                // if (linkResult.success === false) {
                //     embed.color = 0xbf0f0f;
                //     embed.description = linkResult.error;
                // } else {
                //     embed.color = 0x65bf65;
                //     embed.description = linkResult.data;
                // }

                // _this.logger("discord", guildID, _this.clientId, message);
                // return await interaction.editReply({ embeds: [embed] });
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
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
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