import { Icon } from "@iconify/react/dist/iconify.js";
import { Dialog, Flex } from "@radix-ui/themes";
import React, { useState } from "react";
import { useConnectors } from "wagmi";

const WalletModal = () => {
  const connectors = useConnectors();
  const [pendingConnectorId, setPendingConnectorId] = useState(null);

  const otherConnectors = connectors.filter(
    (connector) => connector.id !== "walletConnect"
  );

  // Handles wallet connection attempt
  const connectWallet = async (connector) => {
    if (!connector) return;

    try {
      setPendingConnectorId(connector.id);
      await connector.connect();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setPendingConnectorId(null);
    }
  };

  // Renders a connector button

  const ConnectorButton = ({ connector, icon, name }) => (
    <button
      onClick={() => connectWallet(connector)}
      disabled={pendingConnectorId === connector.id}
      className="w-full cursor-pointer flex gap-4 items-center p-4 bg-primary/85 text-secondary rounded-md disabled:opacity-70 hover:bg-primary/95 transition-colors"
      aria-label={`Connect with ${name}`}>
      {icon && <img src={icon} alt={`${name} logo`} className="w-6 h-6" />}
      <span className="ml-2">{name}</span>

      {pendingConnectorId === connector.id && (
        <Icon
          icon="codex:loader"
          className="w-4 h-4 animate-spin ml-auto"
          aria-hidden="true"
        />
      )}
    </button>
  );

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <button
          className="bg-secondary text-primary px-4 py-2 rounded-md cursor-pointer hover:bg-secondary/90 transition-colors"
          aria-label="Open wallet connection dialog">
          Connect Wallet
        </button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="450px">
        <Dialog.Title className="text-primary">Available Wallets</Dialog.Title>

        <Flex direction="column" gap="3" className="mt-4">
          <div className="flex flex-col gap-4">
            {otherConnectors.map((connector) => (
              <ConnectorButton
                key={connector.id}
                connector={connector}
                icon={connector.icon}
                name={connector.name}
              />
            ))}
          </div>

          {connectors.length === 0 && (
            <p className="text-center text-primary/70">
              No wallet connectors available.
            </p>
          )}
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default WalletModal;
