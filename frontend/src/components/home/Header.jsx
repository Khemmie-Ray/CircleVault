import React, { useState, useEffect } from "react";
import { NavLink } from "react-router";
import logo from "../../assets/circle-logo.svg";
import { Divide as Hamburger } from "hamburger-react";
import { useScroll, motion, useSpring } from "framer-motion";
import { useAppKit } from "@reown/appkit/react";

const Header = () => {
  const [isOpen, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const { open } = useAppKit();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-dark/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          : "bg-linear-to-b from-dark to-darkest"
      }`}
    >
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-linear-to-r from-[#00D4FF] to-[#7C3AED] origin-[0%] z-50 shadow-[0_0_20px_rgba(0,212,255,0.5)]"
        style={{ scaleX }}
      />

      <nav className="w-[90%] max-w-7xl mx-auto hidden lg:flex items-center justify-between py-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center"
        >
          <img src={logo} alt="CircleVault logo" className="h-10 w-auto" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-8"
        >
          <NavLink
            to="/"
            className={({ isActive }) =>
              `relative text-base font-medium transition-all duration-300 ${
                isActive
                  ? "text-[#00D4FF]"
                  : "text-gray-300 hover:text-[#00D4FF]"
              } group`
            }
          >
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] group-hover:w-full transition-all duration-300"></span>
          </NavLink>
          <a
            href="#about"
            className="relative text-base font-medium text-gray-300 hover:text-[#00D4FF] transition-all duration-300 group"
          >
            About Us
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] group-hover:w-full transition-all duration-300"></span>
          </a>
          <a
            href="#features"
            className="relative text-base font-medium text-gray-300 hover:text-[#00D4FF] transition-all duration-300 group"
          >
            Features
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] group-hover:w-full transition-all duration-300"></span>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <button
            onClick={() => open()}
            className="group relative px-6 py-3 bg-linear-to-r from-[#00D4FF] to-[#7C3AED] rounded-full text-base font-semibold text-white overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,212,255,0.5)] hover:scale-105"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              Connect Wallet
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] to-[#00D4FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </motion.div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="w-[90%] mx-auto lg:hidden flex items-center justify-between py-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img src={logo} alt="CircleVault logo" className="h-8 w-auto" />
        </motion.div>

        {/* Hamburger Menu */}
        <div className="z-50">
          <Hamburger
            toggled={isOpen}
            toggle={setOpen}
            color="#00D4FF"
            direction="right"
            size={24}
          />
        </div>

        {/* Mobile Menu Overlay */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setOpen(false)}
            />

            {/* Mobile Menu */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-gradient-to-br from-[#0A1628] to-[#0F2744] shadow-2xl z-50 overflow-y-auto"
            >
              {/* Close Button Area */}
              <div className="flex justify-end p-6">
                <div className="w-12"></div> {/* Spacer for hamburger */}
              </div>

              {/* Menu Content */}
              <div className="flex flex-col items-center px-8 pt-8 pb-12 space-y-8">
                {/* Logo in mobile menu */}
                <img
                  src={logo}
                  alt="CircleVault logo"
                  className="h-12 w-auto mb-4"
                />

                {/* Divider */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#00D4FF]/50 to-transparent"></div>

                {/* Navigation Links */}
                <div className="flex flex-col items-center space-y-6 w-full">
                  <NavLink
                    to="/"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `text-lg font-semibold transition-all duration-300 ${
                        isActive
                          ? "text-[#00D4FF]"
                          : "text-gray-300 hover:text-[#00D4FF]"
                      }`
                    }
                  >
                    Home
                  </NavLink>
                  <a
                    href="#about"
                    onClick={() => setOpen(false)}
                    className="text-lg font-semibold text-gray-300 hover:text-[#00D4FF] transition-all duration-300"
                  >
                    About Us
                  </a>
                  <a
                    href="#features"
                    onClick={() => setOpen(false)}
                    className="text-lg font-semibold text-gray-300 hover:text-[#00D4FF] transition-all duration-300"
                  >
                    Features
                  </a>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#00D4FF]/50 to-transparent"></div>
                <button
                  onClick={() => open()}
                  className="w-full px-6 py-4 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] rounded-full text-base font-semibold text-white shadow-lg hover:shadow-[0_0_30px_rgba(0,212,255,0.5)] transition-all duration-300 hover:scale-105"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      />
                    </svg>
                    Connect Wallet
                  </span>
                </button>

                {/* Social Links */}
                <div className="flex gap-4 pt-8">
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full bg-[#1A3A5C] flex items-center justify-center text-[#00D4FF] hover:bg-[#00D4FF] hover:text-white transition-all duration-300 hover:scale-110"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full bg-[#1A3A5C] flex items-center justify-center text-[#00D4FF] hover:bg-[#00D4FF] hover:text-white transition-all duration-300 hover:scale-110"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full bg-[#1A3A5C] flex items-center justify-center text-[#00D4FF] hover:bg-[#00D4FF] hover:text-white transition-all duration-300 hover:scale-110"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
