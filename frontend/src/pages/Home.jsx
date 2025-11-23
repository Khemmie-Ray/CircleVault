import React from "react";
import Header from "../components/home/Header";
import Footer from "../components/home/Footer";
import About from "../components/home/About";
import MerchantPromos from "../components/home/MerchantPromos";
import Hero from "../components/home/Hero";

const Home = () => {
  return (
    <div>
      <Header />
      <main>
        <Hero />
        <About />
        <MerchantPromos />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
