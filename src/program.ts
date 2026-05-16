#!/usr/bin/env node
import 'reflect-metadata';

import { program } from "commander";
import Container from 'typedi';
import { optionsToken } from "./options";
import { Peers, PeersService } from './services/peers.service';
import { parseArrayOptions } from './utils';

program
    .name("tailscale-hosts")
    .description("Automatically map Tailscale hosts to DNS names in /etc/hosts.")
    .version("1.0.0")
    .option("-d, --domain <domain>", "Domain suffix to add to hostname.")
    .option("-t, --tags <tags>", "Filter hosts by tag.", parseArrayOptions, [])
    .option("-b, --binary <binary>", "Path to tailscale binary.", "tailscale")
    .option("-h, --hosts <hosts>", "Additional host to append to hosts file.", parseArrayOptions, []);

program.parse(process.argv);
Container.set(optionsToken, program.opts());

(async () => {
    const peersService = Container.get<Peers>(PeersService);
    await peersService.updateFromTailscale();
    peersService.updateFromOptions();

    // console.log(peersService.peers.value);
    console.log(peersService.hostsString.value);
})();