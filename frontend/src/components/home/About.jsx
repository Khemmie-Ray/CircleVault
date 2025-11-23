import React from "react";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { HiOutlineUser } from "react-icons/hi2";

import { motion } from "framer-motion";

const About = () => {
  const audiences = [
    {
      icon: <HiOutlineUser />,
      title: "Solo Savers",
      description:
        "Those saving independently for personal milestones while maintaining the option to join group contributions or access community loans.",
      gradient: "from-[#00D4FF] to-[#0891B2]",
      delay: 0.1,
    },
    {
      icon: <HiOutlineUserGroup />,
      title: "Collective Savers",
      description:
        "Friends, families or communities looking to pool resources for shared objectives, such as purchasing assets or supporting community projects",
      gradient: "from-[#00D4FF] to-[#7C3AED]",
      delay: 0.3,
    },
  ];

  return (
    <section className="py-20 bg-[#0F1419]">
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
            Who is{" "}
            <span className="bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] bg-clip-text text-transparent">
              CircleVault
            </span>{" "}
            for?
          </h2>
          <p className="text-lg md:text-xl text-gray-400">
            Our Target Audience
          </p>
        </motion.div>

        {/* Audience Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {audiences.map((audience, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: audience.delay }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative"
            >
              {/* Gradient border effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${audience.gradient} rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-300`}></div>
              
              {/* Card */}
              <div className="relative h-full bg-gradient-to-br from-[#1A3A5C] to-[#0A1628] rounded-2xl p-8 border border-[#00D4FF]/20 backdrop-blur-sm transition-all duration-300 group-hover:border-transparent">
                {/* Icon with gradient background */}
                <div className="mb-6">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${audience.gradient} rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] group-hover:scale-110`}
                  >
                    {audience.icon}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-bold text-white mb-4 group-hover:text-[#00D4FF] transition-colors duration-300">
                  {audience.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 leading-relaxed">
                  {audience.description}
                </p>

                {/* Decorative element */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${audience.gradient} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom decoration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-[#00D4FF]/10 to-[#7C3AED]/10 rounded-full border border-[#00D4FF]/20">
            <div className="w-3 h-3 bg-[#00D4FF] rounded-full animate-pulse"></div>
            <p className="text-gray-300 font-medium">
              Join thousands of users building their financial future
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;