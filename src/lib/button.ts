import { ButtonBuilder, ButtonInteraction } from "discord.js";

import { ExecutableComponent, ExecutableComponentConstructor } from "./base_component";
import { CreateBuilderFunction, ExecuteInteractionFunction } from "./utils";


interface ButtonConstructor extends ExecutableComponentConstructor {
    builder: CreateBuilderFunction<ButtonBuilder>;
    execute?: ExecuteInteractionFunction<ButtonInteraction>;
}

export class Button extends ExecutableComponent {
    public builder: CreateBuilderFunction<ButtonBuilder>;
    public _execute?: ExecuteInteractionFunction<ButtonInteraction>;

    public constructor(fields: ButtonConstructor) {
        super(fields);
        this.builder = fields.builder;
        this._execute = fields.execute;
    }
}
