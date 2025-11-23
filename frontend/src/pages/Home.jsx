import React from "react";
import Header from "../components/home/Header";
import Footer from "../components/home/Footer";
import About from "../components/home/About";
import Feature from "../components/home/Feature";
import Hero from "../components/home/Hero";

const Home = () => {
  return (
    <main>
      <Hero />
      <About />
      <Feature />
    </main>
  );
};

export default Home;
