const hre = require("hardhat");

async function main() {
  console.log("🚀 UserRegistry 스마트 컨트랙트 배포 시작...");

  // UserRegistry 컨트랙트 가져오기
  const UserRegistry = await hre.ethers.getContractFactory("UserRegistry");
  
  // 컨트랙트 배포
  const userRegistry = await UserRegistry.deploy();
  
  // 배포 완료까지 대기
  await userRegistry.waitForDeployment();
  
  // 배포된 컨트랙트 주소 가져오기
  const contractAddress = await userRegistry.getAddress();
  
  console.log("✅ UserRegistry 배포 완료!");
  console.log("📍 컨트랙트 주소:", contractAddress);
  console.log("🌐 네트워크:", hre.network.name);
  
  // 컨트랙트 주소를 파일에 저장 (프론트엔드에서 사용)
  const fs = require('fs');
  const contractInfo = {
    address: contractAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(
    './src/contracts/UserRegistry.json', 
    JSON.stringify(contractInfo, null, 2)
  );
  
  console.log("💾 컨트랙트 정보가 src/contracts/UserRegistry.json에 저장되었습니다.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 배포 실패:", error);
    process.exit(1);
  });