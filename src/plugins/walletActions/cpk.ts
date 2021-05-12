import { Wallet } from "zksync";
import { Address, TokenSymbol } from "zksync/build/types";
import { accessorType } from "@/store";
import { GweiBalance, CPKLocal } from "@/plugins/types";
import { BatchBuilder } from "zksync/build/batch-builder";

function getCPKStorageKey(address: Address) {
  return `pubKeySignature-${address}`;
}
export const saveCPKTx = (address: Address, tx: CPKLocal) => {
  window.localStorage.setItem(getCPKStorageKey(address), JSON.stringify(tx));
};
export const removeCPKTx = (address: Address) => {
  window.localStorage.removeItem(getCPKStorageKey(address));
};
export const getCPKTx = (address: Address): CPKLocal | undefined => {
  const CPKTxJSON = window.localStorage.getItem(getCPKStorageKey(address));
  if (!CPKTxJSON) {
    throw new Error("No signed changePubKey was found for the current account");
  }
  try {
    return JSON.parse(CPKTxJSON);
  } catch (error) {
    throw new Error("Couldn't parse saved signed changePubKey");
  }
};

export const addCPKToBatch = async (syncWallet: Wallet, fee: GweiBalance, feeToken: TokenSymbol, batchBuilder: BatchBuilder, store: typeof accessorType) => {
  let pubKeyTx: CPKLocal | undefined;
  try {
    pubKeyTx = getCPKTx(store.account.address!);
  } catch (error) {
    removeCPKTx(store.account.address!);
    store.openModal("SignPubkey");
    throw error;
  }
  if (!pubKeyTx) {
    return store.openModal("SignPubkey");
  }
  const changePubKeyTx = await syncWallet!.signer!.signSyncChangePubKey({
    ...pubKeyTx,
    fee,
    feeTokenId: syncWallet!.provider.tokenSet.resolveTokenId(feeToken),
  });
  batchBuilder.addChangePubKey({
    tx: changePubKeyTx,
    // @ts-ignore
    alreadySigned: true,
  });
};
