import React from "react";
import { motion } from "framer-motion";
import { HiShoppingBag, HiHeart, HiGift, HiStar } from "react-icons/hi";
import bgImg from "../../assets/bg.jpg";

const Feature = () => {
  const floatingIcons = [
    {
      icon: <HiShoppingBag className="w-6 h-6" />,
      position: "top-8 -right-7",
      delay: 0.5,
    },
    {
      icon: <HiHeart className="w-5 h-5" />,
      position: "top-32 -right-7",
      delay: 0.7,
    },
    {
      icon: <HiGift className="w-6 h-6" />,
      position: "bottom-40 -right-7",
      delay: 0.9,
    },
    {
      icon: <HiStar className="w-5 h-5" />,
      position: "bottom-16 -right-7",
      delay: 1.1,
    },
  ];

  const features = [
    {
      title: "Customizable Savings Modules",
      description:
        "Choose from a variety of savings modules tailored to your goals. Whether it's daily, weekly, or goal-based savings, the platform adapts to your financial plans with ease and flexibility.",
      imageFirst: true,
    },
    {
      title: "Secure Savings Wallet",
      description:
        "Safeguard your funds with a secure and user-friendly digital wallet. Your savings are protected with advanced encryption and blockchain technology.",
      imageFirst: false,
    },
    {
      title: "Personalized and Group Dashboard",
      description:
        "The user dashboard offers a seamless view of your activities, providing real-time insights into your savings, deposits, and progress toward financial goals.",
      imageFirst: true,
    },
  ];

  return (
    <section className="py-24 bg-[#1A1F2E] relative overflow-hidden">
      {/* Background decorative blur */}
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-[#00D4FF] rounded-full filter blur-[200px] opacity-20"></div>

      <div className="w-[90%] max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:w-[45%] md:w-[45%] w-full order-2 lg:order-1"
          >
            <div className="">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className={`flex flex-col`}
                >
                  {/* Content Section */}
                  <div className="w-full space-y-6">
                    {/* Feature number badge */}
                    <motion.div
                      initial={{ opacity: 0, x: feature.imageFirst ? -20 : 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00D4FF]/10 to-[#7C3AED]/10 rounded-full border border-[#00D4FF]/20 mt-6">
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
                      className="text-2xl md:text-3xl font-bold text-white leading-tight"
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
                    {/* Decorative gradient line */}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Image with Floating Icons and Overlapping Chart */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative order-1 lg:order-2 lg:w-[45%] md:w-[45%] w-full"
          >
            {/* Main Image Container */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              {/* Gradient overlay on image */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/20 to-[#7C3AED]/20 mix-blend-overlay"></div>

              {/* Merchant/shopping image */}
              <div className="aspect-[4/5] bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                <img
                  src={bgImg}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Curved accent at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#7C3AED]/40 to-transparent"></div>
            </div>

            {/* Floating Icon Badges - Positioned at edges */}
            {floatingIcons.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: item.delay,
                  type: "spring",
                  stiffness: 200,
                }}
                whileHover={{ scale: 1.2 }}
                className={`absolute ${item.position} w-14 h-14 bg-gradient-to-br from-[#7C3AED] to-[#A855F7] rounded-2xl flex items-center justify-center text-white shadow-2xl cursor-pointer z-20`}
              >
                {item.icon}
              </motion.div>
            ))}

            {/* Mini Chart Visualization - Overlapping the image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="absolute bottom-8 -left-16 lg:-left-20 bg-gradient-to-br from-[#1A3A5C]/95 to-[#0F2744]/95 backdrop-blur-xl rounded-2xl p-6 border border-[#00D4FF]/30 shadow-2xl z-10 w-64"
            >
              <div className="text-white text-sm font-semibold mb-4">
                Last 6 Months
              </div>
              <div className="flex items-end justify-between gap-2 h-24">
                {[45, 70, 55, 85, 60, 95].map((height, index) => (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${height}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 1.1 + index * 0.1 }}
                    className="flex-1 bg-gradient-to-t from-[#00D4FF] to-[#7C3AED] rounded-t-lg"
                  ></motion.div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
            </motion.div>

            {/* Decorative glow behind image */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-[#7C3AED]/30 to-[#00D4FF]/20 rounded-full blur-3xl -z-10"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Feature;