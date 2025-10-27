import { ethers } from "ethers";
import fs from 'fs';

async function main() {
  console.log("🚀 VaultNFT Sepolia 배포 시작 (Alchemy RPC)...");

  // Alchemy Sepolia RPC에 연결
  const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/zd8kC79HZ4XzMh-o0-1NL");
  
  // Private Key로 지갑 생성
  const privateKey = "0x13b1c9bae9e9f986e117b06ff315c8d49235ff1d93c69e757b1b2ac880871d4b";
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log("🔑 사용할 계정:", wallet.address);
  
  const balance = await provider.getBalance(wallet.address);
  console.log("💰 잔액:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) connector.log("⚠️ 경고: Sepolia ETH가 없습니다!");

  console.log("\n📦 컨트랙트 배포 중...");

  // VaultNFT 컨트랙트 ABI와 바이트코드
  const VaultNFTArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/VaultNFT.sol/VaultNFT.json', 'utf8'));
  
  // 컨트랙트 팩토리 생성
  const VaultNFT = new ethers.ContractFactory(
    VaultNFTArtifact.abi,
    VaultNFTArtifact.bytecode,
    wallet
  );
  
  // 컨트랙트 배포
  console.log("⏳ 트랜잭션 전송 중...");
  const vaultNFT = await VaultNFT.deploy();
  
  console.log("⏳ 트랜잭션 확인 대기 중...");
  // 배포 완료까지 대기
  await vaultNFT.waitForDeployment();
  
  // 배포된 컨트랙트 주소 가져오기
  const contractAddress = await vaultNFT.getAddress();
  
  console.log("\n" + "=".repeat(50));
  console.log("✅ VaultNFT Sepolia 배포 완료!");
  console.log("=".repeat(50));
  console.log("📍 컨트랙트 주소:", contractAddress);
  console.log("🌐 네트워크: Sepolia Testnet");
  console.log("⛓️ 체인 ID: 11155111");
  console.log("🔗 Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log("=".repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 배포 실패:", error);
    process.exit(1);
  });
