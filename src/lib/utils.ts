import { readdirSync } from "node:fs";
import { resolve as resolvePath } from "node:path";
import { pathToFileURL } from "node:url";
const __dirname = import.meta.dirname;

import { Activity, Collection, EmbedBuilder, Role, User } from "discord.js";


export type ConstructorFields<T> = Pick<T, keyof T>;

export type CreateBuilderFunction<T> = (input?: unknown) => T;

export type ExecuteInteractionFunction<T> = (interaction: T) => Promise<void>;

export interface NamedObject {
    name: string;
}

export interface PageSubsection {
    header: string;
    body: string;
}

export interface PageSection {
    header: string;
    body?: string;
    image?: string;
    subsections: PageSubsection[];
}

export interface CachedPage {
    content: PageSection[];
    path: string;
    timestamp: number;
}

export const assertType = <T>(value: T, expectedType: unknown): asserts value is T => {
    if (typeof value !== expectedType) throw Error(`Value ${value} is not of type ${expectedType}`);
};

export const buildComponentCollection = async <T extends NamedObject>(folderName: string) => {
    const collectedComponents = new Collection<string, T>()
    const folderPath = resolvePath(__dirname, `../components/${folderName}`)
    for (const fileName of readdirSync(folderPath)) {
        const component: T = await import(pathToFileURL(resolvePath(folderPath, fileName)).href).then(m => m.default);
        collectedComponents.set(component.name, component);
    }
    return collectedComponents;
};

export const namedObjectMapper = <T extends NamedObject>(entry: T) => [entry.name, entry] as [string, T];

export const formatRoles = (roles: (Role | string)[]) => {
    if (roles.length === 1) return `@${roles[0]}`;
    else if (roles.length === 2) return `@${roles[0]} and @${roles[1]}`;
    else if (roles.length > 2) {
        const lastElement = roles.pop();
        return roles.map(r => `@${r}, `).join() + "@" + lastElement;
    }
};

export const pageSectionEmbed = (section: PageSection) => {
    const embed = new EmbedBuilder().setTitle(section.header);
    if (section.body) embed.setDescription(section.body);
    if (section.image) embed.setImage(section.image);
    if (section.subsections) section.subsections.map(x => embed.addFields({ name: x.header, value: x.body ? x.body : "\u200b" }));

    return embed;
};

export const streamEmbed = (activity: Activity, user: User) => new EmbedBuilder()
    .setAuthor({ name: user.username + " is now live!", iconURL: user.avatarURL() || undefined, url: activity.url || undefined })
    .setTitle(activity.details)
    .setURL(activity.url)
    .setImage(activity.assets?.largeImageURL() || null);

export const objectsArrayEquals = (arr1: unknown[], arr2: unknown[]) => {
    if (arr1.length !== arr2.length) return false;
    else return arr1.every((x, i) => JSON.stringify(x) === JSON.stringify(arr2[i]));
};
