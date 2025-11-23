import React from "react";
import Header from "../components/home/Header";
import Footer from "../components/home/Footer";
import About from "../components/home/About";
import Feature from "../components/home/Feature";
import Hero from "../components/home/Hero";

const Home = () => {
  return (
    <div>
      <Header />
      <main>
        <Hero />
        <About />
        <Feature />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
