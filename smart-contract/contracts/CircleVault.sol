// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;


import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";


enum SavingsFrequency {Daily, Weekly, BiWeekly, Monthly}
interface Ifactory{
    function createClone(
       address _implementationContract,
       string memory _goalName, 
       uint _goalAmount, 
       uint _goalId, 
       SavingsFrequency _savingFrequency, 
       address currency, 
       uint _startTime, 
       uint _endTime, 
       uint _platformFee, 
       uint _emergencyFee, 
       address _creator,
       uint256 _participant
    ) external returns (address);
}

struct GroupGoal {
    address goalCreator;
    address currency;
    uint goalId;
    string goalName;
    uint goalAmount;
    uint amountSaved;
    uint amountPerPeriod;
    bool goalAchieved; // track if goal has ended
    uint startime;
    uint endtime;
    uint lasttimeSaved;
    uint totalPeriods;
    uint totalPartiticipant;
    address[] allParticipant;
    SavingsFrequency savingFrequency;
}

// Both Vault shares almost similar interface
interface ICircleVault {
    function join(address _memberAddress) external;
    function saveForGoal(address _memberAddr) external ;
    function groupGoals() external view returns (GroupGoal memory);
}

contract CircleVault is AccessControl{
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    address public admin;
    uint256 public totalUsers;
    address public platformFeeRecipient;
    uint8 public platformFee = 2; 
    uint8 public emergencyFee = 10; 
    address public singleVaultImplemetation;
    address public GroupVaultImplemetation;
    address public Factory;
    address[] public allSingleproxy;
    address[] public allGroupproxy;
    uint256 contractIndex = 1;
    bytes32 private constant EMPTY_USERNAME_HASH =0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470;
    bytes32 private constant EMPTY_USERNAME = bytes32(0);

    // -------------------------------Errors--------------------------------------------------//
    error Unauthorized();
    error AlreadyRegistered();
    error EmptyAssetName();
    error NotRegistered();
    error InvalidKey();
    error AddressZero();
    error InvalidTime();
    error InvalidAmount();
    error Invalid();
    error AlreadyTaken();
    error NotVerified();

    // -------------------------------Events--------------------------------------------------//
    event UserRegistered(address indexed userAddress, bytes32 username, bool isAssetLister);
    event UserVerified(address indexed userAddress, bool verified);
    event SingleVaultCreated(address indexed creator, address indexed vaultAddress, uint256 goalId, string goalName, uint256 goalAmount);
    event GroupVaultCreated(address indexed creator, address indexed vaultAddress, uint256 goalId, string goalName, uint256 goalAmount, uint256 participants);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event EmergencyFeeUpdated(uint256 oldFee, uint256 newFee);
    event PlatformFeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);
    event ImplementationUpdated(address indexed oldImpl, address indexed newImpl, string contractType);


    struct User {
        address userAddress;
        bytes32 userName;
        bool verified;
        bool isAssetLiser;
        bool listingApproval;
        uint256 lasttimeSaved;
        uint256[] userGoals;
    }


    mapping(address => User) public users;
    mapping(uint256 => address) public cloneAddresses;
    mapping (address => address[]) public allUserSingleProxy;
    mapping (address => address[]) public allUserGroupProxy;
    mapping (bytes32 => address ) userNameMap;

    /// @notice Initializes the CircleVault contract with implementation contracts and factory.
    /// @param _singleVault Address of the SingleVault implementation contract.
    /// @param _groupVault Address of the GroupVault implementation contract.
    /// @param _factory Address of the MinimalProxy factory for creating vault clones.
    constructor(address _singleVault, address _groupVault, address _factory ) { 
        admin = msg.sender;
        singleVaultImplemetation = _singleVault;
        GroupVaultImplemetation = _groupVault;
        Factory = _factory;
        userNameMap[EMPTY_USERNAME_HASH] = msg.sender;
        userNameMap[EMPTY_USERNAME] = msg.sender;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /// @notice Registers a new user on the CircleVault platform.
    /// @dev Prevents duplicate registrations and username collisions. Emits UserRegistered event.
    /// @param _username The unique bytes32 identifier for the user. Cannot be empty (EMPTY_USERNAME_HASH).
    /// @param _isAssetLiser Boolean flag indicating if the user is an asset lister.
    /// @custom:reverts AlreadyRegistered if the caller is already registered.
    /// @custom:reverts AlreadyTaken if the username is already taken.
    function register(bytes32 _username, bool _isAssetLiser) public {
        if(users[msg.sender].userAddress == msg.sender) {
            revert AlreadyRegistered();
        }

        if(userNameMap[_username] != address(0)){
            revert AlreadyTaken();
        }
        userNameMap[_username] = msg.sender;

        User memory _user = User(msg.sender, _username, false, _isAssetLiser, false, 0, new uint256[](0));
        users[msg.sender] = _user;
        totalUsers++;
        
        emit UserRegistered(msg.sender, _username, _isAssetLiser);
    }

    /// @notice Verifies or unverifies a registered user (admin only).
    /// @dev Only accounts with ADMIN_ROLE can call this function. Emits UserVerified event.
    /// @param _userAddress The address of the user to verify or unverify.
    /// @param _isVerified Boolean flag: true to verify, false to unverify.
    /// @custom:reverts NotRegistered if the user is not registered.
    /// @custom:reverts Unauthorized if caller does not have ADMIN_ROLE.
    function verifyUser(address _userAddress, bool _isVerified) public onlyRole(ADMIN_ROLE) {
        if(users[_userAddress].userAddress != _userAddress) {
            revert NotRegistered();
        }
        users[_userAddress].verified = _isVerified;
        
        emit UserVerified(_userAddress, _isVerified);
    }

    /// @notice Creates a new savings vault (single or group based on participant count).
    /// @dev Validates time windows and goal amounts. Deploys vault via factory and tracks it.
    /// Emits SingleVaultCreated or GroupVaultCreated event based on participant count.
    /// @param _goalName The name of the savings goal.
    /// @param _goalAmount The target amount to save (must be > 0).
    /// @param _savingFrequency The frequency of savings contributions (Daily, Weekly, BiWeekly, Monthly).
    /// @param currency The ERC20 token address for the vault currency.
    /// @param _startTime The timestamp when the vault starts (must be >= current block.timestamp).
    /// @param _endTime The timestamp when the vault ends (must be > _startTime).
    /// @param _participant The number of participants. 0 = SingleVault, >0 = GroupVault.
    /// @return clone The address of the deployed vault proxy.
    /// @return key The contract index used to identify the vault.
    /// @custom:reverts InvalidAmount if _goalAmount is 0.
    /// @custom:reverts Invalid if _startTime is in the past.
    /// @custom:reverts InvalidTime if _endTime <= _startTime or duration doesn't match frequency requirements.
    function createVault(string memory _goalName, uint _goalAmount, SavingsFrequency _savingFrequency, address currency, uint _startTime, uint _endTime, uint256 _participant) public  returns (address clone, uint256 key) {
        // if(!users[msg.sender].verified) {
        //     revert NotVerified();
        // }
        //@note add verification later
        if(_goalAmount == 0) {
            revert InvalidAmount();
        }
        if(_startTime < block.timestamp) {
            revert Invalid();
        }
        if(_endTime < _startTime) {
            revert InvalidTime();
        }

        if(_savingFrequency == SavingsFrequency.Monthly && _endTime - _startTime < 30 days) {
            revert InvalidTime();
        }

        if(_savingFrequency == SavingsFrequency.Weekly && _endTime - _startTime < 7 days) {
            revert InvalidTime();
        }

        if(_savingFrequency == SavingsFrequency.BiWeekly && _endTime - _startTime < 14 days) {
            revert InvalidTime();
        }

        if(_savingFrequency == SavingsFrequency.Daily && _endTime - _startTime < 1 days) {
            revert InvalidTime();
        }

        if(_savingFrequency > SavingsFrequency.Monthly) {
            revert InvalidTime();
        }

        uint256 _contracIndex = contractIndex;


        if(_participant > 0){
           clone = Ifactory(Factory).createClone(GroupVaultImplemetation, _goalName, _goalAmount, _contracIndex, _savingFrequency, currency, _startTime, _endTime, platformFee, emergencyFee, msg.sender, _participant );
           allGroupproxy.push(clone);
           allUserGroupProxy[msg.sender].push(clone);
           cloneAddresses[_contracIndex] = clone;


           emit GroupVaultCreated(msg.sender, clone, _contracIndex, _goalName, _goalAmount, _participant);
           contractIndex = _contracIndex + 1;
           return (clone, _contracIndex);
        }

        clone = Ifactory(Factory).createClone(singleVaultImplemetation, _goalName, _goalAmount, _contracIndex, _savingFrequency, currency, _startTime, _endTime, platformFee, emergencyFee, msg.sender, _participant );
        allSingleproxy.push(clone);
        cloneAddresses[_contracIndex] = clone;
        allUserSingleProxy[msg.sender].push(clone);
        //key = keccak256(abi.encodePacked(clone, _goalId, block.timestamp));

        emit SingleVaultCreated(msg.sender, clone, _contracIndex, _goalName, _goalAmount);
        contractIndex = _contracIndex + 1;
        return (clone, _contracIndex);
    }

    /// @notice Updates the address that receives platform fees (admin only).
    /// @dev Only accounts with ADMIN_ROLE can call this function. Emits PlatformFeeRecipientUpdated event.
    /// @param _platformFeeRecipient The new address to receive platform fees.
    /// @custom:reverts Unauthorized if caller does not have ADMIN_ROLE.
    function updatePlatformFeeRecipient(address _platformFeeRecipient) public onlyRole(ADMIN_ROLE)  {
        address oldRecipient = platformFeeRecipient;
        platformFeeRecipient = _platformFeeRecipient;
        
        emit PlatformFeeRecipientUpdated(oldRecipient, _platformFeeRecipient);
    }

    /// @notice Updates the platform fee percentage (admin only).
    /// @dev Only accounts with ADMIN_ROLE can call this function. Emits PlatformFeeUpdated event.
    /// @param _fee The new platform fee percentage (e.g., 5 = 0.5%).
    /// @custom:reverts Unauthorized if caller does not have ADMIN_ROLE.
    function updateFee(uint8 _fee) public onlyRole(ADMIN_ROLE)  {
        uint8 oldFee = platformFee;
        platformFee = _fee;
        
        emit PlatformFeeUpdated(oldFee, _fee);
    }

    /// @notice Allows a user to contribute funds to another user's group vault goal.
    /// @dev Transfers tokens from caller to CircleVault, then calls vault's saveForGoal.
    /// @param _username The bytes32 username of the user who will receive the contribution.
    /// @param _key The contract index/key identifying the specific vault.
    /// @custom:reverts Invalid if the username doesn't exist.
    /// @custom:reverts InvalidKey if the vault key doesn't exist.
    function saveFor(bytes32 _username, uint256 _key) public{        
       
        if(userNameMap[_username] == address(0)){
            revert Invalid();
        }

        address _contract =  cloneAddresses[_key];
       if(_contract == address(0)){
        revert InvalidKey();
       }

        address userAddr = userNameMap[_username];

        GroupGoal memory _group = ICircleVault(_contract).groupGoals();
        IERC20 token = IERC20(_group.currency);
        uint256 amount = _group.amountPerPeriod;

        //transfer from user to contract
        token.safeTransferFrom(msg.sender, address(this), amount);

        ICircleVault(_contract).saveForGoal(userAddr);
    }

    /// @notice Allows a user to join a group vault.
    /// @dev Calls the vault's join function to add the caller to the pending users list.
    /// @param _key The contract index/key identifying the specific group vault.
    /// @custom:reverts InvalidKey if the vault key doesn't exist.
    function joinGroup(uint256 _key) public {
       address _contract =  cloneAddresses[_key];

       if(_contract == address(0)){
        revert InvalidKey();
       }
        
       ICircleVault(_contract).join(msg.sender);
    }

    /// @notice Updates the SingleVault implementation contract address (admin only).
    /// @dev Only accounts with ADMIN_ROLE can call this function. New vaults will use the new implementation.
    /// @param _newImpl The address of the new SingleVault implementation.
    /// @custom:reverts AddressZero if _newImpl is the zero address.
    /// @custom:reverts Unauthorized if caller does not have ADMIN_ROLE.
    function updateSingleImpl(address _newImpl) public onlyRole(ADMIN_ROLE) {
        if(_newImpl == address(0)){
            revert AddressZero();
        }
        singleVaultImplemetation = _newImpl;
    }

    /// @notice Updates the GroupVault implementation contract address (admin only).
    /// @dev Only accounts with ADMIN_ROLE can call this function. New vaults will use the new implementation.
    /// @param _newImpl The address of the new GroupVault implementation.
    /// @custom:reverts AddressZero if _newImpl is the zero address.
    /// @custom:reverts Unauthorized if caller does not have ADMIN_ROLE.
    function updateGroupImpl(address _newImpl) public onlyRole(ADMIN_ROLE) {
                if(_newImpl == address(0)){
            revert AddressZero();
        }
        GroupVaultImplemetation = _newImpl;
    }

    /// @notice Retrieves the address associated with a given username.
    /// @dev View function that does not modify state.
    /// @param _username The bytes32 username to look up.
    /// @return The address associated with the username.
    /// @custom:reverts Invalid if the username doesn't exist.
    function getUserAddress(bytes32 _username) public view returns(address){
        if(userNameMap[_username] == address(0)){
            revert Invalid();
        }

        return userNameMap[_username];
    }

    /// @notice Checks if a user is verified.
    /// @dev note Currently returns true for all users (testing bypass).
    /// @param _user The address of the user to check.
    /// @return bool True if the user is verified, false otherwise.
    function isVerified(address _user) external view returns (bool) {
        // return users[_user].verified;
        //note return true for testing purpose
        return true;
    }

    /// @notice Retrieves all SingleVault proxies created by a user.
    /// @dev View function that returns an array of vault addresses.
    /// @param userAddress The address of the user.
    /// @return An array of SingleVault proxy addresses created by the user.
    function getAllUserSingleProxy(address userAddress) public view returns(address[] memory){
        return allUserSingleProxy[userAddress];
    }

    /// @notice Retrieves all GroupVault proxies created by a user.
    /// @dev View function that returns an array of vault addresses.
    /// @param userAddress The address of the user.
    /// @return An array of GroupVault proxy addresses created by the user.
    function getAllUserGroupProxy(address userAddress) public view returns(address[] memory){
        return allUserGroupProxy[userAddress];
    }

    /// @notice Retrieves all SingleVault proxies deployed on the platform.
    /// @dev View function that returns an array of all SingleVault addresses.
    /// @return An array of all SingleVault proxy addresses.
    function getAllSingleProxy() public view returns(address[] memory){
        return allSingleproxy;
    }

    /// @notice Retrieves all GroupVault proxies deployed on the platform.
    /// @dev View function that returns an array of all GroupVault addresses.
    /// @return An array of all GroupVault proxy addresses.
    function getAllGroupProxy() public view returns(address[] memory){
        return allGroupproxy;
    }

    /// @notice Retrieves all registered users (currently buggy - returns caller info only).
    /// @dev View function. NOTE: Implementation appears buggy - iterates but always returns caller's data.
    /// @return An array of User structs for all registered users.
    function returnAllUser() public view returns(User[] memory){
        User[] memory _user = new User[](totalUsers);
        uint256 index = 0;
        for(uint256 i = 0; i < totalUsers; i++){
            _user[index] = users[msg.sender];
            index++;
        }
        return _user;
    }

    /// @notice Retrieves the user information for a given address.
    /// @dev View function that does not modify state.
    /// @param _userAddress The address of the user.
    /// @return A User struct containing the user's information (address, username, verified status, etc.).
    function returnUser(address _userAddress) public view returns(User memory){
        return users[_userAddress];
    }

}