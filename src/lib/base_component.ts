import { Interaction, MessageFlags, RepliableInteraction } from "discord.js";

import { ExecuteInteractionFunction } from "./utils";
import { BotConfigTable } from "../databases/db_objects";

import { owners } from "../../config.json";


export interface BaseComponentConstructor {
    name: string;
    builder: unknown;
    moderatorOnly?: boolean;
    ownerOnly?: boolean;
}

export abstract class BaseComponent {
    public name: string;
    public abstract builder: unknown;
    public moderatorOnly?: boolean;
    public ownerOnly?: boolean;

    public constructor(fields: BaseComponentConstructor) {
        this.name = fields.name;
        this.moderatorOnly = fields.moderatorOnly;
        this.ownerOnly = fields.ownerOnly;
    }
}

export interface ExecutableComponentConstructor extends BaseComponentConstructor {
    execute?: ExecuteInteractionFunction<RepliableInteraction>;
}

export abstract class ExecutableComponent extends BaseComponent {
    public abstract _execute?: ExecuteInteractionFunction<RepliableInteraction>;

    public async canExecute(interaction: Interaction): Promise<boolean> {
        if (this.ownerOnly) {
            if (!owners.includes(interaction.user.id)) {
                if (interaction.isRepliable()) interaction.reply({ content: "Only the bot owners can use that command.", flags: MessageFlags.Ephemeral });
                return false;
            }
            else return true;
        }
        else if (this.moderatorOnly && interaction.inCachedGuild()) {
            const moderatorRole = await BotConfigTable.findOne({ where: { id: "moderatorRole", guild: interaction.guild.id } }).then(x => x?.get("value"));
            if (!moderatorRole || !interaction.member?.roles.cache.has(moderatorRole)) {
                if (interaction.isRepliable()) interaction.reply({ content: "Only moderators can use that command.", flags: MessageFlags.Ephemeral });
                return false;
            }
        }
        return true;
    }

    public async execute(interaction: RepliableInteraction): Promise<void> {
        if (this._execute && await this.canExecute(interaction)) await this._execute(interaction);
    }
}
