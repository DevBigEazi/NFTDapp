import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import TabNavigation from "./components/TabNavigation.jsx";
import MyNFTs from "./components/NFTs/MyNFTs.jsx";
import Home from "./components/Home";
import AvailableNFTs from "./components/NFTs/AvailableNFTs.jsx";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <TabNavigation />
        <main className="flex-grow container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/my-nfts" element={<MyNFTs />} />
            <Route path="/available-nfts" element={<AvailableNFTs />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;