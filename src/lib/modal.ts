import { ModalBuilder, ModalSubmitInteraction } from "discord.js";

import { ExecutableComponent, ExecutableComponentConstructor } from "./base_component";
import { CreateBuilderFunction, ExecuteInteractionFunction } from "./utils";


interface ModalConstructor extends ExecutableComponentConstructor {
    builder: CreateBuilderFunction<ModalBuilder>;
    execute?: ExecuteInteractionFunction<ModalSubmitInteraction>;
}

export class Modal extends ExecutableComponent {
    public builder: CreateBuilderFunction<ModalBuilder>;
    public _execute?: ExecuteInteractionFunction<ModalSubmitInteraction>;

    public constructor(fields: ModalConstructor) {
        super(fields);
        this.builder = fields.builder;
        this._execute = fields.execute;
    }
}
