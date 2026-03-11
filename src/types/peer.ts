import { type Options } from "../options";

export class Peer {
    constructor(
        public readonly ip: string | null,
        public readonly hostname: string,
        public readonly isOnline: boolean = true,
        public readonly tags: string[] = [],
        private readonly options: Options = null as any
    ) { }

    get isValid(): boolean {
        return this.ip != null && this.isOnline && this.tags.length > 0;
    }

    toString(): string {
        // if (!this.isValid) return '';
        return `${this.ip}\t${this.hostname}`
            + (this.options.domain ? `\t${this.hostname}.${this.options.domain}` : '');
    }
}