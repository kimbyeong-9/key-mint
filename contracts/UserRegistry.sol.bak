// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title UserRegistry
 * @dev 사용자 데이터를 블록체인에 안전하게 저장하는 스마트 컨트랙트
 * @notice 이메일은 해시값으로 저장되어 개인정보를 보호합니다
 */
contract UserRegistry {
    // 사용자 정보 구조체
    struct User {
        string username;
        bytes32 emailHash;      // 이메일 해시 (평문 저장 X)
        address walletAddress;
        uint256 timestamp;
        bool exists;
    }
    
    // 이벤트 정의
    event UserRegistered(
        address indexed walletAddress,
        string username,
        bytes32 emailHash,      // 이메일 해시값만 저장
        uint256 timestamp
    );
    
    // 지갑 주소로 사용자 정보 매핑
    mapping(address => User) public users;
    
    // 등록된 사용자 주소 목록
    address[] public registeredUsers;
    
    // 소유자 주소
    address public owner;
    
    // 생성자
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev 사용자 등록 함수 (보안 강화)
     * @param _username 사용자명
     * @param _emailHash 이메일 해시값 (keccak256)
     */
    function registerUser(
        string memory _username,
        bytes32 _emailHash
    ) public {
        // 이미 등록된 사용자인지 확인
        require(!users[msg.sender].exists, "User already registered");

        // 입력 검증
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(bytes(_username).length <= 50, "Username too long");
        require(_emailHash != bytes32(0), "Email hash cannot be empty");

        // 사용자 정보 저장 (이메일은 해시값으로 저장)
        users[msg.sender] = User({
            username: _username,
            emailHash: _emailHash,
            walletAddress: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        // 등록된 사용자 목록에 추가
        registeredUsers.push(msg.sender);

        // 이벤트 발생
        emit UserRegistered(
            msg.sender,
            _username,
            _emailHash,
            block.timestamp
        );
    }
    
    /**
     * @dev 사용자 정보 조회
     * @param _walletAddress 지갑 주소
     * @return 사용자 정보
     */
    function getUser(address _walletAddress) public view returns (User memory) {
        require(users[_walletAddress].exists, "User not found");
        return users[_walletAddress];
    }
    
    /**
     * @dev 등록된 사용자 수 조회
     * @return 등록된 사용자 수
     */
    function getUserCount() public view returns (uint256) {
        return registeredUsers.length;
    }
    
    /**
     * @dev 모든 등록된 사용자 주소 조회
     * @return 등록된 사용자 주소 배열
     */
    function getAllUsers() public view returns (address[] memory) {
        return registeredUsers;
    }
    
    /**
     * @dev 사용자 존재 여부 확인
     * @param _walletAddress 지갑 주소
     * @return 사용자 존재 여부
     */
    function isUserRegistered(address _walletAddress) public view returns (bool) {
        return users[_walletAddress].exists;
    }
}