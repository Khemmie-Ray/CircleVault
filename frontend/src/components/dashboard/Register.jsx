import React from "react";
import RegisterModal from "./RegisterModal";
import { FaUserPlus } from "react-icons/fa6";

const Register = () => {
  return (
    <div className="w-full flex justify-between items-center flex-col p-1 mb-4 gradient-border">
      
      <div className="bg-white flex flex-col justify-center items-center p-6 rounded-xl">
        <FaUserPlus className="text-[60px] text-dark mb-2"/>
        <p className="text-center w-[70%]">
          If you are a new user, get started on CircleVault by Registering.{" "}
          {<RegisterModal />}
        </p>
      </div>
    </div>
  );
};

export default Register;