import hre, { ethers } from "hardhat";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { AkhiraFactory } from "typechain/AkhiraFactory";
import { Multiwrap } from "typechain/Multiwrap";

async function main() {

    const [caller]: SignerWithAddress[] = await ethers.getSigners();

    const nativeTokenWrapperAddress: string = ethers.constants.AddressZero; // replace
    const akhiraFactoryAddress: string = ethers.constants.AddressZero; // replace

    const akhiraFactory: AkhiraFactory = await ethers.getContractAt('AkhiraFactory', akhiraFactoryAddress);

    const hasFactoryRole = await akhiraFactory.hasRole(
        ethers.utils.solidityKeccak256(["string"], ["FACTORY_ROLE"]),
        caller.address
    )
    if(!hasFactoryRole) {
        throw new Error("Caller does not have FACTORY_ROLE on factory");
    }
    const multiwrap: Multiwrap = await ethers.getContractFactory("Multiwrap").then(f => f.deploy(nativeTokenWrapperAddress));

    console.log("Deploying Multiwrap \ntransaction: ", multiwrap.deployTransaction.hash, "\naddress: ", multiwrap.address);

    console.log("\n")

    const addImplementationTx = await akhiraFactory.addImplementation(multiwrap.address)
    console.log("Adding Multiwrap implementation to AkhiraFactory: ", addImplementationTx.hash);
    await addImplementationTx.wait();

    console.log("\n")

    console.log("Verifying contract.")
    await verify(multiwrap.address, [nativeTokenWrapperAddress]);
}

async function verify(address: string, args: any[]) {
    try {
      return await hre.run("verify:verify", {
        address: address,
        constructorArguments: args,
      });
    } catch (e) {
      console.log(address, args, e);
    }
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
