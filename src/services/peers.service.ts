import { computed, ReadonlySignal, signal } from "@preact/signals";
import { Inject, Service } from "typedi";
import { type Options, optionsToken } from "../options";
import { Peer } from "../types/peer";
import { PeerInfo } from "../types/peer-info";
import { execAsync } from "../utils";
import { PeerFactory } from "./peer.factory";

export interface Peers {
    peers: ReadonlySignal<Peer[]>;
    hostsString: ReadonlySignal<string>;
    getFromTailscale(): Promise<void>;
    getFromOptions(): void;
}

@Service<Peers>()
export class PeersService implements Peers {
    peers = signal<Peer[]>([]);
    hostsString = computed(() => {
        return this.peers.value.filter(p => p.isOnline).map(p => p.toString()).join("\n");
    });

    constructor(
        @Inject(optionsToken)
        private readonly options: Options,
        private readonly peerFactory: PeerFactory
    ) { }

    async getFromTailscale() {
        const { stdout } = await execAsync(`${this.options.binary} status --json`);
        const output: { Peer: { [nodeKey: string]: PeerInfo } } = JSON.parse(stdout);
        const peers = Object.values(output.Peer)
            .map(p => this.peerFactory.createFromPeerInfo(p));
        this.peers.value = [...this.peers.value, ...peers];
    }

    getFromOptions() {
        for (const customHost of this.options.hosts) {
            const [ip, hostname] = customHost.split(/\s+/);
            if (ip && hostname) {
                this.peers.value = [...this.peers.value, this.peerFactory.create(ip, hostname)];
            }
        }
    }
}