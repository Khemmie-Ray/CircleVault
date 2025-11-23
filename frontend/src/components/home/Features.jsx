import React from "react";
import fImg from "../../assets/1.svg";
import fImg2 from "../../assets/2.svg";
import fImg3 from "../../assets/3.svg";
import { motion } from "framer-motion";

const Features = () => {
  const features = [
    {
      image: fImg,
      title: "Customizable Savings Modules",
      description:
        "Choose from a variety of savings modules tailored to your goals. Whether it's daily, weekly, or goal-based savings, the platform adapts to your financial plans with ease and flexibility.",
      imageFirst: true,
    },
    {
      image: fImg2,
      title: "Secure Savings Wallet",
      description:
        "Safeguard your funds with a secure and user-friendly digital wallet. Your savings are protected with advanced encryption and blockchain technology.",
      imageFirst: false,
    },
    {
      image: fImg3,
      title: "Personalized and Group Dashboard",
      description:
        "The user dashboard offers a seamless view of your activities, providing real-time insights into your savings, deposits, and progress toward financial goals.",
      imageFirst: true,
    },
  ];

  return (
    <section className="py-20 bg-[#1A1F2E]">
      <div className="w-[90%] max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Features of{" "}
            <span className="bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] bg-clip-text text-transparent">
              CircleVault
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Below are the key features that make CircleVault the best choice for
            your savings journey
          </p>
        </motion.div>

        {/* Features List */}
        <div className="space-y-24">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className={`flex flex-col ${
                feature.imageFirst
                  ? "lg:flex-row"
                  : "lg:flex-row-reverse"
              } gap-12 lg:gap-16 items-center`}
            >
              {/* Image Section */}
              <div className="w-full lg:w-1/2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="relative group"
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/20 to-[#7C3AED]/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Image container */}
                  <div className="relative bg-gradient-to-br from-[#1A3A5C]/50 to-[#0F2744]/30 backdrop-blur-sm rounded-3xl p-4 border border-[#00D4FF]/20 overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full rounded-2xl"
                    />
                    
                    {/* Decorative corner accent */}
                    <div className={`absolute top-0 ${feature.imageFirst ? 'right-0' : 'left-0'} w-20 h-20 bg-gradient-to-br from-[#00D4FF] to-[#7C3AED] opacity-20 blur-2xl`}></div>
                  </div>
                </motion.div>
              </div>

              {/* Content Section */}
              <div className="w-full lg:w-1/2 space-y-6">
                {/* Feature number badge */}
                <motion.div
                  initial={{ opacity: 0, x: feature.imageFirst ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00D4FF]/10 to-[#7C3AED]/10 rounded-full border border-[#00D4FF]/20">
                    <span className="w-2 h-2 bg-[#00D4FF] rounded-full"></span>
                    <span className="text-[#00D4FF] font-semibold text-sm">
                      Feature {index + 1}
                    </span>
                  </span>
                </motion.div>

                {/* Title */}
                <motion.h3
                  initial={{ opacity: 0, x: feature.imageFirst ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-3xl md:text-4xl font-bold text-white leading-tight"
                >
                  {feature.title}
                </motion.h3>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, x: feature.imageFirst ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-lg text-gray-400 leading-relaxed"
                >
                  {feature.description}
                </motion.p>

                {/* Learn more link */}
                <motion.div
                  initial={{ opacity: 0, x: feature.imageFirst ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 text-[#00D4FF] hover:text-[#7C3AED] font-semibold transition-colors duration-300 group"
                  >
                    Learn more
                    <svg
                      className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                </motion.div>

                {/* Decorative gradient line */}
                <div className={`w-24 h-1 bg-gradient-to-r ${feature.imageFirst ? 'from-[#00D4FF] to-transparent' : 'from-transparent to-[#7C3AED]'} rounded-full`}></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-24 text-center"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] blur-2xl opacity-30"></div>
            <button className="relative px-8 py-4 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] rounded-full text-lg font-semibold text-white hover:shadow-[0_0_40px_rgba(0,212,255,0.5)] transition-all duration-300 hover:scale-105">
              Explore All Features
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;