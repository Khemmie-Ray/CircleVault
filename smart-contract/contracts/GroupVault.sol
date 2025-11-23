// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import {ContractRegistry} from "@flarenetwork/flare-periphery-contracts/coston2/ContractRegistry.sol";
import {RandomNumberV2Interface} from "@flarenetwork/flare-periphery-contracts/coston2/RandomNumberV2Interface.sol";

interface ICircleVault {
    function isVerified(address _user) external view returns (bool);
    function platformFeeRecipient() external view returns (address);
}

contract GroupVault is AccessControl {
    using SafeERC20 for IERC20;
    bytes32 public constant PARTICIPANT_ROLE = keccak256("PARTICIPANT_ROLE");
    RandomNumberV2Interface public _generator;


    // -------------------------------State Variables------------------------------------------//
    enum SavingsFrequency {Daily, Weekly, BiWeekly, Monthly}

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


        // Structure to track payment information per period
    // for tracking the payment status of rotational 
    struct PeriodPayment {
        uint256 period;
        address recipient; //recipient of the payment
        uint256 amountExpected; //expected amount for this period
        uint256 amountPaid; //amount users has paid/contributed to this period 
        uint256 amountReceived; //amount received by the recipient
        bool fullyPaid; 
    }


    uint256 public currentRound;
    uint256 public totalUsers;
    address public Admin;
    address public creator;
    uint public Fee;
    uint public creatorFee;
    uint public defaultFee; // Fee percentage for late payments
    uint public buffer;
    address[] public pending;
    bool initialized;
    bool rotational;
    uint256 public lastRotationalPeriod;     // Track current rotational period
    GroupGoal public groupGoals;

    // -------------------------------Round Management------------------------------------------//
    mapping(uint256 => bool) public roundCompleted;
    mapping(uint256 => GroupGoal) public roundGoals; // Store goals per round
    mapping(uint256 => mapping(address => bool)) public roundValidMembers; // Track members per round
    // Track pending users
    mapping(uint256 => mapping(address => bool)) public roundIsPending;
    
    // Historical tracking per round
    mapping(uint256 => mapping(uint256 => PeriodPayment)) public roundPeriodPayments;
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) public roundHasPaidForPeriod;
    mapping(uint256 => mapping(address => uint256)) public roundIndividualContribution;
    mapping(uint256 => mapping(address => bool)) public roundHasReceivedRotationalPayout;

    // Track all period payments
    //PeriodPayment[] public periodPayments;
    mapping(uint256 => PeriodPayment) public periodPayments;
    
    // Track defaulted payments
    mapping(uint256 => mapping(address => bool)) public hasPaidForPeriod;
    mapping(uint256 => mapping(address => bool)) public hasDefaultedForPeriod;
    // Track individual contributions
    mapping(address => uint256) public individualContribution;
    
    // Track recipients who have received payouts in rotational mode
    mapping(address => bool) public hasReceivedRotationalPayout;
    
    mapping(uint256 => bool) public roundRotationShuffled; // Track if round has been shuffled


    mapping(address => bool) public validMember;
  


    // -------------------------------Error Messages-------------------------------------------//
    error InvalidAssetOwner();
    error EmptyAssetName();
    error NotAdmin();
    error NotCreator();
    error NotVerified();
    error InvalidAmount();
    error Invalid();
    error AddressZero();
    error Achieved();
    error NotAchieved();
    error InvalidTime();
    error AlreadyInitialized();
    error PendingUser();
    error RecipientAlreadyPaid();
    error NotDueForRotationalPayout();
    error RecipientNotValidMember();
    error AlreadyPaidForPeriod();
    error NoDefaultForPeriod();
    error NoPendingPayments();
    error NoPeriodPaymentsExist();
    error InvalidParticipant();
    error FullyPaid();
    error InvalidPeriod();
    error PayoutNotProcessed();


    // -------------------------------Events--------------------------------------------------//
    event GroupGoalInitialized(address indexed creator, uint256 indexed goalId, string goalName, uint256 goalAmount, uint256 participants, uint256 startTime, uint256 endTime);
    event UserJoinedGroup(address indexed user, uint256 indexed goalId);
    event UserAcceptedToGroup(address indexed user, address indexed acceptedBy, uint256 indexed goalId);
    event SavingMade(address indexed saver, uint256 indexed goalId, uint256 amount, uint256 period, uint256 totalSaved);
    event GoalAchieved(address indexed creator, uint256 indexed goalId, uint256 totalAmount, uint256 timestamp);
    event Withdrawal(address indexed recipient, uint256 amount, bool isRotational);
    event RotationalPayout(address indexed recipient, uint256 amount, uint256 period);
    event DefaultPayment(address indexed defaulter, uint256 period, uint256 amount, uint256 penalty);
    event RecipientBalancePaid(address indexed recipient, uint256 period, uint256 amount);
    event UserMarkedAsDefaulter(address indexed user, uint256 period, address indexed markedBy);
    event RotationalSettingsUpdated(bool rotational, uint256 creatorFee, uint256 defaultFee);
    event EndTimeAdjusted(uint256 indexed goalId, uint256 newEndTime, uint256 totalParticipants);


    // -------------------------------Modifiers------------------------------------------------//
    modifier onlyCircleVault() {
        if (msg.sender != Admin) revert NotAdmin();
        _;
    }

    // -------------------------------Functions------------------------------------------------//

    function initialize(string memory _goalName, uint _goalAmount, uint _goalId, SavingsFrequency _savingFrequency, address currency, uint _startTime, uint _endTime, uint _platformFee, uint /*_emergencyFee*/, address _creator,address _circleVault, uint256 _participant) public {
        if(initialized){
            revert AlreadyInitialized();
        }
        initialized = true;
        
        
        if(_participant < 0){
            revert InvalidParticipant();
        }

        if(_goalAmount == 0) {
            revert InvalidAmount();
        }
        if(_startTime < block.timestamp) {
            revert InvalidTime();
        }
        if(_endTime < _startTime) {
            revert InvalidTime();
        }

        Fee = _platformFee;
        creator = _creator;
        Admin = _circleVault;
        currentRound = 0; // Initialize first round
        buffer = 1 days;

        (uint _totalPeriods, uint amountPerPeriod, ) = calculateSavingsSchedule(_goalAmount, _startTime, _endTime, _savingFrequency);

        address[] memory emptyParticipants;

        GroupGoal memory _goal = GroupGoal({
            goalCreator: _creator,
            currency: currency,
            goalId: _goalId,
            goalName: _goalName,
            goalAmount: _goalAmount,
            amountSaved: 0,
            amountPerPeriod: amountPerPeriod,
            goalAchieved: false, 
            startime: _startTime,
            endtime: _endTime,
            lasttimeSaved: 0,
            totalPeriods: _totalPeriods,
            totalPartiticipant: _participant,
            allParticipant: emptyParticipants ,
            savingFrequency: _savingFrequency
        });

        roundGoals[currentRound] = _goal;
        groupGoals = _goal; // Keep for backward compatibility
    
        _grantRole(DEFAULT_ADMIN_ROLE, _creator);
        _grantRole(PARTICIPANT_ROLE, _creator);
        _generator = ContractRegistry.getRandomNumberV2();

        
        emit GroupGoalInitialized(_creator, _goalId, _goalName, _goalAmount, _participant, _startTime, _endTime);
    }

    // Function to start a new round
    function startNewRound(string memory _goalName, uint _goalAmount, uint _goalId, SavingsFrequency _savingFrequency, address currency, uint _startTime, uint _endTime, uint256 _participant) public onlyRole(DEFAULT_ADMIN_ROLE) {
        // Ensure current round is completed before starting a new one
        if(!roundCompleted[currentRound]) {
            revert("Current round not completed");
        }

        if(_goalAmount == 0) {
            revert InvalidAmount();
        }
        if(_startTime < block.timestamp) {
            revert InvalidTime();
        }
        if(_endTime < _startTime) {
            revert InvalidTime();
        }

        // Increment round
        currentRound++;
        
        (uint _totalPeriods, uint amountPerPeriod, ) = calculateSavingsSchedule(_goalAmount, _startTime, _endTime, _savingFrequency);

        address[] memory emptyParticipants;

        GroupGoal memory _goal = GroupGoal({
            goalCreator: creator,
            currency: currency,
            goalId: _goalId,
            goalName: _goalName,
            goalAmount: _goalAmount,
            amountSaved: 0,
            amountPerPeriod: amountPerPeriod,
            goalAchieved: false, 
            startime: _startTime,
            endtime: _endTime,
            lasttimeSaved: 0,
            totalPeriods: _totalPeriods,
            totalPartiticipant: _participant,
            allParticipant: emptyParticipants ,
            savingFrequency: _savingFrequency
        });

        roundGoals[currentRound] = _goal;
        groupGoals = _goal; // Update current goal for backward compatibility

        // Reset pending users for new round
        delete pending;
        
        // Reset rotational tracking for new round
        lastRotationalPeriod = 0;
        roundRotationShuffled[currentRound] = false;
    }
    // Function to join 
    function join(address _memberAddress) public {
        if(_memberAddress == address(0)){
            revert AddressZero();
        }
        if(!ICircleVault(Admin).isVerified(_memberAddress)){
            revert NotVerified();
        }

        //verify that caller is either circlevault, circlevaultadmin or the _memberAddress
        if(msg.sender != Admin && msg.sender != creator && msg.sender != _memberAddress){
            revert Invalid();
        }

        if(roundValidMembers[currentRound][_memberAddress]){
            revert InvalidParticipant();
        }

        if(roundIsPending[currentRound][_memberAddress]){
            revert PendingUser();
        }

        pending.push(_memberAddress);
        roundIsPending[currentRound][_memberAddress] = true;

        
        emit UserJoinedGroup(_memberAddress, groupGoals.goalId);
    }

    // Function to accept member for current round
    function accept(address _memberAddress) public onlyRole(PARTICIPANT_ROLE){
        if(_memberAddress == address(0)) {
            revert AddressZero();
        }

        if(!roundIsPending[currentRound][_memberAddress]) {
            revert InvalidParticipant();
        }
    

        if(roundValidMembers[currentRound][_memberAddress]){
            revert InvalidParticipant();
        }

        // Mark as no longer pending
        roundIsPending[currentRound][_memberAddress] = false;

    
        roundGoals[currentRound].allParticipant.push(_memberAddress);
        roundValidMembers[currentRound][_memberAddress] = true;
        validMember[_memberAddress] = true; 
        groupGoals.allParticipant.push(_memberAddress); 

        emit UserAcceptedToGroup(_memberAddress, msg.sender, groupGoals.goalId);
    }

    function acceptMultiple(address[] calldata members) public onlyRole(PARTICIPANT_ROLE){
        for (uint i = 0; i < members.length; i++) {
            accept(members[i]);
        }
    }

    // Function to complete current round
    function completeRound() public onlyRole(DEFAULT_ADMIN_ROLE) {
        GroupGoal storage goal = roundGoals[currentRound];
        
        // Ensure the round timeline has ended
        if(block.timestamp <= goal.endtime + buffer) {
            revert("Round not yet ended");
        }
        
        // Mark round as completed
        roundCompleted[currentRound] = true;
        goal.goalAchieved = true;
        
        // Process final withdrawals if not rotational
        if (!rotational) {
            processNonRotationalWithdrawal();
        }
    }

    // Function to get members for a specific round
    function getRoundMembers(uint256 round) public view returns (address[] memory) {
        return roundGoals[round].allParticipant;
    }

    // Function to check if address is valid member for current round
    function isValidMemberCurrentRound(address member) public view returns (bool) {
        return roundValidMembers[currentRound][member];
    }

    function saveForGoal(address _memberAddr) public {
        GroupGoal storage goal = roundGoals[currentRound];
        uint256 _amountperPeriod = goal.amountPerPeriod;
        //validate the _memberAddr
        if(!roundValidMembers[currentRound][_memberAddr]){
            revert InvalidParticipant();
        }
        if(goal.startime > block.timestamp) {
            revert InvalidTime();
        }
        if(goal.goalAchieved){
            revert Achieved();
        }

        if(block.timestamp > goal.endtime + buffer) {
            // saving has ended
            goal.goalAchieved = true;
            revert InvalidTime();
        }

        (uint nextTime, uint256 currentPeriod) = nextSavingTime();

        // The user can only save within the time window (nextTime to nextTime + buffer)
        if (block.timestamp < nextTime || block.timestamp > nextTime + buffer) {
            revert InvalidTime();
        }

        // Check if user has already paid for this period in current round
        if (roundHasPaidForPeriod[currentRound][currentPeriod][_memberAddr]) {
            revert AlreadyPaidForPeriod();
        }

        // Transfer tokens from user to contract
        IERC20(goal.currency).safeTransferFrom(msg.sender, address(this), _amountperPeriod);
        
        // Update goal status
        goal.amountSaved += _amountperPeriod;
        goal.lasttimeSaved = block.timestamp;
        
        // Update legacy groupGoals for backward compatibility
        groupGoals.amountSaved = goal.amountSaved;
        groupGoals.lasttimeSaved = goal.lasttimeSaved;
        
        // Mark user as paid for this period in current round
        roundHasPaidForPeriod[currentRound][currentPeriod][_memberAddr] = true;
        hasPaidForPeriod[currentPeriod][_memberAddr] = true; // Keep for backward compatibility

        roundPeriodPayments[currentRound][currentPeriod].amountPaid += _amountperPeriod;
        roundPeriodPayments[currentRound][currentPeriod].period = currentPeriod;
        periodPayments[currentPeriod].amountPaid += _amountperPeriod; // Keep for backward compatibility
        periodPayments[currentPeriod].period = currentPeriod;

        // mark to true if fully paid 
        roundIndividualContribution[currentRound][_memberAddr] += _amountperPeriod;
        individualContribution[_memberAddr] += _amountperPeriod; // Keep for backward compatibility
        
        emit SavingMade(_memberAddr, goal.goalId, _amountperPeriod, currentPeriod, goal.amountSaved);
    }

    // Function to handle late payments with penalty
    function payDefault(uint256 period) public {
        GroupGoal storage goal = roundGoals[currentRound];
        
        // Check if caller is a valid member
        if (!roundValidMembers[currentRound][msg.sender]) {
            revert NotVerified();
        }

        // Check if the period is valid
        if(block.timestamp <=  getPeriodSavingWindowEnd(period)) {
            revert InvalidPeriod();
        }
        
        // Check if caller has actually defaulted for this period
        if (roundHasPaidForPeriod[currentRound][period][msg.sender]) {
            revert NoDefaultForPeriod();
        }

        if (rotational && roundPeriodPayments[currentRound][period].recipient == address(0)) {
            revert PayoutNotProcessed(); 
        }

        //check if fully paid.
        if(roundPeriodPayments[currentRound][period].fullyPaid == true){
            revert FullyPaid();
        } 
        
        // Calculate amount including penalty
        uint256 penaltyAmount = (goal.amountPerPeriod * defaultFee) / 100;
        uint256 totalAmount = goal.amountPerPeriod + penaltyAmount;
        
        // Transfer tokens including penalty
        IERC20(goal.currency).safeTransferFrom(msg.sender, address(this), totalAmount);
        
        // Update goal status and mark as paid
        goal.amountSaved += goal.amountPerPeriod;
        roundHasPaidForPeriod[currentRound][period][msg.sender] = true;
        hasPaidForPeriod[period][msg.sender] = true; // Keep for backward compatibility

        // Update period payment status
        roundPeriodPayments[currentRound][period].amountPaid += goal.amountPerPeriod;
        roundIndividualContribution[currentRound][msg.sender] += goal.amountPerPeriod;   
        
        // Update legacy mappings for backward compatibility
        periodPayments[period].amountPaid += goal.amountPerPeriod;
        individualContribution[msg.sender] += goal.amountPerPeriod;
        groupGoals.amountSaved = goal.amountSaved; // Sync legacy groupGoals

        if(!rotational){
            emit DefaultPayment(msg.sender, period, goal.amountPerPeriod, penaltyAmount);
            return;
        }

        address recipient = roundPeriodPayments[currentRound][period].recipient;
                
        // Check if this completes the payment for this period
        if (roundPeriodPayments[currentRound][period].amountPaid >= roundPeriodPayments[currentRound][period].amountExpected) {
            roundPeriodPayments[currentRound][period].fullyPaid = true;
            roundPeriodPayments[currentRound][period].amountReceived += goal.amountPerPeriod;
            
            // Update legacy mappings
            periodPayments[period].fullyPaid = true;
            periodPayments[period].amountReceived += goal.amountPerPeriod;

            IERC20(goal.currency).safeTransfer(recipient, totalAmount);
            emit RecipientBalancePaid(recipient, period, totalAmount);
        } else {
            IERC20(goal.currency).safeTransfer(recipient, totalAmount);
            roundPeriodPayments[currentRound][period].amountReceived += goal.amountPerPeriod;
            periodPayments[period].amountReceived += goal.amountPerPeriod; // Update legacy mapping
        } 
        emit DefaultPayment(msg.sender, period, goal.amountPerPeriod, penaltyAmount);
    }

    // Modified withdraw function for final withdrawal
    // function withdraw(address _recipient, uint256 _period) public {
    function withdraw() public{
        GroupGoal storage goal = groupGoals;
        
        if (rotational) {

            // processRotationalWithdrawal(_recipient, _period);
            processRotationalWithdrawal();

        }else{

            if (block.timestamp > goal.endtime + buffer) {
                // Saving has ended
                goal.goalAchieved = true; 
             processNonRotationalWithdrawal();
            } else {
                revert NotAchieved();
            }

        }
    }

    // Mark a user as defaulted for the current period
    function markDefault(address _memberAddr, uint256 period) public onlyRole(DEFAULT_ADMIN_ROLE) {
        if (!validMember[_memberAddr]) {
            revert NotVerified();
        }
        
        if (hasPaidForPeriod[period][_memberAddr]) {
            revert AlreadyPaidForPeriod();
        }

        hasDefaultedForPeriod[period][_memberAddr] = true;
        
        emit UserMarkedAsDefaulter(_memberAddr, period, msg.sender);
    }

    function _getFrequency(SavingsFrequency _frequency) private pure returns (uint freq) {
        if(_frequency == SavingsFrequency.Daily) {
            freq = 1 days ;
        } else if(_frequency == SavingsFrequency.Weekly) {
            freq = 7 days;
        } else if(_frequency == SavingsFrequency.BiWeekly) {
            freq = 14 days;
        } else if(_frequency == SavingsFrequency.Monthly) {
            freq = 30 days;
        }
    }

    // Frequency Calculation Functions
    function calculateSavingsSchedule(uint256 totalTargetAmount, uint256 startTime, uint256 endTime, SavingsFrequency frequency) public pure returns (
        uint256 totalPeriods,
        uint256  amountPerPeriod,
        uint256 periodDuration
    ) {

        // Calculate period duration based on frequency
        periodDuration = _getFrequency(frequency);

        // Calculate total number of periods
        totalPeriods = (endTime - startTime) / periodDuration;
        
        // Ensure we round up to the nearest whole period
        if ((endTime - startTime) % periodDuration > 0) {
            totalPeriods += 1;
        }

        // Calculate amount per period
        require(totalPeriods > 0, "Invalid saving period");
        amountPerPeriod = totalTargetAmount / totalPeriods;

        // Handle potential rounding issues
        if (amountPerPeriod * totalPeriods < totalTargetAmount) {
            amountPerPeriod += 1;
        }
    }


    function addCreatorFeeRotateAndDefaultFee(uint256 _pltaformCreatorFee, bool _rotational, uint256 _defaultFee) public {
        if(pending.length > 0 && groupGoals.allParticipant.length > 0){
            revert PendingUser();
        }

        // If caller is trying to enable rotational mode, ensure there are enough periods
        //AUTO-ADJUST END TIME IF NEEDED
       if (_rotational) {
            GroupGoal storage goal = roundGoals[currentRound];
            uint256 periodDuration = _getFrequency(goal.savingFrequency);
            uint256 requiredDuration = goal.totalPartiticipant * periodDuration;
            uint256 requiredEndTime = goal.startime + requiredDuration;
            
            // Only update if current end time is insufficient
            if (goal.endtime < requiredEndTime) {
                goal.endtime = requiredEndTime;
                groupGoals.endtime = requiredEndTime; // Sync legacy
                
                emit EndTimeAdjusted(goal.goalId, requiredEndTime, goal.totalPartiticipant);
            }
        }

        if(_pltaformCreatorFee < 0){
            revert InvalidAmount();
        }
        creatorFee = _pltaformCreatorFee;
        rotational = _rotational;
        defaultFee = _defaultFee;
        
        emit RotationalSettingsUpdated(_rotational, _pltaformCreatorFee, _defaultFee);
    }

    function nextSavingTime() public view returns (uint256 nextTime, uint256 currentPeriod) {
        GroupGoal storage goal = groupGoals;
        uint256 periodDuration = _getFrequency(goal.savingFrequency);
        uint currentTime = block.timestamp;
        uint startTime = goal.startime;

        // If we haven't reached start time yet
        if (startTime > currentTime) {
            return (startTime, 0);
        }

        // Calculate how many full periods have passed since start
        uint256 periodsPassed = (currentTime - startTime) / periodDuration;
        currentPeriod = periodsPassed;
        
        // For period 0, the saving time is the start time
        if (periodsPassed == 0) {
            return (startTime, 0);
        }
        
        // For subsequent periods, calculate the start of the current period
        nextTime = startTime + (periodsPassed * periodDuration);
        
        return (nextTime, currentPeriod);
    }

 

    // // Process rotational withdrawal 
    // function processRotationalWithdrawal() public onlyRole(DEFAULT_ADMIN_ROLE) {
    //     GroupGoal storage goal = roundGoals[currentRound];

    //    // Get current period
    //     (uint256 nextTime, uint256 currentPeriod) = nextSavingTime();
        
    //     address[] memory participants = goal.allParticipant;
    //     uint256 periodToProcess = currentPeriod - 1;

        
    //     // Calculate remaining unpaid participants
    //     // If currentPeriod = 1, 0 have been paid, all participants available
    //     // If currentPeriod = 3, 2 have been paid, participants.length - 2 available
    //     uint256 paidCount = currentPeriod - 1;
    //     require(paidCount < participants.length, "All participants have been paid");
        
    //     uint256 remainingCount = participants.length - paidCount;
        
    //     // Get random number and select from remaining unpaid participants
    //     (uint256 randomNumber, , ) = _generator.getRandomNumber();
        
    //     // Select from unpaid portion (starting from index paidCount to end)
    //     uint256 randomIndex = randomNumber % remainingCount;
    //     uint256 actualIndex = paidCount + randomIndex;
        
    //     address recipient = participants[actualIndex];
        
    //     // Swap selected recipient to the "paid" section (move to paidCount position)
    //     goal.allParticipant[actualIndex] = goal.allParticipant[paidCount];
    //     goal.allParticipant[paidCount] = recipient;

        
    //     // Validate recipient
    //     if (!roundValidMembers[currentRound][recipient]) {
    //         revert RecipientNotValidMember();
    //     }
        
    //     // Check if recipient has already received a payout
    //     if (roundHasReceivedRotationalPayout[currentRound][recipient]) {
    //         revert RecipientAlreadyPaid();
    //     }

    //     // Check if the period is valid
    //     if(block.timestamp <= getPeriodSavingWindowEnd(periodToProcess)) {
    //         revert NotDueForRotationalPayout();
    //     }

    //     if(roundPeriodPayments[currentRound][periodToProcess].amountPaid == 0){
    //         revert NoPeriodPaymentsExist();
    //     }
        
    //     uint256 _expectedAmount = goal.amountPerPeriod * goal.allParticipant.length;
    //     uint256 actualAmount = roundPeriodPayments[currentRound][periodToProcess].amountPaid;
        
    //     // Calculate fees
    //     uint256 platformFee = (_expectedAmount * Fee) / 100;
    //     uint256 creatorFeeAmount = 0;
    //     if (creatorFee > 0) {
    //         creatorFeeAmount = (_expectedAmount * creatorFee) / 100;
    //     }
        
    //     uint256 userAmount = actualAmount - platformFee - creatorFeeAmount;
        
    //     // Transfer available funds to recipient
    //     IERC20(goal.currency).safeTransfer(recipient, userAmount);

    //     // Update round-specific data
    //     roundPeriodPayments[currentRound][periodToProcess].recipient = recipient;
    //     roundPeriodPayments[currentRound][periodToProcess].amountExpected = _expectedAmount - platformFee - creatorFeeAmount;
    //     roundPeriodPayments[currentRound][periodToProcess].amountReceived += userAmount;
    //     roundPeriodPayments[currentRound][periodToProcess].fullyPaid = roundPeriodPayments[currentRound][periodToProcess].amountReceived >= roundPeriodPayments[currentRound][periodToProcess].amountExpected;

    //     // Update legacy data for backward compatibility
    //     periodPayments[periodToProcess].recipient = recipient;
    //     periodPayments[periodToProcess].amountExpected = _expectedAmount - platformFee - creatorFeeAmount;
    //     periodPayments[periodToProcess].amountReceived += userAmount;
    //     periodPayments[periodToProcess].fullyPaid = roundPeriodPayments[currentRound][periodToProcess].fullyPaid;


    //     // Mark defaulters for this period
    //     // for (uint i = 0; i < goal.allParticipant.length; i++) {
    //     //     address participant = goal.allParticipant[i];
    //     //     if (!hasPaidForPeriod[currentPeriod][participant]) {
    //     //         hasDefaultedForPeriod[currentPeriod][participant] = true;
    //     //     }
    //     // }
    //     //@note move this function to a view function to get all defaulters for a period
        
    //     // Mark this recipient as paid in both round-specific and legacy mappings
    //     roundHasReceivedRotationalPayout[currentRound][recipient] = true;
    //     hasReceivedRotationalPayout[recipient] = true; // Keep for backward compatibility
        
        
    //     // Transfer platform fee
    //     address platformFeeRecipient = ICircleVault(Admin).platformFeeRecipient();
    //     if (platformFeeRecipient != address(0)) {
    //         IERC20(goal.currency).safeTransfer(platformFeeRecipient, platformFee);
    //     }
        
    //     // Transfer creator fee if applicable
    //     if (creatorFeeAmount > 0) {
    //         IERC20(goal.currency).safeTransfer(goal.goalCreator, creatorFeeAmount);
    //     }
        
    //     emit RotationalPayout(recipient, userAmount, periodToProcess);
    // }


/**
 * @notice Processes rotational withdrawal with automatic random recipient selection
 * @dev Uses currentPeriod to track paid participants and reduce selection pool
 */
function processRotationalWithdrawal() public onlyRole(DEFAULT_ADMIN_ROLE) {
    GroupGoal storage goal = roundGoals[currentRound];

    // Get current period
    (uint256 nextTime, uint256 currentPeriod) = nextSavingTime();
    
    // The period we're processing is the one that just ended (previous period)
    require(currentPeriod > 0, "No periods completed yet");
    uint256 periodToProcess = currentPeriod - 1;
    
    // Check if the period is valid (withdrawal window has passed)
    if(block.timestamp <= getPeriodSavingWindowEnd(periodToProcess)) {
        revert NotDueForRotationalPayout();
    }

    // Check if period has payments
    if(roundPeriodPayments[currentRound][periodToProcess].amountPaid == 0){
        revert NoPeriodPaymentsExist();
    }
    
    // Calculate remaining unpaid participants
    // If periodToProcess = 0, 0 have been paid, all participants available
    // If periodToProcess = 1, 1 has been paid, participants.length - 1 available
    uint256 paidCount = periodToProcess;
    require(paidCount < goal.allParticipant.length, "All participants have been paid");
    
    uint256 remainingCount = goal.allParticipant.length - paidCount;
    
    // Get random number and select from remaining unpaid participants
    (uint256 randomNumber, , ) = _generator.getRandomNumber();
    
    // Select from unpaid portion (starting from index paidCount to end)
    uint256 randomIndex = randomNumber % remainingCount;
    uint256 actualIndex = paidCount + randomIndex;
    
    address recipient = goal.allParticipant[actualIndex];
    
    // Validate recipient is a valid member
    if (!roundValidMembers[currentRound][recipient]) {
        revert RecipientNotValidMember();
    }
    
    // Double-check recipient hasn't been paid (should never happen with our logic)
    if (roundHasReceivedRotationalPayout[currentRound][recipient]) {
        revert RecipientAlreadyPaid();
    }
    
    // Swap selected recipient to the "paid" section (move to paidCount position)
    goal.allParticipant[actualIndex] = goal.allParticipant[paidCount];
    goal.allParticipant[paidCount] = recipient;
    
    // Calculate amounts
    uint256 _expectedAmount = goal.amountPerPeriod * goal.allParticipant.length;
    uint256 actualAmount = roundPeriodPayments[currentRound][periodToProcess].amountPaid;
    
    // Calculate fees
    uint256 platformFee = (_expectedAmount * Fee) / 100;
    uint256 creatorFeeAmount = 0;
    if (creatorFee > 0) {
        creatorFeeAmount = (_expectedAmount * creatorFee) / 100;
    }
    
    uint256 userAmount = actualAmount - platformFee - creatorFeeAmount;
    
    // Transfer available funds to recipient
    IERC20(goal.currency).safeTransfer(recipient, userAmount);

    // Update round-specific data
    roundPeriodPayments[currentRound][periodToProcess].recipient = recipient;
    roundPeriodPayments[currentRound][periodToProcess].amountExpected = _expectedAmount - platformFee - creatorFeeAmount;
    roundPeriodPayments[currentRound][periodToProcess].amountReceived += userAmount;
    roundPeriodPayments[currentRound][periodToProcess].fullyPaid = roundPeriodPayments[currentRound][periodToProcess].amountReceived >= roundPeriodPayments[currentRound][periodToProcess].amountExpected;

    // Update legacy data for backward compatibility
    periodPayments[periodToProcess].recipient = recipient;
    periodPayments[periodToProcess].amountExpected = _expectedAmount - platformFee - creatorFeeAmount;
    periodPayments[periodToProcess].amountReceived += userAmount;
    periodPayments[periodToProcess].fullyPaid = roundPeriodPayments[currentRound][periodToProcess].fullyPaid;
    
    // Mark this recipient as paid in both round-specific and legacy mappings
    roundHasReceivedRotationalPayout[currentRound][recipient] = true;
    hasReceivedRotationalPayout[recipient] = true; // Keep for backward compatibility
    
    // Transfer platform fee
    address platformFeeRecipient = ICircleVault(Admin).platformFeeRecipient();
    if (platformFeeRecipient != address(0)) {
        IERC20(goal.currency).safeTransfer(platformFeeRecipient, platformFee);
    }
    
    // Transfer creator fee if applicable
    if (creatorFeeAmount > 0) {
        IERC20(goal.currency).safeTransfer(goal.goalCreator, creatorFeeAmount);
    }
    
    emit RotationalPayout(recipient, userAmount, periodToProcess);
}


    
    // // Function to process non-rotational withdrawal
    function processNonRotationalWithdrawal() internal {
        GroupGoal storage goal = groupGoals;
        
        // Get the actual contract balance to ensure we're working with accurate amounts
        uint256 contractBalance = IERC20(goal.currency).balanceOf(address(this));
        
        if (contractBalance == 0) {
            return; // Nothing to distribute
        }
        
        uint256 platformFee = (contractBalance * Fee) / 100;
        uint256 creatorFeeAmount = 0;
        
        if (creatorFee > 0) {
            creatorFeeAmount = (contractBalance * creatorFee) / 100;
        }
        
        uint256 totalFees = platformFee + creatorFeeAmount;
        uint256 amountAfterFees = contractBalance - totalFees;
        
        // Calculate per-participant amount
        uint256 amountPerParticipant = amountAfterFees / goal.allParticipant.length; //@audit check for precision loss
        
        // Distribute to all participants
        for (uint i = 0; i < goal.allParticipant.length; i++) {
            IERC20(goal.currency).safeTransfer(goal.allParticipant[i], amountPerParticipant);
            emit Withdrawal(goal.allParticipant[i], amountPerParticipant, false);
        }
        
        // Transfer platform fee
        address platformFeeRecipient = ICircleVault(Admin).platformFeeRecipient();
        if (platformFeeRecipient != address(0) && platformFee > 0) {
            IERC20(goal.currency).safeTransfer(platformFeeRecipient, platformFee);
        }
        
        // Transfer creator fee if applicable
        if (creatorFeeAmount > 0) {
            IERC20(goal.currency).safeTransfer(goal.goalCreator, creatorFeeAmount);
        }
    }



    // Check if a rotational withdrawal is due
    function isRotationalWithdrawalDue() public view returns (bool) {
        if (!rotational) {
            return false;
        }
        
        (, uint256 currentPeriod) = nextSavingTime();
        return currentPeriod > lastRotationalPeriod;
    }


    function PeriodLeft() public view returns (uint256) {
        GroupGoal storage goal = groupGoals;
        if(goal.goalCreator != msg.sender) {
            revert NotCreator();
        }
        if(goal.startime > block.timestamp) {
            revert Invalid();
        }
        if(goal.goalAchieved == true) {
            revert Achieved();
        }

        uint256 periodDuration = _getFrequency(goal.savingFrequency);
        uint256 timeElapsed = block.timestamp - goal.startime;
        uint256 periodsPassed = timeElapsed / periodDuration;

        return periodsPassed;
    }

    // Function to check who hasn't received a payout yet
    function getUnpaidParticipants() public view returns (address[] memory) {
        GroupGoal storage goal = groupGoals;
        uint256 count = 0;
        
        // First count unpaid participants
        for (uint i = 0; i < goal.allParticipant.length; i++) {
            if (!hasReceivedRotationalPayout[goal.allParticipant[i]]) {
                count++;
            }
        }
        
        // Create array of appropriate size
        address[] memory unpaid = new address[](count);
        uint256 index = 0;
        
        // Fill array with unpaid participants
        for (uint i = 0; i < goal.allParticipant.length; i++) {
            if (!hasReceivedRotationalPayout[goal.allParticipant[i]]) {
                unpaid[index] = goal.allParticipant[i];
                index++;
            }
        }
        
        return unpaid;
    }

    // Function to get defaulters for a specific period
    function getPeriodDefaulters(uint256 period) public view returns (address[] memory) {
        GroupGoal storage goal = groupGoals;
        uint256 count = 0;


        // Mark defaulters for this period
        // First count defaulters
        for (uint i = 0; i < goal.allParticipant.length; i++) {
            address participant = goal.allParticipant[i];
            if (!hasPaidForPeriod[period][participant]) {
                // hasDefaultedForPeriod[period][participant] = true;
            count++;
            }
        }
        // First count defaulters
        // for (uint i = 0; i < goal.allParticipant.length; i++) {
        //     if (hasDefaultedForPeriod[period][goal.allParticipant[i]]) {
        //         count++;
        //     }
        // }
        
        // Create array of appropriate size
        address[] memory defaulters = new address[](count);
        uint256 index = 0;
        
        // Fill array with defaulters
        for (uint i = 0; i < goal.allParticipant.length; i++) {
            address participant = goal.allParticipant[i];
            if (!hasPaidForPeriod[period][participant]) {
                defaulters[index] = goal.allParticipant[i];
                index++;
            }
        }
        
        return defaulters;
    }
       // Function to check payment status for a period
    function getPeriodPayment(uint256 period) public view returns (PeriodPayment memory) {

        return periodPayments[period]; 
    }

    function getTokenAddress() public view returns (address) {
        return groupGoals.currency;
    }   

    function getGroupGoal() external view returns (GroupGoal memory) {
         return groupGoals;
    }

  // Returns only active pending users
function getPendingUsers() external view returns(address[] memory) {
    uint256 count = 0;
    for (uint256 i = 0; i < pending.length; i++) {
        if (roundIsPending[currentRound][pending[i]]) {
            count++;
        }
    }
    
    address[] memory activePending = new address[](count);
    uint256 index = 0;
    
    for (uint256 i = 0; i < pending.length; i++) {
        if (roundIsPending[currentRound][pending[i]]) {
            activePending[index] = pending[i];
            index++;
        }
    }
    
    return activePending;
}


     /**
     * @notice Calculates the timestamp when the saving window (including buffer) ends for a given period.
     * @param _period The period index to check (0-based).
     * @return The Unix timestamp representing the end of the saving window for the specified period.
     */
    function getPeriodSavingWindowEnd(uint256 _period) public view returns (uint256) {
        GroupGoal storage goal = groupGoals;
        uint256 periodDuration = _getFrequency(goal.savingFrequency);

        // Calculate the end timestamp
        uint256 periodSavingWindowEnd = goal.startime + (_period * periodDuration) + buffer;

        // Optional: Add a check to ensure the period is not beyond the goal's duration, though not strictly necessary for just calculation
        // uint256 totalPeriods = (goal.endtime - goal.startime) / periodDuration;
        // if (_period >= totalPeriods) {
        //     revert InvalidPeriod();
        // }

        return periodSavingWindowEnd;
    }


    // -------------------------------Round-Specific Getter Functions--------------------------//
    
    function getCurrentRound() external view returns (uint256) {
        return currentRound;
    }
    
    function getRoundGoal(uint256 round) external view returns (GroupGoal memory) {
        return roundGoals[round];
    }
    
    function getCurrentRoundGoal() external view returns (GroupGoal memory) {
        return roundGoals[currentRound];
    }
    
    function isRoundCompleted(uint256 round) external view returns (bool) {
        return roundCompleted[round];
    }
    
    function getRoundIndividualContribution(uint256 round, address participant) external view returns (uint256) {
        return roundIndividualContribution[round][participant];
    }
    
    function getRoundPeriodPayment(uint256 round, uint256 period) external view returns (PeriodPayment memory) {
        return roundPeriodPayments[round][period];
    }
    
    function hasParticipantPaidForRoundPeriod(uint256 round, uint256 period, address participant) external view returns (bool) {
        return roundHasPaidForPeriod[round][period][participant];
    }

    function getRoundParticipants(uint256 round) external view returns (address[] memory) {
        return roundGoals[round].allParticipant;
    }

    // Function to get all completed rounds
    function getCompletedRounds() external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Count completed rounds
        for (uint256 i = 0; i <= currentRound; i++) {
            if (roundCompleted[i]) {
                count++;
            }
        }
        
        // Create array with completed rounds
        uint256[] memory completed = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i <= currentRound; i++) {
            if (roundCompleted[i]) {
                completed[index] = i;
                index++;
            }
        }
        
        return completed;
    }

    // -------------------------------Fallback Function-----------------------------------------//

    fallback() external {
    }

    receive() external payable {
    }   
}