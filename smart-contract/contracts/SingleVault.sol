// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
interface ICircleVault {
    function isVerified(address _user) external view returns (bool);
    function platformFeeRecipient() external view returns (address);
}

contract SingleVault {
    using SafeERC20 for IERC20;

    // -------------------------------State Variables------------------------------------------//
    enum SavingsFrequency {
        Daily,
        Weekly,
        BiWeekly,
        Monthly
    }

    struct IndividualGoal {
        address goalCreator;
        address currency;
        uint goalId;
        string goalName;
        uint goalAmount;
        uint amountSaved;
        uint amountPerPeriod;
        bool goalAchieved;
        uint startime;
        uint endtime;
        uint lasttimeSaved;
        SavingsFrequency savingFrequency;
    }

    IndividualGoal public individualGoals;
    uint256 public totalUsers;
    address public Admin;
    address public creator;
    uint public platformFee;
    uint public buffer;
    uint public emergencyFee;
    bool initialized;

    // Track if user has saved for each period
    mapping(uint256 => bool) public hasPaidForPeriod;

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
    error AlreadyPaidForPeriod();

    // -------------------------------Events--------------------------------------------------//
    event GoalInitialized(
        address indexed creator,
        uint256 indexed goalId,
        string goalName,
        uint256 goalAmount,
        uint256 startTime,
        uint256 endTime
    );
    event SavingMade(
        address indexed saver,
        uint256 amount,
        uint256 totalSaved,
        uint256 timestamp
    );
    event GoalAchieved(
        address indexed creator,
        uint256 indexed goalId,
        uint256 totalAmount,
        uint256 timestamp
    );
    event WithdrawalMade(
        address indexed recipient,
        uint256 amount,
        uint256 platformFee,
        uint256 timestamp
    );
    event EmergencyWithdrawal(
        address indexed recipient,
        uint256 amount,
        uint256 emergencyFee,
        uint256 timestamp
    );

    // -------------------------------Modifiers------------------------------------------------//
    modifier onlyCircleVault() {
        if (msg.sender != Admin) revert NotAdmin();
        _;
    }

    // -------------------------------Functions------------------------------------------------//

    function initialize(
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
        address _circleVault,
        uint256 _participant
    ) public {
        if (initialized) {
            revert AlreadyInitialized();
        }
        initialized = true;

        platformFee = _platformFee;
        emergencyFee = _emergencyFee;
        buffer = 1 days;
        Admin = _circleVault;
        creator = _creator;

        (, uint amountPerPeriod, ) = calculateSavingsSchedule(
            _goalAmount,
            _startTime,
            _endTime,
            _savingFrequency
        );

        IndividualGoal memory _goal = IndividualGoal(
            _creator,
            currency,
            _goalId,
            _goalName,
            _goalAmount,
            0,
            amountPerPeriod,
            false,
            _startTime,
            _endTime,
            0,
            _savingFrequency
        );
        individualGoals = _goal;

        emit GoalInitialized(
            _creator,
            _goalId,
            _goalName,
            _goalAmount,
            _startTime,
            _endTime
        );
    }

    //@dev to facilitate saving on behalf of the user
    function saveForGoal(address userAddr) public {
        IndividualGoal storage goal = individualGoals;
        if (goal.goalCreator != userAddr) {
            revert NotCreator();
        }
        if (goal.startime > block.timestamp) {
            revert Invalid();
        }
        if (goal.goalAchieved) {
            revert Achieved();
        }

        (uint nextTime, uint256 currentPeriod) = nextSavingTime();

        // Check if user has already saved for this period
        if (hasPaidForPeriod[currentPeriod]) {
            revert AlreadyPaidForPeriod();
        }

        // The user can only save within the time window (nextTime to nextTime + buffer)
        if (block.timestamp < nextTime || block.timestamp > nextTime + buffer) {
            revert InvalidTime();
        }

        // Transfer tokens from user to contract
        IERC20(goal.currency).safeTransferFrom(
            msg.sender,
            address(this),
            goal.amountPerPeriod
        );

        // Update goal status
        goal.amountSaved += goal.amountPerPeriod;
        goal.lasttimeSaved = block.timestamp;

        // Mark this period as paid
        hasPaidForPeriod[currentPeriod] = true;

        emit SavingMade(
            userAddr,
            goal.amountPerPeriod,
            goal.amountSaved,
            block.timestamp
        );

        // Check if goal is achieved
        if (goal.amountSaved >= goal.goalAmount) {
            goal.goalAchieved = true;
            emit GoalAchieved(
                goal.goalCreator,
                goal.goalId,
                goal.amountSaved,
                block.timestamp
            );
        }
    }

    // Function to handle late payments with penalty
    function payDefault(uint256 period) public {
        IndividualGoal storage goal = individualGoals;

        // Check if caller is the goal creator
        if (goal.goalCreator != msg.sender) {
            revert NotCreator();
        }

        // Check if the period is valid and past its saving window
        uint256 periodDuration = _getFrequency(goal.savingFrequency);
        uint256 periodStart = goal.startime + (period * periodDuration);
        uint256 periodEnd = periodStart + buffer;

        if (block.timestamp <= periodEnd) {
            revert InvalidTime(); // Still within saving window
        }

        // Check if already paid for this period
        if (hasPaidForPeriod[period]) {
            revert AlreadyPaidForPeriod();
        }

        // Calculate amount including penalty (10% penalty for example)
        uint256 penaltyAmount = (goal.amountPerPeriod * 10) / 100; // 10% penalty
        uint256 totalAmount = goal.amountPerPeriod + penaltyAmount;

        // Transfer tokens including penalty
        IERC20(goal.currency).safeTransferFrom(
            msg.sender,
            address(this),
            totalAmount
        );

        // Update goal status and mark as paid
        goal.amountSaved += goal.amountPerPeriod; // Only the actual amount counts toward goal
        goal.lasttimeSaved = block.timestamp;
        hasPaidForPeriod[period] = true;

        emit SavingMade(
            msg.sender,
            goal.amountPerPeriod,
            goal.amountSaved,
            block.timestamp
        );

        // Check if goal is achieved
        if (goal.amountSaved >= goal.goalAmount) {
            goal.goalAchieved = true;
            emit GoalAchieved(
                goal.goalCreator,
                goal.goalId,
                goal.amountSaved,
                block.timestamp
            );
        }
    }

    function _getFrequency(
        SavingsFrequency _frequency
    ) private pure returns (uint256 freq) {
        if (_frequency == SavingsFrequency.Daily) {
            freq = 1 days;
        } else if (_frequency == SavingsFrequency.Weekly) {
            freq = 7 days;
        } else if (_frequency == SavingsFrequency.BiWeekly) {
            freq = 14 days;
        } else if (_frequency == SavingsFrequency.Monthly) {
            freq = 30 days;
        }
    }

    // Frequency Calculation Functions
    function calculateSavingsSchedule(
        uint256 totalTargetAmount,
        uint256 startTime,
        uint256 endTime,
        SavingsFrequency frequency
    )
        public
        pure
        returns (
            uint256 totalPeriods,
            uint256 amountPerPeriod,
            uint256 periodDuration
        )
    {
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

    // function nextSavingTime(uint256 goalId) public view returns (uint256 nextTime, uint256 currentPeriod) {
    //     IndividualGoal storage goal = individualGoals[goalId];

    //     uint256 periodDuration = _getFrequency(goal.savingFrequency);

    //     uint currentTime = block.timestamp;

    //     uint startTime = goal.startime;

    //     if(startTime > currentTime) {
    //         return (startTime, 0);
    //     }

    //     nextTime = startTime + ((currentTime - startTime) / periodDuration + 1) * periodDuration;

    //     currentPeriod = (currentTime - startTime) / periodDuration;
    // }

    // function nextSavingTime(uint256 goalId) public view returns (uint256 nextTime, uint256 currentPeriod) {
    //     IndividualGoal storage goal = individualGoals[goalId];
    //     uint256 periodDuration = _getFrequency(goal.savingFrequency);
    //     uint currentTime = block.timestamp;
    //     uint startTime = goal.startime;

    //     if(startTime > currentTime) {
    //         // If start time hasn't arrived yet, next savings is at start time
    //         return (startTime, 0);
    //     }

    //     // For the first saving (when lasttimeSaved is 0), the next time is the start time
    //     if (goal.lasttimeSaved == 0) {
    //         return (startTime, 0);
    //     }

    //     // Calculate elapsed time since start
    //     uint256 timeElapsed = currentTime - startTime;

    //     // Calculate current period
    //     currentPeriod = timeElapsed / periodDuration;

    //     // Calculate next saving time based on periods
    //     nextTime = startTime + currentPeriod * periodDuration;

    //     // If we're already past the calculated next time, move to next period
    //     if (currentTime > nextTime) {
    //         nextTime += periodDuration;
    //     }
    // }

    function nextSavingTime()
        public
        view
        returns (uint256 nextTime, uint256 currentPeriod)
    {
        IndividualGoal storage goal = individualGoals;
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

    function withdraw() public {
        IndividualGoal storage goal = individualGoals;
        if (goal.goalCreator != msg.sender) {
            revert NotCreator();
        }
        if (goal.goalAchieved == false) {
            revert NotAchieved();
        }

        uint _platformFee = (goal.amountSaved * platformFee) / 100;
        uint userAmount = goal.amountSaved - _platformFee;

        IERC20(goal.currency).safeTransfer(msg.sender, userAmount);

        address platformFeeRecipient = ICircleVault(Admin)
            .platformFeeRecipient();
        if (platformFeeRecipient == address(0)) {
            revert AddressZero();
        }

        IERC20(goal.currency).safeTransfer(platformFeeRecipient, _platformFee);

        emit WithdrawalMade(
            msg.sender,
            userAmount,
            _platformFee,
            block.timestamp
        );
    }

    function emergencyWithdrawal() public {
        IndividualGoal storage goal = individualGoals;
        if (goal.goalCreator != msg.sender) {
            revert NotCreator();
        }

        uint _emergencyFee = (goal.amountSaved * emergencyFee) / 100;
        uint userAmount = goal.amountSaved - _emergencyFee;

        IERC20(goal.currency).safeTransfer(msg.sender, userAmount);

        address platformFeeRecipient = ICircleVault(Admin)
            .platformFeeRecipient();
        if (platformFeeRecipient == address(0)) {
            revert AddressZero();
        }

        IERC20(goal.currency).safeTransfer(platformFeeRecipient, _emergencyFee);

        emit EmergencyWithdrawal(
            msg.sender,
            userAmount,
            _emergencyFee,
            block.timestamp
        );
    }

    function PeriodLeft() public view returns (uint256) {
        IndividualGoal storage goal = individualGoals;
        if (goal.goalCreator != msg.sender) {
            revert NotCreator();
        }
        if (goal.startime > block.timestamp) {
            revert Invalid();
        }
        if (goal.goalAchieved == true) {
            revert Achieved();
        }

        uint256 periodDuration = _getFrequency(goal.savingFrequency);
        uint256 timeElapsed = block.timestamp - goal.startime;
        uint256 periodsPassed = timeElapsed / periodDuration;

        return periodsPassed;
    }

    /**
     * @notice Returns the details of the individual savings goal.
     * @return goal The IndividualGoal struct containing goal details.
     */
    function getIndividualGoal()
        external
        view
        returns (IndividualGoal memory goal)
    {
        // Ensure the contract is initialized before returning data
        if (!initialized) {
            // Return an empty struct or revert, depending on desired behavior
            // Reverting might be safer to indicate invalid state
            revert Invalid(); // Or NotInitialized()
        }
        goal = individualGoals;
    }

    // -------------------------------Fallback Function-----------------------------------------//

    fallback() external {}

    receive() external payable {}
}
