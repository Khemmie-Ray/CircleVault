import { useState } from "react";
import { NavLink } from "react-router";
import logo from "../../assets/circle-logo.svg";
import { CgViewComfortable } from "react-icons/cg";
import { TbMoneybag } from "react-icons/tb";
import Dropdown from "./Dropdown";
import { RxCountdownTimer } from "react-icons/rx";
import { RiSettings5Line } from "react-icons/ri";
import { BiLogOut } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown((prev) => (prev === dropdownName ? null : dropdownName));
  };

  const activeStyle = {
    background: "linear-gradient(135deg, #00D4FF 0%, #7C3AED 100%)",
    color: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 212, 255, 0.3)",
  };

  const savingItems = [
    { label: "Solo Vault", href: "/dashboard/solo-vault" },
    { label: "Collective Vault", href: "/dashboard/collective-vault" },
    { label: "All Vaults", href: "/dashboard/allVaults" },
  ];

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-screen text-gray-300 hidden lg:flex md:flex flex-col bg-gradient-to-b from-[#0A1628] to-[#0F2744] overflow-y-auto border-r border-[#00D4FF]/10 relative"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 left-0 w-40 h-40 bg-[#00D4FF] rounded-full filter blur-[80px]"></div>
        <div className="absolute bottom-20 right-0 w-40 h-40 bg-[#7C3AED] rounded-full filter blur-[80px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8 border-b border-[#00D4FF]/10 relative z-10"
      >
        <div className="p-6 flex items-center justify-center">
          <img src={logo} alt="CircleVault logo" className="h-12 w-[200px]" />
        </div>
      </motion.div>

      {/* Navigation Section */}
      <nav className="px-4 flex-1 relative z-10">
        {/* Overview Link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `group relative text-base flex items-center p-4 mb-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? "text-white"
                  : "text-gray-400 hover:text-white hover:bg-[#1A3A5C]/50"
              }`
            }
            style={({ isActive }) => (isActive ? activeStyle : {})}
            end
          >
            <CgViewComfortable className="mr-3 text-xl" />
            <span className="font-medium">Overview</span>
            {/* Hover indicator */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-gradient-to-b from-[#00D4FF] to-[#7C3AED] rounded-r-full group-hover:h-8 transition-all duration-300"></div>
          </NavLink>
        </motion.div>

        {/* Savings Module Dropdown */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Dropdown
            label="Savings Module"
            icon={TbMoneybag}
            items={savingItems}
            activeStyle={activeStyle}
            isOpen={activeDropdown === "savings"}
            onToggle={() => toggleDropdown("savings")}
          />
        </motion.div>

      
      </nav>

      {/* Logout Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mt-auto border-t border-[#00D4FF]/10 relative z-10"
      >
        <button className="group w-full text-left text-base flex items-center p-6 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 rounded-lg">
          <BiLogOut className="mr-3 text-xl group-hover:scale-110 transition-transform duration-300" />
          <span className="font-medium">Log out</span>
        </button>
      </motion.div>

      {/* Decorative bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent"></div>
    </motion.div>
  );
};

export default Sidebar;