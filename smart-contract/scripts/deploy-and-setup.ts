/**
 * Full deployment & interaction flow script for CircleVault using Viem
 * 
 * This script:
 * 1. Deploys CircleVault, SingleVault, GroupVault implementations
 * 2. Deploys MockToken (ERC20)
 * 3. Registers 4 users (admin, user1, user2, user3)
 * 4. User 1 creates a SingleVault
 * 5. User 1 creates a GroupVault with 3 participants
 * 6. User1 invites and accepts User2 & User3 to the GroupVault
 * 
 * Usage:
 *   npx tsx scripts/deploy-and-setup.ts
 * 
 * Environment Variables Required (for Coston network):
 *   NETWORK - 'hardhat' or 'coston2' (default: hardhat)
 *   RPC_URL - RPC endpoint
 *   COSTON_PRIVATE_KEY - Admin/deployer private key
 *   COSTON_PRIVATE_KEY1 - User1 private key
 *   COSTON_PRIVATE_KEY2 - User2 private key
 *   COSTON_PRIVATE_KEY3 - User3 private key
 */
import 'dotenv/config';

import { 
  createPublicClient, 
  createWalletClient, 
  http, 
  parseEther, 
  formatEther,
  getContract,
  type Address,
  type Hash,
  defineChain,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { flareTestnet } from 'viem/chains';  //coston2
import { ethers } from 'ethers';


// Import contract ABIs
import SingleVaultABI from '../artifacts/contracts/SingleVault.sol/SingleVault.json';
import GroupVaultABI from '../artifacts/contracts/GroupVault.sol/GroupVault.json';
import FactoryABI from '../artifacts/contracts/Factory.sol/MinimalProxy.json';
import CircleVaultABI from '../artifacts/contracts/CircleVault.sol/CircleVault.json';
import MockTokenABI from '../artifacts/contracts/test/mocks/MockToken.sol/MockToken.json';


// Type definitions matching Solidity structs
enum SavingsFrequency {
  Weekly = 0,
  Monthly = 1,
  Quarterly = 2,
}

interface GroupGoal {
  goalCreator: Address;
  currency: Address;
  goalId: bigint;
  goalName: string;
  goalAmount: bigint;
  amountSaved: bigint;
  amountPerPeriod: bigint;
  goalAchieved: boolean;
  startime: bigint;
  endtime: bigint;
  lasttimeSaved: bigint;
  totalPeriods: bigint;
  totalPartiticipant: bigint;
  allParticipant: Address[];
  savingFrequency: SavingsFrequency;
}

const hardhat = defineChain({
  id: 31337,
  name: 'Hardhat',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  testnet: true,
});


const NETWORK = process.env.NETWORK || 'hardhat';
const selectedChain = NETWORK === 'coston2' ? flareTestnet : hardhat;
console.log(`Selected network: ${NETWORK}`);

// ⚠️
// For Coston network, use environment variables:
// - COSTON_PRIVATE_KEY (admin)
// - COSTON_PRIVATE_KEY1 (user1)
// - COSTON_PRIVATE_KEY2 (user2)
// - COSTON_PRIVATE_KEY3 (user3)
const PRIVATE_KEYS = {
  admin: process.env.COSTON_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  user1: process.env.COSTON_PRIVATE_KEY1 || "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  user2: process.env.COSTON_PRIVATE_KEY2 || "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
  user3: process.env.COSTON_PRIVATE_KEY3 || "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
};


const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';

// Utility function to log sections
function logSection(title: string) {
  console.log("\n" + "=".repeat(60));
  console.log(`  ${title}`);
  console.log("=".repeat(60));
}

// Helper function to deploy a contract
async function deployContract(
  walletClient: any,
  publicClient: any,
  abi: any,
  bytecode: `0x${string}`,
  args: any[] = []
): Promise<Address> {
  const hash = await walletClient.deployContract({
    abi,
    bytecode,
    args,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return receipt.contractAddress!;
}

async function main() {
  console.log("🚀 Starting Full CircleVault Deployment & Setup Flow\n");

  // Create accounts from private keys
  const adminAccount = privateKeyToAccount(PRIVATE_KEYS.admin as `0x${string}`);
  const user1Account = privateKeyToAccount(PRIVATE_KEYS.user1 as `0x${string}`);
  const user2Account = privateKeyToAccount(PRIVATE_KEYS.user2 as `0x${string}`);
  const user3Account = privateKeyToAccount(PRIVATE_KEYS.user3 as `0x${string}`);

  console.log("📋 Wallet Addresses:");
  console.log(`  Admin: ${adminAccount.address}`);
  console.log(`  User1: ${user1Account.address}`);
  console.log(`  User2: ${user2Account.address}`);
  console.log(`  User3: ${user3Account.address}`);

  // Create clients
  const publicClient = createPublicClient({
    chain: selectedChain,
    transport: http(RPC_URL),
  });

  const adminWallet = createWalletClient({
    account: adminAccount,
    chain: selectedChain,
    transport: http(RPC_URL),
  });

  const user1Wallet = createWalletClient({
    account: user1Account,
    chain: selectedChain,
    transport: http(RPC_URL),
  });
  
  const user2Wallet = createWalletClient({
    account: user2Account,
    chain: selectedChain,
    transport: http(RPC_URL),
  });
  
  const user3Wallet = createWalletClient({
    account: user3Account,
    chain: selectedChain,
    transport: http(RPC_URL),
  });


  logSection("📦 DEPLOYING CONTRACTS");

  // Deploy SingleVault implementation
  console.log("  Deploying SingleVault...");
  const singleVaultAddr = await deployContract(
    adminWallet,
    publicClient,
    SingleVaultABI.abi,
    SingleVaultABI.bytecode as `0x${string}`
  );
  console.log(`    ✓ SingleVault: ${singleVaultAddr}`);

  // Deploy GroupVault implementation
  console.log("  Deploying GroupVault...");
  const groupVaultAddr = await deployContract(
    adminWallet,
    publicClient,
    GroupVaultABI.abi,
    GroupVaultABI.bytecode as `0x${string}`
  );
  console.log(`    ✓ GroupVault: ${groupVaultAddr}`);

  // Deploy MinimalProxy factory
  console.log("  Deploying MinimalProxy factory...");
  const factoryAddr = await deployContract(
    adminWallet,
    publicClient,
    FactoryABI.abi,
    FactoryABI.bytecode as `0x${string}`
  );
  console.log(`    ✓ MinimalProxy: ${factoryAddr}`);

  // Deploy CircleVault
  console.log("  Deploying CircleVault...");
  const circleVaultAddr = await deployContract(
    adminWallet,
    publicClient,
    CircleVaultABI.abi,
    CircleVaultABI.bytecode as `0x${string}`,
    [singleVaultAddr, groupVaultAddr, factoryAddr]
  );
  console.log(`    ✓ CircleVault: ${circleVaultAddr}`);

  // Deploy MockToken
  console.log("  Deploying MockToken...");
  const tokenAddr = await deployContract(
    adminWallet,
    publicClient,
    MockTokenABI.abi,
    MockTokenABI.bytecode as `0x${string}`
  );
  console.log(`    ✓ MockToken: ${tokenAddr}`);

  // Create contract instances
  const circleVault = getContract({
    address: circleVaultAddr,
    abi: CircleVaultABI.abi,
    client: { public: publicClient, wallet: adminWallet },
  });

  const mockToken = getContract({
    address: tokenAddr,
    abi: MockTokenABI.abi,
    client: { public: publicClient, wallet: adminWallet },
  });

  logSection("💰 DISTRIBUTING TOKENS");

  // Distribute tokens to users
  const tokenAmount = parseEther("100000");
  for (const [label, account] of Object.entries({ 
    User1: user1Account, 
    User2: user2Account, 
    User3: user3Account 
  })) {
    const hash = await mockToken.write.transfer([account.address, tokenAmount]);
    await publicClient.waitForTransactionReceipt({ hash });
    console.log(`  ✓ Transferred 100,000 tokens to ${label} (${account.address})`);
  }

  logSection("👤 REGISTERING & VERIFYING USERS");

  // Get contract instances for each user
  const circleVaultUser1 = getContract({
    address: circleVaultAddr,
    abi: CircleVaultABI.abi,
    client: { public: publicClient, wallet: user1Wallet },
  });
  
  const circleVaultUser2 = getContract({
    address: circleVaultAddr,
    abi: CircleVaultABI.abi,
    client: { public: publicClient, wallet: user2Wallet },
  });
  
  const circleVaultUser3 = getContract({
    address: circleVaultAddr,
    abi: CircleVaultABI.abi,
    client: { public: publicClient, wallet: user3Wallet },
  });

  // Each user registers themselves
  console.log("  Registering users...");
  let hash = await circleVaultUser1.write.register([ethers.encodeBytes32String("User1"), false]);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("    ✓ User1 registered");

  hash = await circleVaultUser2.write.register([ethers.encodeBytes32String("User2"), false]);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("    ✓ User2 registered");

  hash = await circleVaultUser3.write.register([ethers.encodeBytes32String("User3"), false]);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("    ✓ User3 registered");

  // Verify users
  console.log("  Verifying users (admin)...");
  hash = await circleVault.write.verifyUser([user1Account.address, true]);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log(`    ✓ User1 verified`);

  hash = await circleVault.write.verifyUser([user2Account.address, true]);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log(`    ✓ User2 verified`);

  hash = await circleVault.write.verifyUser([user3Account.address, true]);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log(`    ✓ User3 verified`);

  logSection("🏦 CREATING SINGLEVAULT");

  const now = Math.floor(Date.now() / 1000);
  const singleStartTime = BigInt(now + 86400); // 1 day from now
  const singleEndTime = singleStartTime + BigInt(2592000); // 30 days

  console.log("  Creating SingleVault for User1...");
  hash = await circleVaultUser1.write.createVault([
    "My Solo Savings Goal",
    parseEther("5000"),
    0, // SavingsFrequency.Weekly
    tokenAddr,
    singleStartTime,
    singleEndTime,
    0, // Single vault
  ]);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log(`    ✓ SingleVault created`);
  console.log(`      Start: ${new Date(Number(singleStartTime) * 1000).toISOString()}`);
  console.log(`      End:   ${new Date(Number(singleEndTime) * 1000).toISOString()}`);

  logSection("👥 CREATING GROUPVAULT");

  const groupStartTime = BigInt(now + 86400);
  const groupEndTime = groupStartTime + BigInt(2592000);

  console.log("  Creating GroupVault for User1 with User2 & User3...");
  
  // Simulate the call first to get return values
  const [groupVaultCloneAddr, vaultKey] = await circleVaultUser1.read.createVault([
    "Group Savings Project",
    parseEther("9000"), // 3000 per person
    1, // SavingsFrequency.Monthly
    tokenAddr,
    groupStartTime,
    groupEndTime,
    3, // 3 participants
  ]) as [Address, bigint];
  
  // Now execute the actual transaction
  hash = await circleVaultUser1.write.createVault([
    "Group Savings Project",
    parseEther("9000"), // 3000 per person
    1, // SavingsFrequency.Monthly
    tokenAddr,
    groupStartTime,
    groupEndTime,
    3, // 3 participants
  ]);
  await publicClient.waitForTransactionReceipt({ hash });

  console.log(`    ✓ GroupVault created: ${groupVaultCloneAddr}`);
  console.log(`      Vault Key: ${vaultKey}`);
  console.log(`      Start: ${new Date(Number(groupStartTime) * 1000).toISOString()}`);
  console.log(`      End:   ${new Date(Number(groupEndTime) * 1000).toISOString()}`);

  if (groupVaultCloneAddr) {
    logSection("📨 USER INVITATION & ACCEPTANCE");

    const groupVaultClone = getContract({
      address: groupVaultCloneAddr,
      abi: GroupVaultABI.abi,
      client: { public: publicClient, wallet: user1Wallet },
    });

    console.log("  User1 inviting User2 and User3...");
    hash = await groupVaultClone.write.join([user2Account.address]);
    await publicClient.waitForTransactionReceipt({ hash });
    console.log("    ✓ User2 invited");

    hash = await groupVaultClone.write.join([user3Account.address]);
    await publicClient.waitForTransactionReceipt({ hash });
    console.log("    ✓ User3 invited");

    console.log("  User1 accepting invitations...");
    hash = await groupVaultClone.write.accept([user2Account.address]);
    await publicClient.waitForTransactionReceipt({ hash });
    console.log("    ✓ User2 accepted");

    hash = await groupVaultClone.write.accept([user3Account.address]);
    await publicClient.waitForTransactionReceipt({ hash });
    console.log("    ✓ User3 accepted");

    logSection("📊 GROUPVAULT INFORMATION");

    const goal = await groupVaultClone.read.getGroupGoal() as GroupGoal;
    console.log(`  Goal Name: ${goal.goalName}`);
    console.log(`  Goal Amount: ${formatEther(goal.goalAmount)} tokens`);
    console.log(`  Amount Per Period: ${formatEther(goal.amountPerPeriod)} tokens`);
    console.log(`  Total Participants: ${goal.totalPartiticipant}`);
    console.log(`  Currency: ${goal.currency}`);
    console.log(`  Rotational Mode: ${goal.goalAchieved ? 'Completed' : 'Active'}`);
    console.log(`  Start Time: ${new Date(Number(goal.startime) * 1000).toISOString()}`);
    console.log(`  End Time: ${new Date(Number(goal.endtime) * 1000).toISOString()}`);
    console.log(`  Savings Frequency: ${SavingsFrequency[goal.savingFrequency]}`);
  }

  logSection("✅ DEPLOYMENT SUMMARY");

  console.log("\n📋 Deployed Contracts:");
  console.log(`  CircleVault:      ${circleVaultAddr}`);
  console.log(`  SingleVault Impl: ${singleVaultAddr}`);
  console.log(`  GroupVault Impl:  ${groupVaultAddr}`);
  console.log(`  MinimalProxy:     ${factoryAddr}`);
  console.log(`  MockToken:        ${tokenAddr}`);

  console.log("\n👥 User Accounts:");
  console.log(`  Admin: ${adminAccount.address}`);
  console.log(`  User1: ${user1Account.address} (Creator)`);
  console.log(`  User2: ${user2Account.address}`);
  console.log(`  User3: ${user3Account.address}`);

  console.log("\n🎯 Vaults Created:");
  console.log(`  SingleVault: (created by User1)`);
  console.log(`  GroupVault:  ${groupVaultCloneAddr}`);

  console.log("\n" + "=".repeat(60));
  console.log("✓ Setup Complete!");
  console.log("=".repeat(60) + "\n");
}

main()
  .then(() => {
    console.log("✓ Script completed successfully\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error during deployment:");
    console.error(error.message);
    if (error.cause) console.error("Cause:", error.cause);
    process.exit(1);
  });