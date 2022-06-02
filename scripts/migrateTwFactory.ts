import { ethers } from "hardhat";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { AkhiraFactory } from "typechain";

import contractTypes from "utils/contractTypes";
import { BytesLike } from "@ethersproject/bytes";

async function main() {
  const [caller]: SignerWithAddress[] = await ethers.getSigners();

  console.log("\nCaller address: ", caller.address);

  const currentAkhiraFactoryAddress: string = ethers.constants.AddressZero; // replace
  const currentAkhiraFactory: AkhiraFactory = await ethers.getContractAt("AkhiraFactory", currentAkhiraFactoryAddress);

  const newAkhiraFactoryAddress: string = ethers.constants.AddressZero; // replace
  const newAkhiraFactory: AkhiraFactory = await ethers.getContractAt("AkhiraFactory", newAkhiraFactoryAddress);

  console.log("\nCurrent factory: ", currentAkhiraFactoryAddress, "\nNew factory: ", newAkhiraFactoryAddress);

  const hasFactoryRole = await newAkhiraFactory.hasRole(
    ethers.utils.solidityKeccak256(["string"], ["FACTORY_ROLE"]),
    caller.address,
  );
  if (!hasFactoryRole) {
    throw new Error("Caller does not have FACTORY_ROLE on new factory");
  }

  const migratedContractTypes: string[] = [];
  const nonMigratedContractTypes: string[] = [];

  for (const contractType of contractTypes) {
    console.log(`\nMigrating ${contractType}`);

    const contractTypeBytes: BytesLike = ethers.utils.formatBytes32String(contractType);

    const currentVersion: number = (await currentAkhiraFactory.currentVersion(contractTypeBytes)).toNumber();
    if (currentVersion == 0) {
      console.log(`No current implementation available for ${contractType}`);
      nonMigratedContractTypes.push(contractType);
      continue;
    }

    const implementation = await currentAkhiraFactory.implementation(contractTypeBytes, currentVersion);
    const addImplementationTx = await newAkhiraFactory.addImplementation(implementation);
    console.log(`Migrating implementation of ${contractType} at tx: `, addImplementationTx.hash);

    await addImplementationTx.wait();

    const implementationOnNewFactory = await newAkhiraFactory.getLatestImplementation(contractTypeBytes);

    if (ethers.utils.getAddress(implementationOnNewFactory) != ethers.utils.getAddress(implementation)) {
      console.log("Something went wrong. Failed to migrate contract.");
      nonMigratedContractTypes.push(contractType);
    } else {
      migratedContractTypes.push(contractType);
      console.log("Done.");
    }
  }

  console.log(
    "\nMigration complete:\nMigrated contract types; ",
    migratedContractTypes,
    "\nDid not migrate: ",
    nonMigratedContractTypes,
  );
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
