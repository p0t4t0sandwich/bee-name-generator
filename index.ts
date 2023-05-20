import { DiscordBot } from "./lib/discordBot.js";
import { WebServer } from "./lib/webServer.js";
import { mongo } from "./lib/mongo.js";


// Web Server
const webServer: WebServer = new WebServer(mongo);
await webServer.start();

// Discord Bot
// const discordBot: DiscordBot = new DiscordBot(mongo);
// await discordBot.start();