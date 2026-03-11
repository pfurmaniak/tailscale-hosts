#!/usr/bin/env node
import 'reflect-metadata';

import { program } from "commander";
import Container from 'typedi';
import { optionsToken } from "./options";
import { Peer } from "./peer";
import { PeerInfo } from "./peer-info";
import { execAsync, parseArrayOpts } from './utils';

program
    .name("tailscale-hosts")
    .description("Automatically map Tailscale hosts to DNS names in /etc/hosts.")
    .version("1.0.0")
    .option("-d, --domain <domain>", "Domain suffix to add to hostname.")
    .option("-t, --tags <tags>", "Filter hosts by tag.", parseArrayOpts, [])
    .option("-b, --binary <binary>", "Path to tailscale binary.", "tailscale")
    .option("-h, --hosts <hosts>", "Additional host to append to hosts file.", parseArrayOpts, [])
    .action((args) => {
        console.log(args);
    });

program.parse(process.argv);
Container.set(optionsToken, program.opts());

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