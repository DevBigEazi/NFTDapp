/**
 * Processes and normalizes image URLs, particularly for IPFS-based content
 * 
 * @param {string} imageUrl - The original image URL to process
 * @param {number|string} [tokenId] - Optional token ID for fallback URL construction
 * @returns {string} - The processed image URL ready for display
 */
export const getProperImageUrl = (imageUrl, tokenId = null) => {
    if (!imageUrl) {
        // If no image URL is provided but token ID is available, return direct SVG URL
        if (tokenId !== null) {
            return `https://lavender-total-spoonbill-490.mypinata.cloud/ipfs/bafybeiaphtde7a5kewan3wje5qqxc6jdgtszsfbjd3kjkyfdfnrajrmpye/${tokenId}.svg`;
        }
        return '';
    }

    // Check if it's already a fully formed IPFS gateway URL
    if (imageUrl.includes('ipfs.io/ipfs/') ||
        imageUrl.includes('gateway.pinata.cloud/ipfs/') ||
        imageUrl.includes('mypinata.cloud/ipfs/')) {
        return imageUrl;
    }

    // Handle ipfs:// protocol
    if (imageUrl.startsWith('ipfs://')) {
        const ipfsHash = imageUrl.replace('ipfs://', '');
        return `https://lavender-total-spoonbill-490.mypinata.cloud/ipfs/${ipfsHash}`;
    }

    // Extract just the file name if it's a direct reference to an SVG
    let fileName = imageUrl;
    if (imageUrl.includes('/')) {
        // Get just the file name from the path
        const parts = imageUrl.split('/');
        fileName = parts[parts.length - 1];
    }

    // If it's an SVG file name or a number (tokenId), append to the IPFS CID
    if (fileName.endsWith('.svg') || !isNaN(fileName)) {
        const svgFileName = fileName.endsWith('.svg') ? fileName : `${fileName}.svg`;
        return `https://lavender-total-spoonbill-490.mypinata.cloud/ipfs/bafybeiaphtde7a5kewan3wje5qqxc6jdgtszsfbjd3kjkyfdfnrajrmpye/${svgFileName}`;
    }

    // If it's just a CID
    if (imageUrl.startsWith('Qm') || imageUrl.startsWith('bafy')) {
        return `https://lavender-total-spoonbill-490.mypinata.cloud/ipfs/${imageUrl}`;
    }

    return imageUrl;
};

/**
 * Creates an image URL fallback handler to be used with the onError event
 * 
 * @param {number|string} tokenId - The token ID to use for fallback URL 
 * @returns {Function} - Error handler function for img onError
 */
export const createImageFallbackHandler = (tokenId) => (event) => {
    console.error(`Failed to load image for token ${tokenId}:`, event.target.src);
    event.target.onerror = null;

    // Try direct SVG URL as fallback
    const fallbackUrl = `https://lavender-total-spoonbill-490.mypinata.cloud/ipfs/bafybeiaphtde7a5kewan3wje5qqxc6jdgtszsfbjd3kjkyfdfnrajrmpye/${tokenId}.svg`;
    console.log(`Trying fallback URL: ${fallbackUrl}`);

    if (event.target.src !== fallbackUrl) {
        event.target.src = fallbackUrl;
    } else {
        // If the fallback URL also fails, use a generic placeholder
        event.target.src = 'https://via.placeholder.com/400x300?text=NFT+Image';
    }
};

/**
 * Creates a placeholder metadata object for when real metadata is unavailable
 * 
 * @param {number|string} tokenId - The token ID 
 * @returns {Object} - Placeholder metadata object with basic info and image URL
 */
export const createPlaceholderMetadata = (tokenId) => {
    return {
        name: `Token #${tokenId}`,
        description: "Metadata unavailable",
        image: `https://lavender-total-spoonbill-490.mypinata.cloud/ipfs/bafybeiaphtde7a5kewan3wje5qqxc6jdgtszsfbjd3kjkyfdfnrajrmpye/${tokenId}.svg`,
        attributes: []
    };
};