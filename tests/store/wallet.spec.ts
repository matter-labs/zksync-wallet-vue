import { WalletModuleState, state } from "@/store/wallet";

let walletModuleState: WalletModuleState;

describe("Wallet Store check", () => {
  beforeEach(() => {
    walletModuleState = state();
  });
});
