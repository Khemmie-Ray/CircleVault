import React from "react";
import token from "../../assets/naira.svg";
import token2 from "../../assets/usdc.svg";
import { motion } from "framer-motion";

const bouncingVariants = {
  bounce: {
    y: [0, -50, 0],
    x: [0, 20, -20, 0],
    transition: {
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "easeInOut",
    },
  },
};

const Hero = () => {
  return (
    <div className="relative min-h-screen bg-[#1A1F2E] overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 right-1/3 w-[500px] h-[500px] bg-[#00D4FF] rounded-full filter blur-[150px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#7C3AED] rounded-full filter blur-[180px]"></div>
      </div>

      <div className="hero-section relative py-20 px-4">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-left z-10"
            >
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                <span className="text-primary">Save </span> Smarter.
                <br />
                Reach Goals Faster.
              </h1>

              <motion.p
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-lg md:text-xl text-gray-400 font-normal mb-10 max-w-lg"
              >
                Your crypto piggy bank for the goals that matter. No banks, no
                paperwork, no waiting in line. Just set your target and watch
                your savings grow on-chain.
              </motion.p>

              {/* Floating tokens - reduced */}
              <motion.img
                src={token}
                alt=""
                className="absolute w-8 top-20 left-10 opacity-60"
                variants={bouncingVariants}
                animate="bounce"
              />
              <motion.img
                src={token2}
                alt=""
                className="absolute w-10 bottom-40 left-20 opacity-60"
                variants={bouncingVariants}
                animate="bounce"
              />

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <button className="group relative px-8 py-4 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] rounded-full text-base md:text-lg font-semibold text-white overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,212,255,0.5)] hover:scale-105">
                  <span className="relative z-10">GET STARTED</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] to-[#00D4FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button className="px-8 py-4 bg-transparent border-2 border-gray-700 rounded-full text-base md:text-lg font-semibold text-white hover:border-[#00D4FF] transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]">
                  CONTACT US
                </button>
              </motion.div>
            </motion.div>

            {/* Right Content - Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative"
            >
              {/* Decorative circle behind phone */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-[#7C3AED]/20 to-[#00D4FF]/20 rounded-full blur-3xl"></div>

              {/* Floating efficiency badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="absolute top-10 right-10 bg-[#1A1F2E] backdrop-blur-xl rounded-2xl p-4 border border-[#00D4FF]/30 shadow-2xl z-20"
              >
                <div className="text-xs text-gray-400 mb-2">Efficiency</div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full border-4 border-[#00D4FF] flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#7C3AED]"></div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Android</div>
                    <div className="text-sm font-bold text-[#00D4FF]">
                      $4,459.7
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Phone Mockup */}
              <div className="relative z-10 max-w-md mx-auto">
                {/* Dashboard Mockup Container */}
                <div className="relative bg-white rounded-[3rem] border-2 border-[#00D4FF]/30 shadow-[0_30px_80px_rgba(0,212,255,0.4)] overflow-hidden transform rotate-[-5deg] hover:rotate-0 transition-transform duration-500">
                  {/* Dashboard Header */}
                  <div className="bg-gradient-to-r from-[#0A1628] to-[#0F2744] px-6 py-4 border-b-2 border-[#00D4FF]/20">
                    <div className="text-xs text-gray-400 font-mono text-center">
                      CircleVault Dashboard
                    </div>
                  </div>

                  {/* Dashboard Content */}
                  <div className="p-6 bg-white max-h-[600px] overflow-hidden">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {/* Stat Card 1 */}
                      <div className="bg-gradient-to-br from-[#E0F7FF] to-[#CFFAFE] rounded-xl p-4 border border-[#00D4FF]/30">
                        <div className="text-gray-600 text-xs font-medium mb-1">
                          Total Savings
                        </div>
                        <div className="text-2xl font-bold text-[#0A1628]">
                          $12,450
                        </div>
                      </div>

                      {/* Stat Card 2 */}
                      <div className="bg-gradient-to-br from-[#EDE9FE] to-[#E9D5FF] rounded-xl p-4 border border-[#7C3AED]/30">
                        <div className="text-gray-600 text-xs font-medium mb-1">
                          Active Groups
                        </div>
                        <div className="text-2xl font-bold text-[#0A1628]">
                          24
                        </div>
                      </div>
                    </div>

                    {/* Chart Section */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                      <div className="text-[#0A1628] font-bold text-sm mb-3">
                        Savings Overview
                      </div>

                      {/* Mini bar chart */}
                      <div className="flex items-end justify-between gap-2 h-24">
                        {[40, 65, 45, 80, 55, 90].map((height, index) => (
                          <motion.div
                            key={index}
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{
                              duration: 0.8,
                              delay: 0.8 + index * 0.1,
                            }}
                            className="flex-1 bg-gradient-to-t from-[#00D4FF] to-[#7C3AED] rounded-t-md"
                          ></motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Transaction list preview */}
                    <div className="mt-4 space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#7C3AED]"></div>
                            <div>
                              <div className="text-xs font-medium text-gray-800">
                                Transaction
                              </div>
                              <div className="text-xs text-gray-500">
                                {i} day ago
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-bold text-[#00D4FF]">
                            +$250
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Easy Payment badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="absolute bottom-10 left-10 bg-[#1A1F2E] backdrop-blur-xl rounded-full px-6 py-3 border border-[#00D4FF]/30 shadow-2xl z-20 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#7C3AED] flex items-center justify-center text-white text-sm font-bold">
                  $
                </div>
                <div>
                  <div className="text-xs text-[#00D4FF] font-bold">
                    EASY SAVINGS
                  </div>
                  <div className="text-xs text-gray-400">Fast & Secure</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
