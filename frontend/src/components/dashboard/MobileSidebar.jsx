import { useState } from "react";
import { NavLink } from "react-router";
import logo from "../../assets/mark.svg";
import { CgViewComfortable } from "react-icons/cg";
import { TbMoneybag } from "react-icons/tb";
import Dropdown from "./Dropdown";
import { BiLogOut } from "react-icons/bi";
import { Divide as Hamburger } from "hamburger-react";
import { MdBookmarkBorder, MdNotificationsNone } from "react-icons/md";

const MobileSidebar = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isOpen, setOpen] = useState(false);

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown((prev) => (prev === dropdownName ? null : dropdownName));
  };

  const activeStyle = {
    borderRadius: "12px",
    width: "100%",
    backgroundColor: "#CEC1FF",
    color: "#080A29",
  };

  const savingItems = [
    { label: "Solo Vault", href: "/dashboard/solo-vault" },
    { label: "Collective Vault", href: "/dashboard/collective-vault" },
    { label: "All Vaults", href: "/dashboard/allVaults" },
  ];

  return (
    <div className="bg-darker w-[100%] text-textGrey flex items-center justify-between relative lg:hidden md:hidden p-6">
      <img src={logo} alt="logo" className="w-[50px]" />

      <Hamburger
        toggled={isOpen}
        toggle={setOpen}
        color="#FFFFFF"
        direction="left"
      />
      {isOpen && (
        <div className="absolute right-0 top-24 w-[100%] p-8 bg-white text-darker">
            <div className="flex items-center justify-between mb-4">
          <div className="flex items-center mr-6 text-2xl">
            <MdBookmarkBorder className="mr-2"/>
            <MdNotificationsNone />
          </div>
          <div className="text-[14px] text-right">
            <w3m-button />
          </div>
        </div>
          <div className="px-4">
            <NavLink
              to="/dashboard"
              className="text-[14px] text-darker flex items-center p-4 mb-4"
              style={({ isActive }) => (isActive ? activeStyle : null)}
              end
            >
              <CgViewComfortable className="mr-2 text-[14px]" />
              Overview
            </NavLink>

            <Dropdown
              label="Savings Module"
              icon={TbMoneybag}
              items={savingItems}
              activeStyle={activeStyle}
              isOpen={activeDropdown === "savings"}
              onToggle={() => toggleDropdown("savings")}
            />
          </div>

          <div className="mt-auto border-t border-[#303030] px-4">
            <button className="text-[14px] flex items-center p-4 py-6 text-red-600">
              <BiLogOut className="mr-2 text-xl" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileSidebar;