import React, { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { Flex, Popover } from "@radix-ui/themes";
import { Icon } from "@iconify/react/dist/iconify.js";
import WalletModal from "./WalletModal";
import { shortenAddress } from "../../utils";
import { supportedNetworks } from "../../config/wallet-connection/wagmi";

const WalletConnection = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [isCopied, setIsCopied] = useState(false);

  // Copy wallet address to clipboard
  const copyAddressToClipboard = () => {
    if (!address) return;
    
    navigator.clipboard.writeText(address)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => console.error("Failed to copy address:", err));
  };

  //Get block explorer URL for the connected address

  const getExplorerUrl = () => {
    if (!address || !supportedNetworks || !supportedNetworks[0]?.blockExplorers?.default?.url) {
      return "#";
    }
    
    return `${supportedNetworks[0].blockExplorers.default.url}/address/${address}`;
  };

  // Show wallet connect modal if not connected
  if (!isConnected || !address) {
    return <WalletModal />;
  }

  return (
    <Popover.Root>
      <Popover.Trigger>
        <button 
          className="rounded-md px-4 py-2 hover:bg-primary/5 transition-colors"
          aria-label="Wallet options"
        >
          <Flex align="center" gap="2">
            <span className="text-secondary">
              {shortenAddress(address)}
            </span>
            <Icon
              icon="radix-icons:caret-down"
              className="w-4 h-4 text-secondary"
              aria-hidden="true"
            />
          </Flex>
        </button>
      </Popover.Trigger>
      
      <Popover.Content width="280px" className="!p-0 shadow-lg">
        <div className="py-2">
          <a
            className="flex items-center gap-4 w-full px-4 py-2 hover:bg-primary/5 transition-colors"
            href={getExplorerUrl()}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="View on block explorer"
          >
            <Icon icon="gridicons:external" className="w-5 h-5" />
            <span>View on Explorer</span>
          </a>
          
          <button 
            onClick={copyAddressToClipboard}
            className="cursor-pointer w-full flex gap-4 items-center px-4 py-2 text-primary hover:bg-primary/5 transition-colors"
          >
            <Icon 
              icon={isCopied ? "mdi:check" : "solar:copy-line-duotone"} 
              className="w-5 h-5" 
            />
            <span>{isCopied ? "Copied!" : "Copy Address"}</span>
          </button>
          
          <button
            onClick={() => disconnect()}
            className="cursor-pointer w-full flex gap-4 items-center px-4 py-2 text-red-500 hover:bg-red-50 transition-colors"
          >
            <Icon
              icon="grommet-icons:power-shutdown"
              className="w-5 h-5"
            />
            <span>Disconnect</span>
          </button>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
};

export default WalletConnection;