import React from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const cardData = [
  {
    icon: <Icon icon="ri:money-dollar-circle-line" className="mr-2 w-6 h-6" />,
    title: "Mint NFT",
    desc: "Mint your NFT and own unique digital collectibles",
  },
  {
    icon: <Icon icon="ri:wallet-3-line" className="mr-2 w-6 h-6" />,
    title: "Manage NFTs",
    desc: "View and transfer your owned NFTs to other wallets",
  },
  {
    icon: <Icon icon="ri:exchange-line" className="mr-2 w-6 h-6" />,
    title: "Transfer Tokens",
    desc: "Easily transfer your NFTs to other Ethereum addresses",
  },
];

function Home() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">NFT dApp</h1>
        <p className="text-primary font-medium">Mint and manage your NFTs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {cardData.map((data, index ) => (
          <div
            key={index}
            className="border-l-2 border-primary p-4 bg-white rounded-lg shadow-sm">
            <h2 className="text-xl font-bold flex items-center">
              {data.icon}
              {data.title}
            </h2>
            <p className="text-gray-600 mt-2">{data.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
