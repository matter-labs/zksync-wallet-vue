const ethers = require("ethers");
const zksync = require("zksync");

const absolutelyNewAccount = "0x8533919e85f2e4ecc5a234a5ca1c46de80c1b1b02c34059bc4b5d4eb9bf957e5";
const newAccountWithNfts = "0x2D9835a1C1662559975B00AEA00e326D1F9f13d0";

async function main() {
  const ethProvider = await ethers.providers.getDefaultProvider("ropsten");
  const syncProvider = await zksync.getDefaultRestProvider("ropsten");
  const ethWallet = new ethers.Wallet(absolutelyNewAccount).connect(ethProvider);
  const syncWallet = await zksync.Wallet.fromEthSigner(ethWallet, syncProvider);
  /// Prepare wallet for generating NFTs

  /* const deposit_amount = ethers.utils.parseEther("0.1");
  const depositHandle = await syncWallet.depositToSyncFromEthereum({
    depositTo: ethWallet.address,
    token: "ETH",
    amount: deposit_amount,
  });
  const receipt = await depositHandle.awaitReceipt();
  console.log("Deposit"); */
  // const tx = await syncWallet.setSigningKey({feeToken:'ETH', ethAuthType: 'ECDSA'});
  // await tx.awaitReceipt();
  // console.log("CHPK");

  // // // MINT NFT
  // const contentHash = "0xbd7289936758c562235a3a42ba2c4a56cbb23a263bb8f8d27aead80d74d9d996"
  // const handle = await syncWallet.mintNFT({
  //     recipient: "0xA36B1c9De690C36C636d99930C5280F4de5f13D0",
  //     contentHash,
  //     feeToken: "ETH",
  // });
  // await handle.awaitReceipt();
  const state = await syncWallet.getAccountState();
  console.log("Committed State of main private key", state.committed);
  console.log("Verified State of main private key", state.verified);
  const token = Object.values(state.committed.nfts)[0];
  // Transfer NFT
  const handles = await syncWallet.syncTransferNFT({ to: newAccountWithNfts, token, feeToken: "ETH" });
  await handles[0].awaitReceipt();

  // await handles.awaitReceipt();
  const new_state = await syncWallet.getAccountState();
  console.log("Committed State of main private key", new_state.committed);
  console.log("Verified State of main private key", new_state.verified);
  const another_state = await syncWallet.provider.getState(newAccountWithNfts);
  console.log("Committed State of another wallet", another_state.committed);
  console.log("Verified State of another wallet", another_state.verified);
  // const handle = await syncWallet.withdrawNFT({
  //     to: syncWallet.address(),
  //     token: 65540,
  //     feeToken: "ETH",
  // });
  // await handle.awaitReceipt();
}

main().then(console.log).catch(console.error);
