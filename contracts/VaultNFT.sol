// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title VaultNFT
 * @dev NFT 컬렉션 컨트랙트 (ERC-721)
 * @notice IPFS 메타데이터와 함께 NFT 발행
 */
contract VaultNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId = 1;

    // 발행자 권한 관리
    mapping(address => bool) public minters;

    // 이벤트
    event Minted(
        address indexed to,
        uint256 indexed tokenId,
        string tokenURI,
        uint256 timestamp
    );

    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);

    // 에러
    error NotMinter();
    error InvalidAddress();
    error InvalidTokenURI();

    constructor() ERC721("Vault NFT", "VNFT") Ownable(msg.sender) {
        // 컨트랙트 소유자를 기본 발행자로 설정
        minters[msg.sender] = true;
    }

    /**
     * @dev NFT 발행
     * @param to NFT를 받을 주소
     * @param tokenURI IPFS 메타데이터 URI
     * @return tokenId 발행된 토큰 ID
     */
    function mint(address to, string memory tokenURI)
        external
        returns (uint256)
    {
        if (!minters[msg.sender]) {
            revert NotMinter();
        }

        if (to == address(0)) {
            revert InvalidAddress();
        }

        if (bytes(tokenURI).length == 0) {
            revert InvalidTokenURI();
        }

        uint256 newTokenId = _nextTokenId;
        _nextTokenId++;

        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        emit Minted(to, newTokenId, tokenURI, block.timestamp);

        return newTokenId;
    }

    /**
     * @dev 발행자 추가 (소유자만 가능)
     * @param minter 추가할 발행자 주소
     */
    function addMinter(address minter) external onlyOwner {
        if (minter == address(0)) {
            revert InvalidAddress();
        }

        minters[minter] = true;
        emit MinterAdded(minter);
    }

    /**
     * @dev 발행자 제거 (소유자만 가능)
     * @param minter 제거할 발행자 주소
     */
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }

    /**
     * @dev 총 발행된 NFT 개수
     * @return 총 토큰 개수
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    /**
     * @dev 발행자 여부 확인
     * @param account 확인할 주소
     * @return 발행자 여부
     */
    function isMinter(address account) external view returns (bool) {
        return minters[account];
    }

    /**
     * @dev 모든 NFT에 대한 승인 설정 (ERC721 표준)
     * @param operator 승인할 주소
     * @param approved 승인 여부
     */
    function setApprovalForAll(address operator, bool approved) public virtual override(ERC721, IERC721) {
        super.setApprovalForAll(operator, approved);
    }
}
