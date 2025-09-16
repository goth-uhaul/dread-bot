import { AnySelectMenuInteraction, ChannelSelectMenuBuilder, MentionableSelectMenuBuilder, RoleSelectMenuBuilder, StringSelectMenuBuilder, UserSelectMenuBuilder, } from "discord.js";

import { ExecutableComponent, ExecutableComponentConstructor } from "./base_component";
import { CreateBuilderFunction, ExecuteInteractionFunction } from "./utils";


export type SelectMenuBuilder = StringSelectMenuBuilder | UserSelectMenuBuilder | RoleSelectMenuBuilder | MentionableSelectMenuBuilder | ChannelSelectMenuBuilder

interface ContextMenuConstructor extends ExecutableComponentConstructor {
    builder: CreateBuilderFunction<SelectMenuBuilder>;
    execute?: ExecuteInteractionFunction<AnySelectMenuInteraction>;
}

export class SelectMenu extends ExecutableComponent {
    public builder: CreateBuilderFunction<SelectMenuBuilder>;
    public _execute?: ExecuteInteractionFunction<AnySelectMenuInteraction>;
    
    public constructor(fields: ContextMenuConstructor) {
        super(fields);
        this.builder = fields.builder;
        this._execute = fields.execute;
    }
}
