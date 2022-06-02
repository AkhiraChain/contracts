// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.11;

// Test imports
import "./mocks/MockAkhiraContract.sol";
import "./utils/BaseTest.sol";
import "contracts/AkhiraFee.sol";

// Helpers
import "@openzeppelin/contracts/utils/Create2.sol";
import "contracts/AkhiraRegistry.sol";
import "contracts/AkhiraFactory.sol";
import "contracts/AkhiraProxy.sol";

contract AkhiraFeeTest is BaseTest {
    // Target contract
    AkhiraFee internal akhiraFee;

    // Helper contracts
    AkhiraRegistry internal akhiraRegistry;
    AkhiraFactory internal akhiraFactory;
    MockAkhiraContract internal mockModule;

    // Actors
    address internal mockModuleDeployer;
    address internal moduleAdmin = address(0x1);
    address internal feeAdmin = address(0x2);
    address internal notFeeAdmin = address(0x3);
    address internal payer = address(0x4);

    // Test params
    address internal trustedForwarder = address(0x4);
    address internal thirdwebTreasury = address(0x5);

    //  =====   Set up  =====

    function setUp() public override {}
}
