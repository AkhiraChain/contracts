import { ethers } from "hardhat";

import { Wallet } from "@ethersproject/wallet";
import { BytesLike } from "@ethersproject/bytes";

import { AkhiraRegistry } from "typechain";

async function main() {
  const akhiraRegistryAddress: string = ethers.constants.AddressZero; // replace

  const akhiraRegistry: AkhiraRegistry = await ethers.getContractAt("AkhiraRegistry", akhiraRegistryAddress);

  const currentAdminPkey: string = ""; // DO NOT COMMIT
  const currentAdmin: Wallet = new ethers.Wallet(currentAdminPkey, ethers.provider);

  const receiverOfRole: string = ethers.constants.AddressZero;
  const role: BytesLike = ""; // replace

  const isAdminOnRegistry: boolean = await akhiraRegistry.hasRole(
    await akhiraRegistry.DEFAULT_ADMIN_ROLE(),
    currentAdmin.address,
  );
  if (!isAdminOnRegistry) {
    throw new Error("Caller provided is not admin on registry");
  }

  const grantRoleTx = await akhiraRegistry
    .connect(currentAdmin)
    .grantRole(role, receiverOfRole);

  console.log(`\nGranting admin role to ${receiverOfRole} at tx: ${grantRoleTx.hash}`);

  await grantRoleTx.wait();

  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
