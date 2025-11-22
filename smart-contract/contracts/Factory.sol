// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

enum SavingsFrequency {Daily, Weekly, BiWeekly, Monthly}

interface ICircleVault {
    function initialize(string memory _goalName, uint _goalAmount, uint _goalId, SavingsFrequency _savingFrequency, address currency, uint _startTime, uint _endTime, uint _platformFee, uint _emergencyFee,address _creator, address _CircleVault, uint256 _participant) external;
}

contract MinimalProxy {
    event ContractCreated(address indexed newCircleVault, uint256 position);

    mapping(address => address[]) public _deployerAddrs; //deployer => contract addressses
    address[] allClonedCircleVaults;

    function createClone(
        address _implementationContract,
       string memory _goalName, uint _goalAmount, uint _goalId, SavingsFrequency _savingFrequency, address currency, uint _startTime, uint _endTime, uint _platformFee, uint _emergencyFee,address _creator, uint256 _participant
    ) external returns (address) {
        // convert the address to 20 bytes
        bytes20 implementationContractInBytes = bytes20(
            _implementationContract
        );

        //address to assign cloned proxy
        address proxy;

        // as stated earlier, the minimal proxy has this bytecode
        // <3d602d80600a3d3981f3363d3d373d3d3d363d73><address of implementation contract><5af43d82803e903d91602b57fd5bf3>

        // <3d602d80600a3d3981f3> == creation code which copy runtime code into memory and deploy it

        // <363d3d373d3d3d363d73> <address of implementation contract> <5af43d82803e903d91602b57fd5bf3> == runtime code that makes a delegatecall to the implentation contract

        assembly {
            /*
            reads the 32 bytes of memory starting at pointer stored in 0x40
            In solidity, the 0x40 slot in memory is special: it contains the "free memory pointer"
            which points to the end of the currently allocated memory.
            */
            let clone := mload(0x40)
            // store 32 bytes to memory starting at "clone"
            mstore(
                clone,
                0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000
            )

            /*
              |              20 bytes                |
            0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000
                                                      ^
                                                      pointer
            */
            // store 32 bytes to memory starting at "clone" + 20 bytes
            // 0x14 = 20
            mstore(add(clone, 0x14), implementationContractInBytes)

            /*
              |               20 bytes               |                 20 bytes              |
            0x3d602d80600a3d3981f3363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebebe
                                                                                              ^
                                                                                              pointer
            */
            // store 32 bytes to memory starting at "clone" + 40 bytes
            // 0x28 = 40
            mstore(
                add(clone, 0x28),
                0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000
            )

            /*
            |                 20 bytes                  |          20 bytes          |           15 bytes          |
            0x3d602d80600a3d3981f3363d3d373d3d3d363d73b<implementationContractInBytes>5af43d82803e903d91602b57fd5bf3 == 45 bytes in total
            */

            // create a new contract
            // send 0 Ether
            // code starts at pointer stored in "clone"
            // code size == 0x37 (55 bytes)
            proxy := create(0, clone, 0x37)
        }
        ICircleVault(proxy).initialize(_goalName, _goalAmount, _goalId, _savingFrequency, currency, _startTime, _endTime, _platformFee, _emergencyFee, _creator, msg.sender, _participant );

        // Add the newly deployed contract address to the deployer's array
        _deployerAddrs[msg.sender].push(proxy);
        allClonedCircleVaults.push(proxy);

        emit ContractCreated(proxy, allClonedCircleVaults.length);
        return proxy;
    }

    // Check if an address is a clone of a particular contract address
    function isClone(
        address _implementationContract,
        address query
    ) external view returns (bool result) {
        bytes20 implementationContractInBytes = bytes20(
            _implementationContract
        );
        assembly {
            let clone := mload(0x40)
            mstore(
                clone,
                0x363d3d373d3d3d363d7300000000000000000000000000000000000000000000
            )
            mstore(add(clone, 0xa), implementationContractInBytes)
            mstore(
                add(clone, 0x1e),
                0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000
            )

            let other := add(clone, 0x40)
            extcodecopy(query, other, 0, 0x2d)
            result := and(
                eq(mload(clone), mload(other)),
                eq(mload(add(clone, 0xd)), mload(add(other, 0xd)))
            )
        }
    }

    function getAllCreatedAddresses() external view returns (address[] memory) {
        return allClonedCircleVaults;
    }

    function getAllProxiesByDeployer(
        address deployerAddr
    ) external view returns (address[] memory) {
        return _deployerAddrs[deployerAddr];
    }
}