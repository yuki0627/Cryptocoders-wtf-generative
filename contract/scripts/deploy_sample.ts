import { ethers, network } from "hardhat";
import { writeFile } from "fs";
import { addresses } from "../../src/utils/addresses";

export const proxy = "0xa5409ec958c83c3f309868babaca7c86dcb077c1"; // openSea proxy

async function main() {
  const factoryHelper = await ethers.getContractFactory("SVGHelperA");
  const contractHelper = await factoryHelper.deploy();
  await contractHelper.deployed();
  console.log(`      helper="${contractHelper.address}"`);

  const factory = await ethers.getContractFactory("SplatterProvider");
  const contractSplatter = await factory.deploy(contractHelper.address);
  await contractSplatter.deployed();
  console.log(`      splatter="${contractSplatter.address}"`);

  const factoryToken = await ethers.getContractFactory("SampleToken");
  const token = await factoryToken.deploy(contractSplatter.address, proxy);
  await token.deployed();
  console.log(`      token="${token.address}"`);

  const addresses = `export const addresses = {\n`
    + `  svgHelperAddress:"${contractHelper.address}",\n`
    + `  splatterAddress:"${contractSplatter.address}",\n`
    + `  sampleToken:"${token.address}"\n`
    + `}\n`;
  await writeFile(`../src/utils/addresses/sample_${network.name}.ts`, addresses, ()=>{});  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
