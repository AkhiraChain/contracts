import hre, { ethers } from "hardhat";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { AkhiraFactory, DropERC1155 } from "typechain";

async function main() {
  const [caller]: SignerWithAddress[] = await ethers.getSigners();

  const akhiraFeeAddress: string = ethers.constants.AddressZero; // replace
  const akhiraFactoryAddress: string = ethers.constants.AddressZero; // replace

  const akhiraFactory: AkhiraFactory = await ethers.getContractAt("AkhiraFactory", akhiraFactoryAddress);

  const hasFactoryRole = await akhiraFactory.hasRole(
    ethers.utils.solidityKeccak256(["string"], ["FACTORY_ROLE"]),
    caller.address,
  );
  if (!hasFactoryRole) {
    throw new Error("Caller does not have FACTORY_ROLE on factory");
  }
  const dropERC1155: DropERC1155 = await ethers.getContractFactory("DropERC1155").then(f => f.deploy(akhiraFeeAddress));

  console.log(
    "Deploying DropERC1155 \ntransaction: ",
    dropERC1155.deployTransaction.hash,
    "\naddress: ",
    dropERC1155.address,
  );

  await dropERC1155.deployTransaction.wait();

  console.log("\n");

  const addImplementationTx = await akhiraFactory.addImplementation(dropERC1155.address);
  console.log("Adding DropERC1155 implementation to AkhiraFactory: ", addImplementationTx.hash);
  await addImplementationTx.wait();

  console.log("\n");

  console.log("Verifying contract.");
  await verify(dropERC1155.address, [akhiraFeeAddress]);
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
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
