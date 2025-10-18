// Hardhat 배포 스크립트
const hre = require("hardhat");

async function main() {
  console.log("🚀 스마트 컨트랙트 배포 시작...\n");

  // 배포 계정 확인
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 배포 계정:", deployer.address);
  console.log("💰 계정 잔액:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // 1. UserRegistry 배포
  console.log("1️⃣ UserRegistry 컨트랙트 배포 중...");
  const UserRegistry = await hre.ethers.getContractFactory("UserRegistry");
  const userRegistry = await UserRegistry.deploy();
  await userRegistry.waitForDeployment();
  const userRegistryAddress = await userRegistry.getAddress();
  console.log("✅ UserRegistry 배포 완료:", userRegistryAddress);
  console.log("");

  // 2. VaultNFT 배포
  console.log("2️⃣ VaultNFT 컨트랙트 배포 중...");
  const VaultNFT = await hre.ethers.getContractFactory("VaultNFT");
  const vaultNFT = await VaultNFT.deploy();
  await vaultNFT.waitForDeployment();
  const vaultNFTAddress = await vaultNFT.getAddress();
  console.log("✅ VaultNFT 배포 완료:", vaultNFTAddress);
  console.log("");

  // 3. Marketplace 배포
  console.log("3️⃣ Marketplace 컨트랙트 배포 중...");
  const Marketplace = await hre.ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy();
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ Marketplace 배포 완료:", marketplaceAddress);
  console.log("");

  // 4. Marketplace에 민터 권한 부여
  console.log("4️⃣ Marketplace에 민터 권한 부여 중...");
  const addMinterTx = await vaultNFT.addMinter(marketplaceAddress);
  await addMinterTx.wait();
  console.log("✅ Marketplace가 민터로 등록되었습니다.");
  console.log("");

  // 배포 정보 출력
  console.log("=" .repeat(60));
  console.log("🎉 모든 컨트랙트 배포 완료!");
  console.log("=" .repeat(60));
  console.log("");
  console.log("📋 배포된 컨트랙트 주소:");
  console.log("  UserRegistry:", userRegistryAddress);
  console.log("  VaultNFT:    ", vaultNFTAddress);
  console.log("  Marketplace: ", marketplaceAddress);
  console.log("");
  console.log("⚠️  .env.local 파일에 아래 내용을 추가하세요:");
  console.log("=" .repeat(60));
  console.log(`VITE_USER_REGISTRY_ADDRESS=${userRegistryAddress}`);
  console.log(`VITE_VAULT_NFT_ADDRESS=${vaultNFTAddress}`);
  console.log(`VITE_MARKETPLACE_ADDRESS=${marketplaceAddress}`);
  console.log("=" .repeat(60));
  console.log("");

  // Etherscan 검증 명령어
  if (hre.network.name === "sepolia") {
    console.log("🔍 Etherscan 검증 명령어:");
    console.log("=" .repeat(60));
    console.log(`npx hardhat verify --network sepolia ${userRegistryAddress}`);
    console.log(`npx hardhat verify --network sepolia ${vaultNFTAddress}`);
    console.log(`npx hardhat verify --network sepolia ${marketplaceAddress}`);
    console.log("=" .repeat(60));
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
