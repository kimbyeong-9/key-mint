import { ethers, network } from "hardhat";
import fs from 'fs';

async function main() {
  console.log("🚀 VaultNFT 스마트 컨트랙트 배포 시작...");

  // VaultNFT 컨트랙트 가져오기
  const VaultNFT = await ethers.getContractFactory("VaultNFT");
  
  // 컨트랙트 배포
  const vaultNFT = await VaultNFT.deploy();
  
  // 배포 완료까지 대기
  await vaultNFT.waitForDeployment();
  
  // 배포된 컨트랙트 주소 가져오기
  const contractAddress = await vaultNFT.getAddress();
  
  console.log("✅ VaultNFT 배포 완료!");
  console.log("📍 컨트랙트 주소:", contractAddress);
  console.log("🌐 네트워크:", network.name);
  console.log("⛓️ 체인 ID:", network.config.chainId);
  
  // 컨트랙트 정보를 파일에 저장
  const contractInfo = {
    address: contractAddress,
    network: network.name,
    chainId: network.config.chainId,
    deployedAt: new Date().toISOString(),
    abi: [
      {
        "inputs": [
          {"internalType": "address", "name": "to", "type": "address"},
          {"internalType": "string", "name": "tokenURI", "type": "string"}
        ],
        "name": "mint",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
        "name": "ownerOf",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [{"internalType": "address", "name": "minter", "type": "address"}],
        "name": "addMinter",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
        "name": "isMinter",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
      }
    ]
  };
  
  // src/contracts 디렉토리가 없으면 생성
  if (!fs.existsSync('./src/contracts')) {
    fs.mkdirSync('./src/contracts', { recursive: true });
  }
  
  fs.writeFileSync(
    './src/contracts/VaultNFT.json', 
    JSON.stringify(contractInfo, null, 2)
  );
  
  console.log("💾 컨트랙트 정보가 src/contracts/VaultNFT.json에 저장되었습니다.");
  console.log("\n🔧 다음 단계:");
  console.log("1. .env 파일에 VITE_VAULT_NFT_ADDRESS=" + contractAddress + " 추가");
  console.log("2. Web3.Storage API 토큰 설정");
  console.log("3. 프론트엔드에서 NFT 민팅 테스트");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 배포 실패:", error);
    process.exit(1);
  });
