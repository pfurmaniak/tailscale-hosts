#!/usr/bin/env node

import { exec } from "child_process";
import { program } from "commander";
import { promisify } from "util";
import { Options } from "./options";
import { Peer } from "./peer";
import { PeerInfo } from "./peer-info";

const parseOpts = (value: string, opts: string[]) => [...opts, value];

program
    .name("tailscale-hosts")
    .description("Automatically map Tailscale hosts to DNS names in /etc/hosts.")
    .version("1.0.0")
    .option("-d, --domain <domain>", "Domain suffix to add to hostname.")
    .option("-t, --tags <tag>", "Filter hosts by tag.", parseOpts, [])
    .option("-b, --binary <binary>", "Path to tailscale binary.", "tailscale")
    .option("-h, --hosts <host>", "Additional host to append to hosts file.", parseOpts, []);

console.log(process.argv);
program.parse(process.argv);
export const options: Options = program.opts();
const execAsync = promisify(exec);

console.log(options);

async function getPeers() {
    const { stdout } = await execAsync(`${options.binary} status --json`);
    const output: { Peer: { [nodeKey: string]: PeerInfo } } = JSON.parse(stdout);
    const peers = Object.values(output.Peer).map(Peer.fromPeerInfo);
    return peers;
}

(async () => {
    const peers = await getPeers();
    for (const peer of peers) {
        if (peer.isValid) {
            console.log(peer.toString());
        }
    }
})();