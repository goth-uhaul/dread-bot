import { readdirSync } from "node:fs";
import { resolve as resolvePath } from "node:path";
import { pathToFileURL } from "node:url";
const __dirname = import.meta.dirname;

import { ButtonBuilder, CacheType, Client, ClientOptions, Collection, CommandInteractionOptionResolver, InteractionType, ModalBuilder, RepliableInteraction } from "discord.js";

import { ExecutableComponent } from "./base_component";
import { Button } from "./button";
import { Command, Subcommand, SubcommandGroup } from "./command";
import { UserContextMenu } from "./context_menu";
import { Modal } from "./modal";
import { SelectMenu, SelectMenuBuilder } from "./select_menu";
import { CachedPage, NamedObject } from "./utils";


declare module "discord.js" {
    interface Client {
        commands: Collection<string, Command>;
        userContextMenus: Collection<string, UserContextMenu>;
        modals: Collection<string, Modal>;
        buttons: Collection<string, Button>;
        selectMenus: Collection<string, SelectMenu>;
        pageCache: Collection<number, CachedPage>;
        getCommand(commandName: string, options: Pick<CommandInteractionOptionResolver<CacheType>, "getSubcommandGroup" | "getSubcommand">): Command | Subcommand;
        getUserContextMenu(userContextMenuName: string): UserContextMenu;
        getModal(modalName: string): Modal;
        createModal(modalName: string, modalInput?: unknown): ModalBuilder;
        getButton(buttonName: string): Button;
        createButton(buttonName: string, buttonInput?: unknown): ButtonBuilder;
        getSelectMenu(selectMenuName: string): SelectMenu;
        createSelectMenu(selectMenuName: string, selectMenuInput?: unknown): SelectMenuBuilder;
        getComponent(interaction: RepliableInteraction): ExecutableComponent;
        getCachedPage(pageId: number): CachedPage;
    }
}

export class DreadClient extends Client {
    public commands: Collection<string, Command>;
    public userContextMenus: Collection<string, UserContextMenu>;
    public modals: Collection<string, Modal>;
    public buttons: Collection<string, Button>;
    public selectMenus: Collection<string, SelectMenu>;
    public pageCache: Collection<number, CachedPage>;

    public constructor(options: ClientOptions) {
        super(options);
        this.commands = new Collection();
        this.userContextMenus = new Collection();
        this.modals = new Collection();
        this.buttons = new Collection();
        this.selectMenus = new Collection();
        this.pageCache = new Collection();
    }

    public async init(): Promise<void> {
        await this.registerComponents("commands", this.commands);
        await this.registerComponents("user_context_menus", this.userContextMenus);
        await this.registerComponents("modals", this.modals);
        await this.registerComponents("buttons", this.buttons);
        await this.registerComponents("select_menus", this.selectMenus);
    }

    private async registerComponents<T extends NamedObject>(folderName: string, componentCollection: Collection<string, T>): Promise<void> {
        const folderPath = resolvePath(__dirname, `../components/${folderName}`)
        for (const fileName of readdirSync(folderPath)) {
            const component = await import(pathToFileURL(resolvePath(folderPath, fileName)).href).then(m => m.default);
            componentCollection.set(component.name, component);
        }
    }

    public getCommand(commandName: string, options: Pick<CommandInteractionOptionResolver<CacheType>, "getSubcommandGroup" | "getSubcommand">): Command | Subcommand {
        const command = this.commands.get(commandName);
        if (!command) throw Error(`No command ${commandName}`);

        const subcommandGroupName = options.getSubcommandGroup(false);
        const subcommandName = options.getSubcommand(false);

        if (command.subcommands && subcommandName) {
            let group: SubcommandGroup | undefined;
            if (command.subcommandGroups && subcommandGroupName) {
                group = command.subcommandGroups.get(subcommandGroupName);
                if (!group) throw Error(`No subcommand group ${subcommandGroupName}`);
            }

            const subcommand = (group ? group : command).subcommands.get(subcommandName);
            if (!subcommand) throw Error(`No subcommand ${subcommandName}`);
            return subcommand;
        }
        else return command;
    }

    public getUserContextMenu(userContextMenuName: string): UserContextMenu {
        const userContextMenu = this.userContextMenus.get(userContextMenuName);
        if (!userContextMenu) throw Error(`No userContextMenu ${userContextMenuName}`);
        else return userContextMenu;
    }

    public getModal(modalName: string): Modal {
        const modal = this.modals.get(modalName);
        if (!modal) throw Error(`No modal ${modalName}`);
        else return modal;
    }

    public createModal(modalName: string, modalInput?: unknown): ModalBuilder {
        return this.getModal(modalName).builder(modalInput);
    }

    public getButton(buttonName: string): Button {
        const button = this.buttons.get(buttonName);
        if (!button) throw Error(`No button ${buttonName}`);
        else return button;
    }

    public createButton(buttonName: string, buttonInput?: unknown): ButtonBuilder {
        return this.getButton(buttonName).builder(buttonInput);
    }

    public getSelectMenu(selectMenuName: string): SelectMenu {
        const selectMenu = this.selectMenus.get(selectMenuName);
        if (!selectMenu) throw Error(`No selectMenu ${selectMenuName}`);
        else return selectMenu;
    }

    public createSelectMenu(selectMenuName: string, selectMenuInput?: unknown): SelectMenuBuilder {
        return this.getSelectMenu(selectMenuName).builder(selectMenuInput);
    }

    public getComponent(interaction: RepliableInteraction): ExecutableComponent {
        if (interaction.isChatInputCommand()) {
            return this.getCommand(interaction.commandName, interaction.options);
        }
        else if (interaction.isUserContextMenuCommand()) {
            return this.getUserContextMenu(interaction.commandName);
        }
        else if (interaction.type === InteractionType.ModalSubmit) {
            const pos = interaction.customId.indexOf("_");
            return this.getModal(pos === -1 ? interaction.customId : interaction.customId.slice(0, pos));
        }
        else if (interaction.isButton()) {
            const pos = interaction.customId.indexOf("_");
            return this.getButton(pos === -1 ? interaction.customId : interaction.customId.slice(0, pos));
        }
        else if (interaction.isAnySelectMenu()) {
            const pos = interaction.customId.indexOf("_");
            return this.getSelectMenu(pos === -1 ? interaction.customId : interaction.customId.slice(0, pos));
        }
        else {
            throw Error("Cannot determine component for interaction.");
        }
    }

    public getCachedPage(pageId: number): CachedPage {
        const page = this.pageCache.get(pageId);
        if (!page) throw Error(`Page ${pageId} is not cached`);
        return page;
    }
}
