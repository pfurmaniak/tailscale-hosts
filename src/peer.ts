import { isIPv4 } from "net";
import { Inject, Service } from "typedi";
import { type Options, optionsToken } from "./options";
import type { PeerInfo } from "./peer-info";

@Service()
export class PeerFactory {
    @Inject(optionsToken) private readonly options!: Options;

    create(ip: string | null, hostname: string, isOnline: boolean = true, tags: string[] = []): Peer {
        return new Peer(ip, hostname, isOnline, tags);
    }

    createFromPeerInfo(peerInfo: PeerInfo): Peer {
        return this.create(
            this.parseSingleIPv4(peerInfo.TailscaleIPs),
            peerInfo.HostName,
            peerInfo.Online,
            peerInfo.Tags
        );
    }

    private parseSingleIPv4(ips: string[]): string | null {
        for (const ip of ips) {
            const normalized = ip.trim();
            if (isIPv4(normalized)) {
                return normalized;
            }
        }

        return null;
    }
}

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
        if (!this.isValid) return '';
        return `${this.ip}\t${this.hostname}`
            + (this.options.domain ? `\t${this.hostname}.${this.options.domain}` : '');
    }
}