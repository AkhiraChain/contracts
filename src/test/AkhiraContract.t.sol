// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.11;

// Test imports
import "./utils/BaseTest.sol";
import "contracts/AkhiraFactory.sol";
import "contracts/AkhiraRegistry.sol";

// Helpers
import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "contracts/AkhiraProxy.sol";
import "contracts/AkhiraContract.sol";

contract MyAkhiraContract is AkhiraContract {
    address public contractDeployerFromConstructor;

    constructor() {
        contractDeployerFromConstructor = _contractDeployer();
    }

    function getContractDeployerOutsideFromConstructor() public view returns (address) {
        return _contractDeployer();
    }
}

contract AkhiraContractTest is BaseTest {
    function setUp() public override {
        super.setUp();
    }

    function getContractDeployer(address) public pure returns (address) {
        return address(42);
    }

    function deployContract() public returns (address) {
        return Create2.deploy(0, keccak256(abi.encode(0)), type(MyAkhiraContract).creationCode);
    }

    function test_AkhiraContract_ContractDeployerConstructor() external {
        address addy = deployContract();
        address contractDeployer = MyAkhiraContract(addy).contractDeployerFromConstructor();
        address contractDeployerNotConstructor = MyAkhiraContract(addy).getContractDeployerOutsideFromConstructor();

        assertEq(contractDeployer, getContractDeployer(addy));
        assertEq(contractDeployerNotConstructor, address(0));
    }
}
