// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title UserRegistry
 * @dev 사용자 등록 컨트랙트 - 블록체인에 사용자 정보 저장
 * @notice 프라이버시 보호를 위해 해시값만 저장
 */
contract UserRegistry {
    // 사용자 프로필 구조체
    struct UserProfile {
        bytes32 usernameHash;  // 사용자명 해시 (프라이버시 보호)
        uint256 createdAt;     // 등록 시간
        bool exists;           // 등록 여부
    }

    // 상태 변수
    mapping(address => UserProfile) public profiles;
    uint256 public totalUsers;

    // 이벤트
    event Registered(
        address indexed user,
        bytes32 usernameHash,
        uint256 timestamp
    );

    event ProfileUpdated(
        address indexed user,
        bytes32 newUsernameHash,
        uint256 timestamp
    );

    // 에러
    error AlreadyRegistered();
    error NotRegistered();
    error InvalidUsernameHash();

    /**
     * @dev 사용자 등록
     * @param usernameHash 사용자명 해시값 (keccak256)
     */
    function register(bytes32 usernameHash) external {
        if (profiles[msg.sender].exists) {
            revert AlreadyRegistered();
        }

        if (usernameHash == bytes32(0)) {
            revert InvalidUsernameHash();
        }

        profiles[msg.sender] = UserProfile({
            usernameHash: usernameHash,
            createdAt: block.timestamp,
            exists: true
        });

        totalUsers++;

        emit Registered(msg.sender, usernameHash, block.timestamp);
    }

    /**
     * @dev 프로필 업데이트
     * @param newUsernameHash 새로운 사용자명 해시값
     */
    function updateProfile(bytes32 newUsernameHash) external {
        if (!profiles[msg.sender].exists) {
            revert NotRegistered();
        }

        if (newUsernameHash == bytes32(0)) {
            revert InvalidUsernameHash();
        }

        profiles[msg.sender].usernameHash = newUsernameHash;

        emit ProfileUpdated(msg.sender, newUsernameHash, block.timestamp);
    }

    /**
     * @dev 사용자 등록 여부 확인
     * @param user 확인할 사용자 주소
     * @return 등록 여부
     */
    function isRegistered(address user) external view returns (bool) {
        return profiles[user].exists;
    }

    /**
     * @dev 사용자 프로필 조회
     * @param user 조회할 사용자 주소
     * @return usernameHash 사용자명 해시
     * @return createdAt 등록 시간
     */
    function getProfile(address user) external view returns (
        bytes32 usernameHash,
        uint256 createdAt
    ) {
        UserProfile memory profile = profiles[user];
        return (profile.usernameHash, profile.createdAt);
    }
}
