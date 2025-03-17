import { Contract } from "ethers";
import { createContext, useContext, useEffect, useState } from "react";
import { getReadOnlyProvider } from "../utils";
import NFT_ABI from "../ABI/nft.json";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "react-hot-toast";
import { getProperImageUrl, createPlaceholderMetadata } from "../utils/nft-image";

const appContext = createContext();

export const useAppContext = () => {
  const context = useContext(appContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const { address } = useAccount();
  const contractAddress = import.meta.env.VITE_NFT_CONTRACT_ADDRESS;
  
  const [nextTokenId, setNextTokenId] = useState(null);
  const [maxSupply, setMaxSupply] = useState(null);
  const [baseTokenURI, setBaseTokenURI] = useState("");
  const [tokenMetaData, setTokenMetaData] = useState(new Map());
  const [mintPrice, setMintPrice] = useState(null);
  const [ownedTokens, setOwnedTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transferToAddress, setTransferToAddress] = useState("");
  const [selectedToken, setSelectedToken] = useState(null);
  const [transferring, setTransferring] = useState(false);
  
  const { 
    data: hash, 
    isPending: isTransferLoading, 
    writeContract 
  } = useWriteContract();

  const { isLoading: isTransferPending } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (hash) {
      toast.success("Transfer initiated! Waiting for confirmation...");
    }
  }, [hash]);

  useEffect(() => {
    if (!isTransferPending && hash) {
      toast.success("NFT transferred successfully!");
      setTransferring(false);
      setSelectedToken(null);
      setTransferToAddress("");
      fetchOwnedTokens();
    }
  }, [isTransferPending, hash]);

  // Function to get the read-only contract
  const getContract = () => {
    return new Contract(
      contractAddress,
      NFT_ABI,
      getReadOnlyProvider()
    );
  };

  // Function to fetch token IDs owned by the user
  const fetchOwnedTokens = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const contract = getContract();
      
      // Get balance (number of tokens owned)
      const balance = await contract.balanceOf(address);
      
      if (Number(balance) > 0) {
        await fetchOwnedTokensByOwnership();
      } else {
        setOwnedTokens([]);
      }
    } catch (error) {
      console.error("Error fetching owned tokens:", error);
      toast.error("Failed to load your NFTs");
      await fetchOwnedTokensByOwnership();
    } finally {
      setLoading(false);
    }
  };

  // fetch tokens by getting all tokens and checking ownership
  const fetchOwnedTokensByOwnership = async () => {
    if (!address) return;
    
    try {
      const contract = getContract();
    
      let maxTokensToCheck;

      try {
        maxTokensToCheck = await contract.totalSupply();
      } catch (innerError) {
        console.error("Could not determine max tokens to check, using default of 100");
        maxTokensToCheck = 100; // Fallback if neither method is available
      }

      const ownedIds = [];
      const batchSize = 10; // Process tokens in batches to avoid UI freezing
      
      // Process tokens in batches
      for (let batchStart = 0; batchStart < Number(maxTokensToCheck); batchStart += batchSize) {
        const batchEnd = Math.min(batchStart + batchSize, Number(maxTokensToCheck));
        const batchPromises = [];
        
        for (let i = batchStart; i < batchEnd; i++) {
          batchPromises.push((async (tokenId) => {
            try {
              const owner = await contract.ownerOf(tokenId);
              if (owner.toLowerCase() === address.toLowerCase()) {
                console.log(`Found owned token ID: ${tokenId} via ownership check`);
                return tokenId;
              }
            } catch (error) {
              return null;
            }
            return null;
          })(i));
        }
        
        const batchResults = await Promise.all(batchPromises);
        const validTokenIds = batchResults.filter(id => id !== null);
        ownedIds.push(...validTokenIds);
        
        console.log(`Checked tokens ${batchStart}-${batchEnd-1}, found ${validTokenIds.length} owned tokens in this batch`);
        
        // Update UI for each batch so user sees progress
        if (validTokenIds.length > 0) {
          // Fetch metadata for tokens in this batch
          validTokenIds.forEach(tokenId => {
            fetchTokenMetadata(tokenId);
          });
          
          // Update the owned tokens list
          setOwnedTokens(prevTokens => [...prevTokens, ...validTokenIds]);
        }
      }
      
      console.log(`Total found: ${ownedIds.length} owned tokens via scanning`);
      
      // Final update to ensure we have the complete list
      if (ownedIds.length > 0) {
        setOwnedTokens(ownedIds);
      }
    } catch (error) {
      console.error("Error in token ownership scanning:", error);
      toast.error("Failed to load your NFTs");
    }
  };

  // Function to fetch metadata for a token
  const fetchTokenMetadata = async (tokenId) => {
    try {
      const contract = getContract();
      
      console.log(`Fetching metadata for token ${tokenId}`);
      
      // Check if we already have this metadata to avoid duplicate fetches
      if (tokenMetaData.has(tokenId)) {
        console.log(`Already have metadata for token ${tokenId}`);
        return;
      }
      
      // Get the token URI
      let tokenURI;
      try {
        tokenURI = await contract.tokenURI(tokenId);
        console.log(`Token URI for ${tokenId}: ${tokenURI}`);
      } catch (error) {
        console.error(`Error getting tokenURI for ${tokenId}:`, error);
        
        // If we can't get the tokenURI, we want to try and construct it from baseTokenURI
        try {
          const baseTokenURI = await contract.baseTokenURI();
          tokenURI = `${baseTokenURI}${tokenId}.json`;
          console.log(`Constructed URI from baseTokenURI: ${tokenURI}`);
        } catch (baseURIError) {
          console.error("Could not get baseTokenURI either:", baseURIError);
          
          // If we can't get the URI at all, create a placeholder
          setTokenMetaData(prevMetadata => 
            new Map(prevMetadata.set(tokenId, createPlaceholderMetadata(tokenId)))
          );
          return;
        }
      }
      
      if (tokenURI) {
        // Using the utility function to process the URI
        const metadataURL = tokenURI.replace('ipfs://', 'https://lavender-total-spoonbill-490.mypinata.cloud/ipfs/');
        console.log(`Fetching metadata from: ${metadataURL}`);
        
        try {
          // Fetch the metadata
          const response = await fetch(metadataURL);
          if (response.ok) {
            const metadata = await response.json();
            console.log(`Successfully fetched metadata for token ${tokenId}:`, metadata);
            
            // Process the image URL using the utility function
            if (metadata.image) {
              metadata.image = getProperImageUrl(metadata.image, tokenId);
            } else {
              // Use utility to get direct SVG URL
              metadata.image = getProperImageUrl(null, tokenId);
            }
            
            console.log(`Processed image URL: ${metadata.image}`);
            
            // Update the metadata state
            setTokenMetaData(prevMetadata => new Map(prevMetadata.set(tokenId, metadata)));
          } else {
            console.error(`Failed to fetch metadata: ${response.status} ${response.statusText}`);
            
            // If we can't fetch the metadata, create a placeholder
            setTokenMetaData(prevMetadata => 
              new Map(prevMetadata.set(tokenId, createPlaceholderMetadata(tokenId)))
            );
          }
        } catch (fetchError) {
          console.error(`Error fetching metadata from ${metadataURL}:`, fetchError);
          
          // Create placeholder on fetch error
          setTokenMetaData(prevMetadata => 
            new Map(prevMetadata.set(tokenId, createPlaceholderMetadata(tokenId)))
          );
        }
      }
    } catch (error) {
      console.error(`Error in fetchTokenMetadata for token ${tokenId}:`, error);
      
      // Create placeholder metadata in case of any error
      setTokenMetaData(prevMetadata => 
        new Map(prevMetadata.set(tokenId, createPlaceholderMetadata(tokenId)))
      );
    }
  };

  // Handle direct transfer function - this simplifies the interface for components
  const handleTransfer = () => {
    if (!selectedToken) {
      toast.error("Please select a token to transfer");
      return;
    }
    
    if (!transferToAddress || transferToAddress.trim() === "") {
      toast.error("Please enter a valid address");
      return;
    }
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(transferToAddress)) {
      toast.error("Please enter a valid Ethereum address");
      return;
    }
    
    transferToken(selectedToken, transferToAddress);
  };

  // Improved transfer function using wagmi's useWriteContract
  const transferToken = (tokenId, toAddress) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }
    
    try {
      setTransferring(true);
      
      console.log(`Transferring token ${tokenId} to ${toAddress}`);
      
      // Call transferFrom function with from, to, tokenId parameters using writeContract
      writeContract({
        address: contractAddress,
        abi: NFT_ABI,
        functionName: 'transferFrom',
        args: [address, toAddress, BigInt(tokenId)],
      });
      
    } catch (error) {
      console.error("Transfer error:", error);
      toast.error(`Transfer failed: ${error.message || "Unknown error"}`);
      setTransferring(false);
    }
  };

  // Load contract info on initial render
  useEffect(() => {
    const contract = getContract();
    
    contract
      .nextTokenId()
      .then((id) => setNextTokenId(id))
      .catch((error) => console.error("error fetching nextTokenId: ", error));
      
    contract
      .baseTokenURI()
      .then((uri) => setBaseTokenURI(uri))
      .catch((error) => console.error("error fetching baseTokenURI: ", error));
      
    contract
      .maxSupply()
      .then((supply) => setMaxSupply(supply))
      .catch((error) => console.error("error fetching maxSupply: ", error));
      
    contract
      .mintPrice()
      .then((price) => setMintPrice(price))
      .catch((error) => console.error("error fetching mintPrice: ", error));
      
  }, []);

  // Fetch owned tokens when address changes or after token is minted
  useEffect(() => {
    if (address) {
      fetchOwnedTokens();
    } else {
      setOwnedTokens([]);
      setTokenMetaData(new Map());
    }
  }, [address, nextTokenId]);

  return (
    <appContext.Provider
      value={{
        nextTokenId,
        setNextTokenId,
        maxSupply,
        baseTokenURI,
        tokenMetaData,
        mintPrice,
        ownedTokens,
        loading,
        fetchOwnedTokens,
        fetchTokenMetadata,
        transferToken,
        getContract,
        transferToAddress,
        setTransferToAddress,
        selectedToken,
        setSelectedToken,
        transferring,
        isTransferLoading,
        isTransferPending,
        handleTransfer 
      }}
    >
      {children}
    </appContext.Provider>
  );
};