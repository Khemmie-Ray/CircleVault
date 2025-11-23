import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable, defineConfig } from "hardhat/config";

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
                settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      production: {
        version: "0.8.28",
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },

    coston2: {
      type: "http",
      chainType: "l1",
      url: configVariable("COSTON2_RPC_URL"),
      accounts: [configVariable("COSTON2_PRIVATE_KEY"), configVariable("COSTON2_PRIVATE_KEY1"), configVariable("COSTON2_PRIVATE_KEY2"), configVariable("COSTON2_PRIVATE_KEY3")],
    },

    mainnetFork: {
      type: "edr-simulated",
      forking: {
        url: "https://rpc.ankr.com/flare_coston2", // Coston2  RPC URL
        // blockNumber: 14390000, // optional
      },
    },
  },
});