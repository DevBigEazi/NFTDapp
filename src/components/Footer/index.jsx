import React from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-6 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Icon icon="ri:nft-line" className="w-6 h-6 text-primary" />
            <span className="font-bold">NFT Marketplace</span>
          </div>
          
          <div className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} NFT Marketplace. All rights reserved.
          </div>
          
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-600 hover:text-primary">
              <Icon icon="ri:twitter-x-line" className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-600 hover:text-primary">
              <Icon icon="ri:discord-line" className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-600 hover:text-primary">
              <Icon icon="ri:github-line" className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;