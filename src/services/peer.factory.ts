import { isIPv4 } from "net";
import { Inject, Service } from "typedi";
import { type Options, optionsToken } from "../options";
import { Peer } from "../types/peer";
import { PeerInfo } from "../types/peer-info";

@Service()
export class PeerFactory {
    @Inject(optionsToken) private readonly options!: Options;

    create(ip: string | null, hostname: string, isOnline: boolean = true, tags: string[] = []): Peer {
        return new Peer(ip, hostname, isOnline, tags, this.options);
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