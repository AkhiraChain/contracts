import { ethers } from "hardhat";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { AkhiraFactory } from "typechain/AkhiraFactory";

async function main() {

    const [caller]: SignerWithAddress[] = await ethers.getSigners();

    console.log("\nCaller address: ", caller.address);

    const akhiraFactoryAddress: string = ethers.constants.AddressZero; // replace
    const akhiraFactory: AkhiraFactory = await ethers.getContractAt("AkhiraFactory", akhiraFactoryAddress);

    const hasFactoryRole = await akhiraFactory.hasRole(
        ethers.utils.solidityKeccak256(["string"], ["FACTORY_ROLE"]),
        caller.address
    )
    if(!hasFactoryRole) {
        throw new Error("Caller does not have FACTORY_ROLE on new factory");
    }

    const implementations: string[] = []; // replace
    const data = implementations.map((impl) => akhiraFactory.interface.encodeFunctionData("addImplementation", [impl]));

    const tx = await akhiraFactory.multicall(data);
    console.log("Adding implementations: ", tx.hash);

    await tx.wait();

    console.log("Done.");
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
