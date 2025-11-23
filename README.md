# 🪙 CircleVault

**CircleVault** is a decentralized savings dApp that enables users to create and manage individual or group savings goals using ERC20 tokens. This repository contains the frontend interface that interacts with the underlying smart contracts to offer a seamless user experience for thrift creation, participation, and tracking.

---

## 🔍 Overview

CircleVault empowers users to:
- Save towards personal financial goals (Solo Vault)
- Collaboratively contribute with friends or community members (Collective Vault)
- Enjoy secure, on-chain management of savings via low-gas proxy contracts

The frontend is designed to guide users through:
- Wallet connection and registration
- Creating or joining savings goals
- Tracking progress and managing contributions

---

## ✨ Features

- **User Registration**: Sign up with a unique username and optional verification for group participation.
- **Thrift Creation**: Launch solo or group savings goals with custom parameters.
- **Group Participation**: Join existing thrift pools once verified by the admin.
- **On-Chain Saving**: Make token contributions securely using ERC20 approvals.
- **Progress Tracking**: View your savings milestones, deadlines, and group stats.
- **Admin Dashboard** *(for superusers)*: Verify users, adjust platform settings, and monitor thrift contracts.

---

## 🛠 Tech Stack

| Layer           | Tools/Frameworks                             |
|----------------|-----------------------------------------------|
| UI              | React.js, Tailwind CSS, Headless UI          |
| Blockchain      | Ethers.js, Reown                             |
| State Mgmt      | Context                                      |

---

Architecture
---
![Savings](./public/Savings.jpg)
![CircleVault](./public/CircleVault.jpg)
![UserCreation](./public/UserCreation.jpg)
![GroupSavings](./public/GroupSavings.jpg)
![Architecture](./public/Architecture.jpg)
![Arch](./public/Arch.jpg)


### **Step 1: Clone the Repository**

```bash
git clone https://github.com/your-username/CircleVault.git
cd CircleVault-frontend
```

---

### **Step 2: Install Dependencies**

```bash
npm install
```

*Or if using yarn:*

```bash
yarn install
```

---

### **Step 3: Configure Environment Variables**

Create a `.env` file in the root directory by copying the example:

```bash
cp .env.example .env
```

Edit the `.env` file with the following Flare Testnet configuration:

```env
# Flare Testnet RPC URL
VITE_RPC_URL=https://coston2-api.flare.network/ext/C/rpc

# Deployed Contract Addresses on Flare Testnet
VITE_CONTRACT_ADDRESS=0xab20e6d156f6f1ea70793a70c01b1a379b603d50
VITE_FACTORY_ADDRESS=0x1f8b55d6b85b42bdbcc4f183656e0c01a93dbf40
VITE_SINGLE_IMPL=0xcfc5eb4990a2d976475a616059517c6e1093c67e
VITE_GROUP_IMPL=0x99d299148b5574a3317fe2b0a3f728e124ac7371
VITE_MULTICALL2_ADDRESS = "0xe5922321678CfF0568E508b84eFc846D23112877"

# Mock Token for Testing
VITE_TOKEN_ADDRESS = 0xea9c19564186958fb6de241c049c3727a6a40c28

# Optional: Reown (WalletConnect) Project ID
VITE_PROJECTID=your_project_id_here
```

**Important Notes:**
- The RPC URL connects to Flare Testnet via the JSON-RPC relay
- Contract addresses are already deployed on Flare Testnet
- Get a free Reown Project ID from [Reown Cloud](https://cloud.reown.com/)

---

### **Step 4: Configure MetaMask for Flare Testnet**

Add Flare Testnet to your MetaMask:

| Parameter | Value |
|-----------|-------|
| **Network Name** | Flare Testnet |
| **RPC URL** | `https://coston2-api.flare.network/ext/C/rpc` |
| **Chain ID** | `114` |
| **Currency Symbol** | `CFLR` |
| **Block Explorer** | `https://coston2-explorer.flare.network` |
---

### **Step 5: Fund Your Wallet**

---

### **Step 6: Run the Development Server**

Start the local development server:

```bash
npm run dev
```

*Or with yarn:*

```bash
yarn dev
```

The application will launch at:

```
http://localhost:5173
```

---

### **Running Environment**

When properly configured, your local environment should have:

- **Frontend**: React development server running on `http://localhost:5173`
- **Blockchain Network**: Connected to Flare Testnet via `https://coston2-explorer.flare.network`
- **Wallet**: MetaMask or compatible wallet connected to Flare Testnet (Chain ID: 114)
- **Smart Contracts**: Interacting with deployed contracts at the addresses specified in `.env`

**Expected Console Output:**

```
VITE v4.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

### **Step 7: Test the Application**

1. Open `http://localhost:5173` in your browser
2. Connect your wallet (ensure it's on Flare Testnet)
3. Register a new user with a username
4. Create a solo or group thrift savings goal
5. Make test contributions using the Mock Token
6. Track your savings progress on the dashboard

---

### **Troubleshooting**

#### Issue: Wallet won't connect
- **Solution**: Verify MetaMask is on Flare Testnet (Chain ID: 114) and has testnet CFLR

#### Issue: Transactions failing
- **Solution**: Ensure you have sufficient testnet CFLR for gas fees

#### Issue: Contract not found errors
- **Solution**: Double-check contract addresses in `.env` match deployed addresses

#### Issue: RPC connection errors
- **Solution**: Verify `VITE_RPC_URL` is set to `https://coston2-api.flare.network/ext/C/rpc`

---

## 📝 Contract Addresses

All contracts are deployed on **Flare Testnet**:

- **Main Contract**: `0xab20e6d156f6f1ea70793a70c01b1a379b603d50`
- **Multicall2**: `0xe5922321678CfF0568E508b84eFc846D23112877`
`
- **Mock Token**: `0xea9c19564186958fb6de241c049c3727a6a40c28`
- **Single Thrift Clone**: `0xcfc5eb4990a2d976475a616059517c6e1093c67e`
- **Group Thrift Clone**: `0x99d299148b5574a3317fe2b0a3f728e124ac7371`
- **MinimalProxy Factory deployed at**: `0x1f8b55d6b85b42bdbcc4f183656e0c01a93dbf40`

View contracts on [HashScan Testnet Explorer](https://coston2-explorer.flare.network/)

---

## 📄 License

This project is licensed under the MIT License.

## Pitch Deck

Pitch Deck: 


## Demo Video Link:
