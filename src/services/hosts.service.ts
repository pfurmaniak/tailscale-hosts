import { computed, ReadonlySignal, signal } from "@preact/signals";
import { Inject, Service } from "typedi";
import { type Options, optionsToken } from "../options";
import { type Peers } from "./peers.service";

interface Host {
    ip: string | null;
    hostname: string;
}

interface Hosts {
    hosts: ReadonlySignal<Host[]>;
    hostsString: ReadonlySignal<string>;
    updateHosts(): Promise<void>;
}

@Service<Hosts>()
export class HostsService implements Hosts {
    hosts = signal([] as Host[]);
    hostsString = computed(() => {
        return this.hosts.value.map(h => this.options.domain
            ? `${h.ip}\t${h.hostname}.${this.options.domain}`
            : `${h.ip}\t${h.hostname}`).join("\n");
    });

    constructor(
        @Inject(optionsToken)
        private readonly options: Options,
        private readonly peersService: Peers
    ) { }

    async updateHosts() {
        await this.peersService.updateFromTailscale();
        this.peersService.updateFromOptions();

        this.hosts.value = this.peersService.peers.value.filter(p => p.isOnline)
            .map(p => ({ ip: p.ip, hostname: p.hostname }));
    }
}