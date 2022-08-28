import axios from 'axios';

/** Handle a slash command interaction */
export class Interaction {
  /** The Discord developer portal application ID or bot client ID */
  applicationId: string;

  /** The defaults to use for the initial response */
  defaults: Partial<InteractionResponse>;

  /** Whether or not an initial response been sent */
  private sentInitial = false;

  /**
   * Construct an interaction client
   *
   * NOTE: when `applicationId` is not set, the application ID must be set in an environment variable called `APPLICATION_ID`
   * @param interaction The interaction data
   * @param [defaults] The default settings used when sending the initial response
   */
  constructor(interaction: Interaction, defaults?: Interaction['defaults']);

  /**
   * Construct an interaction client
   * @param interaction The interaction data
   * @param applicationId The ID of the application
   * @param [defaults] The default settings used when sending the initial response
   */
  constructor(
    interaction: Interaction,
    applicationId?: string,
    defaults?: Interaction['defaults']
  );

  constructor(
    interaction: Interaction,
    p2?: string | Interaction['defaults'],
    p3?: Interaction['defaults']
  ) {
    this.applicationId = process.env.APPLICATION_ID!;
    this.defaults = {
      type: InteractionResponseType.ChannelMessageWithSource,
    };

    if (p2) {
      if (typeof p2 === 'string') {
        this.applicationId = p2;
      } else {
        this.defaults = p2;
      }
    }

    if (p3) {
      this.defaults = p3;
    }

    Object.assign(this, interaction);
  }

  /**
   * Send a plain text message
   * @param body Text to send
   */
  async send(body: string): Promise<WebhookPostResult | void>;

  /**
   * Send an initial response
   *
   * note: you must do this before sending a followup message
   * @param body Initial response data
   */
  async send(body: InteractionResponse): Promise<void>;

  /**
   * Send a followup message
   *
   * note: you can only use this after sending the initial response
   * @param body Followup message data
   */
  async send(body: WebhookBody): Promise<WebhookPostResult>;

  async send(
    body: string | InteractionResponse | WebhookBody
  ): Promise<void | WebhookPostResult> {
    const url = this.sentInitial ? this.webhookURL : this.callbackURL;

    let data = {};

    if (this.sentInitial) {
      if (typeof body === 'string') {
        data = {content: body};
      } else {
        data = body;
      }
    } else {
      if (typeof body === 'string') {
        data = {...this.defaults, data: {content: body}};
      } else {
        data = {...this.defaults, ...body};
      }
    }

    const result = await axios.post(url, data, {
      validateStatus: null,
    });

    this.sentInitial = true;

    return result.data;
  }

  /**
   * Edit an interaction response
   * @param body The new message content
   * @param [id] The ID to of the message to edit. Leave blank to edit original message
   */
  async edit(
    body: WebhookBody | string,
    id = '@original'
  ): Promise<WebhookPostResult> {
    const result = await axios.patch(
      `${this.webhookURL}/messages/${id}`,
      typeof body === 'string' ? {content: body} : body,
      {
        validateStatus: null,
      }
    );

    return result.data;
  }

  /**
   * Delete a message
   * @param [id] The ID of the message to delete. Leave empty to delete original message.
   */
  async delete(id = '@original'): Promise<void> {
    const result = await axios.delete(`${this.webhookURL}/messages/${id}`, {
      validateStatus: null,
    });

    return result.data;
  }

  /** The full command that was used */
  toString() {
    const fullcmd: (string | number | boolean)[] = [this.data.name];

    const descend = (s: ApplicationCommandInteractionDataOption[]) => {
      for (const op of s) {
        fullcmd.push(op?.value ? `${op.name}:` : op.name);

        if (op.options) {
          descend(op.options);
        }

        if (op.value !== undefined) {
          fullcmd.push(op.value);
        }
      }
    };

    if (this.data.options) {
      descend(this.data.options);
    }

    return '/' + fullcmd.join(' ');
  }

  /** The callback URL for sending an initial response */
  get callbackURL(): string {
    return `https://discord.com/api/v8/interactions/${this.id}/${this.token}/callback`;
  }

  /** The webhook URL for sending followup messages */
  get webhookURL(): string {
    return `https://discord.com/api/v8/webhooks/${this.applicationId}/${this.token}`;
  }

  /** The full command that was used */
  get content(): string {
    return this.toString();
  }
}

export interface ApplicationCommand {
  id: string;
  application_id: string;
  name: string;
  description: string;
  options?: ApplicationCommandOption[];
}

export interface ApplicationCommandOption {
  type: number;
  name: string;
  description: string;
  default?: boolean;
  required?: boolean;
  choices?: ApplicationCommandOptionChoice[];
  options?: ApplicationCommandOption[];
}

export enum ApplicationCommandOptionType {
  SUB_COMMAND = 1,
  SUB_COMMAND_GROUP = 2,
  STRING = 3,
  INTEGER = 4,
  BOOLEAN = 5,
  USER = 6,
  CHANNEL = 7,
  ROLE = 8,
}

export interface ApplicationCommandOptionChoice {
  name: string;
  value: string | number;
}

export interface Interaction {
  id: string;
  type: InteractionType;
  data: ApplicationCommandInteractionData;
  guild_id: string;
  channel_id: string;
  member: GuildMember;
  token: string;
  version: number;
}

export enum InteractionType {
  Ping = 1,
  ApplicationCommand = 2,
}

export interface ApplicationCommandInteractionData {
  id: string;
  name: string;
  options?: ApplicationCommandInteractionDataOption[];
}

export type ApplicationCommandInteractionDataOption =
  | {
      name: string;
      options: ApplicationCommandInteractionDataOption[];
      value?: never;
    }
  | {
      name: string;
      options?: never;
      value: string | number | boolean;
    };

export interface InteractionResponse {
  type: InteractionResponseType;
  data?: InteractionApplicationCommandCallbackData;
}

export enum InteractionResponseType {
  Pong = 1,
  Acknowledge = 2,
  /** @deprecated */
  ChannelMessage = 4,
  ChannelMessageWithSource = 4,
  ACKWithSource = 5,
}

export type ResponseType =
  | InteractionResponseType
  | keyof typeof InteractionResponseType;

export enum InteractionResponseFlags {
  EPHEMERAL = 64,
}

export type ResponseFlags =
  | InteractionResponseFlags
  | keyof typeof InteractionResponseFlags;

export interface InteractionApplicationCommandCallbackData {
  tts?: boolean;
  content?: string;
  flags?: InteractionResponseFlags;
  embeds?: EmbedJSON[];
  allowed_mentions?: AllowedMentions;
}

export interface GuildMember {
  deaf: boolean;
  is_pending: boolean;
  joined_at: Date;
  mute: boolean;
  nick: string;
  pending: boolean;
  permissions: string;
  premium_since: Date | null;
  roles: string[];
  user: User;
}

export interface User {
  avatar: string;
  discriminator: string;
  id: string;
  public_flags: number;
  username: string;
}

export interface EmbedJSON {
  title?: string;
  type?: 'rich' | 'image' | 'video' | 'gifv' | 'article' | 'link';
  description?: string;
  url?: string;
  timestamp?: Date | number;
  color?: number;
  footer?: {text: string; icon_url?: string; proxy_icon_url?: string};
  image?: {url?: string; proxy_url?: string; height?: number; width?: number};
  thumbnail?: {
    url?: string;
    proxy_url?: string;
    height?: number;
    width?: number;
  };
  video?: {url?: string; height?: number; width?: number};
  provider?: {name?: string; url?: string};
  author?: {
    name?: string;
    url?: string;
    icon_url?: string;
    proxy_icon_url?: string;
  };
  fields?: {name: string; value: string; inline?: boolean}[];
}

export interface AllowedMentions {
  parse?: ('roles' | 'users' | 'everyone')[];
  roles?: string[];
  users?: string[];
  replied_user?: boolean;
}

export interface WebhookBody {
  username?: string;
  content?: string;
  avatar_url?: string;
  tts?: boolean;
  file?: Buffer;
  embeds?: EmbedJSON[];
  allowed_mentions?: AllowedMentions;
}

export interface WebhookPostResult {
  id: string;
  type: number;
  content: string;
  author: {
    bot: boolean;
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
  };
  attachments: {
    id: string;
    filename: string;
    size: number;
    url: string;
    proxy_url: string;
    height: number | null;
    width: number | null;
  }[];
  embeds: EmbedJSON[];
  mentions: string[];
  mention_roles: string[];
  pinned: boolean;
  mention_everyone: boolean;
  tts: boolean;
  timestamp: string;
  edited_timestamp: string | null;
  flags: number;
  webhook_id: string;
}
