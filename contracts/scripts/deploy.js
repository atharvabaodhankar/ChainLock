const hre = require("hardhat");

async function main() {
  const PasswordVault = await hre.ethers.getContractFactory("PasswordVault");
  const vault = await PasswordVault.deploy();

  await vault.waitForDeployment(); // ✅ Fix here
  console.log(`✅ Contract deployed to: ${vault.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
