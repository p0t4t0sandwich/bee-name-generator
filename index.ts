import { DiscordBot } from "./lib/discordBot.js";
import { mongo } from "./lib/mongo.js";
import { supabase } from "./lib/supabase.js";
import { TwitchBot } from "./lib/twitchBot.js";

// Twitch Bot
const twitchBot: TwitchBot = new TwitchBot(mongo, supabase);
await twitchBot.start();

// Discord Bot
const discordBot: DiscordBot = new DiscordBot(mongo, supabase);
await discordBot.start();