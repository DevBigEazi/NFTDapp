import { createConfig, http } from "wagmi";
import { liskSepolia } from "wagmi/chains";

export const supportedNetworks = [liskSepolia];

export const config = createConfig({
    chains: supportedNetworks,
    multiInjectedProviderDiscovery: true, // default to true though
    transports: {
        [liskSepolia.id]: http(),
    },
});
