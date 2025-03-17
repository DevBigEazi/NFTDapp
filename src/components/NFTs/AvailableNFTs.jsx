// components/AvailableNFTs.jsx
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useAppContext } from "../../contexts/appContext";
import { formatEther } from "ethers";
import { Icon } from "@iconify/react/dist/iconify.js";
import useMintToken from "../../hooks/useMintToken";
import { truncateString } from "../../utils";
import { getProperImageUrl, createImageFallbackHandler } from "../../utils/nft-image";

const AvailableNFTs = () => {
  const { address } = useAccount();
  const { nextTokenId, maxSupply, tokenMetaData, mintPrice } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const mintToken = useMintToken();

  const handleMint = async () => {
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    try {
      await mintToken();
    } catch (error) {
      console.error("Minting error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const [displayNFTs, setDisplayNFTs] = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);

  // prepare data for display
  useEffect(() => {
    const prepareNFTs = async () => {
      setLoadingImages(true);
      const preparedNFTs = [];
      
      if (tokenMetaData && maxSupply) {
        for (let i = 0; i < maxSupply; i++) {
          const metadata = tokenMetaData.get(i);
          if (metadata) {
            // utility function to get the proper image URL
            let imageUrl = metadata.image ? getProperImageUrl(metadata.image, i) : getProperImageUrl(null, i);
            
            const fixedMetadata = {
              ...metadata,
              image: imageUrl
            };
            
            preparedNFTs.push({
              id: i,
              metadata: fixedMetadata,
              status: i < nextTokenId ? "minted" : i === Number(nextTokenId) ? "available" : "upcoming"
            });
          } else {
            // If metadata is missing, still create an entry with just the SVG URL
            const imageUrl = getProperImageUrl(null, i);
            
            preparedNFTs.push({
              id: i,
              metadata: {
                name: `NFT #${i}`,
                description: "NFT from collection",
                image: imageUrl,
                attributes: []
              },
              status: i < nextTokenId ? "minted" : i === Number(nextTokenId) ? "available" : "upcoming"
            });
          }
        }
      }
      
      console.log("Prepared NFTs with image URLs:", preparedNFTs);
      setDisplayNFTs(preparedNFTs);
      setLoadingImages(false);
    };
    
    prepareNFTs();
  }, [tokenMetaData, maxSupply, nextTokenId]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">NFT Collection</h2>
        <div className="text-sm">
          {nextTokenId !== null && maxSupply ? (
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
              {nextTokenId}/{maxSupply} Minted
            </span>
          ) : (
            <div className="animate-pulse w-24 h-6 bg-gray-200 rounded-full"></div>
          )}
        </div>
      </div>

      {loadingImages || displayNFTs.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <div className="text-gray-500">Loading NFT collection...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {displayNFTs.map((nft) => (
            <div 
              key={nft.id} 
              className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <div className="w-full h-48 bg-gray-100 relative overflow-hidden">

                  <img 
                    src={nft.metadata.image} 
                    alt={`NFT #${nft.id}`}
                    className="w-full h-full object-contain"
                    onError={createImageFallbackHandler(nft.id)}
                    loading="lazy"
                  />
                  <div 
                    className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                      nft.status === "minted" 
                        ? "bg-gray-800 text-white" 
                        : nft.status === "available" 
                          ? "bg-green-500 text-white" 
                          : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {nft.status === "minted" 
                      ? "Minted" 
                      : nft.status === "available" 
                        ? "Available" 
                        : "Coming Soon"}
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{nft.metadata.name}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {truncateString(nft.metadata.description, 100)}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>ID: #{nft.id}</span>
                  <div className="flex items-center">
                    <Icon icon="ri:ethereum-fill" className="w-4 h-4 mr-1" />
                    <span>{formatEther(mintPrice)} ETH</span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleMint(nft.id)}
                  disabled={nft.status !== "available" || isLoading}
                  className={`w-full py-2 rounded-lg font-medium text-center transition-colors ${
                    nft.status === "available" && !isLoading
                      ? "bg-primary text-white hover:bg-primary-700"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isLoading && nft.status === "available" 
                    ? "Minting..." 
                    : nft.status === "minted" 
                      ? "Minted" 
                      : nft.status === "available" 
                        ? "Mint Now" 
                        : "Not Available"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableNFTs;