import React, { useCallback } from "react";
import { useAccount, useChainId, useConfig } from "wagmi";
import { useAppContext } from "../contexts/appContext";
import { Contract } from "ethers";
import NFT_ABI from "../ABI/nft.json";
import { getEthersSigner } from "../config/wallet-connection/adapter";
import { isSupportedNetwork } from "../utils";

const useMintToken = () => {
    const { address } = useAccount();
    const chainId = useChainId();
    const wagmiConfig = useConfig();
    const { nextTokenId, maxSupply, mintPrice, setNextTokenId } = useAppContext();

    return useCallback(async () => {
        if (!address) return alert("Please connect your wallet");
        if (!isSupportedNetwork(chainId)) return alert("Unsupported network");
        if (nextTokenId >= maxSupply) return alert("No more tokens to mint");

        const signer = await getEthersSigner(wagmiConfig);

        const contract = new Contract(
            import.meta.env.VITE_NFT_CONTRACT_ADDRESS,
            NFT_ABI,
            signer
        );

        try {
            const tx = await contract.mint({ value: mintPrice });
            const receipt = await tx.wait();

            if (receipt.status === 0) {
                throw new Error("Transaction failed");
            }

            // Update the nextTokenId state after successful minting
            setNextTokenId(Number(nextTokenId) + 1);

            alert("Token minted successfully");

            // Return the receipt for any further processing
            return receipt;
        } catch (error) {
            console.error("error: ", error);
            alert(`Failed to mint: ${error.message}`);
        }
    }, [address, chainId, maxSupply, mintPrice, nextTokenId, wagmiConfig, setNextTokenId]);
};

export default useMintToken;