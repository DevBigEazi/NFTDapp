import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";

const TabNavigation = () => {
  const location = useLocation();
  
  const tabs = [
    {
      name: "Home",
      path: "/",
      icon: "ri:home-line",
    },
    {
      name: "My NFTs",
      path: "/my-nfts",
      icon: "ri:image-line",
    },
    {
      name: "Available NFTs",
      path: "/available-nfts",
      icon: "ri:image-line",
    },
  ];
  
  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex overflow-x-auto space-x-1 border-b border-gray-200">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex items-center px-4 py-2 font-medium rounded-t-lg border-b-2 transition-colors ${
                isActive
                  ? "text-primary border-primary bg-primary/5"
                  : "text-gray-500 border-transparent hover:text-primary hover:border-primary/30"
              }`}
            >
              <Icon icon={tab.icon} className="mr-2 w-5 h-5" />
              {tab.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TabNavigation;