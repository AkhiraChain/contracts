import hre, { ethers } from "hardhat";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { AkhiraFactory, Marketplace } from "typechain";

import { nativeTokenWrapper } from "../../utils/nativeTokenWrapper";

async function main() {

  const chainId: number = hre.network.config.chainId as number;

  const [caller]: SignerWithAddress[] = await ethers.getSigners();

  const nativeTokenWrapperAddress: string = nativeTokenWrapper[chainId];
  const akhiraFeeAddress: string = ethers.constants.AddressZero; // replace
  const akhiraFactoryAddress: string = ethers.constants.AddressZero; // replace Fantom: 0x97EA0Fcc552D5A8Fb5e9101316AAd0D62Ea0876B rest: 0x5DBC7B840baa9daBcBe9D2492E45D7244B54A2A0

  const akhiraFactory: AkhiraFactory = await ethers.getContractAt("AkhiraFactory", akhiraFactoryAddress);

  const hasFactoryRole = await akhiraFactory.hasRole(
    ethers.utils.solidityKeccak256(["string"], ["FACTORY_ROLE"]),
    caller.address,
  );
  if (!hasFactoryRole) {
    throw new Error("Caller does not have FACTORY_ROLE on factory");
  }
  const marketplace: Marketplace = await ethers
    .getContractFactory("Marketplace")
    .then(f => f.deploy(nativeTokenWrapperAddress, akhiraFeeAddress, { gasPrice: ethers.utils.parseUnits("300", "gwei") }));

  console.log(
    "Deploying Marketplace \ntransaction: ",
    marketplace.deployTransaction.hash,
    "\naddress: ",
    marketplace.address,
  );

  await marketplace.deployed();

  console.log("\n");

  const addImplementationTx = await akhiraFactory.addImplementation(marketplace.address);
  console.log("Adding Marketplace implementation to AkhiraFactory: ", addImplementationTx.hash);
  await addImplementationTx.wait();

  console.log("\n");

  console.log("Verifying contract.");
  await verify(marketplace.address, [nativeTokenWrapperAddress, akhiraFeeAddress]);
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
