import { Token } from "typedi";

export const optionsToken = new Token<Options>("OPTIONS_TOKEN");
export type Options = Readonly<{
    domain: string | null;
    tags: string[];
    binary: string | null;
    hosts: string[];
}>;
