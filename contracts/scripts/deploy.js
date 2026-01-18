const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying AgroflowNFT to", hre.network.name, "...\n");

    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("📍 Deployer address:", deployer.address);

    // Check balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Deployer balance:", hre.ethers.formatEther(balance), "MATIC\n");

    if (balance === 0n) {
        console.log("❌ Error: No MATIC balance!");
        console.log("   Get test MATIC from: https://faucet.polygon.technology/");
        process.exit(1);
    }

    // Deploy contract
    console.log("📝 Compiling and deploying contract...");
    const AgroflowNFT = await hre.ethers.getContractFactory("AgroflowNFT");
    const contract = await AgroflowNFT.deploy();

    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    console.log("\n✅ AgroflowNFT deployed successfully!");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("📋 Contract Address:", contractAddress);
    console.log("═══════════════════════════════════════════════════════════════\n");

    // Save address to file for automatic retrieval
    try {
        require("fs").writeFileSync("deployed_address.txt", contractAddress);
    } catch (e) {
        console.log("Error writing address file:", e);
    }

    // Get network info
    const network = await hre.ethers.provider.getNetwork();

    if (network.chainId === 80002n) {
        console.log("🔍 View on Explorer:");
        console.log(`   https://amoy.polygonscan.com/address/${contractAddress}\n`);
    } else if (network.chainId === 137n) {
        console.log("🔍 View on Explorer:");
        console.log(`   https://polygonscan.com/address/${contractAddress}\n`);
    }

    console.log("📝 Next Steps:");
    console.log("   1. Copy the contract address above");
    console.log("   2. Add to your .env.local:");
    console.log(`      NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=${contractAddress}`);
    console.log("   3. Restart your Next.js dev server\n");

    // Test minting (optional verification)
    console.log("🧪 Testing contract...");
    try {
        const tx = await contract.mintBatch(
            deployer.address,
            "AF-TEST001",
            hre.ethers.keccak256(hre.ethers.toUtf8Bytes("test-data")),
            "https://agroflow.vercel.app/api/nft/1"
        );
        await tx.wait();
        console.log("✅ Test mint successful! NFT #1 minted.\n");
    } catch (error) {
        console.log("⚠️  Test mint skipped:", error.message, "\n");
    }

    console.log("🎉 Deployment complete!\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
