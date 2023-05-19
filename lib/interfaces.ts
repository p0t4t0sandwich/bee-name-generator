export interface TwitchUser {
    id: string,
    login?: string,
    display_name?: string,
    type?: string,
    broadcaster_type?: string,
    description?: string,
    profile_image_url?: string,
    offline_image_url?: string,
    view_count?: number
}

interface DiscordUserFlags {
    bitfield: number,
}

export interface DiscordUser {
    id: string,
    bot?: boolean,
    tag?: string,
    system?: boolean,
    flags?: DiscordUserFlags,
    username?: string,
    discriminator?: string,
    avatar?: string,
    banner?: any,
    accentColor?: any,
}

export interface MinecraftUser {
    id: string,
    username: string,
    skin?: string,
}

export interface SteamUser {
    steamID?: string,
    steamID3?: string,
    steamID64?: string,
    customURL?: string,
    profile?: string,
    profileState?: string,
    profileCreated?: string,
    name?: string,
    realName?: string,
    location?: string,
}

export interface User {
    id: string,
    twitch?: TwitchUser,
    discord?: DiscordUser,
    minecraft?: MinecraftUser,
    steam?: SteamUser
}