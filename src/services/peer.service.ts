import { create, DraftedObject } from "mutative";
import { Inject, Service } from "typedi";
import { type Options, optionsToken } from "../options";
import { Peer, PeerFactory } from "../peer";
import { PeerInfo } from "../peer-info";
import { execAsync } from "../utils";

type Peers = {}

@Service()
export class PeerService {
    private draftPeers: DraftedObject<Peer>[];
    private finalizePeers: () => Peer[];
    public get peers() {
        return this.finalizePeers();
    }

    constructor(
        @Inject(optionsToken)
        private readonly options: Options,
        private readonly peerFactory: PeerFactory
    ) {
        const [draft, finalize] = create<Peer[]>([]);
        this.draftPeers = draft;
        this.finalizePeers = finalize;
    }

    async getPeersFromTailscale() {
        const { stdout } = await execAsync(`${this.options.binary} status --json`);
        const output: { Peer: { [nodeKey: string]: PeerInfo } } = JSON.parse(stdout);
        this.draftPeers = Object.values(output.Peer)
            .map(p => this.peerFactory.createFromPeerInfo(p));
    }

    getPeersFromOptions() {
        for (const customHost of this.options.hosts) {
            const [ip, hostname] = customHost.split(/\s+/);
            if (ip && hostname) {
                this.draftPeers.push(this.peerFactory.create(ip, hostname));
            }
        }
    }
}