// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Marketplace
 * @dev NFT 마켓플레이스 컨트랙트
 * @notice NFT 판매 등록, 구매, 취소 기능 제공
 */
contract Marketplace is ReentrancyGuard, Ownable {
    // 판매 목록 구조체
    struct Listing {
        address seller;      // 판매자
        address nftContract; // NFT 컨트랙트 주소
        uint256 tokenId;     // 토큰 ID
        uint256 price;       // 가격 (Wei)
        bool active;         // 활성 상태
    }

    // 상태 변수
    mapping(uint256 => Listing) public listings;
    uint256 public listingCounter;
    uint256 public feePercent = 250; // 2.5% (basis points: 250/10000)
    address public feeRecipient;

    // 이벤트
    event Listed(
        uint256 indexed listingId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 timestamp
    );

    event Bought(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        uint256 timestamp
    );

    event Cancelled(
        uint256 indexed listingId,
        address indexed seller,
        uint256 timestamp
    );

    event FeePercentUpdated(uint256 newFeePercent);
    event FeeRecipientUpdated(address newFeeRecipient);

    // 에러
    error InvalidPrice();
    error InvalidAddress();
    error NotOwner();
    error NotActive();
    error InsufficientPayment();
    error TransferFailed();
    error InvalidFeePercent();

    constructor() Ownable(msg.sender) {
        feeRecipient = msg.sender;
    }

    /**
     * @dev NFT 판매 등록
     * @param nftContract NFT 컨트랙트 주소
     * @param tokenId 토큰 ID
     * @param price 판매 가격 (Wei)
     * @return listingId 생성된 판매 ID
     */
    function list(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant returns (uint256) {
        if (price == 0) {
            revert InvalidPrice();
        }

        if (nftContract == address(0)) {
            revert InvalidAddress();
        }

        IERC721 nft = IERC721(nftContract);

        // NFT 소유권 확인
        if (nft.ownerOf(tokenId) != msg.sender) {
            revert NotOwner();
        }

        // 마켓플레이스가 NFT를 전송할 수 있는지 확인
        if (nft.getApproved(tokenId) != address(this) &&
            !nft.isApprovedForAll(msg.sender, address(this))) {
            revert("Marketplace not approved");
        }

        uint256 listingId = listingCounter++;

        listings[listingId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            active: true
        });

        emit Listed(
            listingId,
            msg.sender,
            nftContract,
            tokenId,
            price,
            block.timestamp
        );

        return listingId;
    }

    /**
     * @dev NFT 구매
     * @param listingId 구매할 판매 ID
     */
    function buy(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];

        if (!listing.active) {
            revert NotActive();
        }

        if (msg.value < listing.price) {
            revert InsufficientPayment();
        }

        // 판매 비활성화
        listing.active = false;

        // 수수료 계산
        uint256 fee = (listing.price * feePercent) / 10000;
        uint256 sellerProceeds = listing.price - fee;

        // NFT 전송
        IERC721(listing.nftContract).safeTransferFrom(
            listing.seller,
            msg.sender,
            listing.tokenId
        );

        // 판매자에게 대금 전송
        (bool successSeller, ) = listing.seller.call{value: sellerProceeds}("");
        if (!successSeller) {
            revert TransferFailed();
        }

        // 수수료 전송
        if (fee > 0) {
            (bool successFee, ) = feeRecipient.call{value: fee}("");
            if (!successFee) {
                revert TransferFailed();
            }
        }

        // 초과 금액 환불
        if (msg.value > listing.price) {
            (bool successRefund, ) = msg.sender.call{value: msg.value - listing.price}("");
            if (!successRefund) {
                revert TransferFailed();
            }
        }

        emit Bought(
            listingId,
            msg.sender,
            listing.seller,
            listing.price,
            block.timestamp
        );
    }

    /**
     * @dev 판매 취소
     * @param listingId 취소할 판매 ID
     */
    function cancel(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];

        if (!listing.active) {
            revert NotActive();
        }

        if (listing.seller != msg.sender) {
            revert NotOwner();
        }

        listing.active = false;

        emit Cancelled(listingId, msg.sender, block.timestamp);
    }

    /**
     * @dev 수수료 비율 업데이트 (소유자만 가능)
     * @param newFeePercent 새로운 수수료 비율 (basis points)
     */
    function setFeePercent(uint256 newFeePercent) external onlyOwner {
        if (newFeePercent > 1000) { // 최대 10%
            revert InvalidFeePercent();
        }

        feePercent = newFeePercent;
        emit FeePercentUpdated(newFeePercent);
    }

    /**
     * @dev 수수료 수령자 변경 (소유자만 가능)
     * @param newFeeRecipient 새로운 수수료 수령자 주소
     */
    function setFeeRecipient(address newFeeRecipient) external onlyOwner {
        if (newFeeRecipient == address(0)) {
            revert InvalidAddress();
        }

        feeRecipient = newFeeRecipient;
        emit FeeRecipientUpdated(newFeeRecipient);
    }

    /**
     * @dev 활성 판매 목록 확인
     * @param listingId 확인할 판매 ID
     * @return 판매 정보
     */
    function getListing(uint256 listingId)
        external
        view
        returns (Listing memory)
    {
        return listings[listingId];
    }

    /**
     * @dev ERC721 수신 지원
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
