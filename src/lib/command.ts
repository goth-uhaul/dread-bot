import { ApplicationCommandOptionChoiceData, AutocompleteInteraction, ChatInputCommandInteraction, Collection, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from "discord.js";

import { BaseComponent, BaseComponentConstructor, ExecutableComponent, ExecutableComponentConstructor } from "./base_component";
import { ExecuteInteractionFunction } from "./utils";


// Base class
type AutocompleteOptionsFunction = (interaction: AutocompleteInteraction) => Promise<ApplicationCommandOptionChoiceData[]>;

interface BaseCommandConstructor extends ExecutableComponentConstructor {
    execute?: ExecuteInteractionFunction<ChatInputCommandInteraction>;
    autocomplete?: AutocompleteOptionsFunction;
}

abstract class BaseCommand extends ExecutableComponent {
    public _execute?: ExecuteInteractionFunction<ChatInputCommandInteraction>;
    public _autocomplete?: AutocompleteOptionsFunction;

    public constructor(fields: BaseCommandConstructor) {
        super(fields);
        this._execute = fields.execute;
        this._autocomplete = fields.autocomplete;
    }

    public async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        if (this._autocomplete && await this.canExecute(interaction)) {
            let choices = await this._autocomplete(interaction);
            if (choices.length > 25) choices = choices.slice(0, 24);
            await interaction.respond(choices);
        }
    }
}

// Subcommand
interface SubcommandConstructor extends BaseCommandConstructor {
    builder: SlashCommandSubcommandBuilder;
}

export class Subcommand extends BaseCommand {
    public builder: SlashCommandSubcommandBuilder;

    public constructor(fields: SubcommandConstructor) {
        super(fields);
        this.builder = fields.builder.setName(fields.name);
    }
}

// Subcommand group
interface SubcommandGroupConstructor extends BaseComponentConstructor {
    builder: SlashCommandSubcommandGroupBuilder;
    subcommands?: Subcommand[];
}

export class SubcommandGroup extends BaseComponent {
    public builder: SlashCommandSubcommandGroupBuilder;
    public subcommands: Collection<string, Subcommand>;

    public constructor(fields: SubcommandGroupConstructor) {
        super(fields);
        this.builder = fields.builder.setName(fields.name);

        const subcommands = fields.subcommands || [];
        this.subcommands = new Collection(subcommands.map((subcommand: Subcommand) => {
            this.builder.addSubcommand(subcommand.builder);
            return [subcommand.name, subcommand] as [string, Subcommand];
        }));
    }
}

// Command
interface CommandConstructor extends BaseCommandConstructor {
    builder: SlashCommandBuilder;
    subcommandGroups?: SubcommandGroup[];
    subcommands?: Subcommand[];
}

export class Command extends BaseCommand {
    public builder: SlashCommandBuilder;
    public subcommandGroups: Collection<string, SubcommandGroup>;
    public subcommands: Collection<string, Subcommand>;

    public constructor(fields: CommandConstructor) {
        super(fields);
        this.builder = fields.builder.setName(fields.name);

        const subcommandGroups = fields.subcommandGroups || [];
        this.subcommandGroups = new Collection(subcommandGroups.map((subcommandGroup: SubcommandGroup) => {
            this.builder.addSubcommandGroup(subcommandGroup.builder);
            return [subcommandGroup.name, subcommandGroup] as [string, SubcommandGroup];
        }));

        const subcommands = fields.subcommands || [];
        this.subcommands = new Collection(subcommands.map((subcommand: Subcommand) => {
            this.builder.addSubcommand(subcommand.builder);
            return [subcommand.name, subcommand] as [string, Subcommand];
        }));
    }
}
