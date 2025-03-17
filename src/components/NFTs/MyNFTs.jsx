import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";
import { useAccount } from "wagmi";
import { truncateString } from "../../utils";
import { createImageFallbackHandler } from "../../utils/nft-image";
import { useAppContext } from "../../contexts/appContext"

const MyNFTs = () => {
  const { address } = useAccount();

  const { 
    ownedTokens, 
    tokenMetaData, 
    loading, 
    transferToAddress, 
    setTransferToAddress,
    selectedToken, 
    setSelectedToken, 
    transferring, 
    isTransferLoading,
    isTransferPending,
    handleTransfer 
  } = useAppContext();

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center my-12 p-6">
        <Icon icon="ri:user-line" className="w-16 h-16 text-gray-400" />
        <h2 className="text-2xl font-bold mt-4">Connect Wallet</h2>
        <p className="text-gray-500 mt-2">
          Please connect your wallet to view your NFTs
        </p>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My NFTs</h1>
      
      {ownedTokens.length === 0 ? (
        <div className="text-center p-8 border border-gray-200 rounded-lg bg-gray-50">
          <Icon icon="ri:image-line" className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="text-xl font-medium mt-4">No NFTs Found</h3>
          <p className="text-gray-500 mt-2">
            You don't own any NFTs yet. Mint some to get started!
          </p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {ownedTokens.map((tokenId) => {
              const metadata = tokenMetaData.get(tokenId);
              if (!metadata) return null;
              
              return (
                <div
                  key={tokenId}
                  className={`w-full space-y-4 rounded-xl bg-secondary shadow-sm border p-4 cursor-pointer transition-all ${
                    selectedToken === tokenId ? "border-primary-500 ring-2 ring-primary-200" : "border-gray-200 hover:border-primary-300"
                  }`}
                  onClick={() => setSelectedToken(tokenId)}
                >
                  <div className="relative">
                    <img
                      src={metadata.image}
                      alt={`${metadata.name} image`}
                      className="rounded-xl w-full h-48 object-contain"
                      onError={createImageFallbackHandler(tokenId)}
                      loading="lazy"
                    />
                    {selectedToken === tokenId && (
                      <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full">
                        <Icon icon="ri:check-line" className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <h2 className="font-bold">{metadata.name}</h2>
                  <p className="text-sm text-gray-600">Token ID: {tokenId}</p>
                  <p className="text-sm text-gray-600">
                    {truncateString(metadata.description, 100)}
                  </p>
                  <div className="flex gap-2 items-center text-sm">
                    <Icon icon="ri:file-list-3-line" className="w-5 h-5" />
                    <span>{metadata.attributes?.length || 0} Attributes</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Transfer Form */}
          {selectedToken !== null && (
            <div className="mt-8 p-6 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-bold mb-4">
                Transfer Token #{selectedToken}
              </h3>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Recipient Address (0x...)"
                  value={transferToAddress}
                  onChange={(e) => setTransferToAddress(e.target.value)}
                  disabled={transferring || isTransferLoading || isTransferPending}
                />
                <button
                  onClick={handleTransfer}
                  disabled={transferring || isTransferLoading || isTransferPending}
                  className={`px-6 py-3 rounded-md transition-colors ${
                    transferring || isTransferLoading || isTransferPending 
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed" 
                      : "bg-primary text-white hover:bg-primary-700 cursor-pointer"
                  }`}
                >
                  {transferring || isTransferLoading || isTransferPending 
                    ? "Transferring..." 
                    : "Transfer NFT"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyNFTs;