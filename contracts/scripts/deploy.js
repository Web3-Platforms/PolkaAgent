const fs = require("node:fs/promises");
const path = require("node:path");
const { ethers, network } = require("hardhat");

async function main() {
  const [deployer, aiOracle] = await ethers.getSigners();

  console.log(`Deploying AegisVault to ${network.name}...`);

  const AegisVault = await ethers.getContractFactory("AegisVault");
  const vault = await AegisVault.deploy(deployer.address, aiOracle.address);
  await vault.waitForDeployment();

  const deployment = {
    network: network.name,
    chainId: Number(network.config.chainId ?? 0),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    aiOracle: aiOracle.address,
    aegisVault: await vault.getAddress(),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  await fs.mkdir(deploymentsDir, { recursive: true });

  const outputPath = path.join(
    deploymentsDir,
    network.name === "paseo" ? "paseo.json" : `${network.name}.json`
  );

  await fs.writeFile(outputPath, `${JSON.stringify(deployment, null, 2)}\n`);

  console.log(`AegisVault deployed to: ${deployment.aegisVault}`);
  console.log(`Deployment metadata written to: ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
