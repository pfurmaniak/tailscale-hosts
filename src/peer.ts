import { isIPv4 } from "net";
import type { PeerInfo } from "./peer-info";
import { options } from "./script";

export class Peer {
    constructor(
        public readonly ip: string | null,
        public readonly hostname: string,
        public readonly isOnline: boolean = true,
        public readonly tags: string[] = []
    ) { }

    get isValid(): boolean {
        return this.ip != null && this.isOnline && this.tags.length > 0;
    }

    static fromPeerInfo(peerInfo: PeerInfo): Peer {
        return new Peer(
            Peer.parseSingleIPv4(peerInfo.TailscaleIPs),
            peerInfo.HostName,
            peerInfo.Online,
            peerInfo.Tags
        );
    }

    toString(): string {
        if (!this.isValid) return '';
        return `${this.ip}\t${this.hostname}`
            + (options.domain ? `\t${this.hostname}.${options.domain}` : '');
    }

    private static parseSingleIPv4(ips: string[]): string | null {
        for (const ip of ips) {
            const normalized = ip.trim();
            if (isIPv4(normalized)) {
                return normalized;
            }
        }

        return null;
    }
}